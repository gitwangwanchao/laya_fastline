import UIComponent = Laya.UIComponent;

import QConst from "./QConst";
import QDebug from "./QDebug";

namespace fastline.framework
{
	export class QUIAnchor extends Laya.Script
	{
		/** @prop {name:anchroType,tips:"对齐方式",type:Option,option:"Center,Left,TopLeft,BottomLeft,Right,TopRight,BottomRight,Top,Bottom",default:Center} */
		public anchroType: string;

		/** @prop {name:pixelOffsetX,tips:"X方向像素偏移",type:Int,default:0} */
		public pixelOffsetX: number = 0;

		/** @prop {name:pixelOffsetY,tips:"Y方向像素偏移",type:Int,default:0} */
		public pixelOffsetY: number = 0;

		private uiComponent: UIComponent;

		public onStart(): void
		{
			this.uiComponent = this.owner as Laya.Box;
			this.uiComponent.mouseEnabled = true;
			this.uiComponent.mouseThrough = true;
			// this.reposition();
			this.uiComponent.frameOnce(0, this, this.reposition);
		}

		public reposition(): void
		{
			let isFitByWidth = (Laya.stage.scaleMode == Laya.Stage.SCALE_FIXED_WIDTH);
			let radio = (isFitByWidth ? QConst.DesignWidth / Laya.Browser.width : QConst.DesignHeight / Laya.Browser.height)

			switch (this.anchroType)
			{
				case 'Center':
					this.uiComponent.anchorX = 0.5;
					this.uiComponent.anchorY = 0.5;
					this.uiComponent.x = (isFitByWidth ? QConst.DesignWidth / 2 : (Laya.Browser.width / 2 * radio)) + this.pixelOffsetX;
					this.uiComponent.y = (isFitByWidth ? (Laya.Browser.height / 2 * radio) : QConst.DesignHeight / 2) + this.pixelOffsetY;
					break;
				case 'Left':
					this.uiComponent.anchorX = 0;
					this.uiComponent.anchorY = 0.5;
					this.uiComponent.x = this.pixelOffsetX;
					this.uiComponent.y = (isFitByWidth ? (Laya.Browser.height / 2 * radio) : QConst.DesignHeight / 2) + this.pixelOffsetY;
					break;
				case 'TopLeft':
					this.uiComponent.anchorX = 0;
					this.uiComponent.anchorY = 0;
					this.uiComponent.x = this.pixelOffsetX;
					this.uiComponent.y = this.pixelOffsetY;
					break;
				case 'BottomLeft':
					this.uiComponent.anchorX = 0;
					this.uiComponent.anchorY = 1;
					this.uiComponent.x = 0;
					this.uiComponent.y = (isFitByWidth ? Laya.Browser.height * radio : QConst.DesignHeight) + this.pixelOffsetY;
					break;
				case 'Right':
					this.uiComponent.anchorX = 1;
					this.uiComponent.anchorY = 0.5;
					this.uiComponent.x = (isFitByWidth ? QConst.DesignWidth : (Laya.Browser.width * radio)) + this.pixelOffsetX;
					this.uiComponent.y = (isFitByWidth ? (Laya.Browser.height / 2 * radio) : QConst.DesignHeight / 2) + this.pixelOffsetY;
					break;
				case 'TopRight':
					this.uiComponent.anchorX = 1;
					this.uiComponent.anchorY = 0;
					this.uiComponent.x = (isFitByWidth ? QConst.DesignWidth : (Laya.Browser.width * radio)) + this.pixelOffsetX;
					this.uiComponent.y = this.pixelOffsetY;
					break;
				case 'BottomRight':
					this.uiComponent.anchorX = 1;
					this.uiComponent.anchorY = 1;
					this.uiComponent.x = (isFitByWidth ? QConst.DesignWidth : (Laya.Browser.width * radio)) + this.pixelOffsetX;
					this.uiComponent.y = (isFitByWidth ? Laya.Browser.height*radio : QConst.DesignHeight) + this.pixelOffsetY;
					break;
				case 'Top':
					this.uiComponent.anchorX = 0.5;
					this.uiComponent.anchorY = 0;
					this.uiComponent.x = (isFitByWidth ? QConst.DesignWidth / 2 : (Laya.Browser.width / 2 * radio)) + this.pixelOffsetX;
					this.uiComponent.y = this.pixelOffsetY;
					break;
				case 'Bottom':
					this.uiComponent.anchorX = 0.5;
					this.uiComponent.anchorY = 1;
					this.uiComponent.x = (isFitByWidth ? QConst.DesignWidth / 2 : (Laya.Browser.width / 2 * radio)) + this.pixelOffsetX;
					this.uiComponent.y = (isFitByWidth ? Laya.Browser.height * radio : QConst.DesignHeight) + this.pixelOffsetY;
					break;
			}
		}

		private printParams(): void
		{
			QDebug.log("anchorType: " + this.anchroType + ", offsetX: " + this.pixelOffsetX + ", offsetY: " + this.pixelOffsetY);
		}
	}
}

export default fastline.framework.QUIAnchor;