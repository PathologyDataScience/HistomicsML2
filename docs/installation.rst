.. highlight:: shell

============
Installation
============

HistomicsML is distributed as a set of Docker containers that allow users to generate datasets and host a HistomicsML server. While HistomicsML is open-source and can be installed from source, we recommend that most users deploy the Docker containers. These containers are platform independent, and contain pre-built libraries, executables, and scripts. `Read more about Docker here <https://docs.docker.com/get-started/>`_.

Installing HistomicsML via Docker
---------------------------------

HistomicsML-TA is implemented as collection of three docker containers:

.. code-block:: bash

  /HistomicsML
  │
  ├── histomicsml
  │
  ├── histomicsml_db
  │
  └── hml_dataset_gpu

* histomicsml: a container for the HistomicsML web server.
* histomicsml_db: a container for the HistomcisML database.
* hml_dataset_gpu: a container for generating HistomicsML datasets.

.. note:: Apache and Mysql servers on HistomicsML-TA docker run on Port 80 and 3306 respectively.
   Check if these ports are in use before deploying HistomicsML.

HistomicsML can be deployed on any platform via the following steps:

1. Download the HistomicsML containers
====================================================================

.. code-block:: bash

  $ docker pull cancerdatascience/histomicsml_db:1.0
  $ docker pull cancerdatascience/histomicsml:1.0

2. Setup and run the HistomicsML database container
====================================================================

.. code-block:: bash

  $ docker network create --subnet=172.18.0.0/16 hmlnet
  $ docker run -d --net hmlnet --ip="172.18.0.5" -t -i -e MYSQL_ROOT_PASSWORD='pass' -e MYSQL_DATABASE='nuclei' -p 3306:3306 --name hmldb cancerdatascience/histomicsml_db:1.0

3. Run the HistomicsML web server container
====================================================================

.. code-block:: bash

  $ docker run --net hmlnet -i -t -p 80:80 -p 6379:6379 --link hmldb --name hml cancerdatascience/histomicsml:1.0 /bin/bash

4. Run the Apache, Redis, and HistomicsML servers
====================================================================

.. code-block:: bash

  # Run redis server.
  root@5c6eb03c0e2f:/notebooks# redis-server --daemonize yes
  # Run apache server.
  root@5c6eb03c0e2f:/notebooks# service apache2 start
  # Use commande below if you're using a server and has static IP address, otherwise go to next command line.
  root@5c6eb03c0e2f:/notebooks# sed -i -e 's/\/localhost/\/Your_Static_IP_Address/g' /var/www/html/HistomicsML/php/hostspecs.php
  # Run model server.
  root@5c6eb03c0e2f:/notebooks# cd /var/www/html/predict-rest-api
  root@5c6eb03c0e2f:/notebooks# python run_model_server.py
  # Please wait until you see "Dataset Loaded."

.. note:: If the server becomes unresponsive or generates a connection error during use, the run_model_server.py should be restarted.

5. Navigate your browser to the HistomicsML-TA page http://localhost/HistomicsML.
====================================================================
