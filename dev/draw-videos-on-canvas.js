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
   
    const cols = Math.min(videosPerRow, videosLength);
    const rows = videosPerColumn; 

    const videoWidth = canvasWidth / cols;
    const videoHeight = canvasHeight / rows;

    drawBackground();

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
    const videoAspectRatio = video.videoWidth / video.videoHeight;
    const containerAspectRatio = width / height;

    var displayHeight, displayWidth;

    if (videoAspectRatio < containerAspectRatio) {
        displayHeight = height;
        // Normalizzo larghezza rispetto all'altezza calcolata e all'aspect-ratio nativ del videos
        displayWidth = height * videoAspectRatio;
    } else {
        if (displayHeight > height) {
            displayHeight = height;
            displayWidth = height * videoAspectRatio;
        }else{
            displayWidth = width;
            displayHeight = width / videoAspectRatio;
        }        
    }    

    const offsetX = x + (width - displayWidth) / 2;
    const offsetY = y + (height - displayHeight) / 2;

    context.drawImage(video, offsetX, offsetY, displayWidth, displayHeight);

    if (typeof video.stream.onRender === 'function') {
        video.stream.onRender(context, offsetX, offsetY, displayWidth, displayHeight);
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