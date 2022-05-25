import { FZShareType } from "./FZShareType";

module game.logic
{
    export class FZShareInfo
    {
        private constructor(){}

        private static listPool = new Array<FZShareInfo>();

		public static create() : FZShareInfo
		{	
			let param : FZShareInfo;

			if(this.listPool.length > 0)
			{
				param = this.listPool.shift();
			}
			else
			{
				param = new FZShareInfo();
			}

			return param;
		}

		public shareType : FZShareType;
		public params = {};
		public mainCallBackHandler: Laya.Handler = null;
		private clear() : FZShareInfo
		{
			this.shareType = -1;
			this.params = null;
			return this;
		}

		public recovery() : void
		{
			// FZShareInfo.listPool.push(this.clear());
		}
    }
}

export default game.logic.FZShareInfo;