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
from keras.optimizers import Adam, RMSprop, Adadelta, SGD, Adagrad, Adamax, Nadam

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
		self.optimizer = 'Adam'
		self.learning_rate = 0.001
		self.loss = 'binary_crossentropy'
		self.noise_shape = None
		self.seed = 145
		self.batch_size = 1000000
		self.metrics = 'accuracy'
		self.checkpointIter = 0
		self.model = None
		self.classifier = None

	def params_setting(self, q):

		self.activation = str(q["activation"])
		self.optimizer = str(q["optimizer"])
		self.epochs = int(q["epochs"])
		self.learning_rate = float(q["learning_rate"])
		self.dropout = float(q["dropout"])

	def getParams(self):

		data = {}
		data['activation'] = self.activation
		data['optimizer'] = self.optimizer
		data['epochs'] = str(self.epochs)
		data['learning_rate'] = str(self.learning_rate)
		data['dropout'] = str(self.dropout)

		return data

	def setParams(self, q):

		self.activation = str(q[0])
		self.optimizer = str(q[1])
		self.epochs = int(q[2])
		self.learning_rate = float(q[3])
		self.dropout = float(q[4])

	def init_model(self):

		self.model = Sequential()
		self.model.add(Dense(self.hidden_units, input_dim=self.input_units, activation=self.activation))
		self.model.add(Dropout(self.dropout, noise_shape=self.noise_shape, seed=self.seed))
		self.model.add(Dense(self.output_units, activation=self.activation_last))

		if self.optimizer == 'RMSprop':
			opt = RMSprop(learning_rate=self.learning_rate)
		elif self.optimizer == 'Adadelta':
			opt = kAdadelta(learning_rate=self.learning_rate)
		elif self.optimizer == 'SGD':
			opt = SGD(learning_rate=self.learning_rate)
		elif self.optimizer == 'Adagrad':
			opt = Adagrad(learning_rate=self.learning_rate)
		elif self.optimizer == 'Adamax':
			opt = Adamax(learning_rate=self.learning_rate)
		elif self.optimizer == 'Nadam':
			opt = Nadam(learning_rate=self.learning_rate)
		else:
			opt = Adam(learning_rate=self.learning_rate)

		self.model.compile(optimizer=opt, loss=self.loss, metrics=[self.metrics])

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
