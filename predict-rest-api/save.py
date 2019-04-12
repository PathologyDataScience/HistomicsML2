"""
Save class
written by Sanghoon Lee (sanghoon.lee@emory.edu)

Initialize classifier information.
Create a classifier
"""
import numpy as np
import settings
import h5py
import augments

class Save():

	def __init__(self):

		self.uid = None
		self.classifier = None
		self.posclass = None
		self.negclass = None
		self.iteration = 0
		self.reloaded = None

		s = settings.Settings()
		self.FEATURE_DIM = s.FEATURE_DIM
		self.traindir = s.TRAININGSET_DIR

	def setData(self, q):

		self.uid = q["uid"]
		self.classifier = q["classifier"]
		self.posclass = q["posclass"]
		self.negclass = q["negclass"]
		self.iteration = int(q["iteration"])
		self.reloaded = q["reloaded"]

	def getData(self, users):

		if self.reloaded == "true":
			tag = self.uid[-3:]
			fileName = self.classifier + "-" + tag + ".h5"
		else:
			fileName = self.classifier + ".h5"

		data = {}
		data['iterations'] = str(self.iteration)
		data['filename'] = fileName
		data['samples'] = []

		sample_num = len(users['samples'])

		features = np.zeros((sample_num, self.FEATURE_DIM), dtype=np.float32)
		labels = np.zeros((sample_num, 1), dtype=np.int32)
		db_id = np.zeros((sample_num, 1), dtype=np.int32)
		checkpoints = np.zeros((sample_num, 1), dtype=np.int32)
		f_idx = np.zeros((sample_num, 1), dtype=np.int32)
		sample_iter = np.zeros((sample_num, 1), dtype=np.int32)
		x_centroid = np.zeros((sample_num, 1), dtype=np.float32)
		y_centroid = np.zeros((sample_num, 1), dtype=np.float32)
		slideIdx = np.zeros((sample_num, 1), dtype=np.int32)
		slides = []
		class_names = []
		augUrls = []

		# add augments
		agen = augments.Augments()
		augments_num = agen.AUG_BATCH_SIZE * sample_num
		augments_features = np.zeros((augments_num, self.FEATURE_DIM), dtype=np.float32)
		augments_labels = np.zeros((augments_num, 1), dtype=np.int32)
		augments_db_id = np.zeros((augments_num, 1), dtype=np.int32)
		augments_checkpoints = np.zeros((augments_num, 1), dtype=np.int32)

		# set slides to unique
		for sample in users['samples']:
			slides.append(sample['slide'].encode("utf-8"))

		slides = np.unique(slides)

		sidx = 0
		for sample in users['samples']:
			sample_data = {}
			sample_data['id'] = str(sample['id'])
			sample_data['label'] = "1" if sample['label'] == 1 else "-1"
			sample_data['iteration'] = str(sample['iteration'])
			sample_data['aurl'] = sample['aurl']
			data['samples'].append(sample_data)

			# save file
			features[sidx] = sample['feature']
			labels[sidx] = 1 if sample['label'] == 1 else -1
			db_id[sidx] = sample['id']
			checkpoints[sidx] = sample['checkpoints']
			f_idx[sidx] = sample['f_idx']
			sample_iter[sidx] = sample['iteration']
			x_centroid[sidx] = sample['centX']
			y_centroid[sidx] = sample['centY']

			for i in range(len(slides)):
				if slides[i] == sample['slide'].encode("utf-8"):
					slideIdx[sidx] = i

			augUrls.append(sample['aurl'].encode("utf-8"))
			sidx += 1


		class_names.append(self.negclass.encode("utf-8"))
		class_names.append(self.posclass.encode("utf-8"))
		mean = np.reshape(
			np.mean(features[:], axis=0), (self.FEATURE_DIM, 1)
		).astype(np.float32)

		std_dev = np.reshape(
			np.std(features[:], axis=0), (self.FEATURE_DIM, 1)
		).astype(np.float32)

		aidx = 0
		for sample in users['augments']:
			# related to save file
			for i in range(agen.AUG_BATCH_SIZE):
				augments_features[aidx] = sample['feature'][i]
				augments_labels[aidx] = 1 if sample['label'][i] == 1 else -1
				augments_db_id[aidx] = sample['id'][i]
				augments_checkpoints[aidx] = sample['checkpoints'][i]
				aidx += 1

		# write training file
		out_train_file = self.traindir + fileName

		output = h5py.File(out_train_file, 'w')
		output.create_dataset('features', data=features)
		output.create_dataset('labels', data=labels)
		output.create_dataset('db_id', data=db_id)
		output.create_dataset('checkpoints', data=checkpoints)
		output.create_dataset('augments_features', data=augments_features)
		output.create_dataset('augments_labels', data=augments_labels)
		output.create_dataset('augments_db_id', data=augments_db_id)
		output.create_dataset('augments_checkpoints', data=augments_checkpoints)
		output.create_dataset('sample_iter', data=sample_iter)
		output.create_dataset('x_centroid', data=x_centroid)
		output.create_dataset('y_centroid', data=y_centroid)
		output.create_dataset('slideIdx', data=slideIdx)
		output.create_dataset('slides', data=slides)
		output.create_dataset('f_idx', data=f_idx)
		output.create_dataset('class_names', data=class_names)
		output.create_dataset('augUrls', data=augUrls)
		output.create_dataset('mean', data=mean)
		output.create_dataset('std_dev', data=std_dev)
		output.close()

		return data
