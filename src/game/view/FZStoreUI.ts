import { ui } from "../../ui/layaMaxUI";
import FZBaseUI from "../core/FZBaseUI";
import FZUIManager from "../core/FZUIManager";
import FZCfgManager from "../core/FZCfgManager";
import FZGameStatus from "../data/FZGameStatus";
import FZDebug from "../../framework/FZDebug";
import FZGameData from "../data/FZGameData";
import FZEventManager from "../../framework/FZEventManager";
import FZEvent from "../data/FZEvent";
import FZUtils from "../../framework/FZUtils";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZSaveDateManager from "../data/FZSaveDateManager";
import FZSoundManager from "../core/FZSoundManager";
import FZShareInfo from "../logic/FZShareInfo";
import FZWechat from "../core/FZWechat";
import FZSceneManager from "../core/FZSceneManager";


namespace game.view
{
    export class FZStoreUI extends FZBaseUI
    {
        public scene : ui.view.ShopDialogUI;

        private carConfig:any;

        private propIconPath : string = "ui_car/";
        private propIconType : string = ".png";

        private blackFilter:any;
        private restoreColor:any;

        private diamondIconStr : string = "ui_common/flyDiamond.png"
        private coinIconStr : string = "ui_common/flyCoin.png"
        private videoIconStr : string = "ui_main/com_icon_0.png"
        private shareIconStr : string = "ui_main/free_share_icon.png"
        private defaultStr:string = "ui_common/flyDiamond.png"

        private propSaleIconStr:string = "ui_main/icon_dazhe.png";
        private propSpeedIconStr:string = "ui_main/icon_jiasu.png";

        private listCarData:Array<any> = new Array<any>();
        private listItemData:Array<any> = new Array<any>();
        private curMaxLevel :number = 1;//当前合成最大等级（TODO）
        private curUnlockLevel = 0;//当前解锁最大的等级（TODO）
        private showCoin:number = 2;//显示金币或者砖石的界线
        
        private unLockDiamondLevel: number = -1;
        private bonusCar_level:number = -1;
        private unLockCoinLevel: number = -1;

        private unlockMaxCarLevel: number = 1;

        public isBuyCar = false;  //判断是否是在买车，控制弹窗的缩放动画
        // public isBuyCar = true;  //去掉动画
        public delayTime = 0;  //弹窗的缩放动画延迟时间
        public ctr = 0;  //控制跳过list的逆序绘制


        public registerEvent() : void
        {
            // 刷新价格
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_CHANGE_PRICE,this.onChangePrice, this);
            // 刷新价格
            FZEventManager.instance.register(FZEvent.FREE_GET_GOLD,this.onChangePrice, this);
            // 监听刷新金币
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_GAME_GOLD,this.onUpdateGameGold, this);
            // 刷新钻石
            FZEventManager.instance.register(FZEvent.MAIN_VIEW_UPDATE_DIAMOND,this.onUpdareDiamond, this);
        }

        public unregisterEvent() : void   
        {
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_CHANGE_PRICE,this.onChangePrice, this);
            FZEventManager.instance.unregister(FZEvent.FREE_GET_GOLD,this.onChangePrice, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_GAME_GOLD,this.onUpdateGameGold, this);
            FZEventManager.instance.unregister(FZEvent.MAIN_VIEW_UPDATE_DIAMOND,this.onUpdareDiamond, this);
        }

        // 更改价格
        public onChangePrice():void
        {
            this.scene.listCar.refresh();
        }
        /**
         * 刷新金币
         */
        onUpdateGameGold():void 
        {
            var str =  FZUtils.formatNumberStr(FZMergeDateManager.instance.getGameGold()); 
            this.scene.lab_game_gold.text = str;
        }
        /**
         * 刷新钻石
         */
        private onUpdareDiamond():void
        {
            var count = FZMergeDateManager.instance.getGameDiamond();
            this.scene.lab_game_diamond.text = FZUtils.formatNumberStr(count+"");
        }
        public init():void
        {
            this.scene = new ui.view.ShopDialogUI();

            // this.scene.ani1.play(0,false);  //弹窗出现的缓动动画
            this.createFilter();
            this.onUpdateGameGold();
            this.onUpdareDiamond();
            if (FZUIManager.instance.longScreen()) {
                Laya.timer.once(20, this, () => {
                    this.scene.box_title.y += 70;
                });
            }
            Laya.timer.once(100, this, function(){  //错开动画和数据加载，避免在播放弹窗动画的时候出现卡顿
                this.carConfig = FZCfgManager.instance.getRoadsideCarList();
                this.scene.bg.visible = true;
                FZUtils.doUIPopAnim(this.scene.AnchorCenter);  //去掉弹窗出现的放大动画
                
                this.curMaxLevel = FZMergeDateManager.instance.getCarMaxLevel();
    
                //要用滚动列表，参数需要是数组，所以这里json转成数组，且需要in这种得到key的形式。
                for(let key in this.carConfig)
                {
                    this.carConfig[key].pos = key
                    this.listCarData.push(this.carConfig[key])
                    if (this.carConfig[key].level == this.curMaxLevel) {
                        this.unLockDiamondLevel = this.carConfig[key]["unlock_buy_diamond_level"];
                        this.bonusCar_level = this.carConfig[key]["bonusCar_level"];
                        this.unLockCoinLevel = this.carConfig[key]["unlock_buy_gold_level"];
                    }
                }
    
                this.unlockMaxCarLevel = (this.unLockDiamondLevel == -1) ? this.unLockCoinLevel : this.unLockDiamondLevel;
                let toIndex = Math.max(this.unlockMaxCarLevel-1-3, 0);
               
                this.scene.btnClose.on(Laya.Event.CLICK,this,this.onClickBtnClose);
                
                // 道具排序
                /*this.ItemSort();    
                this.scene.listItem.visible = false;
                this.scene.listItem.vScrollBarSkin = "";
                this.scene.listItem.renderHandler = new Laya.Handler(this,this.listShopPropHandle);
                this.scene.listItem.array = this.listItemData;*/
    
                // var tab = this.scene.btn_tab as Laya.Tab;
                // this.onSelect(tab.selectedIndex,1);
                // tab.selectHandler = new Laya.Handler(this, this.onSelect);
    
                Laya.timer.once(100,this, function(){
                    //场景需要注意var有相应名字的才能取到
                    this.scene.listCar.vScrollBarSkin = "";
                    this.scene.listCar.array = this.listCarData;
                    this.scene.listCar.tweenTo(toIndex, 0.1);
                    this.scene.listCar.renderHandler = new Laya.Handler(this,this.listShopCarHandle);
                })
                Laya.timer.once(300, this, function(){
                    this.isBuyCar = true;  //控制动画
                });
            });
        }

        setParam (param) {
            if (param != -1) {
                this.scene.listCar.tweenTo(param, 0.1);
            }
        }

        /**
         * 选择
         * @param index 
         */
        public onSelect(index,f_init):void
        {
            if (index == 0) {
                this.scene.listCar.visible = true;
                this.scene.listItem.visible = false;
            } else if(index == 1) {
                this.scene.listCar.visible = false;
                this.scene.listItem.visible = true;
                FZ.BiLog.clickStat(FZ.clickStatEventType.clickThePrivilegeTAB,[]);
            }
            if(!f_init){
                FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.switch);
            }
        }
        /**
         * 道具 排序
         * 0 开启 有钱
         * 1 开启 没钱
         * 2 未解锁
         * 3 已购买
         */
        private ItemSort(){
            let showNotice = false;
            this.listItemData = [];
            var item_list = [];
            var shopItem = FZCfgManager.instance.getShopItem();
            for(let key in shopItem)
            {
                var state = 2;
                if (FZMergeDateManager.instance.getItemBuyRecord(shopItem[key].id) == true){
                    state = 3;
                } else {
                    if (shopItem[key].unlock == 0) {
                        state = 0;
                    } else if(FZMergeDateManager.instance.getItemBuyRecord(shopItem[key].unlock) == true){
                        state = 0;
                    }

                    if (state == 0) {
                        if (FZUtils.StrJudge(FZMergeDateManager.instance.getGameGold()+"", shopItem[key].price+"") == 0) {
                            state = 1;
                        }
                    }
                }

                if (state == 0) {
                    showNotice = true;
                }

                shopItem[key].state = state;
                this.listItemData.push(shopItem[key]);
            }
            this.listItemData.sort(this.ItemDataSort);
            FZDebug.D("排序后 --------" + JSON.stringify(this.listItemData));

            this.scene.notice_img.visible = showNotice;
        }
        /**
         * 排序函数
         * */
        public ItemDataSort (a, b): number {   //返回一个排序函数
            if (a.state > b.state) {
                return 1;
            } else if( a.state ==  b.state) {
                if (a.type > b.type) {
                    return 1;
                } else if (a.type == b.type) {
                    if (a.level > b.level) {
                        return 1;
                    } else if (a.level <= b.level) {
                        return -1;
                    }
                } else {
                    return -1;
                }
            } else if( a.state < b.state) {
                return -1;
            }
        }
      

        private createFilter():void
        {
            //由 20 个项目（排列成 4 x 5 矩阵）组成的数组，黑色
		    let blackMat = [
			    0, 0, 0, 0, 0, // R
			    0, 0, 0, 0, 0, // G
			    0, 0, 0, 0, 0, // B
			    0, 0, 0, 1, 0  // A
		    ];
            this.blackFilter = new Laya.ColorFilter(blackMat);
            this.restoreColor = new Laya.ColorFilter();
        }

        private listShopCarHandle(item,index):void {
            // list组件绘制是先逆序绘制了一次，这里用于隐藏逆序绘制，防止缩放动画顺序错乱
            if(this.unlockMaxCarLevel - 4 > 0){
                this.ctr++;
            }
            if(this.ctr < this.unLockDiamondLevel - 4){
                this.scene.listCar.visible = false;
                return;
            }else{
                Laya.timer.once(100, this, function(){
                    this.scene.listCar.visible = true;
                });
            }

            let itemCarData = this.listCarData[index];
            let itemCarLevel = itemCarData["level"];
            let itemCarName = itemCarData["name"];
            let itemCarPath = itemCarData["path"];

            let itemCellBg = item.getChildByName("carCellBg");
            let lblLevel = itemCellBg.getChildByName("lblLevel");
            let lblCarName = itemCellBg.getChildByName("lblCarName");
            let imgCarIcon = itemCellBg.getChildByName("imgCarIcon");
            let carSaleTag = itemCellBg.getChildByName("carSaleTag");
            let lblSale = carSaleTag.getChildByName("lblSale");
            let btnBuy = itemCellBg.getChildByName("btnBuy");
            let imgCost = btnBuy.getChildByName("imgCost");
            let lblCost = btnBuy.getChildByName("lblCost");

            //
            let freeBtnBuy = itemCellBg.getChildByName("freeBtnBuy");
            freeBtnBuy.visible = false;
            let carPaylValue = freeBtnBuy.getChildByName("carPaylValue");
            carPaylValue.text = FZUtils.formatNumberStr(FZMergeDateManager.instance.getCarBuyPrice(this.listCarData[index].pos));
            freeBtnBuy.off(Laya.Event.CLICK,this,this.onClickFreeBtnBuy);
            freeBtnBuy.on(Laya.Event.CLICK,this,this.onClickFreeBtnBuy,[index,freeBtnBuy]);
            //
            
            //显示基本信息
            lblLevel.text = itemCarLevel;
            lblCarName.text = itemCarName;
            imgCarIcon.skin = itemCarPath;
            carSaleTag.visible = false;
            
            //判断车的显示
            let itemCarColor = (itemCarLevel <= this.curMaxLevel) ? [this.restoreColor] : [this.blackFilter];
            imgCarIcon.filters = itemCarColor;

            //判断按钮的显示
            let btnState = true;
            let mtype:number = -1;
            let mcost:string = null;
            let hasCion = true;
            //btnBuy.disabled = true;
            btnBuy.gray = false;
            imgCost.scaleY = 0.8;
            imgCost.scaleX = 0.8;
            if (itemCarLevel > this.curMaxLevel) {
                //未解锁
                imgCost.skin = this.defaultStr;
                imgCost.visible = false;
                lblCost.text = "未解锁";
                lblCost.x = 95;
                btnBuy.skin = "ui_main/common_btn_gay.png";
                btnState = false;

                this.delayTime++;
                if(!this.isBuyCar){
                    itemCellBg.scaleX = 0;
                    itemCellBg.scaleY = 0;
                    Laya.timer.once(this.delayTime * 50, this, function(){
                        Laya.Tween.to(itemCellBg, {scaleX:1, scaleY:1},200,Laya.Ease.backOut);
                    });
                }
            } else {
                lblCost.x = 120;
                if (itemCarLevel <= this.unLockCoinLevel) {
                    let time = new Date().getTime();
                    let lastVideoTime = FZSaveDateManager.instance.getItemFromLocalStorage("GAME_LAST_VIDEO_BUY_CAR", "0");
                    if (FZMergeDateManager.instance.hasShopFreeCar && itemCarLevel == this.bonusCar_level && (time - parseInt(lastVideoTime)) > FZMergeDateManager.instance.SHOP_VIDEO_BUY_CAR) {
                        //视频购买
                        imgCost.skin = this.videoIconStr;
                        imgCost.scaleX = 0.6;
                        imgCost.scaleY = 0.6;
                        mtype = FZGameStatus.QMoneyType.Video;
                        mcost = "";
                        //btnBuy.disabled = false;
                        btnBuy.gray = false;

                        this.delayTime++;
                        if(!this.isBuyCar){
                            itemCellBg.scaleX = 0;
                            itemCellBg.scaleY = 0;
                            Laya.timer.once(this.delayTime * 50, this, function(){
                                Laya.Tween.to(itemCellBg, {scaleX:1, scaleY:1},200,Laya.Ease.backOut);
                            });
                        }
                    } else {
                        //金币购买
                        imgCost.skin = this.coinIconStr;
                        mtype = FZGameStatus.QMoneyType.Coin;
                        mcost = FZMergeDateManager.instance.getCarBuyPrice(this.listCarData[index].pos);
                        hasCion = FZUtils.StrJudge(FZMergeDateManager.instance.getGameGold()+"", mcost);
                        //btnBuy.disabled = !hasCion;
                        btnBuy.gray = !hasCion;
                        //判断打折
                        let priceProport = FZMergeDateManager.instance.getGamePriceProport();
                        if (priceProport != 1) {
                            carSaleTag.visible = true;
                            let sale_value = Math.floor((1-priceProport)*100);
                            lblSale.text = "降价"+sale_value+"%";
                        }

                        this.delayTime++;
                        if(!this.isBuyCar){
                            itemCellBg.scaleX = 0;
                            itemCellBg.scaleY = 0;
                            Laya.timer.once(this.delayTime * 50, this, function(){
                                Laya.Tween.to(itemCellBg, {scaleX:1, scaleY:1},200,Laya.Ease.backOut);
                            });
                        }
                    }
                } else if (itemCarLevel <= this.unLockDiamondLevel) {
                    //钻石购买
                    imgCost.skin = this.diamondIconStr;
                    mtype = FZGameStatus.QMoneyType.Diamond;
                    mcost = FZMergeDateManager.instance.getCarBuyPriceDiamond(this.listCarData[index].pos);
                    //btnBuy.disabled = false;
                    btnBuy.gray = false;

                    this.delayTime++;
                    if(!this.isBuyCar){
                        itemCellBg.scaleX = 0;
                        itemCellBg.scaleY = 0;
                        Laya.timer.once(this.delayTime * 50, this, function(){
                            Laya.Tween.to(itemCellBg, {scaleX:1, scaleY:1},200,Laya.Ease.backOut);
                        });
                    }
                } else {
                    //未解锁
                    imgCost.skin = this.defaultStr;
                    imgCost.visible = false;
                    lblCost.text = "未解锁";
                    lblCost.x = 95;
                    btnBuy.skin = "ui_main/common_btn_gay.png";
                    btnState = false;

                    this.delayTime++;
                    if(!this.isBuyCar){
                        itemCellBg.scaleX = 0;
                        itemCellBg.scaleY = 0;
                        Laya.timer.once(this.delayTime * 50, this, function(){
                            Laya.Tween.to(itemCellBg, {scaleX:1, scaleY:1},200,Laya.Ease.backOut);
                        });
                    }
                }
                
                if (mcost != null) {
                    let mcost_str = !mcost ? "免费" : mcost+"";
                    lblCost.text = FZUtils.formatNumberStr(mcost_str);
                    imgCarIcon.filters = [this.restoreColor];
                    lblCost.visible = true;
                    imgCost.visible = true;
                    btnBuy.skin = "ui_common/shop_btn_green.png";
                    if (!mcost){
                        btnBuy.skin = "ui_common/shop_btn_yellow.png";
                    }
                }
            }
            
            btnBuy.off(Laya.Event.CLICK,this,this.onClickBtnBuy);
            btnBuy.on(Laya.Event.CLICK,this,this.onClickBtnBuy,[index,mtype,mcost,btnBuy,btnState]);
        }

        onClickFreeBtnBuy(index:number,btnBuy:any){
            FZUtils.playBtnScaleAni(btnBuy);

            var _index = FZMergeDateManager.instance.JudgeSolt();
            if(_index == -1)
            {
                FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "车位已满，请先合成或回收车辆"})
            }
            else
            {
                this.isBuyCar = true;  //控制动画
                var data :any = {}; 
                    data.level = this.listCarData[index].level;
                    data.state = 0; // 显示宝箱
                    // 增加车辆的购买次数
                    FZMergeDateManager.instance.addBuyCarCount(this.listCarData[index].level, FZGameStatus.QMoneyType.Coin);
                    // 更改车位数据
                    FZMergeDateManager.instance.changeCarSlotData(_index, data);
                    //更新车的位置
                    FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_UP_CAR_INDEX, {"index": _index});
                    this.scene.listCar.refresh();
                    FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "购买成功"})
            }
        }

        private onClickBtnBuy(index:number,mtype:number,mcost:number,btnBuy:any,btnState:boolean):void
        {   
            FZUtils.playBtnScaleAni(btnBuy);
            if (!btnState) {
                //FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "车辆未解锁"})
                return ;
            }
            //车位满
            var _index = FZMergeDateManager.instance.JudgeSolt();
            if(_index == -1){
                FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "车位已满，请先合成或回收车辆"})
            }
            else{
                this.isBuyCar = true;  //控制动画
                if(FZMergeDateManager.instance.coseMoney(mtype,mcost)){
                    if (mtype == FZGameStatus.QMoneyType.Video) {
                        let param = FZShareInfo.create();
                        param.shareType = FZGameStatus.FZShareType.FreeCar;
                         // 视频
                        FZWechat.instance.playVideoAd(param, Laya.Handler.create(this, function(){
                            this.shareCallBack(index, _index);
                        }), Laya.Handler.create(this, function(value){
                            if(Laya.Browser.onMiniGame&&value == 1){
                                FZWechat.instance.fakeShare(param, this, function(self : any){
                                    self.shareCallBack(index, _index);
                                }, [this])
                            } else if (value == 0) {
                                FZUIManager.instance.createUI(FZUIManager.UI_Tip, {text : "视频播放失败"});
                            }
                        }));


                        return;
                    }
                    

                    
                    var data :any = {}; 
                    data.level = this.listCarData[index].level;
                    data.state = 0; // 显示宝箱
                    // 增加车辆的购买次数
                    FZMergeDateManager.instance.addBuyCarCount(this.listCarData[index].level, mtype);
                    // 更改车位数据
                    FZMergeDateManager.instance.changeCarSlotData(_index, data);
                    //更新车的位置
                    FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_UP_CAR_INDEX, {"index": _index});
                    this.scene.listCar.refresh();
                    FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "购买成功"})
                    FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.buy_car);
                    FZ.BiLog.clickStat(FZ.clickStatEventType.diamondPurchaseCar,[]);
                } 
                else{
                    if (mtype == FZGameStatus.QMoneyType.Coin) {
                        FZUIManager.instance.createUI(FZUIManager.UI_FreeGoldGet,FZGameStatus.QCurrencyType.gold);
                    } 
                    else if (mtype == FZGameStatus.QMoneyType.Diamond) {
                        FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "钻石不足"});
                    }
                }
            }
        }

        shareCallBack(item_index: number, solt_index: number) {
            if (this.scene == null) {
                return
            }
            solt_index = FZMergeDateManager.instance.JudgeSolt();
            if(solt_index == -1){
                FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "车位已满，请先合成或回收车辆"})
                return;
            }
            let time = new Date().getTime();
            FZSaveDateManager.instance.setItemToLocalStorage("GAME_LAST_VIDEO_BUY_CAR", time+"");

            var data :any = {}; 
            data.level = this.listCarData[item_index].level;
            data.state = 0; // 显示宝箱
            // 增加车辆的购买次数
            FZMergeDateManager.instance.addBuyCarCount(this.listCarData[item_index].level, FZGameStatus.QMoneyType.Video);
            // 更改车位数据
            FZMergeDateManager.instance.changeCarSlotData(solt_index, data);
            //更新车的位置
            FZEventManager.instance.sendEvent(FZEvent.MAIN_VIEW_TOUCH_UP_CAR_INDEX, {"index": solt_index});
            this.scene.listCar.refresh();

            FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "购买成功"});
            FZ.BiLog.clickStat(FZ.clickStatEventType.shopGetFreeCar,[]);
        }
        
        /**
         * 商店道具
         */
        private listShopPropHandle(item,index):void
        {
            let carCellBg = item.getChildByName("shopCellBg");//感觉虽然再抽一个类比较好，这样比较方便吧
            let img_icon = carCellBg.getChildByName("img_icon");
            let lab_item_prop = img_icon.getChildByName("lab_item_prop") as Laya.Label;
            let lab_item_des = carCellBg.getChildByName("lab_item_des");
            let lab_item_name = carCellBg.getChildByName("lab_item_name");

            let btnBuy = carCellBg.getChildByName("btnBuy") as Laya.Button;
            let lblCost = btnBuy.getChildByName("lblCost") as Laya.Label;
            let img_icon_1 = btnBuy.getChildByName("img_icon_1") as Laya.Image;
            let lab_state = carCellBg.getChildByName("lab_state") as Laya.Label;
            
            var itemdata = this.listItemData[index]
            img_icon.skin = (itemdata.type == 1) ? this.propSpeedIconStr : this.propSaleIconStr;
            lab_item_prop.text = itemdata.value + "%";
            var des = itemdata.desc.replace("{0}", itemdata.value);
            lab_item_des.text = des;
            lab_item_name.text = itemdata.name + "等级" + itemdata.level;
            lblCost.text = FZUtils.formatNumberStr(itemdata.price + "");
            lab_state.visible = false;
            //btnBuy.disabled = true;
            btnBuy.gray = true;
            btnBuy.visible = true;
            img_icon_1.visible = false;
            lblCost.x = 120;

            if (itemdata.state == 0) {
                // 开启 有钱
                //btnBuy.disabled = false;
                btnBuy.gray = false;
                img_icon_1.visible = true;
            } else if (itemdata.state == 1){
                // 开启 没钱
                //btnBuy.disabled = false;
                btnBuy.gray = false;
                img_icon_1.visible = true;
            } else if (itemdata.state == 2){
                // 未解锁
                lblCost.text = "未解锁"; 
                lblCost.x = 95;
            } else if (itemdata.state == 3){
                // 已购买
                btnBuy.visible = false;
                lab_state.visible = true;
                lab_state.text = "已购买";
            }
            
            btnBuy.off(Laya.Event.CLICK,this,this.onClickBtnBuyItem);
            btnBuy.on(Laya.Event.CLICK,this,this.onClickBtnBuyItem,[index,FZGameStatus.QMoneyType.Coin,itemdata.price,btnBuy, itemdata.state]);
        }

        /**
         * 购买道具
         */
        private onClickBtnBuyItem(index:number,mtype:number,mcost:number,btnBuy:any, btnState:number):void
        {
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.touch);
            FZUtils.playBtnScaleAni(btnBuy);
            
            if (btnState == 1) {
                FZUIManager.instance.createUI(FZUIManager.UI_FreeGoldGet,FZGameStatus.QCurrencyType.gold);
            } 
            else if (btnState == 2) {
                FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "道具未解锁"});
            } 
            else{
                if(FZMergeDateManager.instance.coseMoney(mtype,mcost)) {
                    if(this.listItemData[index].type == 1){
                        // 永久收益
                        var count = 1 + this.listItemData[index].value/100;
                        FZMergeDateManager.instance.setGameEarnings(count);
                    }
                    else if (this.listItemData[index].type == 2){
                        // 价格
                        var count = 1 - this.listItemData[index].value/100;
                        FZMergeDateManager.instance.setGamePriceProport(count);
                    }
                    FZMergeDateManager.instance.addItemBuyRecord(this.listItemData[index].id);
                    this.ItemSort();
                    this.scene.listItem.refresh();
                    FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "购买成功"});
                    // FZ.BiLog.clickStat(FZ.clickStatEventType.buyingPrivileges,[]);
                } 
                else {
                    if (mtype == FZGameStatus.QMoneyType.Coin) {
                        FZUIManager.instance.createUI(FZUIManager.UI_FreeGoldGet,FZGameStatus.QCurrencyType.gold);
                    } 
                    else if (mtype == FZGameStatus.QMoneyType.Diamond) {
                        FZUIManager.instance.createUI(FZUIManager.UI_Tip,{text : "钻石不足"});
                    }
                }
            }
        }
        /**
         * 关闭界面
         */
        private onClickBtnClose():void
        {
            FZUtils.doUICloseAnim(this.scene.AnchorCenter);
            Laya.timer.once(310, this, function(){
                FZUIManager.instance.removeUI(FZUIManager.UI_ShopDialog);
            });
        }
    }
}
export default game.view.FZStoreUI;