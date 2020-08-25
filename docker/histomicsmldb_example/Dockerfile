FROM mysql:5.5
MAINTAINER sanghoon lee leesan@marshall.edu

# add db schema and create users to docker entrypoint
COPY db_setup.sql /docker-entrypoint-initdb.d/
RUN mkdir /db
COPY BRCA-pyramids-1.csv /db/
COPY BRCA-spboundaries-1.txt /db/
COPY db_run.sh /db/
RUN chmod a+x /db/db_run.sh

RUN cp -r /var/lib/mysql /var/lib/mysql-no-volume
CMD ["--datadir", "/var/lib/mysql-no-volume"]
