# -*- coding:utf-8 -*-

import os, zipfile
from io import BytesIO
import fshelper
from datetime import *


def makezip(srcPath, outFilePath):
    assert os.path.isabs(srcPath)
    assert not os.path.exists(outFilePath)
    fshelper.ensureFileWrite(outFilePath)
    zipdata = _makeZipBinary(srcPath)
    with open(outFilePath, 'wb') as f:
        f.write(zipdata)


def _makeZipBinary(srcPath):
    dirs, files = fshelper.collectFilesAndDirs(srcPath, relativePath=True)

    memoryFile = BytesIO()
    z = zipfile.ZipFile(memoryFile, mode='w', compression=zipfile.ZIP_DEFLATED)
    for fo in dirs:
        zinfo = zipfile.ZipInfo(filename=fo+'/')
        zinfo.external_attr = 0o777 << 16
        z.writestr(zinfo, '', zipfile.ZIP_DEFLATED)
    for fp in files:
        zinfo = zipfile.ZipInfo(filename=fp)
        zinfo.external_attr = 0o777 << 16
        with open(os.path.join(srcPath, fp), 'rb') as f:
            z.writestr(zinfo, f.read(), zipfile.ZIP_DEFLATED)
    z.close()
    return memoryFile.getvalue()
