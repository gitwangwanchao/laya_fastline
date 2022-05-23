import UIComponent = Laya.UIComponent;

import QSoundMgr from "./QSoundMgr";
import QDebug from "../../framework/QDebug";
/**
 * 点击声音
 */
namespace game.core
{
	export class QUISound extends Laya.Script
	{
		/** @prop {name:soundName,tips:"点击声音",type:String,default:"select"} */
		public soundName: string = "select";

		public onAwake(): void
		{
			this.owner.on(Laya.Event.MOUSE_DOWN,this,function(){
				QSoundMgr.instance.playSfx(this.soundName);
			});
		}
		
	}
}

export default game.core.QUISound;