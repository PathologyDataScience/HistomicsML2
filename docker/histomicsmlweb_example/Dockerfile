FROM ubuntu:18.04
MAINTAINER Sanghoon Lee <leesan@marshall.edu>

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && \
		apt-get -y upgrade && \
		apt -y install \
		openslide-tools	\
		python-pip \
		git-all \
		apache2 \
		php \
		iipimage-server \
		python-openslide \
		libapache2-mod-php \
		redis-server \
		mysql-server \
		libapache2-mod-fcgid \
		php-cgi \
		php-mysql \
		libmysqlclient-dev \
		mysql-client-core-5.7 \
		python-mysqldb \
		libapache2-mod-wsgi \
		python-tk \
		vim

RUN mkdir -p /src/gitrepo && \
		git clone https://github.com/CancerDataScience/HistomicsML2.git /src/gitrepo && \
		chown -R www-data:www-data /var/www/html && \
		cd /src/gitrepo/scripts && ./web_install.sh /var/www/html && \
		cp /src/gitrepo/scripts/hostspecs.php /var/www/html/HistomicsML/php && \
		mkdir -p /datasets/BRCA/tif && \
		mkdir -p /datasets/outputs && \
		mkdir -p /datasets/models && \
		mkdir -p /datasets/classifiers/tmp

COPY accounts.php /var/www/html/HistomicsML/db/accounts.php
RUN mkdir -p /root/.keras/models
COPY vgg16_weights_tf_dim_ordering_tf_kernels.h5 /root/.keras/models/

# add image and features
RUN chmod -R 777 /datasets
COPY TCGA-A2-A3XS-01Z-00-DX1.svs.dzi.tif /datasets/BRCA/tif/
COPY BRCA-spfeatures-1.h5 /datasets/BRCA/
COPY BRCA-pyramids-1.csv /datasets/BRCA/
COPY pca_model_sample.pkl /datasets/BRCA/

RUN	cd /var/www/html/HistomicsML && \
		mkdir csv && \
		chmod 777 csv && \
		rm -rf trainingsets datasets && \
		ln -s /datasets/classifiers trainingsets && \
		ln -s /datasets datasets

RUN	cd /src/gitrepo/predict-rest-api && \
		mkdir checkpoints && \
		chmod -R 777 checkpoints

RUN pip install \
		numpy==1.10.2 \
		pylibmc \
		flask \
		h5py \
		cython \
		keras \
		tensorflow \
		redis \
		'networkx==2.2' \
		'matplotlib==2.2.4' \
		'scikit-image<0.15' \
		'scikit-learn==0.20.3' \
		gevent \
		imutils \
		requests \
		'scipy==1.2.1' \
		pillow \
		uuid \
		mysql-connector \
		opencv-contrib-python \
		joblib

RUN pip install \
		large-image \
		large-image-source-tiff \
		large-image-source-openslide


RUN	cd /var/www/html && \
		chmod -R 777 HistomicsML && \
		ln -s /src/gitrepo/predict-rest-api predict-rest-api && \
		cd predict-rest-api && \
		python setup.py build_ext --inplace


RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf
COPY 000-default.conf /etc/apache2/sites-available/
RUN	cd /etc/apache2/sites-enabled && \
		rm 000-default.conf && \
		ln -s ../sites-available/000-default.conf .

EXPOSE 20000
EXPOSE 6379
EXPOSE 80
