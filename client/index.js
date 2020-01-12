let keypoints = [];
const socket = new WebSocket("ws://localhost:8282");
socket.onmessage = event => {
  keypoints = JSON.parse(event.data);
};

const ctx = canvas.getContext('2d');
ctx.fillStyle = 'black';
requestAnimationFrame(function loop() {
  requestAnimationFrame(loop);
  ctx.clearRect(0, 0, 480, 480);
  for(const keypoint of keypoints) {
    const [x, y, s] = keypoint;
    ctx.beginPath();
    ctx.ellipse(x, y, s, s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
});
