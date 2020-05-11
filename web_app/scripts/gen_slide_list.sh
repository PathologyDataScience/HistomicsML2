#!/bin/bash

export PATH=./:$PATH

if [ -z "$1" ]; then
	echo usage: $0 '<source dir> <dest file>'
	exit
fi


if [ -z "$2" ]; then
	echo useage $0 '<source dir> <dest file>'
	exit
fi

while IFS=',' read -ra slidename; do
	for i in "${slidename[0]}"; do
 			echo $i >> $2
 	done

 done < "$1"
