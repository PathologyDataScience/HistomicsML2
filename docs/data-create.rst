.. highlight:: shell

=================
Creating datasets
=================

A docker image is provided to help users create new datasest for HistomicsML. This page describes how users create their new dataset using the docker image.
As an example, .svs file is included in the docker image.

1. Set your local directories.

Four directories should be ready before creating a new dataset.

.. code-block:: bash

  # svs - slide image directory name. Users have to place their images to the directory.
  For your convenience, we provide a .svs file in "/svs" directory of the docker image as an example.
  # dataset - dataset directory name. New dataset will be storied in the directory.
  # feature - feature directory name. Superpixel features are storied in the directory.
  # boundary - boundary directory name. Superpixel boundaries are storied in the directory.
  # centroid - centroid directory name. Superpixel centroids are storied in the directory.
  # create directories for slide image, dataset, feature, boundary, centroid
  $ mkdir "$PWD"/dataset "$PWD"/feature "$PWD"/boundary "$PWD"/centroid

2. Pull the HistomicsML docker image

.. code-block:: bash

  $ docker pull cancerdatascience/hml_dataset:1.0

3. Run the docker image for superpixel segmentation

.. code-block:: bash

  $ docker run -it --rm --name createboundary -v "$PWD"/boundary:/boundary -v "$PWD"/centroid:/centroid cancerdatascience/hml_dataset:1.0 python scripts/SuperpixelSegmentation.py

4. Run the docker image for feature extraction

.. code-block:: bash

  $ docker run -it --rm --name extractfeatures -v "$PWD"/feature:/feature -v "$PWD"/centroid:/centroid cancerdatascience/hml_dataset:1.0 python scripts/FeatureExtraction.py

5. Run the docker image to create a dataset

.. code-block:: bash

  $ docker run -it --rm --name createdataset -v "$PWD"/dataset:/dataset -v "$PWD"/feature:/feature cancerdatascience/hml_dataset:1.0 python scripts/CreateDataset.py

5. Confirm dataset

.. code-block:: bash

  $ ls "$PWD"/dataset "$PWD"/boundary "$PWD"/centroid
