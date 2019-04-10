.. highlight:: shell

============
Installation
============

HistomicsML-TA can be installed from source, but we recommend using the provided Docker image to simplify the process. This image provides a "software container" that is platform independent, and bundled with pre-built libraries and executables.

Installing HistomicsML-TA via Docker
---------------------------------

HistomicsML-TA is implemented as a multi-container image consisting of CPU and GPU-supported versions:

.. code-block:: bash

  /HistomicsML
  │
  ├── hmlweb_gpu:1.0
  │
  ├── hmlweb_cpu:1.0
  │
  └── hmldb_brca:1.0

* /HistomicsML: a working directory on your system.
* hmlweb_gpu:1.0: a docker image GPU-supported (Driver version: 390.87) for HistomicsML-TA web server.
* hmlweb_cpu:1.0: a docker image for HistomicsML-TA web server.
* hmldb_brca:1.0: a docker image for HistomcisML-TA database.

.. note:: Apache and Mysql servers on HistomicsML-TA docker run on Port 80 and 3306 respectively.
   If you already use these ports, you should stop the servers.

The HistomicsML-TA docker can be run on any platform with the following steps:

1. Install docker

* For docker install, refer to https://docs.docker.com/engine/installation/

2. Pull the HistomicsML-TA docker images to your system and start the containers

.. code-block:: bash

  # pull a docker image for HistomicsML-TA database
  $ docker pull cancerdatascience/hmldb_brca:1.0
  # select either GPU or CPU version
  # GPU version
  $ docker pull cancerdatascience/hmlweb_gpu:1.0
  # CPU version
  $ docker pull cancerdatascience/hmlweb_cpu:1.0

3. Import sample data to database

.. code-block:: bash

  $ docker run -d -t -i -e MYSQL_ROOT_PASSWORD='pass' -e MYSQL_DATABASE='nuclei' -p 3306:3306 --name hmldb cancerdatascience/hmldb_brca:1.0
  $ docker exec -t -i hmldb bash
  root@c40e9159dfdb:/# cd /db
  root@c40e9159dfdb:/db# ./db_run.sh
  ---> Starting MySQL server...
  ---> Sleep start...
  ---> Sleep end
  ---> Data importing start ...
  ---> Data importing end
  root@c40e9159dfdb:/db# exit

4. Check the IP address of the database container

.. code-block:: bash

 $ docker inspect hmldb | grep IPAddress
 SecondaryIPAddresses": null,
          "IPAddress": "",
          "IPAddress": "192.80.0.1",

5. Run HistomicsML-TA web server

.. code-block:: bash

  # For CPU version
  $ docker run -i -t -p 80:80 -p 6379:6379 --link hmldb --name hml cancerdatascience/hmlweb_cpu:1.0 /bin/bash
  # For GPU version
  $ docker run -i -t -p 80:80 -p 6379:6379 --runtime=nvidia --link hmldb --name hml cancerdatascience/hmlweb_gpu:1.0 /bin/bash

6. Change IP address

.. code-block:: bash

  # change "$dbAddress = "192.80.0.2" to "$dbAddress = "192.80.0.1"
  root@5c6eb03c0e2f:/notebooks# sed -i -e 's/"192.80.0.2"/"192.80.0.1"/g' /var/www/html/HistomicsML/db/accounts.php
  # Modify IP address when using Static IP address
  # You don't need to change this if using Dynamic IP address
  root@5c6eb03c0e2f:/notebooks# sed -i -e 's/\/localhost/\/Your_Static_IP_Address/g' /var/www/html/HistomicsML/php/hostspecs.php

.. code-block:: bash

  # Run the servers
  root@5c6eb03c0e2f:/notebooks# redis-server --daemonize yes
  root@5c6eb03c0e2f:/notebooks# service apache2 start
  root@5c6eb03c0e2f:/notebooks# cd /var/www/html/predict-rest-api
  root@5c6eb03c0e2f:/notebooks# python run_model_server.py
  # Please wait until you see "Dataset Loaded."

.. note:: If the server becomes unresponsive or generates a connection error during use, the al_server will need to be restarted.

8. Navigate your browser to the HistomicsML-TA page http://localhost/HistomicsML.
