

import Handler = Laya.Handler

namespace fastline.framework
{
	export class QSequenceItem
	{
		private static poolItem: Array<QSequenceItem> = new Array<QSequenceItem>();

		public startTime: number;
		public handler: Handler;

		constructor(startTime: number, handler: Handler)
		{
			this.startTime = startTime;
			this.handler = handler;
		}

		private clear(): QSequenceItem
		{
			this.startTime = 0;
			this.handler.clear();
			return this;
		}

		public recovery(): void
		{
			QSequenceItem.poolItem.push(this.clear());
		}

		public static create(startTime: number, handler: Handler): QSequenceItem
		{
			let item: QSequenceItem = Laya.Pool.getItem("QSequenceItem")

			if (QSequenceItem.poolItem.length > 0)
			{
				item = QSequenceItem.poolItem.shift();
			}
			if (item == null)
			{
				item = new QSequenceItem(startTime, handler);
			}
			return item;
		}
	}
}

export default fastline.framework.QSequenceItem;