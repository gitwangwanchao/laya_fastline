import GameConfig from "./GameConfig";
import FZConst from "./framework/FZConst";
import FZGameManager from "./game/core/FZGameManager";
import FZUtils from "./framework/FZUtils";


class Main
{
	constructor()
	{
		//根据IDE设置初始化引擎		
		if (window["Laya3D"]) Laya3D.init(FZConst.DesignWidth, FZConst.DesignHeight);
		else Laya.init(FZConst.DesignWidth, FZConst.DesignHeight, Laya["WebGL"]);

		
		//适配模式
		if (FZUtils.phoneScreenAdaptive())
		{
			Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_WIDTH;
		}
		else
		{
			Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_HEIGHT;
		}

		// if (!Laya.Browser.onMiniGame)
		// {
		// 	Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
		// }

		Laya.stage.screenMode = Laya.Stage.SCREEN_VERTICAL//Laya.Stage.SCREEN_VERTICAL;
		Laya.MouseManager.multiTouchEnabled = false;

		//兼容微信不支持加载scene后缀场景
		Laya.URL.exportSceneToJson = true;// GameConfig.exportSceneToJson;

		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
		//Laya["DebugPanel"] && Laya["DebugPanel"].enable();
		// Laya.enableDebugPanel();
		// Laya["PhysicsDebugDraw"].enable();

		// if (!Laya.Browser.onMiniGame)
		// {
		// 	Laya.Stat.show();
		// 	// Laya["DebugPanel"] && Laya["DebugPanel"].enable();
		// }
		// Laya.Stat.show();
		// Laya.stage.frameRate = "slow";
		
		

		Laya.alertGlobalError = true;
		// Laya.stage.frameRate='mouse'
		// QTcpMgr.instance.init();
		if (Laya.Browser.onMiniGame) {
			Laya.MiniAdpter.autoCacheFile =false;
		}
		FZGameManager.instance.init();

		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
		//Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
		//Laya.ResourceVersion.enable("view/MainScene.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
	}

	onVersionLoaded(): void
	{
		//激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
		Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
	}

	onConfigLoaded(): void
	{
		//加载IDE指定的场景
		GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
	}

}
//激活启动类
new Main();
