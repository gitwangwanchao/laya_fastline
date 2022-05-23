# -*- coding:utf-8 -*-

import os
from makeZip import fshelper, suger, ziputil
import config

GLOBALS = suger.getAnonymousCls()

def makezipResource():
    # config.RES_PATH = fshelper.getAbsFromRelative(__file__, '..', 'build',"wechatgame/res/"+config.NEED_PACK_PATH)

    tmpDir = suger.getTempDirPath()
    GLOBALS.WORKSPACE = os.path.join(config.GAMES_PATH, config.VERSION_NAME)
    try:
        _worker()
    finally:
        fshelper.deletetree(tmpDir)


def _worker():
    if os.path.exists(GLOBALS.WORKSPACE):
        fshelper.deletetree(GLOBALS.WORKSPACE)
    os.makedirs(GLOBALS.WORKSPACE)
    GLOBALS.ZIPFILE = os.path.join(GLOBALS.WORKSPACE, config.VERSION_NAME+".zip")
    _makeTempFile(config.RES_PATH)
    fshelper.removeLurkers(os.path.join(GLOBALS.WORKSPACE, '..'), ['.DS_Store'])
    fshelper.deletefile(GLOBALS.ZIPFILE, fileMustExist=False)

    ziputil.makezip(config.TEMP_PATH, GLOBALS.ZIPFILE)
    _makeJsonFile(GLOBALS.WORKSPACE)

    _cleanWxWorkspace(config.RES_PATH);

def _cleanWxWorkspace(path):
    for file in fshelper.listdir(path):
        isExist = False
        for nopackFile in config.NOPACK_FILES:
            if (file == nopackFile):
                isExist = True
                break
        if (isExist != True):
            fshelper.cleartree(os.path.join(path, file))

def _makeJsonFile(path):
    # 创建version.manifest文件
    versionXml = config.getJsonText()
    f = file(os.path.join(path, config.VERSION_NUM + "version.json"), "w+")
    f.write(versionXml)
    f.close()

def _makeTempFile(path):
    fshelper.cleartree(config.TEMP_PATH)

    for file in fshelper.listdir(path):
        isExist = False
        for nopackFile in config.NOPACK_FILES :
            if(file == nopackFile):
                isExist = True
                break
        if(isExist != True):
            fshelper.removeLurkers(os.path.join(path, file), ['.DS_Store'])
            _copyDir(file)

def _copyDir(argl):
    srcPath = os.path.join(config.RES_PATH, argl)

    if not os.path.isdir(srcPath):
        return
    dstPath = os.path.join(config.TEMP_PATH, "res/",argl)
    fshelper.copytree(srcPath, dstPath)

# def _updateSelect():
#     print '     [1]:完整更新'
#     print '     [2]:上传cdn'
#     selectIndex = raw_input('选择操作, 输入数字编号 : ')
#     print '输入编号为 : ' + selectIndex
#     if selectIndex == '1':
#         fullUpdate()
#     elif selectIndex == '2':
#         # createzip()
#     elif selectIndex == '3':
#         # uploadSrcRes()
#     else:
#         print '编号输入错误!'

if __name__ == '__main__':
    makezipResource()