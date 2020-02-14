.. highlight:: shell
.. _data-format:

===================
Data formats
===================

The format described here provides a template for users to generate HistomicsML2 datasets using their own segmentation and feature extraction methods. This section describes how to format user-generated data for import into HistomicsML2 and references the example dataset provided with the Docker containers.

A dataset consists of whole-slide images (.tif), a slide description table (.csv), object boundaries (.txt), histomic features (.h5), and optionally a PCA model (.pkl).


Slide description file
----------------------
A sample .csv table describes the dimensions, magnification, and location of the files for each whole-slide image on one line:

.. code-block:: bash

  <slide name>,<width in pixels>,<height in pixels>,<path to the pyramid on IIPServer>,<scale>

where scale = 1 for 20X objective scans, and scale = 2 for 40X objective scans. The file extension of the slides are not included in the slide name.

The contents of the example slide information file:

.. code-block:: bash

   $ more /datasets/BRCA/BRCA-pyramids.csv
   TCGA-3C-AALJ-01Z-00-DX1,95744,86336,/datasets/BRCA/tif/TCGA-3C-AALJ-01Z-00-DX1.svs.dzi.tif,2


Object boundaries file
----------------------

This .txt describes the centroids and boundary coordinates for each superpixel on one line:

.. code-block:: bash

  <slide name> \t <centroid x coordinate> \t <centroid y coordinate> \t <boundary points>

where \t is a tab character and <boundary points> are formatted as:
x1,y1 x2,y2 x3,y3 ... xN,yN (with a single space separating x,y coordinate pairs)

One line from the example boundaries file:

.. code-block:: bash

  $ head -n1 /datasets/BRCA/BRCA-boundaries.txt
  TCGA-3C-AALJ-01Z-00-DX1 2250.1 4043.0 2246,4043 2247,4043 2247 ... 2247,4043 2246,4043


Features file
-------------

Features are stored in an HDF5 binary array. The HDF5 file contains the following variables:

.. code-block:: bash

  /slides -	Names of the slides/images in the dataset
  /features - A D x N array of floats containing the feature values for each object in the dataset (D objects, each with N features).
  /slideIdx - D-length array containing the slide index of each object. Integer indices are assigned to each entry in 'slides' and are used to determine what slide each object originates from.
  /x_centroid - D-length array of floats containing the x coordinate of object centroids. Units are pixels in the base magnification layer, typically 20X or 40X.
  /y_centroid - D-length array of floats containing the y coordinate of object centroids. Units are pixels in the base magnification layer, typically 20X or 40X.
  /dataIdx - Array containing the object indices of the first object in each slide. Used to index by slide into the arrays 'features', 'x_centroid', and 'y_centroid'.
  /wsi_mean - Sample mean of the image in LAB color space for Reinhard color normalization.
  /wsi_std - Sample standard deviation of the image in LAB color space for Reinhard color normalization.

The contents of the feature file from the example feature file can be viewed using python's h5py library

.. code-block:: python

  >> import h5py
  >> file="/datasets/BRCA/BRCA-features-1.h5"
  >> contents = h5py.File(file)
  >> for i in contents:
  ...     print i
  ...
  # for loop will print out the feature information under the root of the HDF5.

  dataIdx
  features
  slideIdx
  slides
  wsi_mean
  wsi_std
  x_centroid
  y_centroid

  #contents of the 'features' array

  >> contents['features'][0]
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
