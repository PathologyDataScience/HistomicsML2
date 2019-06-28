.. highlight:: shell

==============
Importing datasets
==============

A data import interface is provided to help users import new datasests into HistomicsML. This page demonstrates the data import function using the sample data located in the database container. The following steps, the interface is used to import this dataset into this system.

* Note that you already have dataset and boundary data in "$PWD"/dataset and "$PWD"/boundary (See "Creating datasets" section)

1. Copy boundaries to the database container.

.. code-block:: bash

   # find mysql docker container
   $ docker ps
   CONTAINER ID        IMAGE                                  COMMAND                  CREATED             STATUS              PORTS                                                   NAMES
   0abb0c6f7f3b        cancerdatascience/histomicsml:1.0      "/bin/bash"              4 hours ago         Up 3 hours          0.0.0.0:80->80/tcp, 0.0.0.0:6379->6379/tcp, 20000/tcp   hml
   f46a1d2ad3d9        cancerdatascience/histomicsml_db:1.0   "docker-entrypoint.s…"   4 hours ago         Up 4 hours          0.0.0.0:3306->3306/tcp                                  hmldb

   # copy boundary to mysql docker container
   $ docker cp "$PWD"/boundary/TCGA-OL-A66I-01Z-00-DX1.txt f46a1d2ad3d9:/db/TCGA-OL-A66I-01Z-00-DX1.txt

   # run mysql docker container
   $ docker exec -it f46a1d2ad3d9 /bin/bash
   root@f46a1d2ad3d9:/# cd db
   root@f46a1d2ad3d9:/# mysql -u guest -p --local-infile=1
   Enter password: # type "guest". This is password for guest
   mysql> use nuclei;
   mysql> LOAD DATA LOCAL INFILE 'TCGA-OL-A66I-01Z-00-DX1.txt' INTO TABLE sregionboundaries fields terminated by '\t' lines terminated by '\n' (slide, centroid_x, centroid_y, boundary);
   mysql> exit
   root@eb3f26621386:/db# exit

2. Copy dataset to the main server container.

.. code-block:: bash

  # find web server container
  $ docker ps
  CONTAINER ID        IMAGE                                  COMMAND                  CREATED             STATUS              PORTS                                                   NAMES
  0abb0c6f7f3b        cancerdatascience/histomicsml:1.0      "/bin/bash"              4 hours ago         Up 3 hours          0.0.0.0:80->80/tcp, 0.0.0.0:6379->6379/tcp, 20000/tcp   hml
  f46a1d2ad3d9        cancerdatascience/histomicsml_db:1.0   "docker-entrypoint.s…"   4 hours ago         Up 4 hours          0.0.0.0:3306->3306/tcp                                  hmldb

  # copy dataset to the web server docker container
  $ docker cp "$PWD"/dataset/BRCA-spfeatures-2.h5 0abb0c6f7f3b:/fastdata/features/BRCA/BRCA-spfeatures-2.h5

3. Import dataset using the web interface.

* Open the web page http://localhost/HistomicsML/data.html
* Enter a dataset name and select ``Project Directory``,  ``Slide Information``, ``Features`` from the dropdown list.
* Note that ``BRCA-pyramids-2.csv`` is created for your convenience. For more details, see the following "Formatting datasets" section.
* Note that ``BRCA-spfeatures-2.h5`` is the dataset created in the previous section.

.. image:: images/import.png

* Click Submit to confirm the import

Now, you can see the new dataset on the main page, http://localhost/HistomicsML.

* To delete the current dataset, go to http://localhost/HistomicsML/data.html and select the current dataset from the dropdown on the top right, and then click Remove button.

See the data formats section for detailed information on HistomicsML-TA data formats.
