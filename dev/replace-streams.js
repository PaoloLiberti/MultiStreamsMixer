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
                console.log("🚀 ~ streams video forEach ~ t:", stream);
                var video = getVideo(stream);
                video.stream = stream;
                activeVideos.push(video);
        }

        else if (stream.getTracks().filter(function(t) {
            return t.kind === 'audio';
        }).length && type === 'audio') {
            try {
                console.log("🚀 ~ streams audio forEach ~ t:", stream);

                var activeAudio = audios.filter(function(a){
                    console.log("🚀 ~ audios.filter ~ a:", a)
                    try {
                        return a["audioSource"].mediaStream === stream   
                    } catch (error) {
                        console.error("error dentro filter ", error)
                        return;
                    }
                })
                if (activeAudio) activeAudios.push(activeAudio[0])                
            } catch (error) {
                console.error("ERROR FATALE: ", error)
            }

        }        
    });

    if(type === 'video'){
        videos = activeVideos;
    }
    
    if(type === 'audio'){
        try {
            console.log("🚀 ~ removedAudios ~ audios:", audios)
            console.log("🚀 ~ removedAudios ~ videos:", videos)
            console.log("🚀 ~ return!activeAudios.some ~ activeAudios:", activeAudios)            
            var removedAudios = audios.filter(function(audio) {
                return !activeAudios.some(function(ac) {
                    console.log(" **************** DENTRO SOME FILTER REMOVE AUDIOS")
                    console.log("🚀 ~ return!activeAudios.some ~ audio[audioSource].mediaStream:", audio)
                    console.log("🚀 ~ return!activeAudios.some ~ ac[audioSource].mediaStream:", ac)
                    console.log("[END ] **************** DENTRO SOME FILTER REMOVE AUDIOS")
                    return audio["audioSource"].mediaStream === ac["audioSource"].mediaStream;
                });
            });
            console.log("🚀 ~ removedAudios ~ removedAudios:", removedAudios)
    
            audios = activeAudios;
    
            console.log("🚀 ~ [END ] resetVideoStreams ~ audios:", audios)            
        } catch (error) {
            console.error("ERRORE TYPE audio: ", error)
        }


        removedAudios.forEach(function(audio) {
            console.log("🚀 ~ removedAudios.forEach ~ audio:", audio)
            console.log("🚀 ~ removedAudios.forEach ~ typeof audio:", typeof audio)
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
}
