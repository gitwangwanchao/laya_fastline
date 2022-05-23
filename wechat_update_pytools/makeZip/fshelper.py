# -*- coding:utf-8 -*-

import os, shutil, commands
import externalcall


def getAbsFromRelative(filepath, *argl):
    dirpath = os.path.dirname(filepath)
    return os.path.abspath(os.path.join(dirpath, *argl))


def ensureFileWrite(fPath):
    if not os.path.isdir(os.path.dirname(fPath)):
        os.makedirs(os.path.dirname(fPath))


def listdir(path):
    return filter(lambda x: not x.startswith('.'), os.listdir(path))


def copyfile(srcAbsPath, dstAbsPath, deleteIfExist=False):
    assert os.path.isabs(srcAbsPath)
    assert os.path.isfile(srcAbsPath)
    assert os.path.isabs(dstAbsPath)
    if os.path.isdir(dstAbsPath):
        raise Exception(dstAbsPath + ' is a path!')
    elif os.path.isfile(dstAbsPath):
        if deleteIfExist:
            os.remove(dstAbsPath)
        else:
            raise Exception(dstAbsPath + ' exists!')
    elif not os.path.isdir(os.path.dirname(dstAbsPath)):
        os.makedirs(os.path.dirname(dstAbsPath))
    shutil.copyfile(srcAbsPath, dstAbsPath)


def deletefile(filepath, fileMustExist=True):
    assert os.path.isabs(filepath)
    if fileMustExist:
        assert os.path.isfile(filepath)
        os.remove(filepath)
    elif os.path.isfile(filepath):
        os.remove(filepath)


def deletetree(treepath, treeMustExist=True):
    assert os.path.isabs(treepath)
    if treeMustExist:
        assert os.path.isdir(treepath)
        shutil.rmtree(treepath)
    elif os.path.isdir(treepath):
        shutil.rmtree(treepath)


def cleartree(treepath):
    assert os.path.isabs(treepath) and not os.path.isfile(treepath)
    if os.path.isdir(treepath):
        shutil.rmtree(treepath)
    os.makedirs(treepath)


def copytree(srcAbsPath, dstAbsPath, deleteIfExist=False):
    assert os.path.isabs(srcAbsPath) and os.path.isdir(srcAbsPath)
    assert os.path.isabs(dstAbsPath)
    if os.path.isdir(dstAbsPath):
        if deleteIfExist:
            shutil.rmtree(dstAbsPath)
        else:
            raise Exception(dstAbsPath + ' exists!')
    if not os.path.isdir(os.path.dirname(dstAbsPath)):
        os.makedirs(os.path.dirname(dstAbsPath))
    shutil.copytree(srcAbsPath, dstAbsPath)


def mergetree(srcAbsPath, dstAbsPath):
    assert os.path.isabs(srcAbsPath) and os.path.isdir(srcAbsPath)
    assert os.path.isabs(dstAbsPath)
    ensureFileWrite(dstAbsPath)
    if os.path.isdir(dstAbsPath):
        shcmd = 'cp -r %s%s %s' % (srcAbsPath, '/*', dstAbsPath)
    else:
        shcmd = 'cp -r %s %s' % (srcAbsPath, dstAbsPath)
    return externalcall.callShellCommand(shcmd)


def getNameWithoutExtension(filePath):
    return os.path.splitext(os.path.basename(filePath))[0]


def collectAllFiles(fromAbsDir, filefilter=None, fileExt=None, relativePath=False):
    assert os.path.isabs(fromAbsDir)
    ret = []
    for dirpath, dirnames, filenames in os.walk(fromAbsDir):
        for fn in filenames:
            if fn.startswith('.'):
                continue
            if fileExt:
                if os.path.splitext(fn)[1] != fileExt:
                    continue
            if filefilter:
                if not filefilter(fn):
                    continue
            if relativePath:
                ret.append(os.path.join(dirpath, fn)[len(fromAbsDir) + 1:])
            else:
                ret.append(os.path.join(dirpath, fn))
    return ret


def collectFilesAndDirs(fromAbsDir, relativePath=False):
    assert os.path.isabs(fromAbsDir)
    dirs, files = set([]), set([])
    for dirpath, dirnames, filenames in os.walk(fromAbsDir):
        for dn in dirnames:
            if relativePath:
                dirs.add(os.path.join(dirpath, dn)[len(fromAbsDir) + 1:])
            else:
                dirs.add(os.path.join(dirpath, dn))
        for fn in filenames:
            if fn.startswith('.'):
                continue
            if relativePath:
                files.add(os.path.join(dirpath, fn)[len(fromAbsDir) + 1:])
            else:
                files.add(os.path.join(dirpath, fn))
    return list(dirs), list(files)


def removeLurkers(dirPath, lurkerNames):
    lurkerNameSet = set(lurkerNames)
    for k in os.listdir(dirPath):
        fp = os.path.join(dirPath, k)
        if os.path.isfile(fp):
            if k in lurkerNameSet:
                os.remove(fp)
        elif os.path.isdir(fp):
            if k in lurkerNameSet:
                shutil.rmtree(fp)
            else:
                removeLurkers(fp, lurkerNameSet)
