

import Handler = Laya.Handler

namespace fastline.framework
{
	export class FZSequenceItem
	{
		private static poolItem: Array<FZSequenceItem> = new Array<FZSequenceItem>();

		public startTime: number;
		public handler: Handler;

		constructor(startTime: number, handler: Handler)
		{
			this.startTime = startTime;
			this.handler = handler;
		}

		private clear(): FZSequenceItem
		{
			this.startTime = 0;
			this.handler.clear();
			return this;
		}

		public recovery(): void
		{
			FZSequenceItem.poolItem.push(this.clear());
		}

		public static create(startTime: number, handler: Handler): FZSequenceItem
		{
			let item: FZSequenceItem = Laya.Pool.getItem("FZSequenceItem")

			if (FZSequenceItem.poolItem.length > 0)
			{
				item = FZSequenceItem.poolItem.shift();
			}
			if (item == null)
			{
				item = new FZSequenceItem(startTime, handler);
			}
			return item;
		}
	}
}

export default fastline.framework.FZSequenceItem;