import numpy as np
import settings

class count():
	def __init__(self):

		self.uid = None
		self.trainSet = None
		self.dataSet = None
		self.inFile = None
		self.outFile = None

	def setData(self, q):
		# initialize settings
		set = settings.Settings()
		self.uid = q["uid"]
		self.trainSet = set.TRAININGSET_DIR + str(q["trainset"])
		self.classifier = str(q["trainset"])
		self.dataSet = str(q["dataset"])
		self.inFile = set.TRAININGTEMP_DIR + str(q["trainset"]) + '_' + self.dataSet.split('/')[1] + '.csv'
		self.outFile = set.SOFT_TRAININGTEMP_DIR + str(q["trainset"]) + '_' + self.dataSet.split('/')[1] + '.csv'
