import numpy as np
import dataset
import settings

class map():
	def __init__(self):

		self.uid = None
		self.slide = None
		self.trainSet = None
		self.dataSet = None
		self.inFile = None
		self.outFile = None

	def setData(self, q):
		# initialize settings
		set = settings.Settings()
		self.uid = q["uid"]
		self.slide = str(q["slide"])
		self.trainSet = set.TRAININGSET_DIR + str(q["trainset"])
		self.classifier = str(q["trainset"])
		self.dataSet = str(q["dataset"])
		self.inFile = set.TRAININGTEMP_DIR + self.slide + '_' + str(q["trainset"]) + '_' + self.dataSet.split('/')[1] + '.h5'
		self.outFile = set.SOFT_TRAININGTEMP_DIR + self.slide + '_' + str(q["trainset"]) + '_' + self.dataSet.split('/')[1] + '.h5'
