"""
Train data
"""
import numpy as np
import settings
import json

class Train():

    def __init__(self):

        self.uid = None
        self.samples = None
        self.iter = 0

        s = settings.Settings()
        self.FEATURE_DIM = s.FEATURE_DIM

    def setData(self, q):
        self.uid = q["uid"]
        self.samples = q["samples"]
        self.iter = int(q["iteration"])
        self.classifier = q["classifier"]
