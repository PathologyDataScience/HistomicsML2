.. highlight:: shell

===================================================
Creating boundaries and features for HistomicsML
===================================================

A docker image that performs superpixel segmentation, feature extraction, and dataset creation is provided to help users create a new datasest for HistomicsML-TA. This page describes how the users create their new dataset using the docker image.

.. note:: The processing time of creating boundaries and features for HistomicsML varies on different environments.
Below is an example of our environments::

      -- Two-socket server with 2 x 16 Intel Xeon cores, 256 GB memory, and NVIDIA Telsa P100 GPU.

      -- Slide Size: 66816 x 75520 pixels, Magnification: 40x

      -- superpixelSize: 64, patchSize: 128

      -- Superpixel segmentation: 40 minutes (only uses CPU)

      -- Feature extraction: 1 hour and 30 minutes (GPU) more than 6 hours (CPU)


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
--patchSize             Patch size range [8, 512]. Default 128.

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
