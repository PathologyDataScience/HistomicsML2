import argparse
from time import time
import dataset
import networks
import openslide
import numpy as np
import matplotlib.pyplot as plt
import settings
plt.switch_backend('agg')

def find_mag(i):
    base_mag={10:40, 9:20, 8:10, 7:5, 6:2.5, 5:1.25}
    return base_mag.get(i,"Invalid level count")

def find_level(i):
    downsample_factor={1:0, 2:1, 4:2, 8:3, 16:4, 32:5, 64:6, 128:7, 256:8}
    return downsample_factor.get(i,"Invalid downsample factor")

def get_patch_bounds(cx, cy, patch):
    top = int(cy) - patch
    left = int(cx) - patch
    return top, left

def main(args):
    # load model
    model = networks.Network()
    model.init_model()
    model.loading_model(args['model_path'])
    # load dataset
    dset = dataset.Dataset(args['dataset_path'])
    # predict
    scores = model.model.predict_classes(dset.features, batch_size=args['batch_size'])[:, 0]
    fig = plt.figure(figsize=(8,8))
    t0 = time()
    for slideName in dset.slides:
        # check if slide name matches slide path
        if slideName == args['slide_path'].split('/')[-1].split('.')[0]:
            # get dataset information for each slide
            slide_idx = dset.getSlideIdx(slideName)
            object_num = dset.getObjNum(slide_idx)
            data_idx = dset.getDataIdx(slide_idx)
            x_centroid_set = dset.getXcentroidSet(data_idx, object_num)
            y_centroid_set = dset.getYcentroidSet(data_idx, object_num)
            # get score for eadh slide
            score_set = scores[data_idx: data_idx+object_num]
            # get slide properties for each slide
            slide = openslide.open_slide(args['slide_path'])
            # compute downsample factor
            base_mag = find_mag(slide.level_count)
            downsample_factor = base_mag / args['target_mag']
            level = find_level(downsample_factor)
            # read downsampled image
            downsampled_img = slide.read_region((0,0), level, slide.level_dimensions[level])
            # get centroids for the downsampled image
            [width, height] = slide.level_dimensions[level]
            patch_size_log_mag = int(args['patch_size']/downsample_factor)
            half_patch_size_log_mag = int(patch_size_log_mag/2)
            x_centroids = x_centroid_set/downsample_factor
            y_centroids = y_centroid_set/downsample_factor
            mask = np.zeros((height, width))
            for i in range(len(x_centroids)):
                top, left = get_patch_bounds(x_centroids[i, 0], y_centroids[i, 0], half_patch_size_log_mag)
                if score_set[i] > 0:
                    mask[top:top+patch_size_log_mag, left:left+patch_size_log_mag] = 255
                elif score_set[i] == 0:
                    mask[top:top+patch_size_log_mag, left:left+patch_size_log_mag] = 128
            im_output = args['out_dir']+slideName+'.png'
            plt.imsave(im_output, mask)
    t1 = time()
    print ("Processing done ", t1 - t0)

if __name__ == '__main__':
    # initialize settings
    set = settings.Settings()
    parser = argparse.ArgumentParser()
    parser.add_argument('dataset_path',
                        metavar='Dataset-Path',
                        type=str,
                        help='The location of a dataset')
    parser.add_argument('model_path',
                        metavar='Model-Path',
                        type=str,
                        help='The location of a trained model')
    parser.add_argument('slide_path',
                        metavar='Slide_Path',
                        type=str,
                        help='The location of a slide')
    parser.add_argument('out_dir',
                        metavar='Output_Directory',
                        type=str,
                        help='The location of the output directory')
    parser.add_argument('-b',
                        '--batch_size',
                        default=1000000,
                        type=int,
                        help='For test use, the number of superpixels to predict in a batch')
    parser.add_argument('-tm',
                    '--target_mag',
                    default=1.25,
                    type=float,
                    help='The target magnficiation to be used for creating images')
    parser.add_argument('-p',
                    '--patch_size',
                    default=64,
                    type=int,
                    help='The image patch size for each superpixel')

    args = vars(parser.parse_args())
    main(args)
