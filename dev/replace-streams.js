this.resetVideoStreams = function(streams, type) {
    if (streams && !(streams instanceof Array)) {
        streams = [streams];
    }

    resetVideoStreams(streams, type);
};

function resetVideoStreams(streams, type) {
    streams = streams || arrayOfMediaStreams;
   
    videos = [];
    arrayOfMediaStreams = [];

    var activeAudios = []

    streams.forEach(function(stream) {
        arrayOfMediaStreams.push(stream); 

        if (stream.getTracks().filter(function(t) {
                return t.kind === 'video';
            }).length) {
                console.log("🚀 ~ streams video forEach ~ t:", stream);
                var video = getVideo(stream);
                video.stream = stream;
                videos.push(video);
        }

        if (stream.getTracks().filter(function(t) {
            return t.kind === 'audio';
        }).length) {
            try {
                console.log("🚀 ~ streams audio forEach ~ t:", stream);
                var activeAudio = audios.filter(function(a){
                    console.log("🚀 ~ audios.filter ~ a:", a)
                    return a["audioSource"].mediaStream === stream
                })
                if (activeAudio) activeAudios.push(activeAudio)                
            } catch (error) {
                console.error("ERROR FATALE: ", error)
            }

        }        
    });
    var removedAudios = audios.filter(function(audio) {
        return !activeAudios.some(function(audioStream) {
            return audio["audioSource"].mediaStream === audioStream;
        });
    });
    
    if(type === 'audio'){
        audios = activeAudios;
        console.log("🚀 ~ [END ] resetVideoStreams ~ audios:", audios)
        removedAudios.forEach(function(audio) {
            console.log(typeof audio["gainNode"])
            console.log("🚀 ~ audios.forEach ~ gainNode:", audio["gainNode"])
            audio["gainNode"].gain.value = 0;
            try {
                audio["gainNode"].disconnect(self.audioDestination);   
            } catch (error) {
                console.error(error);
            }
        })
    }

    // console.log("🚀 ~ [END ] resetVideoStreams ~ audios:", audios)
    // console.log("🚀 ~ [END ] resetVideoStreams ~ activeAudios:", activeAudios)
    // console.log("🚀 ~ [END ] resetVideoStreams ~ removedAudios:", removedAudios)    
    // removedAudios.forEach(function(mediaSourceAudioNode) {
    //     mediaSourceAudioNode = mediaSourceAudioNode[0]
    //     console.log("************************ removed audio");
    //     console.log(mediaSourceAudioNode);
    //     console.log(typeof mediaSourceAudioNode);
    //     try {
    //         mediaSourceAudioNode.disconnect();
    //     } catch (error) {
    //         console.error(error);
    //     }
    // });
}
