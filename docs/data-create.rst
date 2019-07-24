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
  #if running on a GPU system use this container instead
  $ docker pull cancerdatascience/hml_dataset_gpu:1.0


2. Create project directories
====================================================================

On the local file system, navigate to the directory where you want to store and generate project files

.. code-block:: bash

  $ cd myproject

Create subdirectories to store superpixel boundaries, centroids, and whole-slide images

.. code-block:: bash

  $ mkdir boundary centroid svs tif

The base project directory *myproject* will be mounted inside the data creation docker during dataset creation, and again by the database and server containers during dataset import and runtime.


3. Create whole-slide information
====================================================================

Create a .csv table describing the whole-slide images using ``CreateSlideInformation.py``

.. code-block:: bash

  $ docker run -it --rm --name createinfo -v "$PWD":/dataset cancerdatascience/hml_dataset_gpu:1.0 python scripts/CreateSlideInformation.py --inputSlidePath /dataset/svs  --projectTitle myproject --outputFileName myproject.csv

Here the -v option mounts the base project folder to ``/dataset`` inside the container.

The directory of the slides, the project title, and the output filename can be adjusted using parameters

  --inputSlidePath
    Path of input slides as mounted in the data creation container. Typically '/dataset/svs'.

  --projectTitle
    Name of the project directory. Default 'myProject'.

  --outputFileName
    Output slide information file name. Default 'mySlideInformation.csv'.

.. note:: The .csv file describes the whole-slide image dimensions and magnifications and will be ingested by the HistomicsML database during dataset import.


4. Convert whole-slide images to pyramidal tif format
====================================================================

Whole-slide images need to be converted to a pyramidal .tif format that is compatible with the `IIPImage server <http://iipimage.sourceforge.net/documentation/server/)>`_. The data generation docker contains the `VIPs library <http://www.vips.ecs.soton.ac.uk/index.php?title=VIPS>`_ to support this conversion.

Use ``create_tiff.sh`` to convert '.svs' to '.tif' format

.. code-block:: bash

  $ docker run -it --rm --name convertslide -v "$PWD":/dataset cancerdatascience/hml_dataset_gpu:1.0 bash scripts/create_tiff.sh /dataset/svs /dataset/tif

Here ``/dataset/svs`` is the path of the whole-slide images inside the data creation docker, and ``/dataset/tif`` is the location where the converted tif files will be generated. The generated tifs will appear in the tif subdirectory on the local file system as well.


5. Generate superpixel segmentation
====================================================================

Use ``SuperpixelSegmentation.py`` to generate superpixel boundaries and centroids

.. code-block:: bash

  $ docker run -it --rm --name createboundary -v "$PWD":/dataset cancerdatascience/hml_dataset_gpu:1.0 python scripts/SuperpixelSegmentation.py --superpixelSize 64 --patchSize 128

Parameters of the superpixel segmentation script ``SuperpixelSegmentation.py`` can be adjusted to change the size, shape, and threshold of superpixels to discard background regions

  --superpixelSize
    Superpixel edge length in pixels. Range is [8, 256] (default 64).

  --patchSize
    Patch edge length in pixels. Range is [8, 512] (default 128).

  --compactness
    SLIC compactness parameter. Range is [0.01, 100] (default 50).

  --inputSlidePath
    Path of input slides as mounted in the data creation container. Typically '/dataset/svs'.


6. Generate features and PCA transformation
====================================================================

Use ``FeatureExtraction.py`` to extract features from the superpixel segmentation. 

To extract features on a CPU system

.. code-block:: bash

  $ docker run -it --rm --name extractfeatures -v "$PWD":/dataset cancerdatascience/hml_dataset_cpu:1.0 python scripts/FeatureExtraction.py

To extract features on a GPU equipped system (currently supporting CUDA 9.0, Linux x86_64 Driver Version >= 384.81):

.. code-block:: bash

  $ docker run --runtime=nvidia -it --rm --name extractfeatures -v "$PWD":/dataset cancerdatascience/hml_dataset_gpu:1.0 python scripts/FeatureExtraction.py
  
Parameters of the feature extraction script can be adjusted to change the patch size and dimensionality reduction process

  --superpixelSize
    Superpixel edge length in pixels. Range is [8, 256] (default 64).

  --patchSize
    Patch size of each superpixel. Range is [8, 512] (default 128).

  --usePCAmodel
    'true' to use an existing transform for inference. Setting 'true' requires copying the existing .pkl file to the base directory and setting parameter 'inputPCAModel'. Setting 'false' generates a new PCA transformation with default filename 'pca_model_sample.pkl' in the base project folder (default 'false').

  --inputPCAModel
    Path and filename of .pkl for PCA transformation as mounted in the data creation container.

  --inputSlidePath
    Path to the directory of input slides as mounted in the data creation container. Typically '/dataset/svs/'.

  --outputDataSetName
    Name of the HistomicsML dataset. '.h5' format should be used for ingestion (default HistomicsML_dataset.h5).


An important note on training, inference, and the PCA transformation:

.. note::  HistomicsML can be used to either train new classifiers, or to apply trained classifiers to new datasets (inference). When doing inference it is important that features are extracted in a consistent manner from the training dataset and new dataset.

  During feature extraction a principal component analysis (PCA) transformation is applied to the features to improve speed and performance. This transformation can either be newly generated from the extracted features or imported from an existing dataset. For inference the transformation should be imported from the desired training dataset to ensure consistent feature extraction. For training we recommend generating a new transformation in most cases.

  HistomicsML stores a PCA transformation as a .pkl file in the base project directory. These files should be managed and copied between directories as needed for re-use.


Completed dataset
====================================================================

Following these steps the base project directory on your local file system will have the following contents:

.. code-block:: bash

  myproject/
  |----- HistomicsML_dataset.h5
  |----- pca_model_sample.pkl
  |----- mySlideInformation.csv
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
  |      |----- slide1.dzi.tif
  |      |----- slide2.dzi.tif
  |      |----- slide3.dzi.tif
  .
  .
  .
