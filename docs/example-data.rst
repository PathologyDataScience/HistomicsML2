.. highlight:: shell
.. _example-data:

=================
Quick start guide
=================

HistomicsML2 is distributed as a collection of Docker containers for server hosting and dataset creation. While HistomicsML can be installed from source, we recommend that most users work with the Docker containers. These containers are platform independent, and encapsulate all needed libraries and scripts. `Read more about Docker here <https://docs.docker.com/get-started/>`_.


Example dataset
===============

The HistomicsML2 containers comes pre-loaded with an example dataset containing a single slide. This example allows you to explore the functionality and user interfaces of HistomicsML2 in the next section.

Running HistomicsML2
===================================


Download the HistomicsML2 containers
-----------------------------------

HistomicsML2 is implemented as collection of three docker containers:

* histomicsml: a container for the HistomicsML2 web server.
* histomicsml_db: a container for the HistomicsML2 database.
* hml_dataset_gpu: a container for creating HistomicsML2 datasets.

To explore the example dataset we need to download the database and server containers:

.. code-block:: bash

  $ docker pull cancerdatascience/histomicsml_db:example
  $ docker pull cancerdatascience/histomicsml:example


Runing the HistomicsML2 database container
-----------------------------------------

Run the database container and setup a network to communicate with the server container

.. code-block:: bash

  $ docker network create --subnet=172.18.0.0/16 hmlnet
  $ docker run -d --net hmlnet --ip="172.18.0.5" -t -i -e MYSQL_ROOT_PASSWORD='pass' -e MYSQL_DATABASE='nuclei' -p 3306:3306 --name hmldb cancerdatascience/histomicsml_db:example

.. note:: The database and server dockers run Apache and Mysql servers on ports 80 and 3306 respectively.
   Check if these ports are in use before deploying HistomicsML2.


Running the HistomicsML2 web server container
--------------------------------------------

Run the server container, start Redis and Apache, and then launch the HistomicsML2 application

.. code-block:: bash

  $ docker run --net hmlnet -i -t -p 80:80 -p 6379:6379 --link hmldb --name hml cancerdatascience/histomicsml:example /bin/bash
  # Run redis on server container.
  root@5c6eb03c0e2f:/notebooks# redis-server --daemonize yes
  # Run apache on server container.
  root@5c6eb03c0e2f:/notebooks# service apache2 start
  # Launch HistomicsML and wait for "Dataset Loaded."
  root@5c6eb03c0e2f:/notebooks# cd /var/www/html/predict-rest-api
  root@5c6eb03c0e2f:/notebooks# python run_model_server.py

If the server has a static IP address available you can run this command to set it after starting Apache and before launching HistomicsML2

.. code-block:: bash

  # Use this command if server has a static IP address available, otherwise skip.
  root@5c6eb03c0e2f:/notebooks# sed -i -e 's/\/localhost/\/Your_Static_IP_Address/g' /var/www/html/HistomicsML/php/hostspecs.php

.. note:: If the server becomes unresponsive or generates a connection error during use then re-launch run_model_server.py.


Accessing HistomicsML2 from your browser
---------------------------------------

Navigate your browser to the HistomicsML2 page http://localhost/HistomicsML.


Next steps
==========

Watch the tutorial video to learn how to use the HistomicsML2 interface, or see the See the section on :ref:`training <training classifiers>` for written documentation.

.. raw:: html

    <div style="position: relative; padding-bottom: 5.0%; height: 0; overflow: hidden; max-width: 100%; height: auto;">
        <iframe width="560" height="315" src="https://www.youtube.com/embed/vIExh6tukPk" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>

See a more detailed overview of HistomicsML2 see :ref:`system-overview <System overivew>`, or learn how to :ref:`data-create <create>` and :ref:`data-import <import>` your own datasets in HistomicsML2.
