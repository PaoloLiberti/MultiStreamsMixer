this.resetVideoStreams = function(streams, type) {
    if (streams && !(streams instanceof Array)) {
        streams = [streams];
    }

    resetVideoStreams(streams, type);
};

function resetVideoStreams(streams, type) {
    streams = streams || arrayOfMediaStreams;
   
    arrayOfMediaStreams = [];

    var activeAudios = []
    var activeVideos = []

    streams.forEach(function(stream) {
        arrayOfMediaStreams.push(stream); 

        if (stream.getTracks().filter(function(t) {
            return t.kind === 'video';
        }).length && type === 'video') {
                var video = getVideo(stream);
                video.stream = stream;
                activeVideos.push(video);
        }

        else if (stream.getTracks().filter(function(t) {
            return t.kind === 'audio';
        }).length && type === 'audio') {
            try {
                var activeAudio = audios.filter(function(a){
                    try {
                        return a["audioSource"].mediaStream === stream   
                    } catch (error) {
                        console.error(error)
                        return;
                    }
                })
                if (activeAudio) activeAudios.push(activeAudio[0])                
            } catch (error) {
                console.error(error)
            }

        }        
    });

    if(type === 'video'){
        videos = activeVideos;
    }
    
    if(type === 'audio'){
        try {            
            var removedAudios = audios.filter(function(audio) {
                return !activeAudios.some(function(ac) {
                    return audio["audioSource"].mediaStream === ac["audioSource"].mediaStream;
                });
            });
    
            audios = activeAudios;
    
        } catch (error) {
        }


        removedAudios.forEach(function(audio) {
            audio["gainNode"].gain.value = 0;
            try {
                audio["gainNode"].disconnect(self.audioDestination);   
            } catch (error) {
                console.error(error);
            }
        })
    }
}
