import numpy as np
import settings

class validate():
	def __init__(self):

		self.uid = None
		self.trainSet = None
		self.testSet = None
		self.classifier = None
		self.dataSet = None
		self.inFile = None
		self.outFile = None

	def setData(self, q):
		# initialize settings
		set = settings.Settings()
		self.uid = q["uid"]
		self.trainSet = set.TRAININGSET_DIR + str(q["trainset"]) + '.h5'
		self.testSet = set.TRAININGSET_DIR + str(q["testset"]) + '.h5'
		self.classifier = str(q["trainset"])
		self.dataSet = str(q["dataset"])
		self.inFile = set.TRAININGTEMP_DIR + str(q["trainset"]) + '_' + str(q["testset"]) + '.csv'
		self.outFile = set.SOFT_TRAININGTEMP_DIR + str(q["trainset"]) + '_' + str(q["testset"]) + '.csv'
