.. highlight:: shell

=================
Creating datasets
=================

A docker image is provided to help users create new datasest for HistomicsML. This page describes how the users create their new dataset using the docker image.
As an example, .svs file is included in the docker image.

1. Set your local directories.

Following directories should be ready before creating a new dataset.

.. code-block:: bash

  # svs - a slide image directory name. Users have to place their images to this directory.
  For your convenience, we provide a .svs file in "/svs" directory of the docker image as an example.
  # feature - a feature directory name. Feature data for each slide will be storied in this directory.
  # boundary - a boundary directory name. Boundary data for each slide will be storied in this directory.
  # centroid - a centroid directory name. Centroid data for each slide will be storied in this directory.
  # dataset - a dataset directory name. A dataset will be created in this directory.
  # create directories for feature, boundary, centroid, and dataset.
  $ mkdir "$PWD"/dataset "$PWD"/feature "$PWD"/boundary "$PWD"/centroid

2. Pull the HistomicsML docker image

.. code-block:: bash

  $ docker pull cancerdatascience/hml_dataset:1.0

3. Run the docker image for superpixel segmentation

.. code-block:: bash

  $ docker run -it --rm --name createboundary -v "$PWD"/boundary:/boundary -v "$PWD"/centroid:/centroid cancerdatascience/hml_dataset:1.0 python scripts/SuperpixelSegmentation.py

4. Run the docker image for feature extraction

.. code-block:: bash
  # use the command line below if using CPU.
  $ docker run -it --rm --name extractfeatures -v "$PWD"/feature:/feature -v "$PWD"/centroid:/centroid cancerdatascience/hml_dataset:1.0 python scripts/FeatureExtraction.py
  # use the command line below if using GPU. Current verion supports CUDA 9.0, Linux x86_64 Driver Version >= 384.81
  $ docker run --runtime=nvidia -it --rm --name extractfeatures -v "$PWD"/feature:/feature -v "$PWD"/centroid:/centroid cancerdatascience/hml_dataset_cuda_90:latest python scripts/FeatureExtraction.py

5. Run the docker image to create a dataset

.. code-block:: bash

  $ docker run -it --rm --name createdataset -v "$PWD"/dataset:/dataset -v "$PWD"/feature:/feature cancerdatascience/hml_dataset:1.0 python scripts/CreateDataset.py

5. Confirm dataset

.. code-block:: bash

  $ ls "$PWD"/dataset "$PWD"/feature "$PWD"/boundary "$PWD"/centroid
