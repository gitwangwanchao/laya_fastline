# -*- coding: UTF-8 -*-  
import os
import sys
import commands

pngquant_path = sys.argv[1]
print 'pngquant_path = ', pngquant_path

png_file = sys.argv[2]
if png_file.endswith('.9.png') or png_file.startswith('nt_'):
	print '.9 pic or nt pic', png_file, ', do not tiny'
else:
	print 'png_file = ', png_file
	ipng = png_file
	dpng = ipng[:-4]+'-fs8.png'
	cmd = pngquant_path + ' -f '+ ipng
	code, out = commands.getstatusoutput(cmd)
	if code==0:
		cmdmv = 'mv -f ' + dpng + ' ' + ipng
		codemv, outmv = commands.getstatusoutput(cmdmv)