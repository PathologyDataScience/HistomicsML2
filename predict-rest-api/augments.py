"""
Data normalization and augmentation class

To perform real time augmentation, we do perform several preprocessing steps.
1. Color normalization(Reinhard) - reference mean and standard deviation
are set as default.
2. Resize image to 224 x 224 x 3 to be used as an input of VGG Network.
3. Augment images - batch size is set to as default.
"""

import numpy as np
import urllib, cStringIO

from tensorflow.keras.preprocessing.image import img_to_array, ImageDataGenerator
from tensorflow.keras.applications.vgg16 import preprocess_input
from tensorflow.keras import backend as K
from scipy.misc import imresize

from PIL import Image


class Augments():

	def __init__(self):

		self.AUG_BATCH_SIZE = 2
		self.REFERENCE_MU_LAB = [8.63234435, -0.11501964, 0.03868433]
		self.REFERENCE_STD_LAB = [0.57506023, 0.10403329, 0.01364062]

		self.IMAGE_WIDTH = 224
		self.IMAGE_HEIGHT = 224
		self.IMAGE_CHANS = 3
		self.IMAGE_DTYPE = "float32"
		self.IMAGE_SHAPE = (self.IMAGE_WIDTH, self.IMAGE_HEIGHT, 3)

		# define conversion matrices
		self._rgb2lms = np.array([[0.3811, 0.5783, 0.0402],
							 [0.1967, 0.7244, 0.0782],
							 [0.0241, 0.1288, 0.8444]])

		self._lms2lab = np.dot(
			np.array([[1 / (3 ** 0.5), 0, 0],
					  [0, 1 / (6 ** 0.5), 0],
					  [0, 0, 1 / (2 ** 0.5)]]),
			np.array([[1, 1, 1],
					  [1, 1, -2],
					  [1, -1, 0]])
		)

		# Define conversion matrices
		self._lms2rgb = np.linalg.inv(self._rgb2lms)
		self._lab2lms = np.linalg.inv(self._lms2lab)

	def rgb_to_lab(self, im_rgb):
		# get input image dimensions
		m, n, c = im_rgb.shape
		# calculate im_lms values from RGB
		im_rgb = np.reshape(im_rgb, (m * n, 3))
		im_lms = np.dot(self._rgb2lms, np.transpose(im_rgb))
		im_lms[im_lms == 0] = np.spacing(1)
		# calculate LAB values from im_lms
		im_lab = np.dot(self._lms2lab, np.log(im_lms))
		# reshape to 3-channel image
		im_lab = np.reshape(im_lab.transpose(), (m, n, 3))
		return im_lab

	def lab_to_rgb(self, im_lab):
		# get input image dimensions
		m, n, c = im_lab.shape
		# Define conversion matrices
		self._lms2rgb = np.linalg.inv(self._rgb2lms)
		self._lab2lms = np.linalg.inv(self._lms2lab)
		# calculate im_lms values from LAB
		im_lab = np.reshape(im_lab, (m * n, 3))
		im_lms = np.dot(self._lab2lms, np.transpose(im_lab))
		# calculate RGB values from im_lms
		im_lms = np.exp(im_lms)
		im_lms[im_lms == np.spacing(1)] = 0
		im_rgb = np.dot(self._lms2rgb, im_lms)
		# reshape to 3-channel image
		im_rgb = np.reshape(im_rgb.transpose(), (m, n, 3))
		return im_rgb

	def reinhard(self, im_src, t_mu, t_sigma, s_mu, s_sigma):
		m, n, c = im_src.shape
		# convert input image to LAB color space
		im_lab = self.rgb_to_lab(im_src)
		# calculate s_mu if not provided
		if s_mu is None:
			s_mu = im_lab.sum(axis=0).sum(axis=0) / (m * n)
		# center to zero-mean
		for i in range(3):
			im_lab[:, :, i] = im_lab[:, :, i] - s_mu[i]
		# calculate s_sigma if not provided
		if s_sigma is None:
			s_sigma = ((im_lab * im_lab).sum(axis=0).sum(axis=0) /
					   (m * n - 1)) ** 0.5
		# scale to unit variance
		for i in range(3):
			im_lab[:, :, i] = im_lab[:, :, i] / s_sigma[i]
		# rescale and recenter to match target statistics
		for i in range(3):
			im_lab[:, :, i] = im_lab[:, :, i] * t_sigma[i] + t_mu[i]
		# convert back to RGB colorspace
		im_normalized = self.lab_to_rgb(im_lab)
		im_normalized[im_normalized > 255] = 255
		im_normalized[im_normalized < 0] = 0
		im_normalized = im_normalized.astype(np.uint8)
		return im_normalized

	def prepare_image(self, aurl, mean, std):

		img = np.array(Image.open(
			cStringIO.StringIO(urllib.urlopen(aurl).read())
			))

		# wsi_mean_std = self.find_mean_std(slide)
		img_norm = self.reinhard(img, self.REFERENCE_MU_LAB, self.REFERENCE_STD_LAB, mean, std)

		img_norm = img_to_array(
			imresize(img_norm, self.IMAGE_SHAPE)
			)

		image_dim = np.expand_dims(img_norm, axis=0)
		batch_angle = self.generator(image_dim, rotation=60)
		batch_angle = batch_angle.reshape(2, self.IMAGE_WIDTH, self.IMAGE_HEIGHT, 3)
		batches = np.round(batch_angle).astype(np.uint8)
		image = preprocess_input(batches)
		return image

	def generator(self, img, rotation=0., preprocess_fcn=None):
		datagen = ImageDataGenerator(
			rotation_range=rotation,
			fill_mode='nearest',
			preprocessing_function=preprocess_fcn,
			data_format=K.image_data_format())
		datagen.fit(img)
		index = 0
		batch_img = []
		for img_batch in datagen.flow(img, batch_size=2, shuffle=False):
			for img in img_batch:
				batch_img = img if index == 0 else np.append(batch_img, img, axis=0)
				index += 1
			if index >= self.AUG_BATCH_SIZE:
				break
		return batch_img
