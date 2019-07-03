.. highlight:: shell

===================================================
Creating datasets for HistomicsML
===================================================

Datasets are created using a single Docker container that performs superpixel segmentation, feature extraction, and dimensionality reduction. This page describes how to use this docker image to generate new datasets from whole-slide images.

.. note:: Processing time depends on hardware. On a two-CPU system equipped with two NVIDIA P100 GPUs we observed 40 minutes for superpixel segmentation (CPU) and 1.5 hours for feature extraction (GPU) on a 40X objective 66K x 76K slide.

1. Create folders
====================================================================

Navigate to the base dataset folder

.. code-block:: bash

  $ cd myproject

Create subdirectories inside the base folder

.. code-block:: bash

  $ mkdir "$PWD"/dataset "$PWD"/feature "$PWD"/boundary "$PWD"/centroid

  Superpixel boundaries and centroids (x,y) coordinates are stored in the *boundary* and *centroid* folders. Features extracted from superpixels are stored in the *feature* folder. The *dataset* folder contains the final transformed data in .h5 format that is ready for ingestion (see below). Finally, an *svs* directory contains whole-slide image files. Data from a single slide is included in the Docker image as an example.

2. Download the dataset creation Docker container
====================================================================

Download the HistomicsML dataset creation Docker container

.. code-block:: bash

  $ docker pull cancerdatascience/hml_dataset_gpu:1.0

Use ``SuperpixelSegmentation.py`` to generate superpixel boundaries and centroids

.. code-block:: bash

  $ docker run -it --rm --name createboundary -v "$PWD"/boundary:/boundary -v "$PWD"/centroid:/centroid cancerdatascience/hml_dataset_gpu:1.0 python scripts/SuperpixelSegmentation.py --superpixelSize 64 --patchSize 128

.. note:: 
  Parameters of the superpixel segmentation script ``SuperpixelSegmentation.py`` can be adjusted to change the size, shape, and thresholding of superpixels to discard background regions
  
  -superpixelSize        An approximate edge length of each superpixel. Range is [8, 256]. Default 64.
  
  -patchSize             Patch size of each superpixel. Range is [8, 512]. Default 128.

3. Extract features
====================================================================

On a CPU system

.. code-block:: bash

  $ docker run -it --rm --name extractfeatures -v "$PWD"/feature:/feature -v "$PWD"/centroid:/centroid cancerdatascience/hml_dataset_gpu:1.0 python scripts/FeatureExtraction.py --superpixelSize 64 --patchSize 128

On a GPU system (currently supporting CUDA 9.0, Linux x86_64 Driver Version >= 384.81):

.. code-block:: bash

  $ docker run --runtime=nvidia -it --rm --name extractfeatures -v "$PWD"/feature:/feature -v "$PWD"/centroid:/centroid cancerdatascience/hml_dataset_gpu:1.0 python scripts/FeatureExtraction.py --superpixelSize 64 --patchSize 128

.. note:: 
  The patch size utilized by ``FeatureExtraction.py`` can be adjusted:

4. Create HistomicsML dataset and check outputs
====================================================================

Transform the superpixel segmentation and feature information into the final .h5 format for ingestion

.. code-block:: bash

  $ docker run -it --rm --name createdataset -v "$PWD"/dataset:/dataset -v "$PWD"/feature:/feature cancerdatascience/hml_dataset_gpu:1.0 python scripts/CreateDataSet.py

Check the generated outputs

.. code-block:: bash

  $ ls "$PWD"/dataset "$PWD"/feature "$PWD"/boundary "$PWD"/centroid
  # Note that the default dataset name of the current docker image is "BRCA-spfeatures-2.h5"
  dataset/BRCA-spfeatures-2.h5
  feature/your-slidename.h5
  boundary/your-slidename.txt
  centroid/your-slidename.h5
