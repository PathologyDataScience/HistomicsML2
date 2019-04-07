import numpy as np
cimport numpy as np
cimport cython
from libcpp.vector cimport vector
from libc.math cimport fabs

def get(double[:] predict not None):

    cdef long nrows = predict.shape[0]
    cdef long count = 8
    cdef double[:] selScores = np.ones((count,), dtype=np.double)
    cdef long[:] picks = np.zeros((count,), dtype=np.int)
    cdef long i, minIdx
    cdef double scores, objScore

    with nogil:
        for i in range(nrows):
            scores = (predict[i] * 2 ) - 1
            objScore = fabs(scores)
            minIdx = count - 1
            if objScore < fabs(selScores[minIdx]):
                while minIdx > 0 and objScore < fabs(selScores[minIdx - 1]):
                    selScores[minIdx] = selScores[minIdx - 1]
                    picks[minIdx] = picks[minIdx - 1]
                    minIdx = minIdx - 1

                selScores[minIdx] = scores
                picks[minIdx] = i

    return selScores, picks
