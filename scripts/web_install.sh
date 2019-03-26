#!/bin/bash

if [ -z "$1" ]; then
	echo usage $0 '<web root dir>'
	exit
fi

HistomicsML_DIR=$1'/HistomicsML'
mkdir $HistomicsML_DIR
mkdir $HistomicsML_DIR'/datasets'
mkdir $HistomicsML_DIR'/trainingsets'

mkdir $HistomicsML_DIR'/heatmaps'

# For reports
mkdir $HistomicsML_DIR'/trainingsets/tmp'
chown www-data:www-data $HistomicsML_DIR'/trainingsets/tmp'
chmod 777 $HistomicsML_DIR'/trainingsets/tmp'

cp -r ../web_app/* $HistomicsML_DIR

