import cv2 as cv
import numpy as np

from mouse import MouseHandler
from quad import Quad
from store import Store

store = Store('store.json')

cv.namedWindow('input', cv.WINDOW_GUI_NORMAL | cv.WINDOW_AUTOSIZE)
cv.moveWindow('input', 100, 500)
cv.namedWindow('output', cv.WINDOW_GUI_NORMAL | cv.WINDOW_AUTOSIZE)
cv.moveWindow('output', 750, 500)
cv.namedWindow('filtered', cv.WINDOW_GUI_NORMAL | cv.WINDOW_AUTOSIZE)
cv.moveWindow('filtered', 1250, 500)

capture = cv.VideoCapture(4)


def updateStorage():
    store.put('quad', quad.getPoints())


quad = Quad(store.get('quad'), MouseHandler('input'), updateStorage)

outputRes = 480
outputSize = (outputRes, outputRes)
squarePoints = ((0, 0), (outputRes, 0), (0, outputRes), (outputRes, outputRes))
lowerRed = np.array([145,100,20])
upperRed = np.array([195,180,250])
#lowerRed = np.array([100,60,20])
#upperRed = np.array([130,180,250])
kernel = np.ones((10, 10),np.uint8)

def printColor(x, y):
    print(hsv[y][x])

MouseHandler('output').onMouseDown = printColor

while True:
    ret, frame = capture.read()

    warpMatrix = cv.getPerspectiveTransform(np.float32(quad.getPoints()), np.float32(squarePoints))
    output = cv.warpPerspective(frame, warpMatrix, outputSize)
    cv.imshow('output', output)

    hsv = cv.cvtColor(output, cv.COLOR_BGR2HSV)
    filtered = cv.inRange(hsv, lowerRed, upperRed)
    filtered = cv.dilate(filtered, kernel, iterations = 1)
    cv.imshow('filtered', filtered)

    quad.update(frame)
    cv.imshow('input', frame)

    if cv.waitKey(1) == ord('q'):
        break

cv.destroyAllWindows()
capture.release()
