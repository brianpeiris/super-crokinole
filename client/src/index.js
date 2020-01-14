import Quad from "./quad.js";

let keypoints = [];
const socket = new WebSocket("ws://localhost:8282");
socket.onmessage = event => {
  keypoints = JSON.parse(event.data);
};

const ctx = canvas.getContext("2d");
const testSquare = { pos: { x: 0, y: 0 }, vel: { x: 5 + Math.random() * 5, y: 5 + Math.random() * 5 } };

requestAnimationFrame(function loop() {
  requestAnimationFrame(loop);

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 480, 480);

  ctx.fillStyle = "black";
  testSquare.pos.x += testSquare.vel.x;
  testSquare.pos.y += testSquare.vel.y;
  ctx.fillRect(testSquare.pos.x - 10, testSquare.pos.y - 10, 20, 20);
  if (testSquare.pos.x < 0 || testSquare.pos.x > 480) testSquare.vel.x *= -1;
  if (testSquare.pos.y < 0 || testSquare.pos.y > 480) testSquare.vel.y *= -1;

  for (const keypoint of keypoints) {
    const [x, y, s] = keypoint;
    ctx.beginPath();
    ctx.ellipse(x, y, s, s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
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
