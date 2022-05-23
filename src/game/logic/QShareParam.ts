import { QShareType } from "./QShareType";

module game.logic
{
    export class QShareParam
    {
        private constructor(){}

        private static listPool = new Array<QShareParam>();

		public static create() : QShareParam
		{	
			let param : QShareParam;

			if(this.listPool.length > 0)
			{
				param = this.listPool.shift();
			}
			else
			{
				param = new QShareParam();
			}

			return param;
		}

		public shareType : QShareType;
		public params = {};
		public mainCallBackHandler: Laya.Handler = null;
		private clear() : QShareParam
		{
			this.shareType = -1;
			this.params = null;
			return this;
		}

		public recovery() : void
		{
			// QShareParam.listPool.push(this.clear());
		}
    }
}

export default game.logic.QShareParam;