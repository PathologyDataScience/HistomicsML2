#!/usr/bin/env python

import sys
import string
import mysql.connector as mysql


if len(sys.argv) != 8:
	print "Usage: ", sys.argv[0], "<db address> <user account> <pass> <dataset to create> <features file> <pca file> <slide list>"
	exit(1)

dbAddress = sys.argv[1]
userId = sys.argv[2]
passWord = sys.argv[3]
dataset = sys.argv[4]
featuresFile = sys.argv[5]
pcaFile = sys.argv[6]
slideListFile = sys.argv[7]

db = mysql.connect(host=dbAddress, user=userId, passwd=passWord, database="nuclei")
cursor = db.cursor()

#
#	Create dataset
#
try:
	sql = "INSERT INTO datasets (name, features_file, pca_file, superpixel_size) VALUES (%s, %s, %s, %s)"
	val = (dataset, featuresFile, pcaFile, 8)
	cursor.execute(sql, val)
	db.commit()

except mysql.Error as err:

	print("Something went wrong: {}".format(err))
	sys.exit(3)


#
#	Get the id for the dataset
#
cursor.execute("SELECT id from datasets where name=%s", (dataset,))
row = cursor.fetchone()
datasetId = row[0]


slideList = open(slideListFile, 'r').readlines()

for slide in slideList:

	slide = slide.rstrip('\n')
	cursor.execute("select id from slides where name=%s", (slide,))
	row = cursor.fetchone()

	try:
		cursor.execute("INSERT INTO dataset_slides (slide_id, dataset_id) VALUES(%s, %s)", (row[0], datasetId))
		db.commit()

	except mysql.Error as err:

		print("Something went wrong: {}".format(err))
		sys.exit(3)



print "Created dataset", dataset, "with", len(slideList), "slides"
