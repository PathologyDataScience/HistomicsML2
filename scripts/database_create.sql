DROP DATABASE IF EXISTS nuclei;
CREATE DATABASE nuclei;

USE nuclei;


CREATE TABLE `logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `remote_addr` varchar(255) NOT NULL DEFAULT '',
  `type` varchar(8) NOT NULL,
  `message` text NOT NULL,
  `log_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB;




CREATE TABLE `slides` (
  `name` varchar(80) NOT NULL,
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `patient` varchar(80) DEFAULT NULL,
  `x_size` int(11) NOT NULL COMMENT 'Needed for thumbnails',
  `y_size` int(11) NOT NULL COMMENT 'Needed for thumbnails',
  `pyramid_path` varchar(1024) DEFAULT NULL,
  `scale` int(2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB;



CREATE TABLE `datasets` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `features_file` varchar(1024) NOT NULL,
  `pca_file` varchar(1024) NOT NULL,
  `superpixel_size` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (name)
) ENGINE=InnoDB;




CREATE TABLE `dataset_slides` (
  `slide_id` int(10) NOT NULL,
  `dataset_id` int(10) NOT NULL,
  KEY `FK_datasets_id` (`dataset_id`),
  KEY `FK_slide_id` (`slide_id`),
  CONSTRAINT `dataset_slides_ibfk_1` FOREIGN KEY (`slide_id`) REFERENCES `slides` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `dataset_slides_ibfk_2` FOREIGN KEY (`dataset_id`) REFERENCES `datasets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;



CREATE TABLE `training_sets` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `type` varchar(10) DEFAULT NULL,
  `dataset_id` int(10) NOT NULL,
  `iterations` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_datasets_id` (`dataset_id`),
  CONSTRAINT `training_sets_ibfk_1` FOREIGN KEY (`dataset_id`) REFERENCES `datasets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;




CREATE TABLE `classes` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `training_set_id` int(10) NOT NULL,
  `color` varchar(20) DEFAULT NULL,
  `label` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_training_set` (`training_set_id`),
  CONSTRAINT `FK_training_set` FOREIGN KEY (`training_set_id`) REFERENCES `training_sets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;




CREATE TABLE `training_objs` (
  `training_set_id` int(10) NOT NULL,
  `cell_id` int(11) NOT NULL,
  `iteration` int(10) NOT NULL,
  `class_id` int(10) NOT NULL COMMENT 'Sample label',
  PRIMARY KEY (`training_set_id`,`cell_id`),
  KEY `FK_objs_class_id` (`class_id`),
  CONSTRAINT `FK_objs_class_id` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_objs_training_set` FOREIGN KEY (`training_set_id`) REFERENCES `training_sets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;




CREATE TABLE boundaries (
	id int(11) NOT NULL AUTO_INCREMENT,
	slide varchar(80) NOT NULL,
	centroid_x decimal(10,1) NOT NULL,
	centroid_y decimal(10,1) NOT NULL,
	boundary varchar(4096) NOT NULL,
	PRIMARY KEY(slide, centroid_x, centroid_y),
	UNIQUE KEY (id)
) ENGINE=InnoDB;




CREATE TABLE sregionboundaries (
	id int(11) NOT NULL AUTO_INCREMENT,
	slide varchar(80) NOT NULL,
	centroid_x decimal(10,1) NOT NULL,
	centroid_y decimal(10,1) NOT NULL,
	boundary varchar(4096) NOT NULL,
	PRIMARY KEY(slide, centroid_x, centroid_y),
	UNIQUE KEY (id)
) ENGINE=InnoDB;




CREATE TABLE `test_sets` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `dataset_id` int(10) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `pos_name` varchar(80) NOT NULL,
  `neg_name` varchar(80) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_datasets_id` (`dataset_id`),
  CONSTRAINT `test_set_ibfk_1` FOREIGN KEY (`dataset_id`) REFERENCES `datasets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;



CREATE USER 'guest'@'%' IDENTIFIED BY 'guest';
UPDATE mysql.user SET Password = PASSWORD('guest') WHERE User = 'guest';
GRANT ALL PRIVILEGES ON *.* TO 'guest'@'%';
CREATE USER 'logger'@'%' IDENTIFIED BY 'logger';
UPDATE mysql.user SET Password = PASSWORD('logger') WHERE User = 'logger';
GRANT ALL PRIVILEGES ON *.* TO 'logger'@'%';
