
import QBaseUI from "../core/QBaseUI";
import QSoundMgr from "../core/QSoundMgr";
import QUIMgr from "../core/QUIMgr";
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QShareParam from "../logic/QShareParam";
import QWxSDK from "../core/QWxSDK";
import QGameConst from "../data/QGameConst";
import { ui } from "../../ui/layaMaxUI";
import QGameData from "../data/QGameData";
import QUtil from "../../framework/QUtil";
import QDebug from "../../framework/QDebug";
import QJcdlTypeView from "../../game/view/QJcdlTypeView";

namespace game.view
{
    export class QGameResurrectView extends QBaseUI
    {
        public scene: ui.view.GameResurrectViewUI ;
        public VideoTime :any = 3;
        private freeResurrect:boolean = false;
        private nowCheckPoint:number;
        public init():void
        {
            this.scene = new ui.view.GameResurrectViewUI();
            //侧面交叉导流
            this.setStateToJCDL();
            if(QUIMgr.instance.longScreen()){
                this.scene.box_resurrect.y += 70
                if(QGameData.instance.getCheckPoint() < 3){
                    this.scene.box_resurrect.y += 140;
                }
            }
            this.nowCheckPoint = QGameData.instance.getCheckPoint()
            this.VideoTime = 3;
            this.onVideoTime();
            if(this.nowCheckPoint>2){
                Laya.timer.loop(1000, this, this.onVideoTime)
            }else{
                this.scene.label_time.visible = false;
                this.freeResurrect = true;
            }
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_resurrect, this, this.startResurrect,[]);
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_free, this, this.shareCallBack,[]);
            // this.scene.btn_cancel.visible = false;
            // QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btn_cancel, this, this.onClose,[]);  
            QUtil.doUIPopAnim(this.scene.box_resurrect);
        }
        public setParam(param){
            this.scene.btn_resurrect.visible = false;
            this.scene.btn_free.visible = false;
            let stepIdx  = QGameData.instance.newPlayerGudieStep(null);
            if(stepIdx   == 1||this.freeResurrect){
                this.scene.btn_free.visible = true;
                this.scene.btn_free.y -= 150;
            }else{
                this.scene.btn_resurrect.visible = true;
                var isShare = QGameData.instance.getShareOrVideo();
                this.scene.img_share.skin = isShare ?  "ui_common/free_share_icon.png" : "ui_main/com_icon_0.png";
            }
            if(QGameData.instance.getCheckPoint() > 2){
                this.scene.permanent1.visible = true;
                this.scene.btnSingleJcdlIcon.visible = true;
                QJcdlTypeView.instance.create({type : 0 });  //添加底部交叉导流
                //右侧交叉导流
                this.createResidentRoll();
                this.createRollBanner();
            }else{
                this.scene.permanent1.visible = false;
                this.scene.btnSingleJcdlIcon.visible = false;
            }
        }
        /**
         * 复活界面倒计时
         */
        public onVideoTime(){
            if (this.VideoTime == -1) {
                Laya.timer.clear(this, this.onVideoTime);
                this.onClose();
                // 失败界面
                return;
            }
            if(this.scene&&this.scene.label_time){
                this.scene.label_time.text = this.VideoTime + "";
            }
            this.VideoTime -= 1;
        }

        
        /**
         * 复活按钮
         */
        public startResurrect() {
            Laya.timer.clear(this, this.onVideoTime);
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.touch);
            let param = QShareParam.create();
            param.shareType = QGameConst.QShareType.Revive;
            var isShare = QGameData.instance.getShareOrVideo();
            var self = this;
            if(isShare == true) {
                QWxSDK.instance.fakeShare(param, this, function(self : any){
                    self.shareCallBack();
                }, [this], function() {
                    if(self) {
                        QEventMgr.instance.register(QEventType.SHARE_FAIL_CALLBACK,self.shareFailCallBack,self)
                        // // 分享失败
                        // Laya.timer.loop(1000, self, self.onVideoTime);
                    }
                })
            }else {
                QWxSDK.instance.playVideoAd(param, Laya.Handler.create(this, function(){
                    this.shareCallBack();
                }), Laya.Handler.create(this, function(value){
                    if(Laya.Browser.onMiniGame&&value == 1){
                        QWxSDK.instance.fakeShare(param, this, function(self : any){
                            self.shareCallBack();
                        }, [this], function() {
                            if(self) {
                                QEventMgr.instance.register(QEventType.SHARE_FAIL_CALLBACK,self.shareFailCallBack,self)
                                // // 分享失败
                                // Laya.timer.loop(1000, self, self.onVideoTime);
                            }
                        })
                    }else if (value == 0) {
                        QUIMgr.instance.createUI(QUIMgr.UI_Tip, {text : "视频播放失败"});
                        // 视频取消
                        Laya.timer.loop(1000, self, self.onVideoTime);
                    }
                }));
            }
        }

        public shareFailCallBack(){
            // 分享失败
            QEventMgr.instance.unregister(QEventType.SHARE_FAIL_CALLBACK,this.shareFailCallBack,this)
            Laya.timer.loop(1000, this, this.onVideoTime);
        }
        public onClose(){
            Laya.timer.clearAll(this);
            QUIMgr.instance.removeUI(QUIMgr.UI_GameResurrectView);
            QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_RESURRECT_FAIL);
        }

        public shareCallBack(){
            QJcdlTypeView.instance.remove();
            Laya.timer.clearAll(this);
            QUIMgr.instance.createUI(QUIMgr.UI_Tip,{text: "复活成功"});
            QEventMgr.instance.sendEvent(QEventType.GAME_VIEW_GAME_RESURRECT_START)
            QUIMgr.instance.removeUI(QUIMgr.UI_GameResurrectView);
            let gq = Number(QGameData.instance.getCheckPoint());
            tywx.BiLog.clickStat(tywx.clickStatEventType.successRevive,[gq]);
            QGameData.instance.game_revive_times++;
        }

        
        public jcdlListData: any = null;  // 交叉导流 列表 
        public iconTimestamp : number;  // 交叉导流(使用的随机数)
        public jdclSingleIndex : number = 0; // 交叉导流循环 坐标
        public jdclSingleIndex_down : number = 1; //  第二个 交叉导流循环 坐标  （ 默认从第二位开始 )
        public jdclList_middle : number = 4; // 记录交叉导流列表中间值

        // 设置 交叉导流读取的信息
        setStateToJCDL(){
            // this.scene.btnSingleJcdlIcon.visible = false; // 起始不显示 滚动导流
            QJcdlTypeView.instance.remove();
            this.jcdlListData = QGameData.instance.getJcdlDataList();  // 获取交叉导流的数值信息
            this.iconTimestamp = Math.sqrt(Math.random());

            this.jdclList_middle =  Math.floor( this.jcdlListData.length / 2 );  // 获取配置 中间值
            this.jdclSingleIndex =  this.jdclList_middle;

        }

        // 【常驻“滚动导流】 - 创建 常驻滚动导流
        private createResidentRoll() : void {
            // this.scene.jcdlRollShake_down.play(0,true);
            this.JcdlResidentSingleInfo();
            Laya.timer.loop(4000,this,this.JcdlResidentSingleInfo);
        }

        //  停止 常驻滚动导流 
        private stopResidentRollBanner() : void {
            // this.scene.jcdlRollShake_down.stop();
            this.scene.permanent1.rotation = 0;
            Laya.timer.clear(this,this.JcdlResidentSingleInfo);
         }

        // 常驻滚动导流 - 底部    ( 循环 前半部分 )
        private JcdlResidentSingleInfo() : void {
            try{
                if( ! this.jcdlListData || !this.jcdlListData[this.jdclSingleIndex_down] ){
                    return;
                }
                this.scene.permanent1.on(Laya.Event.CLICK,this,this.onClickBtnJcdlIconByMain,[this.jdclSingleIndex_down]);
                this.scene.imgSingleJcdlIcon1.skin = this.jcdlListData[this.jdclSingleIndex_down].icon_url[0]+ "?v=" + this.iconTimestamp;
                this.scene.lblSingleJcdlName1.text = this.jcdlListData[this.jdclSingleIndex_down].gameName;
                this.jdclSingleIndex_down++;
                if(this.jdclSingleIndex_down == this.jdclList_middle)
                {
                    this.jdclSingleIndex_down = 1;
                }
            } catch(e){

            }
        }

        //【空投箱 “滚动" 导流】 - 创建 滚动导流
        private createRollBanner() : void {
            // this.scene.btnSingleJcdlIcon.visible = true;
            // this.scene.jcdlRollShake.play(0,true);
            this.JcdlSingleInfo();
            Laya.timer.loop(4000,this,this.JcdlSingleInfo);
        }

        //  停止 滚动导流
        private stopRollBanner() : void {
            // this.scene.jcdlRollShake.stop();
            this.scene.btnSingleJcdlIcon.rotation = 0;
            Laya.timer.clear(this,this.JcdlSingleInfo);
            // this.scene.btnSingleJcdlIcon.visible = false;
        }

        // 执行 交叉导流信息循环   ( 循环 后半部分 )
        private JcdlSingleInfo():void
        {
            try{
                if( ! this.jcdlListData || !this.jcdlListData[this.jdclSingleIndex] ){
                    return;
                }
                this.scene.btnSingleJcdlIcon.on(Laya.Event.CLICK,this,this.onClickBtnJcdlIconByMain,[this.jdclSingleIndex]);
                this.scene.imgSingleJcdlIcon.skin = this.jcdlListData[this.jdclSingleIndex].icon_url[0]+ "?v=" + this.iconTimestamp;
                // this.scene.btnSingleJcdlIcon.visible = true;
                this.scene.lblSingleJcdlName.text = this.jcdlListData[this.jdclSingleIndex].gameName;
                this.jdclSingleIndex++;
                if(this.jdclSingleIndex == this.jcdlListData.length)
                {
                    this.jdclSingleIndex = this.jdclList_middle;  //  回到中间值
                }
            } catch(e){
                
            }
        }
        
        // 交叉导流 按下执行事件
        private onClickBtnJcdlIconByMain(iconIndex : number):void
        {
            let toappid =  this.jcdlListData[iconIndex]["toappid"];
            QWxSDK.instance.clickAdIcon(toappid);
        }
    }
    
    
}
export default game.view.QGameResurrectView;