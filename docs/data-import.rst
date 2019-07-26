.. highlight:: shell

============================
Importing datasets
============================

This section demonstrates the data import process using the example data provided with the database docker container. During import, datasets in HistomicsML are first registered in the database container at the command line. Following database registration, datasets can be imported using the HistomicsML user interface.

.. note:: Importing superpixel boundaries to the database is time consuming. For this reason, the some import steps take place at the command line.

Following data creation steps the master project directory on your local file system will have the following contents:

.. code-block:: bash

  master/
  |
  |----- myproject1/
      |----- HistomicsML_dataset.h5
      |----- pca_model_sample.pkl
      |----- slide_info.csv
      |----- boundary/
      |----- centroid/
      |----- svs/
      |----- tif/
  |----- myproject2/
      |----- HistomicsML_dataset.h5
      |----- pca_model_sample.pkl
      |----- slide_info.csv
      |----- boundary/
      |----- centroid/
      |----- svs/
      |----- tif/
  .
  .
  .
  |----- classifiers/
      |----- tmp/

.. note:: ``classifiers`` is a directory path to the classifiers which will be saved after training. ``tmp`` is a temporal directory path to the classifiers which will be saved temporarily to be exported.

.. note:: Web server docker container needs a permission to access the directories: ``myproject1``, ``myproject2``, ..., ``classifiers``, so make sure that the directories support a writable permission (e.g. chmod 777 /master/myproject1).

1. Download the HistomicsML containers
====================================================================

.. code-block:: bash

  $ docker pull cancerdatascience/histomicsml_db:1.0
  $ docker pull cancerdatascience/histomicsml:1.0

2. Navigate to the master directory and run the HistomicsML database container
====================================================================

On the local file system, navigate to the master directory that includes all datasets

.. code-block:: bash

  $ cd master

Run the database container and setup a network to communicate with the server container

.. code-block:: bash

  $ docker network create --subnet=172.18.0.0/16 hmlnet
  $ docker run -d --net hmlnet --ip="172.18.0.5" -t -i -v "$PWD":/"${PWD##*/}" -e MYSQL_ROOT_PASSWORD='pass' -e MYSQL_DATABASE='nuclei' -p 3306:3306 --name hmldb cancerdatascience/histomicsml_db:1.0

Here ``$PWD`` is the path of the master directory inside the local machine and ``/${PWD##*/}`` is the path of the master directory inside the database docker container

.. note:: The database and server dockers run Apache and Mysql servers on ports 80 and 3306 respectively.
   Check if these ports are in use before deploying HistomicsML.

Then execute the database docker container and perform the commit using the provided script

.. code-block:: bash

  $ docker exec -it hmldb bash
  root@cf2213792571:/# ./import_boundary_slideinformation.sh /master/myproject1/slide_info.csv /master/myproject1/boundary
  root@cf2213792571:/# ./import_boundary_slideinformation.sh /master/myproject2/slide_info.csv /master/myproject2/boundary
  ...
  root@cf2213792571:/db# exit

Here ``/master/myproject1/slide_info.csv`` is the path to the slide information file and ``/master/myproject1/boundary`` is the path to boundary directory

3. Add PCA model to base folder (for inference only)
====================================================================

If performing inference the .pkl file corresponding to the trained classifier needs to be copied into your base folder

.. code-block:: bash

  $ cp /source/existing_pca.pkl /master/myproject1

The directory /master/myproject1 is mounted on the docker container and so the .pkl file will be available to the container during import.


4. Import dataset using the web interface
====================================================================
With the webserver and database containers running, mount your base directory to the web-server container and navigate to the user interface to import the data.

Run the server container, start Redis and Apache, then launch HistomicsML

.. code-block:: bash

  $ docker run --net hmlnet -i -t -v "$PWD":/datasets -p 80:80 -p 6379:6379 --link hmldb --name hml cancerdatascience/histomicsml:1.0 /bin/bash

.. code-block:: bash

  # Run redis on server container.
  root@5c6eb03c0e2f:/notebooks# redis-server --daemonize yes
  # Run apache on server container.
  root@5c6eb03c0e2f:/notebooks# service apache2 start
  # Use this command if server has a static IP address available, otherwise skip.
  root@5c6eb03c0e2f:/notebooks# sed -i -e 's/\/localhost/\/Your_Static_IP_Address/g' /var/www/html/HistomicsML/php/hostspecs.php
  # Launch HistomicsML and wait for "Dataset Loaded."
  root@5c6eb03c0e2f:/notebooks# cd /var/www/html/predict-rest-api
  root@5c6eb03c0e2f:/notebooks# python run_model_server.py

.. note:: If the server becomes unresponsive or generates a connection error during use then re-launch run_model_server.py.

* Open the web page http://localhost/HistomicsML/data.html
* Enter a dataset name and select your base project directory from ``Project Directory``. The fields for ``Slide Information``, ``PCA Information``, ``Features`` will automatically populate after selecting the project folder. If you have multiple versions of these files in a project folder then these alternative files can be accessed with the list buttons.
* Click Submit to confirm

.. image:: images/import.png
