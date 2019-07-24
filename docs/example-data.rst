.. highlight:: shell

============
Running a simple example
============

HistomicsML is distributed as a collection of Docker containers for server hosting and dataset creation. While HistomicsML can be installed from source, we recommend that most users work with the Docker containers. These containers are platform independent, and encapsulate all needed libraries and scripts. `Read more about Docker here <https://docs.docker.com/get-started/>`_.


Example dataset
---------------------------------

The HistomicsML containers comes pre-loaded with an example dataset containing a single slide. This example allows you to explore the functionality and user interfaces of HistomicsML in the next section.


1. Download the HistomicsML containers
====================================================================

HistomicsML is implemented as collection of three docker containers:

* histomicsml: a container for the HistomicsML web server.
* histomicsml_db: a container for the HistomcisML database.
* hml_dataset_gpu: a container for creating HistomicsML datasets.

To explore the example dataset we need to download the database and server containers:

.. code-block:: bash

  $ docker pull cancerdatascience/histomicsml_db:1.0
  $ docker pull cancerdatascience/histomicsml:1.0

2. Run the HistomicsML database container
====================================================================

Run the database container and setup a network to communicate with the server container

.. code-block:: bash

  $ docker network create --subnet=172.18.0.0/16 hmlnet
  $ docker run -d --net hmlnet --ip="172.18.0.5" -t -i -e MYSQL_ROOT_PASSWORD='pass' -e MYSQL_DATABASE='nuclei' -p 3306:3306 --name hmldb cancerdatascience/histomicsml_db:1.0

.. note:: The database and server dockers run Apache and Mysql servers on ports 80 and 3306 respectively.
   Check if these ports are in use before deploying HistomicsML.

3. Run the HistomicsML web server container
====================================================================

Run the server container, start Redis and Apache, then launch HistomicsML 

.. code-block:: bash

  $ docker run --net hmlnet -i -t -p 80:80 -p 6379:6379 --link hmldb --name hml cancerdatascience/histomicsml:1.0 /bin/bash

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

4. Navigate your browser to the HistomicsML-TA page http://localhost/HistomicsML.
====================================================================
