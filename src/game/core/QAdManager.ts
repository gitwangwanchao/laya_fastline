import QDebug from "../../framework/QDebug";

module game.core
{
	export class QAdManager
	{
        private constructor() { }

		private static _instance: QAdManager;
		public static get instance(): QAdManager
		{
			if (QAdManager._instance == null)
			{
				QAdManager._instance = new QAdManager();

				if (Laya.Browser.onMiniGame)
				{
					// tywx.TuyooSDK.wechatLogin();
				}
			}
			return QAdManager._instance;
        }
        public BANNER_GAME_VIDEO_ID: "adunit-1896b0b11c77e456";
        public AD_VIDEO_ID: "adunit-9d8b35e635f641c9";
        public isAdOpen :boolean = true;
        public init() {
            // this.isAdOpen = true;
        }
        /**
         * 显示Banner
         */
        public showBanner() {
            if (this.isAdOpen != true ) {
                return;
            }
            QDebug.D("显示Banner--------------------1"); 
            if (Laya.Browser.onMiniGame){
                QDebug.D("显示Banner--------------------2");    
                tywx.AD.createBannerAdOnBottom(this.BANNER_GAME_VIDEO_ID);
            }
        }

        /**
         * 隐藏Banner
         */
        public hideBanner() {
            if (this.isAdOpen != true) {
                return;
            }
            if (Laya.Browser.onMiniGame){
                tywx.AD.bannerAdHide();
            }
            
        }

        /**
         * 显示激励视频
         * @param {} successcall
         * @param {*} failedcall
         */
        public showVideo(successcall:any, failedcall:any) {
            if (!this.isAdOpen) {
                if (failedcall) {
                    failedcall(true);
                }
            }
            if (Laya.Browser.onMiniGame) {
                tywx.AD.createRewardedVideoAd(this.AD_VIDEO_ID, successcall, failedcall);
            }
        }
    }
}
    
export default game.core.QAdManager;