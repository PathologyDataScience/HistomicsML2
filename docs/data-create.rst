.. highlight:: shell

===================================================
Creating datasets for HistomicsML
===================================================

Datasets are created using a single Docker container that performs superpixel segmentation, feature extraction, and dimensionality reduction. This page describes how to use this docker image to generate new datasets from whole-slide images.

.. note:: Processing time depends on hardware. On a two-CPU system equipped with two NVIDIA P100 GPUs we observed 40 minutes for superpixel segmentation (CPU) and 1.5 hours for feature extraction (GPU) on a 40X objective 66K x 76K slide with 382,225 superpixels.

1. Create project folders
====================================================================

Navigate to the folder where you want to generate a dataset

.. code-block:: bash

  $ cd myproject

Create directories in this base project folder to store superpixel boundaries and centroids

.. code-block:: bash

  $ mkdir boundary centroid svs

*myproject* will contain the final transformed data in .h5 format that is ready for ingestion (see below). The *svs* directory contains the whole-slide image files to be analyzed. Data from a single slide is provided in the Docker images as an example.


2. Convert whole-slide images to pyramidal tif format
====================================================================

Whole-slide images need to be converted to a pyramidal .tif format that is compatible with the IIPImage server (http://iipimage.sourceforge.net/documentation/server/). The data generation docker contains the VIPs library to support this conversion (http://www.vips.ecs.soton.ac.uk/index.php?title=VIPS).

VIPs steps here

.. code-block:: bash

  $ mkdir tif && cd tif
  # convert slides to .tif format
  $ ls
  your-slidename.svs.dzi.tif


3. Generate superpixel segmentation
====================================================================

Download the HistomicsML dataset creation Docker container

.. code-block:: bash

  $ docker pull cancerdatascience/hml_dataset_gpu:1.0

Use ``SuperpixelSegmentation.py`` to generate superpixel boundaries and centroids

.. code-block:: bash

  $ docker run -it --rm --name createboundary -v "$PWD":/dataset cancerdatascience/hml_dataset_gpu:1.0 python scripts/SuperpixelSegmentation.py --superpixelSize 64 --patchSize 128

The -v option here mounts the base project folder inside the Docker container so the data can be output there.

.. note::
  Parameters of the superpixel segmentation script ``SuperpixelSegmentation.py`` can be adjusted to change the size, shape, and threshold of superpixels to discard background regions

  --superpixelSize
    Superpixel edge length in pixels. Range is [8, 256] (default 64).

  --patchSize
    Patch edge length in pixels. Range is [8, 512] (default 128).

  --compactness
    SLIC compactness parameter. Range is [0.01, 100] (default 50).

  --inputSlidePath
    Path to the directory of input slides. Set 'inputSlidePath' to '/dataset/svs/' when using your own slides. (default /svs/).

Check the generated outputs: boundaries and centroids

.. code-block:: bash

  $ ls boundary centroid
  boundary/your-slidename.txt
  centroid/your-slidename.h5


4. Generate features
====================================================================

Extract features using the whole-slide images and superpixel segmentation

.. note::
  Parameters of the feature extraction script ``FeatureExtraction.py`` can be adjusted to change the size and shape of superpixels. In addition, a boolean is added to provide the existing PCA transformation.

  --superpixelSize
    Superpixel edge length in pixels. Range is [8, 256] (default 64).

  --patchSize
    Patch size of each superpixel. Range is [8, 512] (default 128).

  --usePCAmodel
    'true' if re-using an exsiting PCA transformation. When applying a trained model to a new dataset (inference) the PCA transform from the training dataset should be re-used. 'false' to generate a new PCA transformation (default 'true').

  --inputPCAModel
    Path to .pkl file defining existing PCA transformation.

  --inputSlidePath
    Path to the directory of input slides as mounted in the Docker container. Typically '/dataset/svs/'.

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
