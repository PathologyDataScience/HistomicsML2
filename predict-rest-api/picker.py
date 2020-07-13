"""
Validation class

Initialize picker information.
Create a test classifier
"""
import dataset
import numpy as np
import settings
import h5py
import os.path
from os import path

class picker():

	def __init__(self):

		s = settings.Settings()
		self.FEATURE_DIM = s.FEATURE_DIM
		self.traindir = s.TRAININGSET_DIR

		self.cnt = 0

		self.out_features = []
		self.out_labels = []
		self.out_db_id = []
		self.out_feature_id = []
		self.out_x_centroid = []
		self.out_y_centroid = []
		self.out_slides = []
		self.out_class_names = []

		self.fileName = None
		self.out_train_file = None

	def setData(self, q):

		self.init = {'uid': q["uid"], 'classifier': q["testset"],
		'posclass': q["posClass"], 'negclass': q["negClass"],
		'reloaded': q["reloaded"], 'datapath': q["dataset"],
		'samples': []}

		self.cnt = 0

		self.out_features = []
		self.out_labels = []
		self.out_db_id = []
		self.out_feature_id = []
		self.out_x_centroid = []
		self.out_y_centroid = []
		self.out_slides = []
		self.out_class_names = []

		self.fileName = self.init['classifier']+ ".h5"
		self.out_train_file = self.traindir + self.fileName

		self.out_class_names.append(self.init['negclass'].encode("utf-8"))
		self.out_class_names.append(self.init['posclass'].encode("utf-8"))

	def getCnt(self):

		if path.exists(self.out_train_file):
			c = h5py.File(self.out_train_file, 'r')
			# self.out_features = c['features'][:]
			self.out_labels = c['labels'][:].tolist()
			self.out_db_id = c['db_id'][:].tolist()
			# self.out_feature_id = c['f_id'][:].tolist()
			self.out_x_centroid = c['x_centroid'][:].tolist()
			self.out_y_centroid = c['y_centroid'][:].tolist()
			self.out_slides = c['slides'][:].tolist()
			c.close()
			self.cnt = len(self.out_labels)
		return self.cnt

	def addData(self, q):
		for i in q["samples"]:
			self.out_labels.append(i['label'])
			self.out_db_id.append(i['id'])
			self.out_x_centroid.append(i['centX'])
			self.out_y_centroid.append(i['centY'])
			self.out_slides.append(i['slide'].encode("utf-8"))
			self.cnt += 1

	def addFeature(self, f_idx, feature):
		if len(self.out_features) == 0:
			self.out_features = feature
		else:
			self.out_features = np.vstack((self.out_features, feature))
		self.out_feature_id.append(f_idx)

	def updateData(self, q):
		for i in q:
			index = self.out_db_id.index(i['id'])
			self.out_labels[index] = i['label']

	def save(self):
		if path.exists(self.out_train_file):
			output = h5py.File(self.out_train_file, 'a')
			del output['features']
			del output['labels']
			del output['db_id']
			del output['f_id']
			del output['x_centroid']
			del output['y_centroid']
			del output['slides']
			del output['class_names']
		else:
			output= h5py.File(self.out_train_file, 'w')
		output.create_dataset('features', data=self.out_features)
		output.create_dataset('labels', data=self.out_labels)
		output.create_dataset('db_id', data=self.out_db_id)
		output.create_dataset('f_id', data=self.out_feature_id)
		output.create_dataset('x_centroid', data=self.out_x_centroid)
		output.create_dataset('y_centroid', data=self.out_y_centroid)
		output.create_dataset('slides', data=self.out_slides)
		output.create_dataset('class_names', data=self.out_class_names)
		output.close()
