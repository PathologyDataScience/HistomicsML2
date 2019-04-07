import numpy as np
cimport numpy as np
cimport cython

def getIdx(double[:, :] centX, double[:, :] centY, long[:, :] slideIdx,
    double c_centX, double c_centY, long c_slideIdx):

    cdef long nsamples = centX.shape[0]
    cdef long i, idx

    with nogil:
        for i in range(nsamples):
            if c_centX == centX[i, 0] and c_centY == centY[i, 0] and c_slideIdx == slideIdx[i, 0]:
                idx = i
                break

    return idx
