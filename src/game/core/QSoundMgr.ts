import QUtil from "../../framework/QUtil";
import QDebug from "../../framework/QDebug";
import QGameConst from "../data/QGameConst";
import QEventMgr from "../../framework/QEventMgr";
import QEventType from "../data/QEventType";
import QSavedDateItem from "../data/QSavedDateItem";

import Handler = Laya.Handler;
import QWxSDK from "./QWxSDK";
/**
 * 音效管理
 */
module game.core
{
	export class QSoundMgr
	{
		public soundInfo_wav = {
			explosionflame:  "explosionflame", //爆炸火焰音效
			
			buy_car: "buyCar", //买车
   
			// missile1:  "missile1", //导弹音效1
			// missile2:  "missile2", //导弹音效2
			// missile3:  "missile3", //导弹音效3
		   
			touch:  "touch", 				//点击
			startPlay: "startPlay",         //开始游戏
			// theScoring:  "theScoring", 		//计分

			deathBomb: "deathBomb", // 死亡爆炸

			getMuchMoney:  "getMuchMoney", 	//获得大额美钞
			get_nitrogen:  "get_nitrogen", 	//获得氮气道具
			get_nitrogenPass: "get_nitrogenPass", //使用氮气过程
			getMoneyDouble:  "getMoneyDouble",//获得美钞加倍
			getMoney:  "getMoney", 		//获得美钞
			getDiamond:  "getDiamond", 	//获得钻石
			hecheng:  "hecheng", 		//合成
		   
			machine_gunfire:  "machine_gunfire", 	//机枪开枪
			// machine_gunfirexh:  "machine_gunfirexh", 	//机枪开枪循环
			machine_gunfireOver: "machine_gunfireOver", //机枪结束
			// shoot_appear:  "shoot_appear", 		//敌人出现
			damageUp:  "damageUp",	//捡起伤害增加
			unlock:  "unlock", 		//解锁新车
			// theTruck:  "theTruck",		//卡车音效循环
			//	startTheCar:  "startTheCar", 	//汽车启动
			// car_audio:  "car_audio", 		//汽车音效循环
			gunfire:  "gunfire", 	 //枪声
			switch:  "switch", //切换
			lvUp_mainWeapon:  "lvUp_mainWeapon",    //升级主武器机枪
			lvUp_deputyWeapon: "lvUp_deputyWeapon", //升级副武器
			lvUp_uav: 'lvUp_uav', 					//升级无人机
			// plane_laser:  "plane_laser", 			//无人机激光开始音效
			// plane_laserLoop:  "plane_laserLoop", 	//无人机激光循环
			uav_tip: "uav_tip",						//无人机界面
			mainWeapon_tip: "mainWeapon_tip",       //主武器界面
			// magnetLoop:  "magnetLoop", 				//吸铁石循环

			siginGetDiamond: "siginGetDiamond",     //签到得钻石
			win:  "win",	 	//胜利
			fail:  "fail", 		//失败
			boss: "boss", // boss来袭
			airdrop : "airdrop"  // 空投降落
		}
		
		public path: string = "res/sound/";
		public static suffix_mp3: string = ".mp3";
		public static suffix_wav: string = ".wav";
		private constructor() { }
		private static _instance: QSoundMgr;
		public static get instance(): QSoundMgr
		{
			if (QSoundMgr._instance == null)
			{
				QSoundMgr._instance = new QSoundMgr();
			}

			return QSoundMgr._instance;
		}
		public allSoundUrl = [];
		public openWeaponLevelUp = 0;
		public loadSound(): void
		{
			this.path = this.path;
			let listRes = [];
			//加载不同的音效
			for(var key in this.soundInfo_wav){
				let wav_url = this.path + this.soundInfo_wav[key] + QSoundMgr.suffix_mp3;
				listRes.push(wav_url);
			}
			this.allSoundUrl = listRes;
			// if (Laya.Browser.onMiniGame) {
            //     QDebug.D("加载SoundRes----------------------");
            //     QUtil.readFile(listRes,0, function(){
            //         QEventMgr.instance.sendEvent(QEventType.RES_LOAD_FINISHED, QGameConst.QResType.Sound);
            //     });
            // }else {
			if (Laya.Browser.onMiniGame) {
				Laya.loader.load(listRes, Handler.create(this, this.completeHandler, [QGameConst.QResType.Sound]));
			}
			// }
			// QEventMgr.instance.sendEvent(QEventType.RES_LOAD_FINISHED, QGameConst.QResType.Sound);
			this.setSoundOpen("");
			this.setVibrateOpen("");
			// if(!Laya.Browser.onMiniGame){
				QEventMgr.instance.sendEvent(QEventType.RES_LOAD_FINISHED, QGameConst.QResType.Sound);
			// }
			if (Laya.Browser.onMiniGame) {
				for(var i=0;i<20;i++){
					var innerAudioContext = Laya.Browser.window.wx.createInnerAudioContext();
					this.listAudioContextPool.push(innerAudioContext);
				}
			}
			
		}

		public setSoundOpen (tag: string)  {
			if(tag){
				this.isSoundOn = tag == "open";
			}else{
				let soundState = QSavedDateItem.instance.getItemFromLocalStorage("GAME_SETTING_SOUND_STATE", "open");
				this.isSoundOn = soundState == "open";
			}
		}
		public setVibrateOpen (tag: string)  {
			if(tag){
				this.isVibrateOn = tag == "open";
			}else{
				let vibrateState = QSavedDateItem.instance.getItemFromLocalStorage("GAME_SETTING_VIBRATW_STATE", "open");
				this.isVibrateOn = vibrateState == "open";
			}
		}

		public getRandomIndex(n: number = 0): number{
			let r = Math.random()*n;
			return Math.round(r);
		}

		/**
		 * 音效加载完成回调
		 * @param resType 
		 */
		private completeHandler(resType : number) : void
		{
			Laya.SoundManager.autoReleaseSound = false;
			QEventMgr.instance.sendEvent(QEventType.RES_LOAD_FINISHED, resType);
			if(Laya.Browser.onMiniGame){
				Laya.timer.loop(1,this,this.testLoad);
			}
		}
		public loadTimes: number = 0;
		public testLoad(){
			let url = this.allSoundUrl[this.loadTimes];
			if(!url){
				Laya.timer.clear(this,this.testLoad)
				return;
			}
			let innerAudioContext = Laya.Browser.window.wx.createInnerAudioContext();
			innerAudioContext.src = url;
			innerAudioContext.volume = 0;
			innerAudioContext.loop = false;
			innerAudioContext.play();
			this.loadTimes++;
		}

		public isSoundOn: boolean = true;
		public isVibrateOn: boolean = true;
		/**
		 * 播发背景音乐
		 * @param soundName 
		 */
		public playBgm(soundName: string): void
		{
			if (this.isSoundOn)
			{
				Laya.SoundManager.playMusic(this.path + soundName + ".mp3");
			}
		}
		/**
		 * 停止背景音乐的播放
		 */
		public stopBgm()
		{
			if (this.isSoundOn)
			{
				Laya.SoundManager.stopMusic();
			}
		}

		private listAudioContextPool = [];
		private innerAudioContext:any =null;
		/**
		 * 播发音效
		 * @param soundName 
		 * @param loop 
		 * @param suffix 
		 */
		
		public playSfx(soundName : string, loop : boolean = false, suffix : string = ".mp3") : void
		{
			if(QWxSDK.instance.isVideoPlaying == true){
				return;
			}
			if(this.isSoundOn)
			{
				QDebug.log("playsfx: " + soundName + ", loop: " + loop);
				if(Laya.Browser.onMiniGame)
				{
					let innerAudioContext = null;
					//小游戏音效
					if(this.listAudioContextPool.length > 0)
					{
						innerAudioContext = this.listAudioContextPool.shift();
					}else
					{
						innerAudioContext = Laya.Browser.window.wx.createInnerAudioContext();
					}
					if(soundName == "explosionflame"){
						innerAudioContext.volume = 0.2;
					}else if(soundName == "gunfire"&&this.openWeaponLevelUp==0){
						innerAudioContext.volume =0.9;
					}else if(soundName == "getMoney"){
						innerAudioContext.volume = 0.08;
					}else{
						innerAudioContext.volume = 0.35;
					}
					innerAudioContext.loop = loop;
					innerAudioContext.src = this.path + soundName + suffix;
					innerAudioContext.play();
					
					if(innerAudioContext.duration > 0)
					{
						Laya.timer.once(innerAudioContext.duration * 1000, this, (_innerAudioContext)=>{
							this.listAudioContextPool.push(_innerAudioContext);
						}, [innerAudioContext]);
					}
				}
				else
				{
					Laya.SoundManager.autoReleaseSound = false;
					Laya.SoundManager.playSound(this.path + soundName + suffix, loop ? 0 : 1);
				}
			}
		}
		/**
		 * 停止音效的播放
		 * @param soundName 
		 * @param suffix 
		 */
		public stopSfx(soundName: string, suffix: string = ".wav"): void
		{
			if(this.isSoundOn)
			{
				if(Laya.Browser.onMiniGame)
				{
				}
				else
				{
					Laya.SoundManager.stopSound(this.path + soundName + suffix);
				}
			}
		}
	}
}

export default game.core.QSoundMgr;