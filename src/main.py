import cv2 as cv
import numpy as np

from mouse import MouseHandler
from quad import Quad
from store import Store

cv.namedWindow('input', cv.WINDOW_GUI_NORMAL | cv.WINDOW_AUTOSIZE)
cv.namedWindow('output', cv.WINDOW_GUI_NORMAL | cv.WINDOW_AUTOSIZE)

capture = cv.VideoCapture(4)

store = Store('store.json')
def updateStorage():
    store.put('quad', quad.getPoints())

mouseHandler = MouseHandler('input')
quad = Quad(store.get('quad'), mouseHandler, updateStorage)
outputRes = 480
outputSize = (outputRes, outputRes)
squarePoints = ((0, 0), (outputRes, 0), (0, outputRes), (outputRes, outputRes))

while True:
    ret, frame = capture.read()

    warpMatrix = cv.getPerspectiveTransform(np.float32(quad.getPoints()), np.float32(squarePoints))
    output = cv.warpPerspective(frame, warpMatrix, outputSize)
    cv.imshow('output', output)

    quad.update(frame)
    cv.imshow('input', frame)

    if cv.waitKey(1) == ord('q'):
        break
