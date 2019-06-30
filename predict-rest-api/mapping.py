import numpy as np
import dataset

class map():
	def __init__(self):

		self.uid = None
		self.slide = None
		self.trainSet = None
		self.dataSet = None
		self.inFile = None
		self.outFile = None

	def setData(self, q):
		self.uid = q["uid"]
		self.slide = str(q["slide"])
		self.trainSet = '/localdata/classifiers/' + str(q["trainset"])
		self.classifier = str(q["trainset"])
		self.dataSet = str(q["dataset"])
		self.inFile = '/localdata/classifiers/tmp/' + self.slide + '_' + str(q["trainset"]) + '_' + self.dataSet.split('/')[1] + '.h5'
		self.outFile = 'trainingsets/tmp/' + self.slide + '_' + str(q["trainset"]) + '_' + self.dataSet.split('/')[1] + '.h5'
