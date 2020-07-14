class Settings():

    def __init__(self):

        # initialize redis settings
        self.REDIS_HOST = "localhost"
        self.REDIS_PORT = 6379
        self.REDIS_DB = 0
        self.MYSQL_HOST = "172.18.0.5"

        # initialize constants
        self.REQUEST_QUEUE = "request_queue"
        self.REQUEST_START = 0
        self.REQUEST_END = 100
        self.SLEEP = 0.5

        # initialize datasets
        self.FEATURE_DIM = 64
        self.IS_HEATMAP = False
        self.DATASET_DIR = "/datasets/"
        self.OUTPUT_DIR = self.DATASET_DIR+"/outputs/"
        self.TRAININGSET_DIR = self.DATASET_DIR+"/classifiers/"
        self.TRAININGTEMP_DIR = self.DATASET_DIR+"/classifiers/tmp/"
        self.SOFT_TRAININGTEMP_DIR = 'trainingsets/tmp/'
        self.MODEL_DIR = self.DATASET_DIR+"/models/"
        self.PATH_TO_SPECIAL = self.DATASET_DIR+"/BRCA/BRCA-spfeatures-1.h5"
