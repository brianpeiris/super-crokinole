import Quad from "./quad.js";

let keypoints = [];
const socket = new WebSocket("ws://localhost:8282");
let lastMessageTime = 0;
const interpolate = false;
socket.onmessage = event => {
  const rawKeypoints = JSON.parse(event.data);
  if (interpolate) {
  const delta = Date.now() - lastMessageTime;
  for (let i = 0; i < rawKeypoints.length; i++) {
    const rawKeypoint = rawKeypoints[i];
    if (keypoints[i]) {
      const kp = keypoints[i];
      kp.vx = (rawKeypoint[0] - kp.x) / delta;
      kp.vy = (rawKeypoint[1] - kp.y) / delta;
      kp.s = rawKeypoint[2];
    } else {
      keypoints[i] = {
        x: rawKeypoint[0],
        y: rawKeypoint[1],
        vx: 0,
        vy: 0,
        s: rawKeypoint[2]
      };
    }
    lastMessageTime = Date.now();
  }} else {
    keypoints = rawKeypoints.map(kp => ({
      x: kp[0],
      y: kp[1],
      vx: 0,
      vy: 0,
    }));
  }
};

// prettier-ignore
const debugKeypoints = [
  [[50, 50, 20]],
  [[150, 150, 20]],
  [[200, 200, 20]],
  [[200, 200, 20]],
];

let debugKeypointIndex = 0;
//socket.onmessage({ data: JSON.stringify(debugKeypoints[debugKeypointIndex]) });
/*
setInterval(() => {
  if (debugKeypointIndex === 0) {
    lastMessageTime = 0;
    keypoints = [];
  }
  socket.onmessage({ data: JSON.stringify(debugKeypoints[debugKeypointIndex]) });
  debugKeypointIndex = (debugKeypointIndex + 1) % debugKeypoints.length;
}, 1000);
//*/

const ctx = canvas.getContext("2d");

let lastFrameTime = 0;
requestAnimationFrame(function loop(time) {
  requestAnimationFrame(loop);

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 480, 480);

  const delta = time - lastFrameTime;

  for (const keypoint of keypoints) {
    keypoint.x += keypoint.vx * delta;
    keypoint.y += keypoint.vy * delta;
    const { x, y, s } = keypoint;

    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.ellipse(x, y, 40, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.ellipse(x, y, 30, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
  lastFrameTime = time;
});

const app = new PIXI.Application({ resizeTo: window });
document.body.appendChild(app.view);

const w = app.screen.width / 2;
const h = app.screen.height / 2;

const quad = new Quad(app, w, h, () => {
  const points = quad.points.map(p => ({ x: p.x, y: p.y }));
  localStorage.setItem("points", JSON.stringify(points));
});
if (localStorage.getItem("points")) {
  quad.fromPoints(JSON.parse(localStorage.getItem("points")));
}

const canvasTexture = PIXI.Texture.from(canvas);
const canvasSprite = new PIXI.projection.Sprite2d(canvasTexture);
canvasSprite.anchor.set(0.5);

app.stage.addChild(canvasSprite);

app.ticker.add(delta => {
  canvasTexture.update();
  canvasSprite.proj.mapSprite(canvasSprite, quad.points);
});
