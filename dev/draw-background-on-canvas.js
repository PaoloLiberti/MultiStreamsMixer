function drawBackground() {
    
    const gradient = context.createRadialGradient(970, 530, 290, 960, 540, 580);
    gradient.addColorStop(0, "#eeaeca");
    gradient.addColorStop(1, "#94bbe9");
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
}

drawBackground();
