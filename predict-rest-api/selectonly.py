"""
Prime on TrainingSet
"""
import numpy as np
from getUncertainSamples import get as getTopUncertain


class Select():

	def __init__(self):

		self.uid = None
		self.iter = 0

	def setData(self, q):

		self.uid = q["uid"]
		self.iter = int(q["iteration"])

	def getData(self, scores, slideIdx, slides, x_centroid, y_centroid):

		uncertain_score, uncertain_index = np.asarray(
				getTopUncertain(np.ascontiguousarray(scores, dtype=np.double))
			)
		uncertain_index_int = uncertain_index.astype(np.int)

		data = {'samples':[] }
		uncertain_sample_index = 0

		for i in uncertain_index_int:
			sample_data = {}
			sample_data['slide'] = slides[slideIdx[i][0]]
			sample_data['centX'] = str(x_centroid[i][0])
			sample_data['centY'] = str(y_centroid[i][0])
			sample_data['label'] = '1' if uncertain_score[uncertain_sample_index] < 0 else '-1'
			data['samples'].append(sample_data)
			uncertain_sample_index += 1

		return data
