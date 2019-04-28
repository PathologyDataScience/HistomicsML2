"""
Init class
written by Sanghoon Lee (sanghoon.lee@emory.edu)

Initialize model(VGG).
Load pca information
"""
from keras.applications.vgg16 import VGG16
from keras.models import Model
from sklearn.externals import joblib


class Init():

    def __init__(self):

        # initialize constants used for HistomicsML
        self.VGG_MODEL = VGG16(include_top=True, weights='imagenet')
        self.FC1_MODEL = Model(inputs=self.VGG_MODEL.input, outputs=self.VGG_MODEL.get_layer('fc1').output)
        self.PCA = joblib.load('./pca_model_sample.pkl')
