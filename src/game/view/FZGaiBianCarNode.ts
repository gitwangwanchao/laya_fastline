import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZDebug from "../../framework/FZDebug";
import FZUIManager from "../core/FZUIManager";
import FZWechat from "../core/FZWechat";
import FZUtils from "../../framework/FZUtils";
export default class FZGaiBianCarNode extends Laya.Image{
    
    constructor() {
        super();
        this.registerEvent();
    }
    public registerEvent():void
    {
        // 监听 抬起 
        FZEventManager.instance.register(FZEvent.MAIN_VIEW_TOUCH_UP, this.onMouseUp, this);
        
        let isAuditVersion = FZWechat.instance.isAuditVersion();
        if (!isAuditVersion) {
            this.on(Laya.Event.CLICK, this, this.onBtnClick);
        }
    }
    public unregisterEvent():void
    {
        let isAuditVersion = FZWechat.instance.isAuditVersion();
        if (!isAuditVersion) {
            this.off(Laya.Event.CLICK, this, this.onBtnClick);
        }
        FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_TOUCH_UP, this.onMouseUp, this);
    }
    public destroy() : void
    {
        this.unregisterEvent();
        Laya.timer.clearAll(this);
    }

    onMouseUp(param:any):void
    {
        if (this.onJudge(param) == true){
            FZDebug.D("选择车辆-----------------------------");
            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_CAR_SELECT_CAR);
        }
    }
    public onJudge(param):any 
    {
        if(FZUtils.isNullOrEmpty(param)){
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
        // FZUIManager.instance.createUI(FZUIManager.UI_SelectView);
    }
}