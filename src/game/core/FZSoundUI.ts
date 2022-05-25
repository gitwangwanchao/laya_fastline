import UIComponent = Laya.UIComponent;

import FZSoundManager from "./FZSoundManager";
import FZDebug from "../../framework/FZDebug";
/**
 * 点击声音
 */
namespace game.core
{
	export class FZSoundUI extends Laya.Script
	{
		/** @prop {name:soundName,tips:"点击声音",type:String,default:"select"} */
		public soundName: string = "select";

		public onAwake(): void
		{
			this.owner.on(Laya.Event.MOUSE_DOWN,this,function(){
				FZSoundManager.instance.playSfx(this.soundName);
			});
		}
		
	}
}

export default game.core.FZSoundUI;