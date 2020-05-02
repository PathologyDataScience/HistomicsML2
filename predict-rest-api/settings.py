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
        self.TRAININGSET_DIR = "/datasets/classifiers/"
        self.MODEL_DIR = "/datasets/models/"
        self.DATASET_DIR = "/datasets/"
        self.PATH_TO_SPECIAL = "/datasets/BRCA/BRCA-spfeatures-1.h5"
