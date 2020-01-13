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

const app = new PIXI.Application({resizeTo: window});
document.body.appendChild(app.view);

const w = app.screen.width / 2;
const h = app.screen.height / 2;

function createSquare(x, y) {
  const square = new PIXI.Sprite(PIXI.Texture.WHITE);
  square.tint = 0xff0000;
  square.factor = 1;
  square.anchor.set(0.5);
  square.position.set(x, y);
  return square;
}

const squares = [
  createSquare(w - 150, h - 150),
  createSquare(w + 150, h - 150),
  createSquare(w + 150, h + 150),
  createSquare(w - 150, h + 150)
];

const quad = squares.map(s => s.position);

// add sprite itself
const texture = PIXI.Texture.from(canvas);
const containerSprite = new PIXI.projection.Sprite2d(texture);
containerSprite.anchor.set(0.5);

app.stage.addChild(containerSprite);
squares.forEach(s => {
  app.stage.addChild(s);
});

// Listen for animate update
app.ticker.add(delta => {
  texture.update();
  containerSprite.proj.mapSprite(containerSprite, quad);
});

squares.forEach(s => {
  addInteraction(s);
});

// === INTERACTION CODE  ===

function addInteraction(obj) {
  obj.interactive = true;
  obj
    .on("pointerdown", onDragStart)
    .on("pointerup", onDragEnd)
    .on("pointerupoutside", onDragEnd)
    .on("pointermove", onDragMove);
}

function onDragStart(event) {
  const obj = event.currentTarget;
  obj.dragData = event.data;
  obj.dragging = 1;
  obj.dragPointerStart = event.data.getLocalPosition(obj.parent);
  obj.dragObjStart = new PIXI.Point();
  obj.dragObjStart.copyFrom(obj.position);
  obj.dragGlobalStart = new PIXI.Point();
  obj.dragGlobalStart.copyFrom(event.data.global);
}

function onDragEnd(event) {
  const obj = event.currentTarget;
  if (obj.dragging !== 1) {
    obj.position.x = Math.min(Math.max(obj.position.x, 0), app.screen.width);
    obj.position.y = Math.min(Math.max(obj.position.y, 0), app.screen.height);
  }
  obj.dragging = 0;
  obj.dragData = null;
}

function onDragMove(event) {
  const obj = event.currentTarget;
  if (!obj.dragging) return;
  const data = obj.dragData;
  if (obj.dragging === 1) {
    if (Math.abs(data.global.x - obj.dragGlobalStart.x) + Math.abs(data.global.y - obj.dragGlobalStart.y) >= 3) {
      obj.dragging = 2;
    }
  }
  if (obj.dragging === 2) {
    const dragPointerEnd = data.getLocalPosition(obj.parent);
    obj.position.set(
      obj.dragObjStart.x + (dragPointerEnd.x - obj.dragPointerStart.x),
      obj.dragObjStart.y + (dragPointerEnd.y - obj.dragPointerStart.y)
    );
  }
}
