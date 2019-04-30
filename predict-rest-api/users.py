"""
Data for Users
written by Sanghoon Lee (sanghoon.lee@emory.edu)
"""
import h5py
import numpy as np
import settings
import augments

class Users():

	def __init__(self):
		self.users = []
		self.u_size = 0

		s = settings.Settings()
		self.FEATURE_DIM = s.FEATURE_DIM

	def addUser(self, uid):
		init = {'uid': uid, 'iteration': 0, 'mean':0, 'std_dev':0, 'filename': 0, 'class_names':[], 'samples': [], 'augments': []}
		self.users.append(init)
		self.u_size += 1

	def setIter(self, uidx, iter):
		for idx in range(self.u_size):
			if idx == uidx:
				self.users[idx]['iteration'] = iter

	def setReloadedData(self, uidx, path):

		c = h5py.File(path)
		agen = augments.Augments()
		object_num = len(c['slideIdx'][:])
		augment_object_num = agen.AUG_BATCH_SIZE * object_num

		for idx in range(self.u_size):
			if idx == uidx:
				for i in range(object_num):
					# init sample
					init_sample = dict(
						id=0, checkpoints=0, f_idx=0, aurl=0, feature=0,
						label=0, iteration=0, centX=0, centY=0,
						slideIdx=0, slide=None
					)
					# add feature
					init_sample['id'] = c['db_id'][:][i, 0]
					init_sample['checkpoints'] = c['checkpoints'][:][i, 0]
					init_sample['aurl'] = c['augUrls'][:][i]
					init_sample['slideIdx'] = c['slideIdx'][:][i, 0]
					init_sample['slide'] = c['slides'][:][c['slideIdx'][:][i, 0]]
					init_sample['centX'] = c['x_centroid'][:][i, 0]
					init_sample['centY'] = c['y_centroid'][:][i, 0]
					init_sample['f_idx'] = c['f_idx'][:][i, 0]
					init_sample['feature'] = c['features'][:][i]
					init_sample['label'] = 1 if c['labels'][:][i, 0] > 0 else 0
					init_sample['iteration'] = c['sample_iter'][:][i, 0]

					self.users[idx]['samples'].append(init_sample)

				a_idx = 0
				for i in range(object_num):
					# init sample and augment
					init_augment = dict(
						id=0, checkpoints=0, feature=0, label=0
					)
					a_featureSet = np.zeros((agen.AUG_BATCH_SIZE, self.FEATURE_DIM)).astype(np.float32)
					a_labelSet = np.zeros((agen.AUG_BATCH_SIZE, )).astype(np.uint8)
					a_idSet = []
					a_checkpointSet = []

					if c['augments_labels'][:][a_idx, 0] > 0:
						a_labelSet.fill(1)

					for j in range(agen.AUG_BATCH_SIZE):

						a_idSet.append(c['augments_db_id'][:][a_idx, 0])
						a_checkpointSet.append(c['augments_checkpoints'][:][a_idx, 0])
						a_featureSet[j, :] = c['augments_features'][:][a_idx]
						a_idx += 1

					# add feature
					init_augment['id'] = a_idSet
					init_augment['checkpoints'] = a_checkpointSet
					init_augment['feature'] = a_featureSet
					init_augment['label'] = a_labelSet

					self.users[idx]['augments'].append(init_augment)

	def setAugmentData(self, idx, sample):
		self.users[idx]['augments'].append(sample)

	def setTrainSampleData(self, idx, sample):
		self.users[idx]['samples'].append(sample)
