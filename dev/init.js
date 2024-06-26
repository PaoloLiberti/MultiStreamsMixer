// requires: chrome://flags/#enable-experimental-web-platform-features
this.disableLogs = false;
this.frameInterval = 33;

this.width = 1920;
this.height = 1080;

// use gain node to prevent echo
this.useGainNode = true;

elementClass = elementClass || 'multi-streams-mixer';

var videos = [];
var audios = [];
var isStopDrawingFrames = false;

var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
canvas.style.opacity = 0;
canvas.style.position = 'absolute';
canvas.style.zIndex = -1;
canvas.style.top = '-1000em';
canvas.style.left = '-1000em';
canvas.className = elementClass;

canvas.width = this.width;
canvas.height = this.height;

(document.body || document.documentElement).appendChild(canvas);

var self = this;
