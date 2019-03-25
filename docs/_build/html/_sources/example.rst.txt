.. highlight:: shell

============
Training a classifier
============

This page illustrates how to use the HistomicsML-TA interfaces to train classification rules using the example data provided in the Docker container.

Initializing the classifier
-------------------------

Go to http://localhost/HistomicsML/.

Under *Start a session* enter a training set name and select the pre-loaded The Cancer Genome Atlas Breast Invasive Carcinoma (TCGA-BRCA) dataset from the drop-down menu. Enter names for your classes - in our case we will use ``tumor`` for the positive class and ``other`` for the negative class.

.. image:: images/example-start.png

After clicking ``Begin`` the ``Prime`` interface will be loaded to collect annotations in order to initialize the classifier. The drop-down can be used to select a slides to display in the slide viewer. Zoom to a region of interest in the slide, then click ``Show Segmentation`` to display object boundaries. After clicking ``Select Superpixels``, you will be prompted to select four objects from each class. Double-clicking an object in the slide viewer will add this object to the training set, and display a thumbnail image of the object above the slide viewer.

.. image:: images/example-prime.png

We selected 4 examples of positive superpixels and 4 examples of negative superpixels in this example.

.. note:: You can remove objects from the training set in this menu by double clicking their thumbnail images.

With the initial annotation complete, click ``Prime`` to create the classifier. There will be a small delay while the classifier is trained and applied to the entire dataset to generate predictions for active learning.

Instance-based active learning
-------------------------

The instance-based learning interface presents objects selected by the active learning algorithm to the user for annotation. The selected objects are displayed along with their predicted class labels at the top of the slide viewer. Clicking one of these objects will bring it into focus in the slide viewer for inspection. Feedback is provided by double-clicking the thumbnails with incorrect predictions to cycle their class labels. After correcting the predictions the classifier can be updated with these new annotations by clicking ``Update``.

.. image:: images/example-instance.png

Heatmap-based active learning
-------------------------

The ``Gallery`` menu provides a high-level overview of the current classification results for the entire dataset. Each row displays heatmaps for a single slide - the left heatmap indicates the classifier uncertainty (red = more uncertain) - and the right heatmap indicates the positive class object density (red = higher density of positively classified objects). Slides are sorted in this view based on average uncertainty, with the slide having the most uncertaintly placed at the top.

.. image:: images/example-gallery.png

Clicking a slide in the gallery will load this slide in the heatmap viewer, where the user can identify regions for annotation. Clicking ``Show Segmentation`` will display the heatmap overlay on the slide viewer, and the user can zoom to hotspots to provide corrections to the classifier.

.. image:: images/example-heatmap.png

At high-magnification, objects are displayed with color-coded superpixels to indicate their predicted class (green = positive). Prediction errors can be corrected directly in the slide viewer by double clicking an object to cycle it's class, adding this object to the training set. The classifier can be retrained with the ``Retrain`` button.

.. image:: images/example-heatmapzoom.png

.. note:: Object labels can be cycled in the heatmap menu by a drag-drop function after selecting ``Paint On``. An object can be removed from the training set by clicking ``Del``

When the training is completed, click the ``Save`` or ``Finalize`` button to save the training set to the database. This training set can be reloaded and resumed from using the *Continue a session* option on the main page.

Reviewing a training set
------------------------------
Annotations in a validation set can be reviewed using the review interface.

At the home page under *Continue a session*, select the dataset and training set name and click ``Continue``. Navigate to the ``Review`` interface by clicking the tab at the top menu.

.. image:: images/example-continue.png

The review interface displays the annotated objects organized by class and slide. Thumbnail images of the objects are organized into columns by class. Clicking a thumbnail will bring that object into the field of view in the slide view. The thumbnails can be dragged/dropped to a different column to change the class label. Changes are instantly commited to the database (no additional button clicks are needed).

.. image:: images/example-review.png
