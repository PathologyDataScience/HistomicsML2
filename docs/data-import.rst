.. highlight:: shell

============================
Importing datasets
============================

This section demonstrates the data import process using the example data provided with the database docker container. During import, datasets in HistomicsML are first registered in the database container at the command line. Following database registration, datasets can be imported using the HistomicsML user interface.

.. note:: Importing superpixel boundaries to the database is time consuming. For this reason, the some import steps take place at the command line.


1. Run the database import script
====================================================================
The first step in importing a dataset is to commit the superpixel boundaries and slide information .csv file to the database.

First, check the identifier of the running database container ("cf2213792571" here).

.. code-block:: bash

   $ docker ps
   CONTAINER ID        IMAGE                                  COMMAND                  CREATED             STATUS              PORTS                                                   NAMES
   4e73571843f3        cancerdatascience/histomicsml:1.0      "/bin/bash"              4 hours ago         Up 3 hours          0.0.0.0:80->80/tcp, 0.0.0.0:6379->6379/tcp, 20000/tcp   hml
   cf2213792571        cancerdatascience/histomicsml_db:1.0   "docker-entrypoint.s…"   4 hours ago         Up 4 hours          0.0.0.0:3306->3306/tcp                                  hmldb
   
Next use this ID to copy the boundary and slide information file to the database container

.. code-block:: bash

   $ cd myproject
   $ docker cp boundary/your-slidename.txt cf2213792571:/db/your-slidename.txt
   $ docker cp HistomicsML_dataset.csv cf2213792571:/db/HistomicsML_dataset.csv

Then perform the commit using the provided script

.. code-block:: bash
   
   $ docker exec -it cf2213792571 /bin/bash
   root@cf2213792571:/# db/import_boundary_slideinformation.sh path-to-slideinformation-file path-to-boundary-directory
   root@cf2213792571:/db# exit


2. Add PCA model to base folder (for inference only)
====================================================================

If performing inference the .pkl file corresponding to the trained classifier needs to be copied into your base folder

.. code-block:: bash

  $ cp /source/existing_pca.pkl /myproject/

The directory /myproject is mounted on the docker container and so the .pkl file will be available to the container during import.


3. Import dataset using the web interface
====================================================================
With the webserver and database containers running, mount your base directory to the web-server container and navigate to the user interface to import the data.

* Open the web page http://localhost/HistomicsML/data.html
* Enter a dataset name and select your base project directory from ``Project Directory``. The fields for ``Slide Information``, ``PCA Information``, ``Features`` will automatically populate after selecting the project folder. If you have multiple versions of these files in a project folder then these alternative files can be accessed with the list buttons.
* Click Submit to confirm

.. image:: images/import.png
