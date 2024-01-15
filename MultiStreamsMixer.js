// Last time updated: 2024-01-15 11:30:04 AM UTC

// ________________________
// MultiStreamsMixer v1.2.3

// Open-Sourced: https://github.com/muaz-khan/MultiStreamsMixer

// --------------------------------------------------
// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// --------------------------------------------------

function MultiStreamsMixer(arrayOfMediaStreams, elementClass) {

var browserFakeUserAgent = 'Fake/5.0 (FakeOS) AppleWebKit/123 (KHTML, like Gecko) Fake/12.3.4567.89 Fake/123.45';

(function(that) {
    if (typeof RecordRTC !== 'undefined') {
        return;
    }

    if (!that) {
        return;
    }

    if (typeof window !== 'undefined') {
        return;
    }

    if (typeof global === 'undefined') {
        return;
    }

    global.navigator = {
        userAgent: browserFakeUserAgent,
        getUserMedia: function() {}
    };

    if (!global.console) {
        global.console = {};
    }

    if (typeof global.console.log === 'undefined' || typeof global.console.error === 'undefined') {
        global.console.error = global.console.log = global.console.log || function() {
            console.log(arguments);
        };
    }

    if (typeof document === 'undefined') {
        /*global document:true */
        that.document = {
            documentElement: {
                appendChild: function() {
                    return '';
                }
            }
        };

        document.createElement = document.captureStream = document.mozCaptureStream = function() {
            var obj = {
                getContext: function() {
                    return obj;
                },
                play: function() {},
                pause: function() {},
                drawImage: function() {},
                toDataURL: function() {
                    return '';
                },
                style: {}
            };
            return obj;
        };

        that.HTMLVideoElement = function() {};
    }

    if (typeof location === 'undefined') {
        /*global location:true */
        that.location = {
            protocol: 'file:',
            href: '',
            hash: ''
        };
    }

    if (typeof screen === 'undefined') {
        /*global screen:true */
        that.screen = {
            width: 0,
            height: 0
        };
    }

    if (typeof URL === 'undefined') {
        /*global screen:true */
        that.URL = {
            createObjectURL: function() {
                return '';
            },
            revokeObjectURL: function() {
                return '';
            }
        };
    }

    /*global window:true */
    that.window = global;
})(typeof global !== 'undefined' ? global : null);

// requires: chrome://flags/#enable-experimental-web-platform-features

elementClass = elementClass || 'multi-streams-mixer';

var videos = [];
var isStopDrawingFrames = false;

var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
canvas.style.opacity = 0;
canvas.style.position = 'absolute';
canvas.style.zIndex = -1;
canvas.style.top = '-1000em';
canvas.style.left = '-1000em';
canvas.className = elementClass;
(document.body || document.documentElement).appendChild(canvas);

this.disableLogs = false;
this.frameInterval = 10;

this.width = 1920;
this.height = 1080;

// use gain node to prevent echo
this.useGainNode = true;

var self = this;

// _____________________________
// Cross-Browser-Declarations.js

// WebAudio API representer
var AudioContext = window.AudioContext;

if (typeof AudioContext === 'undefined') {
    if (typeof webkitAudioContext !== 'undefined') {
        /*global AudioContext:true */
        AudioContext = webkitAudioContext;
    }

    if (typeof mozAudioContext !== 'undefined') {
        /*global AudioContext:true */
        AudioContext = mozAudioContext;
    }
}

/*jshint -W079 */
var URL = window.URL;

if (typeof URL === 'undefined' && typeof webkitURL !== 'undefined') {
    /*global URL:true */
    URL = webkitURL;
}

if (typeof navigator !== 'undefined' && typeof navigator.getUserMedia === 'undefined') { // maybe window.navigator?
    if (typeof navigator.webkitGetUserMedia !== 'undefined') {
        navigator.getUserMedia = navigator.webkitGetUserMedia;
    }

    if (typeof navigator.mozGetUserMedia !== 'undefined') {
        navigator.getUserMedia = navigator.mozGetUserMedia;
    }
}

var MediaStream = window.MediaStream;

if (typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
    MediaStream = webkitMediaStream;
}

/*global MediaStream:true */
if (typeof MediaStream !== 'undefined') {
    // override "stop" method for all browsers
    if (typeof MediaStream.prototype.stop === 'undefined') {
        MediaStream.prototype.stop = function() {
            this.getTracks().forEach(function(track) {
                track.stop();
            });
        };
    }
}

var Storage = {};

if (typeof AudioContext !== 'undefined') {
    Storage.AudioContext = AudioContext;
} else if (typeof webkitAudioContext !== 'undefined') {
    Storage.AudioContext = webkitAudioContext;
}

if (!Storage.AudioContextConstructor) {
    Storage.AudioContextConstructor = new Storage.AudioContext();
}

self.audioContext = Storage.AudioContextConstructor;  
console.log("self.audioContext", self.audioContext) 

function setSrcObject(stream, element) {
    if ('srcObject' in element) {
        element.srcObject = stream;
    } else if ('mozSrcObject' in element) {
        element.mozSrcObject = stream;
    } else {
        element.srcObject = stream;
    }
}

this.startDrawingFrames = function() {
    drawVideosToCanvas();
};

function drawVideosToCanvas() {
    if (isStopDrawingFrames) {
        return;
    }

    canvas.width = self.width || 360;
    canvas.height = self.height || 240;     

    var fullcanvas = false;
    var remaining = [];
    videos.forEach(function(video) {
        if (!video.stream) {
            video.stream = {};
        }

        if (video.stream.fullcanvas) {
            fullcanvas = video;
        } else {
            // todo: video.stream.active or video.stream.live to fix blank frames issues?
            remaining.push(video);
        }
    });

    var videosLength = remaining.length;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const videosPerRow = (videosLength <= Math.sqrt(videosLength)) ? videosLength : Math.ceil(Math.sqrt(videosLength));
    const videosPerColumn = Math.ceil(videosLength / videosPerRow);

    // console.log("videosPerRow: " + videosPerRow)
    // console.log("videosPerColumn: " + videosPerColumn)
    
    const cols = Math.min(videosPerRow, videosLength);
    const rows = videosPerColumn; 

    // console.log("cols: " + cols)
    // console.log("rows: " + rows)    

    const videoWidth = canvasWidth / cols;
    const videoHeight = canvasHeight / rows;

    // console.log("videoWidth: " + videoWidth)
    // console.log("videoHeight: " + videoHeight)          

    var videoIndex = 0;
    for (var row = 0; row < rows && videoIndex < videosLength; row++) {
        for (var col = 0; col < cols && videoIndex < videosLength; col++) {
            const video = remaining[videoIndex];
            const x = col * videoWidth;
            const y = row * videoHeight;
            drawVideo(video, x, y, videoWidth, videoHeight);
            drawTextOnVideo(video, video.stream.nickname, videoIndex, videosPerRow, videosPerColumn) 
            videoIndex++
        }
    }
    setTimeout(drawVideosToCanvas, self.frameInterval);
}

function drawVideo(video, x, y, width, height) {
    const ratio = Math.min(width / video.width, height / video.height);
    const displayWidth = video.width * ratio;
    const displayHeight = video.height * ratio;

    context.drawImage(video, x, y, displayWidth, displayHeight);

    if (typeof video.stream.onRender === 'function') {
        video.stream.onRender(context, x, y, displayWidth, displayHeight);
    }
}

function drawTextOnVideo(video, textToDisplay, idx, videosPerRow, videosPerColumn){
    video.stream.onRender = function(context, x, y, width, height, idx) {
        context.font = '50px Roboto';
        const measuredTextWidth = context.measureText(textToDisplay).width;
        const measuredTextHeight = parseInt(context.font, 10);
    
        // Posiziona il testo nell'angolo in basso a sinistra
        const textX = x + 10; // Aggiunto un margine di 10 pixel dal bordo sinistro
        const textY = y + height - 10; // Aggiunto un margine di 10 pixel dal bordo inferiore
    
        // Disegna il rettangolo nero come sfondo per il testo
        context.strokeStyle = 'rgb(255, 255, 255)'; // Bianco per la cornice
        context.fillStyle = 'rgba(0, 0, 0, .5)'; // Nero per il riempimento
        context.fillRect(textX, textY - measuredTextHeight, measuredTextWidth + 20, measuredTextHeight + 10);
    
        // Disegna il testo bianco
        context.fillStyle = 'rgb(255, 255, 255)'; // Bianco per il testo
        context.fillText(textToDisplay, textX + 10, textY);
    };
    
}
function getMixedStream() {
    isStopDrawingFrames = false;
    var mixedVideoStream = getMixedVideoStream();

    var mixedAudioStream = getMixedAudioStream();
    if (mixedAudioStream) {
        mixedAudioStream.getTracks().filter(function(t) {
            return t.kind === 'audio';
        }).forEach(function(track) {
            mixedVideoStream.addTrack(track);
        });
    }

    var fullcanvas;
    arrayOfMediaStreams.forEach(function(stream) {
        if (stream.fullcanvas) {
            fullcanvas = true;
        }
    });

    // mixedVideoStream.prototype.appendStreams = appendStreams;
    // mixedVideoStream.prototype.resetVideoStreams = resetVideoStreams;
    // mixedVideoStream.prototype.clearRecordedData = clearRecordedData;

    return mixedVideoStream;
}

function getMixedVideoStream() {
    // resetVideoStreams();

    var capturedStream;

    if ('captureStream' in canvas) {
        capturedStream = canvas.captureStream();
    } else if ('mozCaptureStream' in canvas) {
        capturedStream = canvas.mozCaptureStream();
    } else if (!self.disableLogs) {
        console.error('Upgrade to latest Chrome or otherwise enable this flag: chrome://flags/#enable-experimental-web-platform-features');
    }

    var videoStream = new MediaStream();

    capturedStream.getTracks().filter(function(t) {
        return t.kind === 'video';
    }).forEach(function(track) {
        videoStream.addTrack(track);
    });

    canvas.stream = videoStream;

    return videoStream;
}

function getMixedAudioStream() {
    self.audioSources = [];

    if (self.useGainNode === true) {
        self.gainNode = self.audioContext.createGain();
        self.gainNode.connect(self.audioContext.destination);
        self.gainNode.gain.value = 0; // don't hear self
    }

    var audioTracksLength = 0;
    arrayOfMediaStreams.forEach(function(stream) {
        if (!stream.getTracks().filter(function(t) {
                return t.kind === 'audio';
            }).length) {
            return;
        }

        audioTracksLength++;

        var audioSource = self.audioContext.createMediaStreamSource(stream);

        if (self.useGainNode === true) {
            audioSource.connect(self.gainNode);
        }

        self.audioSources.push(audioSource);
    });

    if(!self.audioDestination) self.audioDestination = self.audioContext.createMediaStreamDestination();
    self.audioSources.forEach(function(audioSource) {
        audioSource.connect(self.audioDestination);
    });
    return self.audioDestination.stream;
}

function getVideo(stream) {
    var video = document.createElement('video');

    setSrcObject(stream, video);

    video.className = elementClass;

    video.muted = true;
    video.volume = 0;

    video.width = stream.width || self.width || 360;
    video.height = stream.height || self.height || 240;

    video.play();

    return video;
}

this.appendStreams = function(streams) {
    if (!streams) {
        throw 'First parameter is required.';
    }

    if (!(streams instanceof Array)) {
        streams = [streams];
    }

    streams.forEach(function(stream) {
        arrayOfMediaStreams.push(stream);

        var newStream = new MediaStream();

        if (stream.getTracks().filter(function(t) {
                return t.kind === 'video';
            }).length) {
            var video = getVideo(stream);
            video.stream = stream;
            videos.push(video);

            newStream.addTrack(stream.getTracks().filter(function(t) {
                return t.kind === 'video';
            })[0]);
        }

        if (stream.getTracks().filter(function(t) {
                return t.kind === 'audio';
            }).length) {
            var audioSource = self.audioContext.createMediaStreamSource(stream);
            if(!self.audioDestination) self.audioDestination = self.audioContext.createMediaStreamDestination();
            audioSource.connect(self.audioDestination);

            newStream.addTrack(self.audioDestination.stream.getTracks().filter(function(t) {
                return t.kind === 'audio';
            })[0]);
        }
    });
};

this.releaseStreams = function() {
    videos = [];
    isStopDrawingFrames = true;

    if (self.gainNode) {
        self.gainNode.disconnect();
        self.gainNode = null;
    }

    if (self.audioSources.length) {
        self.audioSources.forEach(function(source) {
            source.disconnect();
        });
        self.audioSources = [];
    }

    if (self.audioDestination) {
        self.audioDestination.disconnect();
        self.audioDestination = null;
    }

    if (self.audioContext) {
        self.audioContext.close();
    }

    self.audioContext = null;

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (canvas.stream) {
        canvas.stream.stop();
        canvas.stream = null;
    }
};

this.resetVideoStreams = function(streams) {
    if (streams && !(streams instanceof Array)) {
        streams = [streams];
    }

    resetVideoStreams(streams);
};

function resetVideoStreams(streams) {
    streams = streams || arrayOfMediaStreams;
   
    videos = [];
    arrayOfMediaStreams = [];


    // via: @adrian-ber
    streams.forEach(function(stream) {
        if (!stream.getTracks().filter(function(t) {
                return t.kind === 'video';
            }).length) {
            return;
        }

        arrayOfMediaStreams.push(stream); 
        var video = getVideo(stream);
        video.stream = stream;
        videos.push(video);
    });
}

// for debugging
this.name = 'MultiStreamsMixer';
this.toString = function() {
    return this.name;
};

this.getMixedStream = getMixedStream;

}

if (typeof RecordRTC === 'undefined') {
    if (typeof module !== 'undefined' /* && !!module.exports*/ ) {
        module.exports = MultiStreamsMixer;
    }

    if (typeof define === 'function' && define.amd) {
        define('MultiStreamsMixer', [], function() {
            return MultiStreamsMixer;
        });
    }
}
