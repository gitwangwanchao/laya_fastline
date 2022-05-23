
import Vector3 = Laya.Vector3;
import QDebug from "../../framework/QDebug";
/**
 * 1. 进入大厅流程
 * 2. json 配置
 */ 
namespace game.data
{
	export class QGameConst
	{
		// 更新地址
		public static DownloadUrl : string = "https://myqn.nalrer.cn/Moyu/quanmzc/update/";

		// 加载重试次数
		public static LoadRetryNum : number = 999;
		// 加载间隔
		public static LoadRetryDelay : number = 1000;
		//1. 进入大厅流程
		public static QResType = {
			LoadingViewRes: 1,
			UIRes: 2,
			GameScene: 4,
			Config: 8,
			Font : 16,
			Sound : 32,
			Subpackage : 64,
			GarageScene : 128
		};
		// 配置文件  车的配置
		// 导流配置
		public static QCfgType = {
			GameConfig: 1,
			JCDL : 2,
			UserLevel: 3,
			CheckPoint: 4,
			BuyCarLevelUp: 5,
			Weapons:6,
			DeputyWeapon:7,
			UAVWeapon:8,
			SignIn:9,
			LuckyRotaryTable:10,
			Bullet:11,
			ShareCfg: 12,
			FanPaiCfg: 13,
			BossCfg:14
		}

		public static QCfgName = {
			1 : "game_config",
			2 : "jcdl_config",
			3 : "user_level",
			4 : "check_point",
			5 : "free_cars_level_up",
			6 : "weapons" ,
			7 : "deputyWeapons",
			8 : "uavWeapons",
			9 : "sigin",
			10 : "luckyRotaryTable",
			11 : "bullet",
			12 : "shareCfg",
			13 : "fanPai_config",
			14 : "boss_config"
		};

		// 1.签到双倍领取 doubleSign
		// 2.幸运转盘√luckyDraw
		// 3.合成新等级汽车领取钻石 newCar
		// 4.商店免费汽车 freeCar
		// 5.收益加速 speedUp
		// 6.空头汽车的免费 freeDropCar
		// 7.空头五倍收益 freeDropFive
		// 8.复活 revive
		// 9.结算的3倍领取√resultReward
		// 10.免费金币 freeGold


		public static QShareType =
		{
			GainDiamond : 1,
			LuckyDraw : 2,
			DoubleSign: 3,
			FreeCar: 4,
			NewCar: 5,
			SpeedUp: 6,
			FreeDropCar: 7,
			FreeDropFive: 8,
			Revive: 9,
			ResultReward: 10,
			FreeGold: 11,
			OfflineCoin: 12,
			FreeCash: 13,
			FanPai:14,
            DailyDiamond:15,
            AirDrop	: 16,
			oncemore:17,
			showof: 18
		}

		public static QGainWay = 
		{
			Video : 0,
			Share : 1
		}

		public static QMoneyType = {
			Coin: 1,
			Diamond: 2,
			Video: 3
		};

		// 钱类型
		public static QCurrencyType = {
			gold: 1,
			diamond: 2,
			dollar: 3
		}

		// 数字  增加类型  减少类型
		public static NumRollType = 
		{
			AddType : 0,
			ReduceType : 1,
		};
		// 强制引导流程 {}
		public static NumForGuide = 
		{
			enterGame: 1,
			getResult: 2,
			buyCar:    3,
			synthetic: 4,
			enterGameAgain: 5,
			weaponUpdate:6,
			weaponUpdateBtn:7,
			weaponUpdateBtnClose:8,
			allStep:   9
		}
		// 软引导流程 []
		public static softGuidePriority = 
		{
			buyCar: 1,
			shop: 2,
			synthetic: 3,
		}

		// 分享策略
		public static integralStrategy = {
			share: 1,
			video: 2,
			nothing: 3,
		}
	}
}

export default game.data.QGameConst;