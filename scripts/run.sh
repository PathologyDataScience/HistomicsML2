#!/bin/bash
docker pull cancerdatascience/histomicsml_db:example

echo "========================================================="
echo "== A container for the HistomicsML2 database is pulled =="
echo "========================================================="

docker pull cancerdatascience/histomicsml:example

echo "==========================================================="
echo "== A container for the HistomicsML2 web server is pulled =="
echo "==========================================================="

docker network create --subnet=172.18.0.0/16 hmlnet
docker run -d --net hmlnet --ip="172.18.0.5" -t -i -e MYSQL_ROOT_PASSWORD='pass' -e MYSQL_DATABASE='nuclei' -p 3306:3306 --name hmldb cancerdatascience/histomicsml_db:example

echo "=========================================================="
echo "== A container for the HistomicsML2 database is started =="
echo "=========================================================="

docker run --net hmlnet -i -t -p 80:80 -p 6379:6379 --link hmldb --name hml cancerdatascience/histomicsml:example /bin/bash
