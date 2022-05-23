# -*- coding:utf-8 -*-

import os, tempfile, externalcall, importlib, hashlib


def md5(any):
    return hashlib.md5(any).hexdigest()


def getAnonymousCls():
    return type('_', (object,), {})()


def getTempTextFilePath(fileExt=''):
    result = tempfile.mkstemp(suffix=fileExt, text=True)
    return result[1]


def getTempDirPath():
    return tempfile.mkdtemp()


def chmod777(filepath):
    assert os.path.isabs(filepath) and os.path.isfile(filepath)
    shcmd = 'chmod 777 %s' % filepath
    ok, msg = externalcall.callShellCommand(shcmd)
    if not ok:
        raise Exception('[chmod777] failed! ' + msg)
