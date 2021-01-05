#coding:utf-8
import os

def push():
	os.system('git add .')
	os.system('git commit -m "..."')
	# os.system('git push coding')
	os.system('git push')
	os.system('git push github')

	return True


push()