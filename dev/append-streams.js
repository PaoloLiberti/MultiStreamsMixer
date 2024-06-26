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

            // newStream.addTrack(stream.getTracks().filter(function(t) {
            //     return t.kind === 'video';
            // })[0]);
        }

        if (stream.getTracks().filter(function(t) {
                return t.kind === 'audio';
            }).length) {
                
            var gainNode = self.audioContext.createGain();
            gainNode.gain.value = 1;

            var audioSource = self.audioContext.createMediaStreamSource(stream);

            try {
                var audioSourceConnect = audioSource.connect(gainNode);  
                console.warn("audioSourceConnect: ", audioSourceConnect);
            } catch (error) {
                console.error(error)
            }

            console.log("🚀 ~ streams.forEach ~ audioSource:", audioSource)
            if(!self.audioDestination) {
                self.audioDestination = self.audioContext.createMediaStreamDestination();
                console.log("🚀 ~ streams.forEach CREATE NEW ~ self.audioDestination:", self.audioDestination)
            }
            
            try {
                var gainAudioDestination = gainNode.connect(self.audioDestination);   
                console.warn("gainAudioDestination: ", gainAudioDestination)
            } catch (error) {
                console.error(error)
            }
            audios.push({"gainNode": gainNode, "audioSource": audioSource});

            // newStream.addTrack(self.audioDestination.stream.getTracks().filter(function(t) {
            //     return t.kind === 'audio';
            // })[0]);
        }
    });
};
