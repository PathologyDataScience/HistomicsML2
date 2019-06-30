.. highlight:: shell

=================
Creating datasets
=================

A docker image is provided to help users create new datasest for HistomicsML. This page describes how the users create their new dataset using the docker image.

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

2. Pull the HistomicsML docker image

.. code-block:: bash

  $ docker pull cancerdatascience/hml_dataset_gpu:1.0

3. Run the docker image for superpixel segmentation

.. code-block:: bash

  $ docker run -it --rm --name createboundary -v "$PWD"/boundary:/boundary -v "$PWD"/centroid:/centroid cancerdatascience/hml_dataset_gpu:1.0 python scripts/SuperpixelSegmentation.py --superpixelSize 64 --patchSize 128

.. note:: Adjustable parameters of ``SuperpixelSegmentation.py`` and ``FeatureExtraction.py`` are following:

.. code-block:: bash
  1. superpixelSize - Superpixel size. Range is between 8 and 256. Default is 64.
  2. patchSize - Patch size for a superpixel. Range is between 8 and 512. Default is 128.
  3. compactness - Color and space proximity of SLIC algorithm. Range is between 0.01 and 100. Default is 50.
  4. min_fgnd_superpixel - The number of minimum foreground pixels in a superpixel. Default is 10.
  5. min_var_superpixel - Minumum variance of a superpixel. Range is between 0 and 1. Default is 0.0015.
  6. min_fgnd_frac - The minimum amount of foreground that must be present in a tile for it to be analyzed. Range is between 0 and 1. Default is 0.001.
  7. sample_fraction - Fraction of pixels to sample for normalization. Range is between 0 and 1. Default is 0.1.

4. Run the docker image for feature extraction

.. code-block:: bash

  # use the command line below if using CPU.
  $ docker run -it --rm --name extractfeatures -v "$PWD"/feature:/feature -v "$PWD"/centroid:/centroid cancerdatascience/hml_dataset_gpu:1.0 python scripts/FeatureExtraction.py --superpixelSize 64 --patchSize 128
  # use the command line below if using GPU. Current verion supports CUDA 9.0, Linux x86_64 Driver Version >= 384.81
  $ docker run --runtime=nvidia -it --rm --name extractfeatures -v "$PWD"/feature:/feature -v "$PWD"/centroid:/centroid cancerdatascience/hml_dataset_gpu:1.0 python scripts/FeatureExtraction.py --superpixelSize 64 --patchSize 128

5. Run the docker image to create a dataset

.. code-block:: bash

  $ docker run -it --rm --name createdataset -v "$PWD"/dataset:/dataset -v "$PWD"/feature:/feature cancerdatascience/hml_dataset_gpu:1.0 python scripts/CreateDataset.py

5. Confirm dataset

.. code-block:: bash

  $ ls "$PWD"/dataset "$PWD"/feature "$PWD"/boundary "$PWD"/centroid
