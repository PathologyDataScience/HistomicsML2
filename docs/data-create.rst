.. highlight:: shell
.. _data-create:

==================================
Creating datasets for HistomicsML2
==================================

The dataset creation docker container provides all the functionality needed to create new HistomicsML2 datasets. This page describes how to use this docker image to generate new datasets from whole-slide image datasets.

.. note:: When working with user-generated datasets you will be mounting folders from the local filesystem to be visible as volumes within the various Docker containers. When we refer to paths in the documentation we are careful to note whether these paths are on the local system or a mounted volume inside a container.

.. note:: Processing time for creating datasets varies depending on hardware. We observed 40 minutes for superpixel segmentation (CPU) and 1.5 hours for feature extraction (GPU) on a 40X objective 66K x 76K slide with 382,225 superpixels performed on a two-CPU system equipped with two NVIDIA P100 GPUs.


Download the dataset creation container
---------------------------------------

Use the docker pull command to download the dataset creation container. Use ``cancerdatascience/hml_dataset_gpu:1.0`` if running on a GPU-equipped system to accelerate feature extraction.

.. code-block:: bash

  $ docker pull cancerdatascience/hml_dataset_cpu:1.0
  #use the GPU-enabled docker if runnnig on a GPU system
  $ docker pull cancerdatascience/hml_dataset_gpu:1.0


Create directories
------------------

HistomicsML2 datasets should be stored inside subdirectories within a master directory to simplifies file sharing with the HistomicsML2 containers.

Create the master directory on the local file system and navigate to this folder

.. code-block:: bash

  $ mkdir HistomicsML
  $ cd HistomicsML

Then create directories inside the master to store labeled data, model, and outputs from training sessions

.. code-block:: bash

  $ mkdir -p classifiers/tmp
  $ mkdir -p models
  $ mkdir -p outputs

Now create a project directory and generate subdirectories to store superpixel boundaries, centroids, and whole-slide images

.. code-block:: bash

  $ mkdir myproject
  $ cd myproject
  $ mkdir boundary centroid svs tif

These directories will be mounted inside the data creation docker during dataset creation, and again by the database and server containers when running HistomicsML2.


Create slide information table
------------------------------

Use ``CreateSlideInformation.py`` to create a .csv in the project directory that describes the whole-slide images

.. code-block:: bash

  $ cd myproject
  $ docker run -it --rm --name createinfo -v "$PWD":/"${PWD##*/}" cancerdatascience/hml_dataset_gpu:1.0 python scripts/CreateSlideInformation.py --projectName "${PWD##*/}"

Here the -v option mounts the project directory inside the container and with the same name under root '/'.

.. note:: The ``slide_info.csv`` file describes the whole-slide image dimensions and magnifications and will be ingested by the HistomicsML2 database when datasets are ingested.

.. note:: Whole-slide image filenames must not contain any '.' characters other than the extension (e.g. .svs). This character interferes with the database ingestion and will prevent dataset import.


Convert whole-slide images
--------------------------

A pyramidal .tif format is needed to serve images inside the UI with `IIPImage server <http://iipimage.sourceforge.net/documentation/server/)>`_. The data generation docker contains the `VIPs library <http://www.vips.ecs.soton.ac.uk/index.php?title=VIPS>`_ to support conversion of whole-slide-images to pyramidal tifs.

Use ``create_tiff.sh`` to convert '.svs' to '.tif' format

.. code-block:: bash

  $ cd myproject
  $ docker run -it --rm --name convertslide -v "$PWD":/"${PWD##*/}" cancerdatascience/hml_dataset_gpu:1.0 bash scripts/create_tiff.sh /"${PWD##*/}"/svs /"${PWD##*/}"/tif

``/"${PWD##*/}"/svs`` and ``/"${PWD##*/}"/tif`` are the paths where the whole-slide image and converted tif folders are mounted in the data creation container. As the converted tif files are written they will also appear in the local file system outside the container.


Generate superpixel segmentation
--------------------------------

Use ``SuperpixelSegmentation.py`` to generate superpixel boundaries and centroids

.. code-block:: bash

  $ cd myproject
  $ docker run -it --rm --name createboundary -v "$PWD":/"${PWD##*/}" cancerdatascience/hml_dataset_gpu:1.0 python scripts/SuperpixelSegmentation.py --projectName "${PWD##*/}" --superpixelSize 64 --patchSize 128

Parameters of the superpixel segmentation script ``SuperpixelSegmentation.py`` can be adjusted to change the size, shape, and threshold of superpixels to discard background regions

  --superpixelSize
    Superpixel edge length in pixels. Range is [8, 256] (default 64).

  --patchSize
    Patch edge length in pixels. Range is [8, 512] (default 128).

  --compactness
    SLIC compactness parameter. Range is [0.01, 100] (default 50).

  --projectName
    Name of the project directory. Default 'myproject'.


Generate features and PCA transformation
----------------------------------------

Use ``FeatureExtraction.py`` to extract features from the superpixel segmentation.

To extract features on a CPU system

.. code-block:: bash

  $ docker run -it --rm --name extractfeatures -v "$PWD":/"${PWD##*/}" cancerdatascience/hml_dataset_cpu:1.0 python scripts/FeatureExtraction.py --projectName "${PWD##*/}"

To extract features on a GPU equipped system (currently supporting CUDA 9.0, Linux x86_64 Driver Version >= 384.81):

.. code-block:: bash

  $ docker run --runtime=nvidia -it --rm --name extractfeatures -v "$PWD":/"${PWD##*/}" cancerdatascience/hml_dataset_gpu:1.0 python scripts/FeatureExtraction.py --projectName "${PWD##*/}"

Parameters of the feature extraction script can be adjusted to change the patch size and dimensionality reduction process

  --superpixelSize
    Superpixel edge length in pixels. Range is [8, 256] (default 64).

  --patchSize
    Patch size of each superpixel. Range is [8, 512] (default 128).

  --inputPCAModel
    Path and filename of .pkl when importing a PCA transform. This specifies the location of the .pkl as mounted inside the docker. If the .pkl file was copied to the current project then --inputPCAModel /${PWD##*/}/pca_model_sample.pkl.

  --projectName
    Name of the project directory (default - current working directory name).

**An important note on training, inference, and the PCA transformation:**

.. note::  HistomicsML2 can be used to train new classifiers or to apply existing classifiers to new datasets (inference). For inference it is important that features are extracted consistently in both the training dataset and the inference dataset.

  Since features are transformed through principal component analysis (PCA), the same PCA transform used in training datasets needs to be re-used where these classifier are applied to inference datasets. The data creation container provides the option to generate a new PCA transform when creating a training set, or to re-use an existing PCA transform when creating an inference dataset.

  HistomicsML2 stores a PCA transforms as .pkl files. Each project directory needs a .pkl file to be imported into HistomicsML2, and so users should manage and copy these files when creating inference datasets.


Completed dataset
=================

The above steps will generate a series of files in your project folder:

.. code-block:: bash

  myproject/
  |----- HistomicsML_dataset.h5
  |----- pca_model_sample.pkl
  |----- slide_info.csv
  |----- boundary/
  |      |----- slide1.txt
  |      |----- slide2.txt
  |      |----- slide3.txt
  .
  .
  .
  |----- centroid/
  |      |----- slide1.h5
  |      |----- slide2.h5
  |      |----- slide3.h5
  .
  .
  .
  |----- svs/
  |      |----- slide1.svs
  |      |----- slide2.svs
  |      |----- slide3.svs
  .
  .
  .
  |----- tif/
  |      |----- slide1.svs.dzi.tif
  |      |----- slide2.svs.dzi.tif
  |      |----- slide3.svs.dzi.tif
  .
  .
  .


Next steps
==========

See how to :ref:`import HistomicsML2 datasets <data-import>` using the command-line and user interface.
