/**
 * 设置LayaNative屏幕方向，可设置以下值
 * landscape           横屏
 * portrait            竖屏
 * sensor_landscape    横屏(双方向)
 * sensor_portrait     竖屏(双方向)
 */
window.screenOrientation = "portrait";

//-----libs-begin-----
loadLib("libs/laya.core.js")
loadLib("libs/laya.webgl.js")
loadLib("libs/laya.filter.js")
loadLib("libs/laya.particle.js")
loadLib("libs/laya.ui.js")
loadLib("libs/laya.d3.js")
loadLib("libs/laya.d3Plugin.js")
loadLib("libs/bytebuffer.js")
loadLib("libs/laya.effect.js")

loadLib("libs/CommonFrame/GlobalInit.js")
loadLib("libs/CommonFrame/Bilog.js")
loadLib("libs/CommonFrame/BiStatLog.js")
loadLib("libs/CommonFrame/EncodeDecode.js")
loadLib("libs/CommonFrame/EventType.js")
loadLib("libs/CommonFrame/HttpUtil.js")
loadLib("libs/CommonFrame/NotificationCenter.js")
loadLib("libs/CommonFrame/PropagateInterface.js")
loadLib("libs/CommonFrame/ShareInterface.js")
loadLib("libs/CommonFrame/TCPClient.js")
loadLib("libs/CommonFrame/Timer.js")
loadLib("libs/CommonFrame/TuyooSDK.js")
loadLib("libs/CommonFrame/Util.js")

//-----libs-end-------

loadLib("js/bundle.js")


