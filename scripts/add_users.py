#!/usr/bin/env python
#
#	Copyright (c) 2014-2019, Emory University
#	All rights reserved.
#
#	Redistribution and use in source and binary forms, with or without modification, are
#	permitted provided that the following conditions are met:
#
#	1. Redistributions of source code must retain the above copyright notice, this list of
#	conditions and the following disclaimer.
#
#	2. Redistributions in binary form must reproduce the above copyright notice, this list
# 	of conditions and the following disclaimer in the documentation and/or other materials
#	provided with the distribution.
#
#	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
#	EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
#	OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
#	SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
#	INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
#	TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
#	BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
#	CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
#	WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
#	DAMAGE.
#
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
