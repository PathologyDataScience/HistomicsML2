.. _index:

===========
HistomicsML
===========

HistomicsML is a software platform for fast and interactive development of deep learning classifiers from whole-slide imaging datasets. Scientists can use the browser-based interface of HistomicsML to train and validate classifiers for patterns like tumor infiltrating lymphocytes to support tissue-based studies. An approach called *active learning* guides users to label the most valuable training instances, producing more accurate classifiers with less time and effort.


Getting started
===========

HistomicsML is provided as a collection of Docker images that simplify system deployment and dataset creation. Follow the :ref:`quick start guide <example-data>` to download and run containers with pre-loaded sample data and see the section on :ref:`training classifiers <training>`.

For a more detailed overview of HistomicsML see :ref:`System overivew <system-overview>`.

To create HistomicsML dataset from your own images and to create a system deployment see :ref:`creating datasets for HistomicsML <data-create>` and :ref:`importing HistomicsML datasets <data-import>`.

To format data from your own image segmentation and feature extraction algorithms for use with HistomicsML see :ref:`Dataset formats <data-format>`.


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

* **Project source**: HistomicsML (https://github.com/CancerDataScience/HistomicsML-TA).

* **Related projects**: HistomicsTK (https://github.com/DigitalSlideArchive/HistomicsTK).
