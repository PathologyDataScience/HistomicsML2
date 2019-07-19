#!/usr/bin/env python
#
#	Copyright (c) 2014-2019, Emory University
#	All rights reserved.
#
#	Redistribution and use in source and binary forms, with or without modification, are
#	permitted provided that the following conditions are met:
#
#	1. Redistributions of source code must retain the above copyright notice, this list of
#	conditions and the following disclaimer.
#
#	2. Redistributions in binary form must reproduce the above copyright notice, this list
# 	of conditions and the following disclaimer in the documentation and/or other materials
#	provided with the distribution.
#
#	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
#	EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
#	OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
#	SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
#	INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
#	TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
#	BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
#	CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
#	WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
#	DAMAGE.
#
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
