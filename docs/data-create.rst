.. highlight:: shell

=================
Creating datasets
=================

A docker image is provided to help users create new datasest for HistomicsML. This page describes how users create their new dataset using the docker image.

1. Set directories.

Four directories should be ready before creating a new dataset.
svs - slide image directory name. Users have to place their images to the directory.
dataset - dataset directory name. New dataset is storied in the directory.
boundary - boundary directory name. Superpixel boundaries are storied in the directory.
centroid - centroid directory name. Superpixel centroids are storied in the directory.

.. code-block:: bash

  # create directories for slide image, dataset, boundary, centroid
  $ mkdir ~/svs ~/dataset ~/boundary ~/centroid

2. Pull the HistomicsML docker image

.. code-block:: bash

  $ docker pull cancerdatascience/hml_dataset:1.0

3. Run the docker image for superpixel segmentation

.. code-block:: bash

  $ docker run -it --rm --name createboundary -v "$PWD"/svs:/svs -v "$PWD"/dataset:/dataset -v "$PWD"/boundary:/boundary -v "$PWD"/centroid:/centroid histomicsml/hml_dataset:1.0 python SuperpixelSegmentation.py

4. Run the docker image for feature extraction

.. code-block:: bash

  $ docker run -it --rm --name extractfeatures -v "$PWD"/svs:/svs -v "$PWD"/dataset:/dataset -v "$PWD"/boundary:/boundary -v "$PWD"/centroid:/centroid histomicsml/hml_dataset:1.0 python FeatureExtraction.py

5. Confirm dataset

.. code-block:: bash

  $ ls ~/dataset ~/boundary ~/centroid
