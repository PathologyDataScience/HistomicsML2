#!/bin/bash
if [ -d ${MYSQL_DIR} ]; then

  echo " ---> Starting MySQL server..."
  /usr/bin/mysqld_safe >/dev/null 2>&1 &

  echo " ---> Sleep start..."
  RET=1
  while [[ RET -ne 0 ]]; do
      sleep 5
      mysql -uroot -p${MYSQL_ROOT_PASSWORD} -e "status" > /dev/null 2>&1
      RET=$?
  done

  echo " ---> Sleep end"

  echo " ---> Data importing start ..."

  mysql -uroot -p${MYSQL_ROOT_PASSWORD} -D ${MYSQL_DATABASE} --local-infile=1 -e "LOAD DATA LOCAL INFILE 'BRCA-spboundaries-1.txt' INTO TABLE sregionboundaries fields terminated by '\t' lines terminated by '\n' (slide, centroid_x, centroid_y, boundary)"
  mysql -uroot -p${MYSQL_ROOT_PASSWORD} -D ${MYSQL_DATABASE} --local-infile=1 -e "LOAD DATA LOCAL INFILE 'BRCA-pyramids-1.csv' INTO TABLE slides fields terminated by ',' lines terminated by '\n' (name, x_size, y_size, pyramid_path, scale)"
  mysql -uroot -p${MYSQL_ROOT_PASSWORD} -D ${MYSQL_DATABASE} -e "INSERT into datasets (name, features_file, pca_file, superpixel_size) VALUES('BRCA', 'BRCA/BRCA-spfeatures-1.h5', 'BRCA/pca_model_sample.pkl', 8)"
  mysql -uroot -p${MYSQL_ROOT_PASSWORD} -D ${MYSQL_DATABASE} -e "INSERT INTO dataset_slides (slide_id, dataset_id) VALUES(1, 1)"

  echo " ---> Data importing end"
fi
