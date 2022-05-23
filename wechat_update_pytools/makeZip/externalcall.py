# -*- coding:utf-8 -*-

import os, commands


def callShellCommand(shcmd):
    result = commands.getstatusoutput(shcmd)
    if result[0] == 0:
        return True, result[1]
    else:
        return False, result[1]


def isToolInstalled(toolName):
    checkcmd = 'which %s' % toolName
    ok, msg = callShellCommand(checkcmd)
    if not ok or msg == '':
        return False
    else:
        return True
