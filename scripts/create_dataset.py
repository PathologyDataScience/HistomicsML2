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
import MySQLdb as mysql
import getpass as pw


if len(sys.argv) != 6:
	print "Usage: ", sys.argv[0], "<user name> <dataset to create> <features file> <slide list> <superpixel size>"
	exit(1)

dataset = sys.argv[2]
userId = sys.argv[1]
slideListFile = sys.argv[4]
featuresFile = sys.argv[3]
superpixelSize = sys.argv[5]



passWord = pw.getpass()
db = mysql.connect(host='localhost', user=userId, passwd=passWord, db="nuclei")
cursor = db.cursor()

#
#	Create dataset
#
try:
	cursor.execute("INSERT into datasets (name, features_file, superpixel_size) VALUES(%s, %s, %s)", (dataset, featuresFile, int(superpixelSize)))
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
