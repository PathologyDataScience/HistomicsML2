#!/usr/bin/env python
import sys
import string
import MySQLdb as mysql
import getpass as pw

if len(sys.argv) != 2:
	print "Usage: ", sys.argv[0], "<database user name>"
	exit(1)

userId = sys.argv[1]
passWord = pw.getpass()

try:
	db = mysql.connect(host='localhost', user=userId, passwd=passWord)
	cur = db.cursor()

	print "Creating an account 'guest', please provide a password"
	guestPassword = pw.getpass()

	cur.execute("CREATE USER 'guest'@'localhost' IDENTIFIED BY %s", (guestPassword,))


	print "Creating an account 'logger', please provide a password"
	loggerPassword = pw.getpass()

	cur.execute("CREATE USER 'logger'@'localhost' IDENTIFIED BY %s", (loggerPassword,))

	print "Generating accounts.php..."

	acctFile = open('accounts.php', 'w')
	acctFile.write('<?php\n\n\t$guestAccount = "guest";\n\t$guestPass = "')
	acctFile.write(guestPassword)
	acctFile.write('";\n')
	acctFile.write('\t$logAccount = "logger";\n\t$logPass = "')
	acctFile.write(loggerPassword)
	acctFile.write('";\n\n?>')
	acctFile.close()


except mysql.Error, e:

	print "Error %d %s" % (e.args[0], e.args[1])
	sys.exit(1)

finally:

	if db:
		db.close()
