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
