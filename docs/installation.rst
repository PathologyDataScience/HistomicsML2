.. highlight:: shell

============
Installation
============

HistomicsML-TA can be installed from source, but we recommend using the provided Docker image to simplify the process. This image provides a "software container" that is platform independent, and bundled with pre-built libraries and executables.

Installing HistomicsML-TA via Docker
---------------------------------

HistomicsML-TA is implemented as a multi-container images:

.. code-block:: bash

  /HistomicsML
  │
  ├── histomicsml:1.0
  │
  └── histomicsml_db:1.0

* /HistomicsML: a working directory on your system.
* histomicsml:1.0: a docker image for HistomicsML-TA web server.
* histomicsml_db:1.0: a docker image for HistomcisML-TA database.

.. note:: Apache and Mysql servers on HistomicsML-TA docker run on Port 80 and 3306 respectively.
   If you already use these ports, you should stop the servers.
   And, docker installation is required.

The HistomicsML-TA docker can be run on any platform with the following steps:

1. Pull the HistomicsML-TA docker images to your system and start the containers

.. code-block:: bash

  # pull a docker image for HistomicsML-TA database
  $ docker pull cancerdatascience/histomicsml_db:1.0
  $ docker pull cancerdatascience/histomicsml:1.0

2. Set network and run HistomicsML database

.. code-block:: bash

  $ docker network create --subnet=172.18.0.0/16 hmlnet
  $ docker run -d --net hmlnet --ip="172.18.0.5" -t -i -e MYSQL_ROOT_PASSWORD='pass' -e MYSQL_DATABASE='nuclei' -p 3306:3306 --name hmldb cancerdatascience/histomicsml_db:1.0

3. Run HistomicsML-TA web server

.. code-block:: bash

  $ docker run --net hmlnet -i -t -p 80:80 -p 6379:6379 --link hmldb --name hml cancerdatascience/histomicsml:1.0 /bin/bash

4. Run the servers

.. code-block:: bash

  root@5c6eb03c0e2f:/notebooks# redis-server --daemonize yes
  # Run apache server
  root@5c6eb03c0e2f:/notebooks# service apache2 start
  # If you use Static IP address, you have to modify IP address using below
  root@5c6eb03c0e2f:/notebooks# sed -i -e 's/\/localhost/\/Your_Static_IP_Address/g' /var/www/html/HistomicsML/php/hostspecs.php
  # Run model server
  root@5c6eb03c0e2f:/notebooks# cd /var/www/html/predict-rest-api
  root@5c6eb03c0e2f:/notebooks# python run_model_server.py
  # Please wait until you see "Dataset Loaded."

.. note:: If the server becomes unresponsive or generates a connection error during use, the al_server will need to be restarted.

5. Navigate your browser to the HistomicsML-TA page http://localhost/HistomicsML.
