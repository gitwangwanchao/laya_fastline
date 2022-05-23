import QBaseUI from "../core/QBaseUI";
import { ui } from "../../ui/layaMaxUI";
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QGameData from "../data/QGameData";
import QUIMgr from "../core/QUIMgr";
import QGameConst from "../data/QGameConst";
import QMergeData from "../data/QMergeData";

const tipStrArr = [
    "点击进入游戏",
    "点击回主界面",
    "点击快速购买新车",
    "拖动合成高级车",
    "再次进入游戏",
    "点击升级强化武器"
]

const stepOffSet = {
    "1":{
        offset_x: 0,
        offset_y: 0,
        offset_w: 0,
        offset_h: 0,
    },
    "2":{
        offset_x: 0,
        offset_y: -10,
        offset_w: 0,
        offset_h: 0,
    },
    "3":{
        offset_x: 0,
        offset_y: 0,
        offset_w: 0,
        offset_h: 0,
    },
    "4":{
        offset_x: 5,
        offset_y: -30,
        offset_w: 30,
        offset_h: 30,
    },
    "5":{
        offset_x: 0,
        offset_y: 0,
        offset_w: 0,
        offset_h: 0,
    },
    "6":{
        offset_x: 0,
        offset_y: 0,
        offset_w: 0,
        offset_h: 0,
    },
}

namespace game.view{
    
    import Sprite = Laya.Sprite;
	import HitArea = Laya.HitArea;
    
    export class QGameGuide extends QBaseUI{
        public scene : ui.view.NewPlayerGuideUI;

        private maskArea:Laya.Sprite;
        private tipContainer:Sprite;
		private hitArea:HitArea;
        private interactionArea:Sprite;

        private handPos: {x: 0,y: 0};
        private step   : any;
        private guideData: any;
        private stepIdx:number = 1;
        private ui_step:number = 0;
        //1 软引导 2 强制引导
        private guideType: number = 1;

        public softHand: Sprite;
       
        private refreshWorldPos: boolean = false;
        private guideBtnImg:any;

        public registerEvent():void
        {
            QEventMgr.instance.register(QEventType.GAME_GUIDE_CTRL,this.nextStep, this);
        }
        public unregisterEvent():void
        {
            QEventMgr.instance.unregister(QEventType.GAME_GUIDE_CTRL,this.nextStep, this);
        }
        
        public init(){
            this.scene = new ui.view.NewPlayerGuideUI();
            this.scene.handF_1.visible = false;
            this.scene.hand_2.visible = false;
            this.scene.guide_tip.visible = false;
            this.scene.zOrder = 5;
            this.scene.updateZOrder();
        }

        //创建软引导 (软引导不根据当前步数引导 根据数组内数据进行下一步)
        public createSoftGuide (param) {
            this.guideType = 1;
            this.scene.mouseEnabled = false;
            this.scene.mouseThrough = true;
            this.guideData = param;
            this.closeGuide();
            if(param.hand){
                this.softHand = param.hand;
                let pos_1 = {x:param.nArr[0].x,y:param.nArr[0].y};
                let pos_2 = {x:param.nArr[1].x,y:param.nArr[1].y};
                pos_1.x   = pos_1.x + param.nArr[0].width / 2;
                pos_2.x   = pos_2.x + param.nArr[1].width / 2;
                pos_1.y   = pos_1.y + param.nArr[0].height / 2;
                pos_2.y   = pos_2.y + param.nArr[1].height / 2;
                //从 1 到 2
                let time = Math.sqrt(Math.pow(pos_1.x - pos_2.x,2) + Math.pow(pos_2.y - pos_1.y,2)) / 200;
                let ani_2 = ()=>{
                    this.softHand.x = pos_2.x;
                    this.softHand.y = pos_2.y;
                    Laya.Tween.to(this.softHand,{x: pos_1.x,y: pos_1.y},time * 1000,null,Laya.Handler.create(this,()=>{
                        ani_2();
                    }))
                };
                ani_2();
                QGameData.instance.isHandGuideFix = true;
                this.softHand.visible = true;
            }
        }

        //创建强制引导
        public createForcedGuide (param,stepIdx){
            this.stepIdx       = stepIdx;
            this.guideData     = param;
            this.refreshWorldPos = param.refreshWorldPos || false;
            this.guideType     = 2;
            //当前执行到第几步
            this.ui_step = this.stepNumber(param.perform);
            if(this.ui_step>=0 && this.checkGuideProcess()){
                // this.scene.cacheAs = "bitmap";
                //绘制遮罩区，含透明度，可见游戏背景
                // this.maskArea = new Laya.Sprite();
                // this.maskArea.alpha = 0.75;
                // this.maskArea.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");
                // this.scene.addChild(this.maskArea);

                this.hitArea = new HitArea();
                this.hitArea.hit.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");
                
                this.scene.hitArea = this.hitArea;
                this.scene.mouseEnabled = true;
                let info     = this.calculateRectSize(param.nArr,param.key);
                this.handPos = info.handPos;
                this.step    = info.step;
                if(info){
                    // this.perfromGuide();
                    this.hitArea.unHit.clear();
                    this.hitArea.unHit.drawRect(this.step.x,this.step.y,this.step.width,this.step.height, "#000000");
                    this.runHandAni(param.key);
                }   
            }
        }

        public stepNumber(perform: Array<any>): any{
            let idx = perform.indexOf(this.stepIdx);
            if(idx >= 0){
                this.closeGuide();
                return idx;
            }
            //不存在步骤 关闭当前界面
            this.unregisterEvent();
            QUIMgr.instance.removeUI(QUIMgr.UI_GameGuideView);
            return -1;
        }

        //执行新手引导
        public perfromGuide(){
            let step = this.step;
            if(this.stepIdx!=QGameConst.NumForGuide.enterGame&&this.stepIdx!=QGameConst.NumForGuide.enterGameAgain&&this.stepIdx!=QGameConst.NumForGuide.weaponUpdate){
                this.scene.cacheAs = "bitmap";
                //绘制一个fang形区域，利用叠加模式，从遮罩区域抠出可交互区
                this.interactionArea = new Sprite();
                this.interactionArea.blendMode = "destination-out";
                this.interactionArea.graphics.clear();
                this.interactionArea.graphics.drawRect(step.x,step.y,step.width,step.height, "#000000");
                // this.interactionArea.pivotY    = step.height;
                this.scene.addChild(this.interactionArea);   
                if (this.stepIdx == QGameConst.NumForGuide.buyCar) {
                    this.scene.click_img.blendMode = "";
                }else {
                    this.scene.click_img.blendMode = "lighter";
                }
            }else if(this.stepIdx==QGameConst.NumForGuide.weaponUpdate){
                this.scene.cacheAs = "none";
                if(this.guideBtnImg){
                    this.guideBtnImg.skin = "ui_main/main_btn_shengji.png";
                }else{
                    this.guideBtnImg = new Laya.Image("ui_main/main_btn_shengji.png");
                    this.scene.addChild(this.guideBtnImg);
                }
                var redpoint = new Laya.Image("ui_main/main_notice_point.png");
                this.guideBtnImg.addChild(redpoint);
                redpoint.x = 77;
                redpoint.y = 2;
                
                this.guideBtnImg.scaleX = 1.2;
                this.guideBtnImg.scaleY = 1.2;
                this.guideBtnImg.x = step.x;
                this.guideBtnImg.y = step.y;
            }else{
                this.scene.cacheAs = "none";
                if(this.guideBtnImg){
                    this.guideBtnImg.skin = "ui_main/main_startGame.png";
                    this.guideBtnImg.removeChild();
                }else{
                    this.guideBtnImg = new Laya.Image("ui_main/main_startGame.png");
                    this.scene.addChild(this.guideBtnImg);
                }
                this.guideBtnImg.scaleX = 1;
                this.guideBtnImg.scaleY = 1;
                this.guideBtnImg.x = step.x;
                this.guideBtnImg.y = step.y;
            }
            this.hitArea.unHit.clear();
            this.hitArea.unHit.drawRect(step.x,step.y,step.width,step.height, "#000000");
        }

        //执行小手点击 1上下 2左右 
        public runHandAni(key){
            
            switch (key[this.ui_step]) {
                case 1:
                    if(this.stepIdx==2){
                        this.scene.handF_1.x = this.handPos.x;
                        if(this.guideData.handRotate == "down")
                        {
                            this.scene.handF_1.rotation = 180;
                            this.scene.handF_1.y = this.step.height + this.handPos.y;
                        }
                        else if (this.guideData.handRotate == "up")
                        {
                            this.scene.handF_1.rotation = 0;
                            this.scene.handF_1.y = this.handPos.y;
                        } 
                        this.scene.handF_1.visible  = true;
                    }else{
                        this.scene.new_ani_box.x = this.step.x+this.step.width*0.5;
                        this.scene.new_ani_box.y = this.step.y+this.step.height*0.5;
                        this.scene.new_ani_box.scaleX = 1.5;
                        this.scene.new_ani_box.scaleY = 1.5;
                        this.scene.new_ani_box.visible = true;
                        this.scene.new_ani_box.zOrder = 5;
                        if(this.stepIdx==QGameConst.NumForGuide.weaponUpdate){
                            // this.scene.new_ani_box.x = this.step.x+this.step.width;
                            // this.scene.new_ani_box.y = this.step.y+this.step.height;
                            this.scene.btn_click_ani.play(0,true);
                        }else{
                            this.scene.btn_click_ani.play(0,true);
                        }
                        this.scene.updateZOrder();
                    }
                break;

                case 2:
                    // if(this.stepIdx==4){
                    //     this.scene.hand_2.skin = 'ui_main/newbie_hand2.png';
                    //     this.scene.hand_2.scaleX = 1;
                    //     this.scene.hand_2.scaleY = 1;
                    // }    
                    this.scene.hand_2.x = this.handPos.x;
                    this.scene.hand_2.y = this.handPos.y;
                    let ani_2 = ()=>{
                        this.scene.hand_2.x = this.handPos.x;
                        Laya.Tween.from(this.scene.hand_2,{x: this.handPos.x-this.step.width*0.8},1000,null,Laya.Handler.create(this,function(){
                            ani_2();
                        }))
                    }
                    ani_2();      
                    this.scene.hand_2.visible = true;
                break;
            }
        }


        public closeGuide(){
            this.scene.removeChild(this.maskArea);
            this.scene.removeChild(this.interactionArea);
            this.scene.handF_1.visible = false;
            this.scene.hand_2.visible = false;
            this.scene.guide_tip.visible = false;
            this.scene.new_ani_box.visible = false;
            this.scene.btn_click_ani.gotoAndStop(0);
            this.scene.btn_click_ani_0.gotoAndStop(0);
        }

        public calculateRectSize(nodeArr: Array<any>, key: number = 0): any {
            if(nodeArr.length && nodeArr[this.ui_step]){
                nodeArr  = nodeArr[this.ui_step];
                QEventMgr.instance.sendEvent(QEventType.FORCE_GUIDE_START,[nodeArr]);//开始强制引导
                let info = {
                    handPos:{
                        x: 0,
                        y: 0,
                    },
                    step:{
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0,
                    }
                }
                let startX = 0;
                let allY = 0;
                let allW = 0;
                let allH = 0;
                for(let i = 0; i < nodeArr.length; i++){
                    let c = this.refreshWorldPos ? this.localToWorld(nodeArr[i]) : (nodeArr[i] as Laya.Sprite).localToGlobal(new Laya.Point(0, 0));
                    startX = i == 0 ? c.x : startX;
                    allY+=c.y;
                    allW+=nodeArr[i].width;
                    allH+=nodeArr[i].height;
                }
                info.step.width = allW + stepOffSet[this.stepIdx].offset_w;
                info.step.height = allH / nodeArr.length + stepOffSet[this.stepIdx].offset_h;
                switch(key[this.ui_step]){
                    case 1:
                        info.step.x = startX + stepOffSet[this.stepIdx].offset_x;
                        info.step.y = allY / nodeArr.length + stepOffSet[this.stepIdx].offset_y;
                        info.handPos.x = info.step.x + (info.step.width*0.5);
                        info.handPos.y = info.step.y;
                        this.scene.lbl_tip.text = tipStrArr[this.stepIdx - 1] + "";
                        if(this.stepIdx==QGameConst.NumForGuide.weaponUpdate){  //武器升级
                            // this.scene.lbl_tip.scaleX = 0.8;
                            // this.scene.lbl_tip.scaleY = 0.8;
                            // console.log("武器引导");
                            // let a =+"2"
                            // let b = 1;
                            // console.log(a);
                            // console.log(b+++ +"1");
                            // console.log(1+ +"1");
                            // console.log(1+ +  +"1");
                            // console.log(typeof( +(1+"1")));
                            // console.log(+"1");
                            // console.log( Number( "1"));
                            // console.log("1");
                            // QEventMgr.instance.sendEvent(QEventType.WEAPON_GUIDE, this.scene.guide_tip.zOrder);
                            this.scene.guide_tip.x = info.handPos.x +100;
                            this.scene.guide_tip.y = info.handPos.y - 280;
                        }else{
                            // this.scene.tip_img.skin = 'subpackages/res/atlas/nopack/guide_tip_'+this.stepIdx+'.png';
                            // this.scene.tip_img.scaleX = 1.1;
                            // this.scene.tip_img.scaleY = 1.1;
                            // this.scene.lbl_tip.scaleX = 1;
                            // this.scene.lbl_tip.scaleY = 1;
                            this.scene.guide_tip.x = info.handPos.x;
                            this.scene.guide_tip.y = info.handPos.y - 280;
                        }
                    break;

                    case 2:   
                        info.step.x = startX + stepOffSet[this.stepIdx].offset_x;
                        info.step.y = allY / nodeArr.length + stepOffSet[this.stepIdx].offset_y;
                        info.handPos.x = info.step.x + info.step.width;
                        info.handPos.y = info.step.y + 10 + info.step.height;
                        this.scene.lbl_tip.text = tipStrArr[this.stepIdx - 1] + "";
                        // this.scene.lbl_tip.scaleX = 1;
                        // this.scene.lbl_tip.scaleY = 1;
                        // this.scene.tip_img.skin = 'subpackages/res/atlas/nopack/guide_tip_'+this.stepIdx+'.png';
                        // this.scene.tip_img.scaleX = 1.1;
                        // this.scene.tip_img.scaleY = 1.1;
                        this.scene.guide_tip.x = info.handPos.x;
                        this.scene.guide_tip.y = info.handPos.y + 200;
                    break;
                }
                this.scene.guide_tip.visible = true;
                return info; 
            }
            return null;
        }

        // 强制/非强制引导
        public nextStep(){
            if(this.guideType == 1)
            {
                if( this.softHand)
                {
                    Laya.Tween.clearTween(this.softHand);
                    this.softHand.visible = false;
                    QGameData.instance.isHandGuideFix = false;
                }
                this.unregisterEvent();
                QUIMgr.instance.removeUI(QUIMgr.UI_GameGuideView);
            }
            else if(this.guideType == 2)
            {
                QGameData.instance.newPlayerGudieStep(this.stepIdx);
                this.createForcedGuide(this.guideData,this.stepIdx + 1);
            }
        }

        public checkGuideProcess(){
            switch(this.stepIdx)
            {
                case QGameConst.NumForGuide.synthetic:
                    let CarSlotData = QMergeData.instance.getCarSlotData();
                    if(!CarSlotData["0"] || !CarSlotData["1"] || CarSlotData["0"].level != CarSlotData["1"].level)
                    {
                        QGameData.instance.newPlayerGudieStep(QGameConst.NumForGuide.allStep);
                        this.closeGuide();
                        return false;
                    }
                break;

            }
            return true;
        }

        //已做适配需要手动计算世界坐标
        public localToWorld(_n){
            return {
                x: _n.x - _n.width / 2,
                y: _n.y,
            }
        }

    }
}
export default game.view.QGameGuide;