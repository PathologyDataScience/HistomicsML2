.. highlight:: shell

============================
Importing datasets
============================

This section demonstrates the data import process using the example data provided with the database container. Datasets in HistomicsML are first registered in the database container at the command line. Following database registration, datasets can be imported through the HistomicsML user interface.

1. Register dataset in the database
====================================================================
Import boundary data and slide information to the database docker container

.. code-block:: bash

   $ docker ps
   CONTAINER ID        IMAGE                                  COMMAND                  CREATED             STATUS              PORTS                                                   NAMES
   4e73571843f3        cancerdatascience/histomicsml:1.0      "/bin/bash"              4 hours ago         Up 3 hours          0.0.0.0:80->80/tcp, 0.0.0.0:6379->6379/tcp, 20000/tcp   hml
   cf2213792571        cancerdatascience/histomicsml_db:1.0   "docker-entrypoint.s…"   4 hours ago         Up 4 hours          0.0.0.0:3306->3306/tcp                                  hmldb

   $ cd myproject
   # create your slide information (see ``Formatting datasets`` for details)
   $ cat HistomicsML_dataset.csv
   your-slidename,66816,75520,/localdata/pyramids/myproject/your-slidename.svs.dzi.tif,2
   $ docker cp boundary/your-slidename.txt cf2213792571:/db/your-slidename.txt
   $ docker cp HistomicsML_dataset.csv cf2213792571:/db/HistomicsML_dataset.csv

   $ docker exec -it cf2213792571 /bin/bash
   root@f46a1d2ad3d9:/# cd db
   root@f46a1d2ad3d9:/# mysql -u guest -p --local-infile=1
   Enter password: # type "guest". This is password for guest
   mysql> use nuclei;
   mysql> LOAD DATA LOCAL INFILE 'your-slidename.txt' INTO TABLE sregionboundaries fields terminated by '\t' lines terminated by '\n' (slide, centroid_x, centroid_y, boundary);
   mysql> LOAD DATA LOCAL INFILE 'HistomicsML_dataset.csv' INTO TABLE slides fields terminated by ',' lines terminated by '\n' (name, x_size, y_size, pyramid_path, scale);
   mysql> exit
   root@eb3f26621386:/db# exit

2. Convert slides to .tif format
====================================================================
Convert slides to pyramidal .tif format (see ``Formatting datasets`` for details)

.. code-block:: bash

  $ mkdir tif && cd tif
  # convert slides to .tif format
  $ ls
  your-slidename.svs.dzi.tif

A PCA transformation is included in the Docker image as an example. Copy it to your project directory if you want to use.

.. code-block:: bash

  $ docker cp 4e73571843f3:/fastdata/features/BRCA/pca_model_sample.pkl .

3. Mount the project directory
====================================================================
Mount your project directory to the web server docker container

.. code-block:: bash

  $ docker stop 4e73571843f3
  $ docker run --net hmlnet -i -t -v "$PWD":/fastdata/features/myproject -v "$PWD"/tif:/localdata/pyramids/myproject -p 80:80 -p 6379:6379 --link hmldb --name hml cancerdatascience/histomicsml:1.0 /bin/bash
  # For GPU version
  $ docker run --net hmlnet -i -t -v "$PWD":/fastdata/features/myproject -v "$PWD"/tif:/localdata/pyramids/myproject -p 80:80 -p 6379:6379 --runtime=nvidia --link hmldb --name hml cancerdatascience/histomicsml_gpu:1.0 /bin/bash

3. Import new dataset using the web interface.
====================================================================

Run the server

.. code-block:: bash

  root@5c6eb03c0e2f:/notebooks# redis-server --daemonize yes
  root@5c6eb03c0e2f:/notebooks# service apache2 start
  # Use commande below if you're using a server and has static IP address, otherwise go to next command line.
  root@5c6eb03c0e2f:/notebooks# sed -i -e 's/\/localhost/\/Your_Static_IP_Address/g' /var/www/html/HistomicsML/php/hostspecs.php
  root@5c6eb03c0e2f:/notebooks# cd /var/www/html/predict-rest-api
  root@5c6eb03c0e2f:/notebooks# python run_model_server.py
  # Please wait until you see "Dataset Loaded."

* Open the web page http://localhost/HistomicsML/data.html
* Enter a dataset name and select ``Project Directory``,  ``Slide Information``, ``PCA Information``, ``Features`` from the dropdown list.

.. image:: images/import.png

* Click Submit to confirm the import
