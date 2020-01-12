import cv2 as cv


class MouseHandler:
    def __init__(self, window):
        self.state = [0, 0, 0]
        self.onMouseDown = None
        cv.setMouseCallback(window, self.onMouse)

    def onMouse(self, event, x, y, flags, param):
        if event == cv.EVENT_MOUSEMOVE:
            self.state[0] = x
            self.state[1] = y
        if event == cv.EVENT_LBUTTONDOWN:
            self.state[2] = 1
            if self.onMouseDown is not None:
                self.onMouseDown(x, y)
        if event == cv.EVENT_LBUTTONUP:
            self.state[2] = 0
