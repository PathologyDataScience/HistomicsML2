.. highlight:: shell

==============
Formatting datasets
==============

This section describes how to format your own datasets for importing into HistomicsML. A datasets consists of whole-slide images (.tif), a slide description (.csv), object boundaries (.txt) and histomic features (.h5).

Whole-slide images
------------------

Whole-slide images need to be converted to a pyramidal .tif format that is compatible with the IIPImage server (http://iipimage.sourceforge.net/documentation/server/). We have used Vips (http://www.vips.ecs.soton.ac.uk/index.php?title=VIPS)
to perform this conversion for our datasets.

.. note:: The path to the image needs to be saved in the database.
   HistomicsML uses the database to get the path when forming a request for the IIPIMage server.


Slide description
------------------------------------
A table (.csv) needs to be created to capture the dimensions, magnification, and location of the files for each slide image:

.. code-block:: bash

  <slide name>,<width in pixels>,<height in pixels>,<path to the pyramid on IIPServer>,<scale>

where scale = 1 for 20x and scale = 2 for 40x.

For the sample data provided in the database container, our slide description file (BRCA-pyramids.csv) has the following contents:

.. code-block:: bash

   TCGA-3C-AALJ-01Z-00-DX1,95744,86336,/localdata/pyramids/BRCA/TCGA-3C-AALJ-01Z-00-DX1.svs.dzi.tif,2



Object boundaries
----------
Boundary information is formatted as a tab-delimited text file where each line describes the centroids and boundary coordinates for one object:

.. code-block:: bash

  <slide name> \t <centroid x coordinate> \t <centroid y coordinate> \t <boundary points>

where \t is a tab character and <boundary points> are formatted as:
x1,y1 x2,y2 x3,y3 ... xN,yN (with spaces between coordinate pairs)

One line from the sample data boundaries file (BRCA-boundaries.txt):

.. code-block:: bash

  TCGA-3C-AALJ-01Z-00-DX1 2250.1 4043.0 2246,4043 2247,4043 2247 ... 2247,4043 2246,4043



Histomic features
--------

Features are stored in an HDF5 binary array format. The HDF5 file contains the following variables:

.. code-block:: bash

  /slides -	Names of the slides/images in the dataset
  /features - A D x N array of floats containing the feature values for each object in the dataset (D objects, each with N features).
  /slideIdx - N-length array containing the slide index of each object. These indices can be used with the 'slides' variable to determine what slide each object originates from.
  /x_centroid - N-length array of floats containing the x coordinate of object centroids.
  /y_centroid - N-length array of floats containing the x coordinate of object centroids.
  /dataIdx - Array containing the index of the first object of each slide in 'features', 'x_centroid', and 'y_centroid' (this information can also be obtained from 'slideIdx' and will be eliminated in the future).
  /wsi_mean - Sample mean of the image in LAB color space for Reinhard color normalization.
  /wsi_std - Sample standard deviation of the image in LAB color space for Reinhard color normalization.

The sample file (BRCA-features-1.h5) provided in the database docker container can be queried to examine the structure with the following the command.

.. code-block:: python

  >>> import h5py
  >>> file="BRCA-features-1.h5"
  >>> contents = h5py.File(file)
  >>> for i in contents:
  ...     print i
  ...
  # for loop will print out the feature information under the root of HDF5.

  dataIdx
  features
  slideIdx
  slides
  wsi_mean
  wsi_std
  x_centroid
  y_centroid

  #for further step, if you want to see the details.

  >>> contents['features'][0]
  array([-6.6270187e+01,  2.2519203e+01,  1.9128393e+01, -5.5189757e+00,
        4.8610997e+00,  6.4421225e-01, -2.8530896e+00,  4.4713855e+00,
        5.2029357e+00,  2.1140134e+00,  4.0678120e+00,  5.7025075e+00,
       -2.9773681e+00, -1.7740736e+00,  3.1053669e+00,  4.0015540e+00,
       -5.8424449e+00,  8.3535604e+00,  1.7886569e+00,  4.9754381e+00,
        9.0291014e+00, -5.0825782e+00,  4.6905100e-01,  8.8104753e+00,
        6.1607981e+00,  8.0138278e-01, -3.9697029e-02, -6.9302006e+00,
       -2.0634446e+00, -4.2065005e+00,  6.3333483e+00, -3.1875503e+00,
        6.5222058e+00, -6.2669392e+00,  2.1898651e+00,  8.6684000e-01,
       -1.6624545e+00,  1.0607558e+01,  1.8903568e+00, -2.6199970e+00,
       -4.1902885e+00, -1.0361324e+01, -7.3610363e+00, -6.8901229e+00,
        3.8562522e+00, -7.5902290e+00,  3.7865620e+00,  2.6605055e+00,
       -3.2112164e+00,  4.2868023e+00,  6.2832636e-01, -7.1512747e+00,
        7.1633124e+00,  4.2123771e+00,  5.8183951e+00, -1.5326637e+00,
       -4.2727118e+00,  1.4936157e+00,  2.4031213e-01,  5.3655642e-01,
       -6.8227062e+00, -5.5922155e+00, -1.1424997e+01, -4.3417501e+00],
      dtype=float32)
