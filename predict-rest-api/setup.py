#python setup.py build_ext --inplace
from distutils.core import setup
from Cython.Build import cythonize
from distutils.extension import Extension
import numpy
ext_modules=[
    Extension("getGrayUncertain",
    sources=["getGrayUncertain.pyx"],
    language="c++",
    ),
    Extension("getItemIndex",
    sources=["getItemIndex.pyx"],
    language="c++",
    ),
    Extension("getUncertainSamples",
    sources=["getUncertainSamples.pyx"],
    language="c++",
    ),
    Extension("loadPredictswithCenXY",
    sources=["loadPredictswithCenXY.pyx"],
    language="c++",
    )]

setup(
  name = 'extensions',
  ext_modules = cythonize(ext_modules),
  include_dirs=[numpy.get_include()]
)
