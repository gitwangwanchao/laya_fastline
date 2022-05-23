# coding: utf-8
import json
import sys
import shutil,os
import zipfile
import hashlib as hashlib
import string
import argparse

def sourceMan(params):
    """
    分片管理主体，
    :param configPath: 配置的路径
    :param projectSrcDir:打包的项目路径
    :param destDir:打包后的存放路径
    :return:
    """
    prjName  = params.get("prjName")
    prjDir = params.get("prjDir")
    prjBuildStartFrom = params.get("buildStartFrom")
    configPath = params.get("configPath")
    destDir = params.get("destDir")
    buildType = params.get("buildType")
    version = params.get("version")
    buildLog = {"version":version,"buildType":buildType}
    buildLog["md5"] = {}
    prjPath = prjDir + "/" + prjName + "/" + prjBuildStartFrom + "/"
    #分包的zips目录路径
    #zipsDir = destDir + "/" + "zips" + "/"
    zipsDir = destDir + "/" + buildType + "/" + prjName +"/" + version
    destDir = destDir + "/" + buildType + "/" + prjName +"/" + version
    #如果已经存在打包目录，说明之前进行过错误打包，删除之前错误的
    if os.path.exists(zipsDir):
        shutil.rmtree(zipsDir)
    #获取配置内容
    sourManConfig = loadFileConfig(configPath)
    if not sourManConfig:
        print "配置读取失败，程序终止！"
        sys.exit()
    #开始读取配置打包文件
    for ZDir, steps in sourManConfig.items():
        thisZDir = zipsDir + "/" + ZDir + "/"
        #判断是否此压缩包进行过有效操作，如果没有则不处理
        if not steps:
            continue
    # 开始对配置里面zip的各个目录进行移动
        for moveStep in steps:
            dirPath = moveStep.get("dirPath")
            #为项目中的 ./ 层目录操作做准备，避免产生 prjPath/./filePath 的路径格式
            if dirPath == "" or dirPath == "." or dirPath == "./" or dirPath == ".//" or dirPath == ".///":
                dirPath = ""
            files = moveStep.get("files")
            if_move = moveStep.get("if_move")       #正选、反选的标志，为1则为正选，否则为反选
            if if_move != 0:
                moveThese(files, dirPath, prjPath, thisZDir, prjName, destDir)
            else:
                notMoveThese(files, dirPath, prjPath, thisZDir, prjName, destDir)
        #开始压缩,将目录名后都加"/"，进行区分，压缩后的存放路径：destZips
        destZips = destDir + "/"
        print "需要压缩的目录", thisZDir, "    压缩后存放目录：    ", destZips
        zipMd5 = zip_file(thisZDir, destZips)
        if not zipMd5:
            print "md5无法获取"
            sys.exit()
        ZZDir, _ = os.path.split(ZDir + "/") #获取zip包的具体名字
        buildLog["md5"][ZZDir] = zipMd5
    buildLogPath = destDir + "/" + "buildLog.json"
    print "最终的buildLog.json:    ", buildLog
    writeJsonFile(buildLog, buildLogPath)

def moveThese(files, dirPath, prjPath, thisZDir, prjName, destDir):
    """
    正选移动文件的方法
    :param files:
    :param dirPath:
    :param prjPath:
    :param thisZDir:
    :param prjName:
    :param destDir:
    :return:
    """
    if not files:
        filePath = prjPath + "/" + dirPath + "/"
        #去除版本后的项目名 本来为 zipPath = thisZDir + "/" + prjName + "/" + dirPath + "/"
        zipPath = thisZDir + "/" + dirPath + "/"
        #print "打包： ", filePath, " ------> ", zipPath
        moveFile(filePath, zipPath)
        return
    for file in files:
        filePath = prjPath + "/" + dirPath + "/" +file   # 组装需要移动的文件路径
        #判断是文件还是文件夹
        if os.path.isdir(filePath):
            file = file + "/"
        # 对文件名和路径进行分离,由于文件名可能包含目录级别的路径，，所以组合需要移动的文件的路径 （ 目录 + 文件名（文件名可能包含目录级别）），方便后面分离路径和文件名
        # 组装移动后的路径
        fileDir, _ = os.path.split(file)
        # 拼接打包后的路径， zip名字 + 项目名（resource）+ 项目名内目录里
        # zipPath = thisZDir + "/" + prjName + " /" +fileDir
        zipPath = thisZDir + "/" + dirPath + "/" + fileDir + "/"

        #print "打包： ", filePath, " ------> ", zipPath
        moveFile(filePath, zipPath)

def notMoveThese(files, dirPath, prjPath, thisZDir, prjName, destDir):
    """
    反选移动文件的方法，先全部移动过去，在删除选择的
    :param files:
    :param dirPath:
    :param prjPath:
    :param thisZDir:
    :param prjName:
    :param destDir:
    :return:
    """
    #先全部移动过去
    allFilePath = prjPath + "/" + dirPath
    zipAllPath = thisZDir + "/" + dirPath
    moveFile(allFilePath, zipAllPath)
    #删除指定不要的
    for file in files:
        filePath = zipAllPath + "/" + file
        rmFile(filePath)


def moveFile(src, destDir):
    """
    移动文件或者文件夹到destDir,检查目的文件夹是否存在以及打包的文件或者文件夹是否存在
    :param src:需要移动的资源
    :param destDir:移动的目的地
    :return:
    """
    #判断打包的内容，文件夹或文件，单独处理
    if not os.path.exists(src):
        print src, "    <-------此打包的文件不存在，请检查！"
        sys.exit()
    #判断移动的目的文件夹是否存在，如果不存在则创建
    #可能存在的情况 1.目的文件夹不存在 2.打包的文件夹不存在 3.需要判断打包的是文件还是文件夹
    if not os.path.exists(destDir):
        os.makedirs(destDir)
        #print "make:    ", src, destDir

    #如果是文件，可以直接复制过去
    if os.path.isfile(src):
        shutil.copy2(src, destDir)
        #print "f", "d"
        return
    #如果是文件夹，先删除目录在移动
    elif os.path.isdir(src):
        if os.path.exists(destDir):
            shutil.rmtree(destDir)
        #print "f", "d"
        shutil.copytree(src, destDir)

def rmFile(src):
    """
    删除一个文件或文件夹进行判断
    :param src:
    :return:
    """
    #先检查有没有
    if not os.path.exists(src):
        print src, "    <-------此反选打包的文件不存在，请检查！"
        sys.exit()
    if os.path.isfile(src):
        os.remove(src)
    elif os.path.isdir(src):
        shutil.rmtree(src)

def loadFileConfig(configPath):
    """
    读取资源分片打包管理配置的路径, 默认为本机目录的sourManConfig.json
    :param configPath:读取打包配置的路径
    :return:
    """
    config = {}
    if not os.path.exists(configPath):
        print configPath,"      <-----------配置文件加载失败！请确认配置路径！"
        sys.exit()
    with open(configPath, 'r') as f:
        try:
            config = json.loads(f.read())
        except:
            print configPath, "      <-----------配置加载失败！请确认配置内容！"
            sys.exit()
        return config

def writeJsonFile(jsonData, filePath):
    """
    将一个json数据写入一个文件
    :param jsonData:
    :param filePath:
    :return:
    """
    with open(filePath, "w") as fp:
        fp.write(json.dumps(jsonData, indent=4))

def zip_file(src, zipDest):
    """
    压缩文件并放到存储的地方
    :param src_dir:
    :return:
    """
    src, _ = os.path.split(src + "/")   #加上"/"保证为目录
    zipconf = getZipName(src)
    zipPath = src + '.zip' #没有加上md5名字的文件名
    z = zipfile.ZipFile(zipPath,'w',zipfile.ZIP_DEFLATED)
    #print "正在压缩",
    for dirpath, dirnames, filenames in os.walk(src):
        #print dirpath, dirnames, filenames
        fpath = dirpath.replace(src, '')
        fpath = fpath and fpath + os.sep or ''
        for filename in filenames:
            z.write(os.path.join(dirpath, filename), fpath+filename)
            #print "+",
    z.close()
    #如果指定的压缩包存放目录不存在，则创建
    if not os.path.exists(zipDest) and not os.path.isdir(zipDest):
        os.mkdir(zipDest)
    #如果指定存放压缩包的路径不为目录，则提示错误
    if not os.path.isdir(str(zipDest)):
        print src, "    <-------此存放压缩包的路径不为目录，请检查！"
        return
    #判断压缩包是否存在，如有，则删除,zipName为该压缩包的文件名

    _, zipName = os.path.split(zipPath) #zipName：压缩后的文件名字
    destPath = zipDest + "/" + zipName #压缩后的包名字
    # if os.path.exists(destPath):
    #     os.remove(destPath)
    md5 = getFileMd5(zipPath)    #计算该压缩包的md5值，并重命名
    #获取zip包的名称 ,   组装zipDest：压缩后最终存放的路径和名字
    zipMd5Name = appendZipName(zipconf, md5) #加上md5后的文件名
    zipDest = zipDest + "/" + zipMd5Name
    shutil.move(zipPath, zipDest)
    if os.path.exists(src):
        shutil.rmtree(src) #删除文件夹
    return md5

def appendZipName(zipconf, md5):
    """
    通过src、type、version、MD5组装最终得到的压缩包名字
    :param src:需要压缩的目录的路径
    :param type:
    :param version:
    :param md5:
    :return:
    """
    if not zipconf or not md5:
        print zipconf, "    <-------压缩出错！"
        sys.exit()
    zipName = zipconf + "_" + md5 + ".zip"
    return zipName

def getZipName(zipSrc):
    """
    通过需要打包的目录的路径，获取配置中zip的名字（即最后一级目录的名字如：a/b/c,将提取出c）
    :param zipSrc:
    :return:
    """
    zipNum,_ = os.path.split(zipSrc + "/")
    _, zipNum = os.path.split(zipNum)
    return zipNum

def getFileMd5(filename):
    """
    获取一个文件的md5值
    :param filename:
    :return:
    """
    if not os.path.isfile(filename):
        print filename, "   <--------这不是文件",
        sys.exit()
    myhash = hashlib.md5()
    f = open(filename, 'rb')
    while True:
        # 每次读入8096kb进入内存
        b = f.read(8096)
        if not b:
            break
        myhash.update(b)
    f.close()
    return myhash.hexdigest()

def setVersion(thisVersion, buildType=None):
    """
    获取./version.json中的version，进行检验是否合格
    :param versionConfPath:记录version.json的路径
    :return:
    """
    versionConfPath = "version_" + str(buildType) + ".json"
    try:
        thisVersion = int(thisVersion)
    except:
        print "配置中version格式错误，无法转化为int，请检查------->version:      ", version
        return
    newVersionJson = {}
    if not os.path.exists(versionConfPath):
        print "当前版本管理json文件： ", versionConfPath, "  不存在，将会直接使用指定 version= ", thisVersion
    else:
        oldVersionJson = loadFileConfig(versionConfPath)
        oldVersion = int(oldVersionJson.get("version"))
        if oldVersion >= thisVersion and buildType != "debug":
            print "版本号错误：   oldVersion: ", oldVersion, "  >=    newVersion: ", thisVersion
            return
    # newVersionJson["version"] = thisVersion
    # writeJsonFile(newVersionJson, versionConfPath)
    # oldVersionJson = loadFileConfig(versionConfPath)
    return 1

def incVersion(thisVersion, buildType):
    """
    在完成所有操作后，直接对version_(buildType).json 修改,因为程序开始时已经进行检查
    :param buildType:
    :return:
    """
    versionConfPath = "version_" + str(buildType) + ".json"
    newVersionJson = {}
    if not os.path.exists(versionConfPath):
        print "当前版本管理json文件： ", versionConfPath, "  不存在，将会直接使用指定 version= ", thisVersion
    else:
        oldVersionJson = loadFileConfig(versionConfPath)
    newVersionJson["version"] = thisVersion
    writeJsonFile(newVersionJson, versionConfPath)
    #oldVersionJson = loadFileConfig(versionConfPath)
    print "本次打包结束， ", buildType," version ——----->  ", thisVersion
    return 1


def loadBuildConf(buildConfigPath):
    """
    从该路径文件加载构建项目的prjName、prjDir、configPath、destDir等参数，并进行检验
    :param buildConfigPath:
    :return:
    """
    buildConfig = {}
    if not os.path.exists(buildConfigPath):
        print buildConfigPath,"      <-----------buildConfig.json配置文件加载失败！请确认该文件路径与执行此脚本的路径为同一路径！"
        sys.exit()
    with open(buildConfigPath, 'r') as f:
        try:
            buildConfig = json.loads(f.read())
            if not buildConfig.get("prjName") or not buildConfig.get("prjDir") or not buildConfig.get("configPath") or not buildConfig.get("destDir"):
                print buildConfigPath, "      <-----------buildConfig.json配置文件参数错误内容错误！请确认配置内容是否完整！"
        except:
            print buildConfigPath, "      <-----------配置加载失败！请确认配置内容格式等！"
            sys.exit()
        return buildConfig

if __name__ == '__main__':
    #现获取必要的参数
    versionParser = argparse.ArgumentParser()
    versionParser.add_argument("-v", "--version", type=str, help="increase output verbosity")
    versionParser.add_argument("-t", "--buildType", type=str, help="increase output verbosity")
    args = versionParser.parse_args()
    if args.version:
        version = args.version
    else:
        print "version读取失败，请输入 version："
        sys.exit()
    if args.buildType:
        buildType = args.buildType
    else:
        print "buildType读取失败，请输入 buildType："
        sys.exit()
    params = {}

    buildConfigPath = "./buildConfig.json"
    buildConfig = loadBuildConf(buildConfigPath)
    if not buildConfig:
        print "buildConfig.json配置读取失败，程序终止！"
        sys.exit()
    params = buildConfig
    params["buildType"] = buildType
    if not setVersion(version, buildType):
        sys.exit()
    params["version"] = version    # 转化为str
    sourceMan(params)
    incVersion(version, buildType)    #在完成所有操作后进行 version+1 操作




