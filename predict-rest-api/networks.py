"""
Network class

Initialize neural network model.
Perform train model.
Return predicted probabilities/Predicted labels.
"""

import numpy as np
from keras.models import Sequential, model_from_json
from keras.layers import Dense, Dropout
from keras.models import load_model

class Network():

	def __init__(self):

		# set variables
		self.input_units = 64
		self.hidden_units = 32
		self.output_units = 1
		self.epochs = 20
		self.dropout = 0.3
		self.activation = 'relu'
		self.activation_last = 'sigmoid'
		self.optimizer = 'adam'
		self.loss = 'binary_crossentropy'
		self.noise_shape = None
		self.seed = 145
		self.batch_size = 1000000
		self.metrics = 'accuracy'
		self.checkpointIter = 0
		self.model = None
		self.classifier = None

	def init_model(self):

	    self.model = Sequential()
	    self.model.add(Dense(self.hidden_units, input_dim=self.input_units, activation=self.activation))
	    self.model.add(Dropout(self.dropout, noise_shape=self.noise_shape, seed=self.seed))
	    self.model.add(Dense(self.output_units, activation=self.activation_last))
	    self.model.compile(optimizer=self.optimizer, loss=self.loss, metrics=[self.metrics])

	def loading_model(self, path):

		self.model = load_model(path)

	def saving_model(self, path):

		self.model.save(path)

	def train_model(self, features, labels, classifier):

		self.classifier = classifier
		self.model.fit(features, labels, epochs=self.epochs)
		self.model.save_weights("./checkpoints/" + self.classifier + ".h5")

	def predict_prob(self, features):

		if self.classifier:
			self.model.load_weights("./checkpoints/" + self.classifier + ".h5")
			predicts_prob = self.model.predict(features, batch_size=self.batch_size)[:, 0]
			return predicts_prob

	def predict(self, features):

		if self.classifier:
			self.model.load_weights("./checkpoints/" + self.classifier + ".h5")
			predicts = self.model.predict_classes(features, batch_size=self.batch_size)[:, 0]
			return predicts
