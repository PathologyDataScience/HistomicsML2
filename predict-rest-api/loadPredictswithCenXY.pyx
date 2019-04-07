#python setup.py build_ext --inplace
import numpy as np
cimport numpy as np
cimport cython
from libcpp.vector cimport vector

def load(long xMin, long xMax, long yMin, long yMax,
double[:, :] x_centroid, double[:, :] y_centroid):

    cdef long nrows = x_centroid.shape[0]
    # cdef vector[double] x_tags
    # cdef vector[double] y_tags
    cdef vector[long] index
    cdef long i

    with nogil:
        for i in range(nrows):
            if x_centroid[i, 0] >= xMin and x_centroid[i, 0] <= xMax and y_centroid[i, 0] >= yMin and y_centroid[i, 0] <= yMax:
                index.push_back(i)
                # x_tags.push_back(x_centroid[i, 0])
                # y_tags.push_back(y_centroid[i, 0])

    return index
