
GRANT SELECT ON `nuclei`.* TO 'guest'@'localhost';
GRANT SELECT, INSERT ON `nuclei`.`training_sets` TO 'guest'@'localhost';
GRANT INSERT, UPDATE ON `nuclei`.`training_objs` TO 'guest'@'localhost';
GRANT INSERT, UPDATE ON `nuclei`.`test_sets` TO 'guest'@'localhost';
GRANT INSERT ON `nuclei`.`classes` TO 'guest'@'localhost';
GRANT INSERT ON `nuclei`.`logs` TO 'logger'@'localhost';

