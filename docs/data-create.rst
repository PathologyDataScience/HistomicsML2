.. highlight:: shell

===================================================
Creating datasets for HistomicsML
===================================================

Datasets are created using a single Docker container that performs superpixel segmentation, feature extraction, and dimensionality reduction. This page describes how to use this docker image to generate new datasets from whole-slide images.

.. note:: Processing time depends on hardware. On a two-CPU system equipped with two NVIDIA P100 GPUs we observed 40 minutes for superpixel segmentation (CPU) and 1.5 hours for feature extraction (GPU) on a 40X objective 66K x 76K slide with 382,225 superpixels.

1. Create folders
====================================================================

Navigate to the base dataset folder

.. code-block:: bash

  $ cd myproject

Create subdirectories inside the base folder

.. code-block:: bash

  $ mkdir boundary centroid svs

  Superpixel boundaries and centroids (x,y) coordinates are stored in the *boundary* and *centroid* folders. The *myproject* folder contains the final transformed data in .h5 format that is ready for ingestion (see below). Finally, an *svs* directory contains whole-slide image files. Data from a single slide is included in the Docker image as an example.

2. Download the dataset creation Docker container
====================================================================

Download the HistomicsML dataset creation Docker container

.. code-block:: bash

  $ docker pull cancerdatascience/hml_dataset_gpu:1.0

Use ``SuperpixelSegmentation.py`` to generate superpixel boundaries and centroids

.. code-block:: bash

  $ docker run -it --rm --name createboundary -v "$PWD":/dataset cancerdatascience/hml_dataset_gpu:1.0 python scripts/SuperpixelSegmentation.py --superpixelSize 64 --patchSize 128

.. note::
  Parameters of the superpixel segmentation script ``SuperpixelSegmentation.py`` can be adjusted to change the size, shape, and threshold of superpixels to discard background regions

  --superpixelSize
    Superpixel edge length in pixels. Range is [8, 256] (default 64).

  --patchSize
    Patch size of each superpixel. Range is [8, 512] (default 128).

  --compactness
    Compactness of SLIC algorithm. Range is [0.01, 100] (default 50).

  --inputSlidePath
    Path to the directory of input slides. Set 'inputSlidePath' to '/dataset/svs/' when using your own slides. (default /svs/).

Check the generated outputs: boundaries and centroids

.. code-block:: bash

  $ ls boundary centroid
  boundary/your-slidename.txt
  centroid/your-slidename.h5


3. Create HistomicsML dataset
====================================================================

Create HistomicsML dataset.

.. note::
  Parameters of the feature extraction script ``FeatureExtraction.py`` can be adjusted to change the size and shape of superpixels. In addition, a boolean is added to provide the existing PCA transformation.

  --superpixelSize
    Superpixel edge length in pixels. Range is [8, 256] (default 64).

  --patchSize
    Patch size of each superpixel. Range is [8, 512] (default 128).

  --usePCAModel
    Boolean value to check whether the existing PCA transformation will be used or not. true/false (default true).

  --inputSlidePath
    Path to the directory of input slides. Set 'inputSlidePath' to '/dataset/svs/' when using your own slides. (default /svs/).

  --outputDataSetName
    Name of the HistomicsML dataset. '.h5' format should be used for ingestion (default HistomicsML_dataset.h5).

On a CPU system

.. code-block:: bash

  $ docker run -it --rm --name extractfeatures -v "$PWD":/dataset cancerdatascience/hml_dataset_gpu:1.0 python scripts/FeatureExtraction.py

On a GPU system (currently supporting CUDA 9.0, Linux x86_64 Driver Version >= 384.81):

.. code-block:: bash

  $ docker run --runtime=nvidia -it --rm --name extractfeatures -v "$PWD":/dataset cancerdatascience/hml_dataset_gpu:1.0 python scripts/FeatureExtraction.py

Check the generated outputs: HistomicsML dataset

.. code-block:: bash

  $ ls
  HistomicsML_dataset.h5
  pca_model_sample.pkl (will be created when 'usePCAModel' is set to false)
  boundary/your-slidename.txt
  centroid/your-slidename.h5
