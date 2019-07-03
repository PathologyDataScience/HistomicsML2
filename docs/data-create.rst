.. highlight:: shell

===================================================
Creating datasets for HistomicsML
===================================================

Dataset creation is performed using a single docker image that performs superpixel segmentation, feature extraction, and dataset creation. This page describes how to use this docker image to create new datasets from whole-slide images.

.. note:: Processing time for dataset creation depends on hardware. On a two-CPU system equipped with two NVIDIA P100 GPUs we observed 40 minutes for superpixel segmentation (CPU) and 1.5 hours for feature extraction (GPU) on a 66K x 76K 40X objective slide.

1. Create your local directories.

.. code-block:: bash

  # Directories below should be ready before creating a new dataset.
  # svs - a slide image directory name. Users have to place their images to this directory.
  # A .svs file in "/svs" directory of the docker image is provided as an example.
  # feature - a feature directory name. Feature data for each slide will be storied in this directory.
  # boundary - a boundary directory name. Boundary data for each slide will be storied in this directory.
  # centroid - a centroid directory name. Centroid data for each slide will be storied in this directory.
  # dataset - a dataset directory name. A dataset will be created in this directory.
  # create directories for feature, boundary, centroid, and dataset.
  $ mkdir "$PWD"/dataset "$PWD"/feature "$PWD"/boundary "$PWD"/centroid

2. Pull the HistomicsML-TA docker image.

.. code-block:: bash

  $ docker pull cancerdatascience/hml_dataset_gpu:1.0

3. Create boundaries and centroids of superpixels.

.. code-block:: bash

  $ docker run -it --rm --name createboundary -v "$PWD"/boundary:/boundary -v "$PWD"/centroid:/centroid cancerdatascience/hml_dataset_gpu:1.0 python scripts/SuperpixelSegmentation.py --superpixelSize 64 --patchSize 128

.. note:: Adjustable parameters of ``SuperpixelSegmentation.py`` and ``FeatureExtraction.py`` are following::

--superpixelSize        An approximate edge length of each superpixel.
                        Range is [8, 256]. Default 64.
--patchSize             Patch size of each superpixel. Range is [8, 512]. Default 128.

4. Create features of superpixels.

.. code-block:: bash

  # use the command line below if using CPU.
  $ docker run -it --rm --name extractfeatures -v "$PWD"/feature:/feature -v "$PWD"/centroid:/centroid cancerdatascience/hml_dataset_gpu:1.0 python scripts/FeatureExtraction.py --superpixelSize 64 --patchSize 128
  # use the command line below if using GPU. Current verion supports CUDA 9.0, Linux x86_64 Driver Version >= 384.81
  $ docker run --runtime=nvidia -it --rm --name extractfeatures -v "$PWD"/feature:/feature -v "$PWD"/centroid:/centroid cancerdatascience/hml_dataset_gpu:1.0 python scripts/FeatureExtraction.py --superpixelSize 64 --patchSize 128

5. Create HistomicsML dataset.

.. code-block:: bash

  $ docker run -it --rm --name createdataset -v "$PWD"/dataset:/dataset -v "$PWD"/feature:/feature cancerdatascience/hml_dataset_gpu:1.0 python scripts/CreateDataSet.py

6. Outputs.

.. code-block:: bash

  $ ls "$PWD"/dataset "$PWD"/feature "$PWD"/boundary "$PWD"/centroid
  # Note that the default dataset name of the current docker image is "BRCA-spfeatures-2.h5"
  dataset/BRCA-spfeatures-2.h5
  feature/your-slidename.h5
  boundary/your-slidename.txt
  centroid/your-slidename.h5
