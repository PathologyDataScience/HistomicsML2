.. highlight:: shell
.. _reports:

===============================
Inference and exporting results
===============================

The Reports user interface and command-line tools can be used to apply trained classifiers to new datasets. Inferences can be generated in image formats or as detailed or aggregate tables.

Reports user interface
======================

.. image:: images/example-report.png

The Reports interface provides three different types of exports:

Mask image inference (ROI)
  Generates a .png image of predictions in a region of interest (ROI) for an inference slide. Positive, negative, and background areas are encoded as 255, 128, and 0 respectively. Input coordinates are provided as pixels at the native scan magnification.
 
Slide summary inference
  Generates a .csv table describing summary statistics of the number of predicted positive and negative superpixels in each slide for an inference dataset.
  
Classifier
  Generates an .h5 file describing the annotated superpixels from a training session. This information can be used for inference with command-line tools. Variables contained in this .h5:
  
.. code-block:: bash
  
  /slides (string) - list of slide names in dataset.  
  /class_names (string) - list of designated class names.
  /x_centroid (float) - array of superpixel centroid x coordinates. Units are pixels at scan magnification.
  /y_centroid (float) - array of superpixel centroid y coordinates. Units are pixels at scan magnification.
  /slideIdx (int) - superpixel slide indices.
  /features (float) - extracted features where each row represents a superpixel.
  /mean (float) - normalization vector used to z-score features.
  /st_dev (float) - normalization vector used to z-score features.
  /labels (int) - superpixel training labels {-1, 1}.
  /sample_iter (int) - training iteration when each superpixel was labeled (instance-mode labeling).
  /checkpoints (int) - training iteration when each superpixel was labeled (all labeling modes).
  /db_id (int) - superpixel database indices.
  /f_idx (int) - index of superpixels in at-large dataset.
  /argUrls (string) - URLs to obtain extracted patches from IIP server (for augmentation).
  /augments_features (float) - features extracted from augmented patches.
  /augments_labels (int) - inherited labels of augmented patches.
  /augments_checkpoints - training iteration when superpixel was labeled, replicated for augmented patches.
  /augments_db_id - superpixel database indices of augmented patches.


Command-line tools
==================

Command line tools are provided to generate detailed inference results at the superpixel level or large whole-slide mask images. These tools are hosted in the server container.

Mask image inference (whole-slide)
  Generates a .tif image of predictions for the whole-slide at the scanning magnification. Positive, negative, and background areas are encoded as 255, 128, and 0 respectively.

.. code-block:: bash

  $ cd myproject
  $ docker run   

Superpixel inference
  Generates an .h5 describing inference results for each superpixel.

.. code-block:: bash

  $ cd myproject
  $ docker run   
  
Variables contained in this .h5:
  
.. code-block:: bash
    
  /softmax (float) - softmax prediction values for each superpixel.
  /predictions (int) - predicted superpixel class labels {-1, 1}.
