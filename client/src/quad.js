class Draggable {
  constructor(app, x, y, dragEndCallback) {
    this.app = app;
    this.dragEndCallback = dragEndCallback;
    const handle = new PIXI.Sprite(PIXI.Texture.WHITE);
    handle.tint = 0xff0000;
    handle.factor = 1;
    handle.anchor.set(0.5);
    handle.position.set(x, y);
    handle.interactive = true;
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onDragMove = this.onDragMove.bind(this);
    handle
      .on("pointerdown", this.onDragStart)
      .on("pointerup", this.onDragEnd)
      .on("pointerupoutside", this.onDragEnd)
      .on("pointermove", this.onDragMove);
    app.stage.addChild(handle);
    this.handle = handle;
  }

  onDragStart(event) {
    const obj = event.currentTarget;
    obj.dragData = event.data;
    obj.dragging = 1;
    obj.dragPointerStart = event.data.getLocalPosition(obj.parent);
    obj.dragObjStart = new PIXI.Point();
    obj.dragObjStart.copyFrom(obj.position);
    obj.dragGlobalStart = new PIXI.Point();
    obj.dragGlobalStart.copyFrom(event.data.global);
  }

  onDragEnd(event) {
    const obj = event.currentTarget;
    if (obj.dragging !== 1) {
      obj.position.x = Math.min(Math.max(obj.position.x, 0), this.app.screen.width);
      obj.position.y = Math.min(Math.max(obj.position.y, 0), this.app.screen.height);
    }
    obj.dragging = 0;
    obj.dragData = null;
    this.dragEndCallback();
  }

  onDragMove(event) {
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
}

export default class Quad {
  constructor(app, x, y, dragEndCallback) {
    this.tl = new Draggable(app, x - 150, y - 150, dragEndCallback);
    this.tr = new Draggable(app, x + 150, y - 150, dragEndCallback);
    this.br = new Draggable(app, x + 150, y + 150, dragEndCallback);
    this.bl = new Draggable(app, x - 150, y + 150, dragEndCallback);
    this.points = [
      this.tl.handle.position,
      this.tr.handle.position,
      this.br.handle.position,
      this.bl.handle.position
    ];
    window.points = this.points;
  }
  fromPoints(points) {
    this.tl.handle.position.x = points[0].x;
    this.tl.handle.position.y = points[0].y;
    this.tr.handle.position.x = points[1].x;
    this.tr.handle.position.y = points[1].y;
    this.br.handle.position.x = points[2].x;
    this.br.handle.position.y = points[2].y;
    this.bl.handle.position.x = points[3].x;
    this.bl.handle.position.y = points[3].y;
  }
}
