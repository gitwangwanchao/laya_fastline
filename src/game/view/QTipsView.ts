import { ui } from "../../ui/layaMaxUI";
import QBaseUI from "../core/QBaseUI";
import QSequence from "../../framework/QSequence";
import QUIMgr from "../core/QUIMgr";

namespace game.view
{
    export class QTipsView extends QBaseUI
    {
        public scene : ui.view.TipsViewUI;
        public off_w: number = 40;
        public min_w: number = 200;

        public init():void
        {
            this.scene = new ui.view.TipsViewUI();
            let _window_screen_height = Laya.Browser.onMiniGame ? Laya.Browser.window.screen.availHeight : Laya.Browser.window.screen.height;
            this.scene.tipsBg.y = _window_screen_height * 5/12;
            this.scene.popup();

            this.scene.zOrder=10000;
            this.scene.updateZOrder();

            //this.scene.imgAcquire.visible = true;
        }

        
        public setParam(param : any)
        {
            let text: string = param.text;
            let delay;

            let _window_screen_height = Laya.Browser.onMiniGame ? Laya.Browser.window.screen.availHeight : Laya.Browser.window.screen.height;
            this.scene.tipsBg.y = _window_screen_height * 5/12;
            let _width = Math.max(text.length*this.off_w, this.min_w)+30;
            this.scene.tipsBg.width = 620;//_width+30;
            this.scene.lblTipsText.text = text;
            this.scene.lblTipsText.x = 310;
            // this.scene.lblTipsText.x = (_width+30)*0.5;

            if(typeof(param.delay) == 'number')
			{
                delay = param.delay;
			}
			else
			{
				delay = 1;
			} 
            Laya.timer.once(delay*1000, this, function(){
                QUIMgr.instance.removeUI(QUIMgr.UI_Tip);
            })
        }
        public doDestroy():void
        {
        }
    }
}
export default game.view.QTipsView;