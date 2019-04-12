"""
Data Export class
written by Sanghoon Lee (sanghoon.lee@emory.edu)

Set the training classifier's path.
Set the export name of the classification results.
"""

import numpy as np


class count():
	def __init__(self):

		self.uid = None
		self.trainSet = None
		self.dataSet = None
		self.inFile = None
		self.outFile = None

	def setData(self, q):
		self.uid = q["uid"]
		# set the classifier's path
		self.trainSet = '/localdata/classifiers/' + str(q["trainset"]) + '.h5'
		self.classifier = str(q["trainset"])
		self.dataSet = str(q["dataset"])
		# set the output file in a local path
		self.inFile = '/localdata/classifiers/tmp/' + str(q["trainset"]) + '_' + self.dataSet.split('/')[1] + '.csv'
		self.outFile = 'trainingsets/tmp/' + str(q["trainset"]) + '_' + self.dataSet.split('/')[1] + '.csv'
