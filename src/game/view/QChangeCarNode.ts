import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QDebug from "../../framework/QDebug";
import QUIMgr from "../core/QUIMgr";
import QWxSDK from "../core/QWxSDK";
import QUtil from "../../framework/QUtil";
export default class QChangeCarNode extends Laya.Image{
    
    constructor() {
        super();
        this.registerEvent();
    }
    public registerEvent():void
    {
        // 监听 抬起 
        QEventMgr.instance.register(QEventType.MAIN_VIEW_TOUCH_UP, this.onMouseUp, this);
        
        let isAuditVersion = QWxSDK.instance.isAuditVersion();
        if (!isAuditVersion) {
            this.on(Laya.Event.CLICK, this, this.onBtnClick);
        }
    }
    public unregisterEvent():void
    {
        let isAuditVersion = QWxSDK.instance.isAuditVersion();
        if (!isAuditVersion) {
            this.off(Laya.Event.CLICK, this, this.onBtnClick);
        }
        QEventMgr.instance.unregister(QEventType.MAIN_VIEW_TOUCH_UP, this.onMouseUp, this);
    }
    public destroy() : void
    {
        this.unregisterEvent();
        Laya.timer.clearAll(this);
    }

    onMouseUp(param:any):void
    {
        if (this.onJudge(param) == true){
            QDebug.D("选择车辆-----------------------------");
            QEventMgr.instance.sendEvent(QEventType.MAIN_VIEW_CAR_SELECT_CAR);
        }
    }
    public onJudge(param):any 
    {
        if(QUtil.isNullOrEmpty(param)){
            return false;
        }
        var pos:any = (this.parent as Laya.Sprite).localToGlobal(new Laya.Point(this.x, this.y));
        if (param.stageX > pos.x - this.width/2  && param.stageX < pos.x + this.width/2) {
            if (param.stageY > pos.y - this.height/2  && param.stageY < pos.y + this.height/2) {
                return true;
            }
        }
        return false;
    }

    public onBtnClick() {
        // QUIMgr.instance.createUI(QUIMgr.UI_SelectView);
    }
}