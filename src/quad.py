import cv2 as cv


class Draggable:
    def __init__(self, name, mouseHandler, pos, dragEndCallback=None):
        self.pos = pos
        self.dragging = False
        self.dragEndCallback = dragEndCallback
        self.mouseHandler = mouseHandler
        self.name = name

    def update(self, dst):
        mx, my, button = self.mouseHandler.state
        x, y = self.pos
        margin = 20
        hit = (x - margin < mx and mx < x + margin) and (y - margin < my and my < y + margin)

        if self.dragging:
            if button == 0:
                self.dragging = False
                if self.dragEndCallback is not None:
                    self.dragEndCallback()
        else:
            if hit and button == 1:
                self.dragOffset = (mx - x, my - y)
                self.dragging = True

        if self.dragging:
            color = (0, 0, 255)
            self.pos = (mx - self.dragOffset[0], my - self.dragOffset[1])
        else:
            if hit:
                color = (0, 255, 0)
            else:
                color = (255, 0, 0)

        x, y = self.pos

        cv.line(dst, (x - margin, y), (x + margin, y), color, 1)
        cv.line(dst, (x, y - margin), (x, y + margin), color, 1)
        cv.putText(dst, self.name, (x + int(margin / 2), y - int(margin / 2)), cv.FONT_HERSHEY_PLAIN, 1, color)


class Quad:
    def __init__(self, mouseHandler):
        self.tl = Draggable('TL', mouseHandler, (10, 10))
        self.tr = Draggable('TR', mouseHandler, (100, 10))
        self.bl = Draggable('BL', mouseHandler, (10, 100))
        self.br = Draggable('BR', mouseHandler, (100, 100))

    def update(self, dst):
        blue = (255, 0, 0)
        cv.line(dst, self.tl.pos, self.tr.pos, blue, 1)
        cv.line(dst, self.tr.pos, self.br.pos, blue, 1)
        cv.line(dst, self.br.pos, self.bl.pos, blue, 1)
        cv.line(dst, self.bl.pos, self.tl.pos, blue, 1)
        self.tl.update(dst)
        self.tr.update(dst)
        self.bl.update(dst)
        self.br.update(dst)

    def getPoints(self):
        return (self.tl.pos, self.tr.pos, self.bl.pos, self.br.pos)
