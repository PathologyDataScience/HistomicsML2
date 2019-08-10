.. _index:

HistomicsML
===========

HistomicsML is a software platform for fast and interactive development of deep learning classifiers from whole-slide imaging datasets. Scientists can use the browser-based interface of HistomicsML to train and validate classifiers for patterns like tumor infiltrating lymphocytes to support tissue-based studies. An approach called *active learning* guides users to label the most valuable training instances, producing more accurate classifiers with less time and effort.


Getting started
===========

HistomicsML is provided as a collection of Docker images that simplify system deployment and dataset creation. Follow the :ref:`example-data <Quick start guide>` to download and run containers with pre-loaded sample data and see the section on :ref:`training <Training classifiers>`.

For a more detailed overview of HistomicsML see :ref:`system-overview <System overivew>`.

To create HistomicsML dataset from your own images and to create a system deployment see :ref:`data-create <Creating datasets for HistomicsML>` and :ref:`data-import <Importing HistomicsML datasets>`.

To format data from your own image segmentation and feature extraction algorithms for use with HistomicsML see :ref:`data-format <Dataset formats>`.


Table of contents
===========

.. toctree::
   :maxdepth: 1

   example-data
   training
   system-overview
   data-create
   data-import
   data-format
   reports


Resources
=========

* **Project source**: HistomicsML (https://github.com/CancerDataScience/HistomicsML-TA).

* **Related projects**: HistomicsTK (https://github.com/DigitalSlideArchive/HistomicsTK).
