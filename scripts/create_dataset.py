#!/usr/bin/env python
import sys
import string
import MySQLdb as mysql
import getpass as pw


if len(sys.argv) != 6:
	print "Usage: ", sys.argv[0], "<user name> <dataset to create> <features file> <pca file> <slide list> <superpixel size>"
	exit(1)

dataset = sys.argv[2]
userId = sys.argv[1]
slideListFile = sys.argv[5]
featuresFile = sys.argv[3]
pcaFile = sys.argv[4]
superpixelSize = sys.argv[6]



passWord = pw.getpass()
db = mysql.connect(host='localhost', user=userId, passwd=passWord, db="nuclei")
cursor = db.cursor()

#
#	Create dataset
#
try:
	cursor.execute("INSERT into datasets (name, features_file, pca_file, superpixel_size) VALUES(%s, %s, %s, %s)", (dataset, featuresFile, pcaFile, int(superpixelSize)))
	db.commit()

except mysql.Error, e:

	if db:
		db.rollback()

	print "Error %d: %s" % (e.args[0], e.args[1])
	sys.exit(3)


#
#	Get the id for the dataset
#
cursor.execute("SELECT id from datasets where name=%s", (dataset))
row = cursor.fetchone()
datasetId = row[0]


slideList = open(slideListFile, 'r').readlines()

for slide in slideList:

	slide = slide.rstrip('\n')
	cursor.execute("select id from slides where name=%s", (slide))
	row = cursor.fetchone()

	try:
		cursor.execute("INSERT INTO dataset_slides (slide_id, dataset_id) VALUES(%s, %s)", (row[0], datasetId))
		db.commit()

	except:
		if db:
			db.rollback()

		print "Error %d: %s" % (e.args[0], e.args[1])
		sys.exit(4)


print "Created dataset", dataset, "with", len(slideList), "slides"
