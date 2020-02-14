.. _index:

============
HistomicsML2
============

HistomicsML2 is a software platform for fast and interactive development of deep learning classifiers from whole-slide imaging datasets. Scientists can use the browser-based interface of HistomicsML2 to train and validate classifiers for patterns like tumor infiltrating lymphocytes to support tissue-based studies. An approach called *active learning* guides users to label the most valuable training instances, producing more accurate classifiers with less time and effort.


Getting started
===========

HistomicsML2 is provided as a collection of Docker images that simplify system deployment and dataset creation. Follow the :ref:`quick start guide <example-data>` to download and run containers with pre-loaded sample data and see the section on :ref:`training classifiers <training>`.

For a more detailed overview of HistomicsML2 see :ref:`system overivew <system-overview>`.

To create HistomicsML2 dataset from your own images and to create a system deployment see :ref:`creating datasets for HistomicsML2 <data-create>` and :ref:`importing HistomicsML2 datasets <data-import>`.

To format data from your own image segmentation and feature extraction algorithms for use with HistomicsML2 see :ref:`data formats <data-format>`.


Table of contents
===========

.. toctree::
   :maxdepth: 1

   example-data
   training
   reports
   system-overview
   data-create
   data-import
   data-format


Resources
=========

* **Project source**: HistomicsML2 (https://github.com/CancerDataScience/HistomicsML2).

* **Related projects**: HistomicsTK (https://github.com/DigitalSlideArchive/HistomicsTK).
