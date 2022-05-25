import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZDebug from "../../framework/FZDebug";
import FZSoundManager from "../core/FZSoundManager";
import FZFlyResConfig from "../view/FZFlyResConfig";
import FZGameData from "../data/FZGameData";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZUtils from "../../framework/FZUtils";

export default class FZDestoryCarNode extends Laya.Image{
    
    private delCarEffect: Laya.Animation;
    private time: any = 500;
    
    constructor() {
        super();
        this.registerEvent();
       
        this.delCarEffect = new Laya.Animation();
        this.delCarEffect.loadAnimation("particle/lajitong.ani");
        this.addChild(this.delCarEffect);
        this.delCarEffect.x = 45;
        this.delCarEffect.y = 50;
        this.delCarEffect.scale(2,2);
    }
    public registerEvent():void
    {
        // 选中车辆
        FZEventManager.instance.register(FZEvent.MAIN_VIEW_TOUCH_SELECTED, this.onCleanState, this);
        // 监听 抬起 
        FZEventManager.instance.register(FZEvent.MAIN_VIEW_TOUCH_UP, this.onMouseUp, this);
        // 车辆销毁
        FZEventManager.instance.register(FZEvent.CAR_SELL_PRICE, this.onTips, this);
        // 垃圾桶变化
        FZEventManager.instance.register(FZEvent.IN_CLEAN, this.changeCleanNode, this);
        FZEventManager.instance.register(FZEvent.OUT_CLEAN, this.changeCleanNode, this);
    }
    public unregisterEvent():void
    {
        FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_TOUCH_UP, this.onMouseUp, this);
        FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_TOUCH_SELECTED, this.onCleanState, this);
        FZEventManager.instance.unregister(FZEvent.CAR_SELL_PRICE, this.onTips, this);
        FZEventManager.instance.unregister(FZEvent.IN_CLEAN, this.changeCleanNode, this);
        FZEventManager.instance.register(FZEvent.OUT_CLEAN, this.changeCleanNode, this);
    }
    public destroy() : void
    {
        this.unregisterEvent();
        Laya.timer.clearAll(this);
    }

    /**
     * 显示回收车辆获得的金币
     * @param carPrice 车辆的价格
     */
    public onTips(carPrice: any):void 
    {
        var gold = carPrice;
        var addGold = this.getChildByName("label_add_gold") as Laya.Text;
        addGold.text = "+$" + FZUtils.formatNumberStr(gold + "");

        addGold.visible = true;
        Laya.Tween.to(addGold, {y : -15}, this.time, Laya.Ease.backOut, Laya.Handler.create(this, function(){
            addGold.visible = false;
            addGold.y = 60;
        }),0, true,true);
    }

    /**
     * 鼠标移进、移出垃圾桶时，垃圾桶出现变化
     */
    public changeCleanNode(flag){
        var clean = this.getChildByName("img_clean_0").getChildByName("img_clean_1") as Laya.Image;
        if(flag){
            clean.alpha = 1;
            clean.scaleX = 1.3;
            clean.scaleY = 1.3;
            if(FZGameData.instance.delCarGuideState == "InGuide" || FZGameData.instance.deleteCarGuide != "Close"){
                FZEventManager.instance.sendEvent(FZEvent.DELETE_CAR_TRASH_STATE , "IN");
            }
        }else{
            clean.alpha = 0.7;
            clean.scaleX = 1;
            clean.scaleY = 1;
            if(FZGameData.instance.delCarGuideState == "InGuide" || FZGameData.instance.deleteCarGuide != "Close"){
                FZEventManager.instance.sendEvent(FZEvent.DELETE_CAR_TRASH_STATE , "OUT");
            }
        } 
    }

    onMouseUp(param:any):void
    {
        if(FZMergeDateManager.instance.getCarMaxLevel() <= 7 && FZMergeDateManager.instance.getIsFirstRecycleCarState() == 0)
        {
            Laya.timer.once(100, this, function(){
                this.alpha = 1;
                // (this.getChildByName("img_clean_0").getChildByName("img_clean_1") as Laya.Image).skin = "ui_main/main_btn_trash2.png"
                this.scaleX = 1;
                this.scaleY = 1;
            })
        }

        if (this.onJudge(param) == true){
            FZDebug.D("出售----------------------0 ");
            
            // 出售
            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_CAR_SELL);
            this.delCarEffect.play(0, false);
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.buy_car);
            this.changeCleanNode(false);
            if(FZGameData.instance.delCarGuideState == "InGuide" || FZGameData.instance.deleteCarGuide != "Close"){
                FZEventManager.instance.sendEvent(FZEvent.DELETE_CAR_TRASH_STATE , "SELL");
            }
            // FZGameData.instance.playResFlyAni(this,null,{type: 1,countType: 0},null);//播放飘金币的动画
            tywx.BiLog.clickStat(tywx.clickStatEventType.successSellCar,[]);
            
            FZMergeDateManager.instance.setIsFirstRecycleCarState(1);
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

    public onCleanState():void 
    {
        if(FZMergeDateManager.instance.getCarMaxLevel() <= 7 && FZMergeDateManager.instance.getIsFirstRecycleCarState() == 0)
        {
            this.alpha = 1;
            // (this.getChildByName("img_clean_0").getChildByName("img_clean_1") as Laya.Image).skin = "ui_main/main_btn_trash2.png"
            this.scaleX = 1.1;
            this.scaleY = 1.1;
        }
    }
}