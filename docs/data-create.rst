.. highlight:: shell

===================================================
Creating datasets for HistomicsML
===================================================

The dataset creation docker container provides all the functionality needed to create new HistomicsML datasets. This page describes how to use this docker image to generate new datasets from whole-slide image datasets.

.. note:: When working with user-generated datasets you will be mounting folders from the local filesystem to be visible as volumes within the various Docker containers. When we refer to paths in the documentation we are careful to note whether these paths are on the local system or a mounted volume inside a container.

.. note:: Processing time for creating datasets varies depending on hardware. We observed 40 minutes for superpixel segmentation (CPU) and 1.5 hours for feature extraction (GPU) on a 40X objective 66K x 76K slide with 382,225 superpixels performed on a two-CPU system equipped with two NVIDIA P100 GPUs.


1. Download the dataset creation container
====================================================================

Use the docker pull command to download the dataset creation container. Use ``cancerdatascience/hml_dataset_gpu:1.0`` if running on a GPU-equipped system to accelerate feature extraction.

.. code-block:: bash

  $ docker pull cancerdatascience/hml_dataset_cpu:1.0
  #use the GPU-enabled docker if runnnig on a GPU system
  $ docker pull cancerdatascience/hml_dataset_gpu:1.0


2. Create project directories
====================================================================

We recommend storing all HistomicsML datasets within subdirectories inside a master directory. This will enable HistomicsML to access all datasets without explicitly mounting each one inside the docker.

Create the master directory on the local file system and navigate to this folder

.. code-block:: bash

  $ mkdir HistomicsML
  $ cd HistomicsML

Create a project directory inside the master directory

.. code-block:: bash

  $ mkdir myproject
  $ cd myproject

Create subdirectories within the project directory to store superpixel boundaries, centroids, and whole-slide images

.. code-block:: bash

  $ mkdir boundary centroid svs tif

The project directory *myproject* will be mounted inside the data creation docker during dataset creation, and again by the database and server containers during dataset import and runtime.


3. Create slide information table
====================================================================

Create a .csv table describing the whole-slide images using ``CreateSlideInformation.py``

.. code-block:: bash

  $ docker run -it --rm --name createinfo -v "$PWD":/"${PWD##*/}" cancerdatascience/hml_dataset_gpu:1.0 python scripts/CreateSlideInformation.py --projectName "${PWD##*/}"

Here the -v option mounts the project directory inside the container and with the same name under root '/'.

  --projectName
    Name of the project directory. Default 'myproject'.

.. note:: The ``slide_info.csv`` file describes the whole-slide image dimensions and magnifications and will be ingested by the HistomicsML database during dataset import.


4. Convert whole-slide images to pyramidal tif format
====================================================================

Whole-slide images need to be converted to a pyramidal .tif format that is compatible with the `IIPImage server <http://iipimage.sourceforge.net/documentation/server/)>`_. The data generation docker contains the `VIPs library <http://www.vips.ecs.soton.ac.uk/index.php?title=VIPS>`_ to support this conversion.

Use ``create_tiff.sh`` to convert '.svs' to '.tif' format

.. code-block:: bash

  $ docker run -it --rm --name convertslide -v "$PWD":/"${PWD##*/}" cancerdatascience/hml_dataset_gpu:1.0 bash scripts/create_tiff.sh /"${PWD##*/}"/svs /"${PWD##*/}"/tif

Here ``/"${PWD##*/}"/svs`` and ``/"${PWD##*/}"/tif`` are the paths where the whole-slide image and converted tif folders will be mounted inside the data creation docker. As the converted tif files are written they will appear in the local file system outside the container as well.


5. Generate superpixel segmentation
====================================================================

Use ``SuperpixelSegmentation.py`` to generate superpixel boundaries and centroids

.. code-block:: bash

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


6. Generate features and PCA transformation
====================================================================

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


An important note on training, inference, and the PCA transformation:

.. note::  HistomicsML can be used to either train new classifiers, or to apply trained classifiers to new datasets (inference). When doing inference it is important that features are extracted in a consistent manner from the training dataset and new dataset.

  During feature extraction a principal component analysis (PCA) transformation is applied to the features to improve speed and performance. This transformation can either be generated from the newly extracted features or imported from an existing dataset. When generating datasets for inference the PCA transformation should be imported from the training dataset that was used to develop the classifier.

  HistomicsML stores a PCA transformation as a .pkl file in the base project directory. These files should be managed and copied between directories as needed when performing inference or for re-use.


Completed dataset
====================================================================

Following these steps the base project directory on your local file system will have the following contents:

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
