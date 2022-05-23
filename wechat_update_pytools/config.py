# -*- coding:utf-8 -*-

import os
from makeZip import fshelper


VERSION_NUM = "10027"
VERSION_NAME = "10027"



FILE_NAME = 'versionStore'

NEED_PACK_PATH = "raw-assets/"


GAMES_PATH = fshelper.getAbsFromRelative(__file__, '.', FILE_NAME)
TEMP_PATH = fshelper.getAbsFromRelative(__file__, '.', 'tempFile')
ZIP_PATH = fshelper.getAbsFromRelative(__file__, '..', FILE_NAME)
RES_PATH = fshelper.getAbsFromRelative(__file__, '..', 'zip',"res")

NOPACK_FILES = {
    
}

def getJsonText():
    return '{\n\
    "version" : "%s",\n\
    "updateFile" : "%s"\n\
}'% (VERSION_NUM,VERSION_NAME+".zip")



