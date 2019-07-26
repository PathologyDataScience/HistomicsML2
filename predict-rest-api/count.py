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
		self.trainSet = '/datasets/classifiers/' + str(q["trainset"])
		self.classifier = str(q["trainset"])
		self.dataSet = str(q["dataset"])
		self.inFile = '/datasets/classifiers/tmp/' + str(q["trainset"]) + '_' + self.dataSet.split('/')[1] + '.csv'
		self.outFile = 'trainingsets/tmp/' + str(q["trainset"]) + '_' + self.dataSet.split('/')[1] + '.csv'
