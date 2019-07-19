.. highlight:: shell

============================
Importing datasets
============================

This section demonstrates the data import process using the example data provided with the database docker container. During import, datasets in HistomicsML are first registered in the database container at the command line. Following database registration, datasets can be imported through the HistomicsML user interface.

.. note:: Importing superpixel boundaries into the database is time consuming given their size. This is the reason that the import process is not driven entirely through the user interface.


1. Run the database import script
====================================================================
Import boundary data and slide information to the database docker container and commit to the database

.. code-block:: bash

   $ script command
   script output


2. Add PCA model to base folder (optional - for inference only)
====================================================================

If you applying an existing classifier to this dataset to perform inference, you will need to copy the corresponding PCA .pkl file from this classifier to your base folder.

.. code-block:: bash

  $ .


3. Import dataset using the web interface
====================================================================
With the webserver and database containers running, mount your base directory to the web-server container and navigate to the user interface to import the data.

* Open the web page http://localhost/HistomicsML/data.html
* Enter a dataset name and select ``Project Directory``,  ``Slide Information``, ``PCA Information``, ``Features`` from the dropdown list.
* Click Submit to confirm

.. image:: images/import.png

