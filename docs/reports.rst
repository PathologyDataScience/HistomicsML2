.. highlight:: shell

============
Inference and exporting results
============

The Reports user interface and command-line tools can apply trained classifiers to new datasets, generating detailed or summary-level inferences in table or image formats.

Reports interface
------------------------------

The Reports menu provides three different types of exports:

Mask image inference (ROI)
  Generates a .png image of predictions in a region of interest (ROI) for an inference slide. Positive, negative, and background areas are encoded as 255, 128, and 0 respectively. Input coordinates are provided as pixels at the native scan magnification.
 
Slide summary inference
  Generates a .csv table describing summary statistics of the number of predicted positive and negative superpixels in each slide for an inference dataset.
  
Classifier
  Generates an .h5 file describing the annotated superpixels from a training session. This information can be used for inference with command-line tools.

.. image:: images/example-report.png


Command-line tools
------------------------------

Generating detailed inference results at the superpixel level or large whole-slide mask images requires the use of command line tools.
