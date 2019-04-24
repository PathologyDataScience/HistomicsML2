"""
Viewer(Heatmap) class
written by Sanghoon Lee (sanghoon.lee@emory.edu)

Initialize viewer variables.
Generate heatmap images (uncertain and density) in a heatmap tab
"""
import cv2
import numpy as np
import os
import subprocess

from getGrayUncertain import get


class retrainHeatmap():
	def __init__(self):

		self.uid = None
		self.slide = None
		self.width = 0
		self.height = 0
		self.grid_size = 0
		self.dir = None
		self.path = None
		self.uncertain_path = None
		self.class_path = None
		self.uncertMin = 0
		self.uncertMax = 0
		self.uncertMedian = 0
		self.classMin = 0
		self.classMax = 0
		self.samples = None
		self.iter = 0

	def setData(self, q):
		self.uid = q["uid"]
		self.slide = str(q["slide"])
		self.width = int(q["width"])
		self.height = int(q["height"])
		self.grid_size = 80
		self.dir = '/var/www/html/HistomicsML/heatmaps/'
		self.path = self.dir + self.uid
		self.uncertain_path = self.path + '/' + self.slide + '.jpg'
		self.class_path = self.path + '/' + self.slide + '_class.jpg'
		self.uncertMin = 0
		self.uncertMax = 0
		self.uncertMedian = 0
		self.classMin = 0
		self.classMax = 0
		self.samples = q["samples"]
		self.iter = int(q["iteration"])
		self.classifier = q["classifier"]


	def setXandYmap(self):
		self.fX = self.width / self.grid_size + 1
		self.fY = self.height / self.grid_size + 1

	def setHeatMap(self, x_set, y_set, scores):
		grayUncertain, grayClass, self.uncertMin, self.uncertMax, self.uncertMedian, self.classMin, self.classMax = get(
			self.fY, self.fX, np.ascontiguousarray(y_set, dtype=np.double), np.ascontiguousarray(x_set, dtype=np.double), np.ascontiguousarray(scores, dtype=np.double)
		)
		im_uncertain = cv2.applyColorMap(grayUncertain.astype(np.uint8), cv2.COLORMAP_JET)
		im_class = cv2.applyColorMap(grayClass.astype(np.uint8), cv2.COLORMAP_JET)

		if not os.path.exists(self.path):
			os.makedirs(self.path)
			subprocess.call(['chmod', '-R', '777', self.path])

		cv2.imwrite(self.uncertain_path, im_uncertain, [cv2.IMWRITE_JPEG_QUALITY, 75])
		cv2.imwrite(self.class_path, im_class, [cv2.IMWRITE_JPEG_QUALITY, 75])

	def getData(self, index):
		data = {}
		data['width'] = self.width
		data['height'] = self.height
		data['uncertFilename'] = self.slide + '.jpg'
		data['classFilename'] = self.slide + '_class.jpg'
		data['uncertMin'] = self.uncertMin
		data['uncertMax'] = self.uncertMax
		data['uncertMedian'] = self.uncertMedian
		data['classMin'] = self.classMin
		data['classMax'] = self.classMax
		data['slide'] = self.slide
		data['index'] = index
		return data
