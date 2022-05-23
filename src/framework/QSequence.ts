
import Vector3 = Laya.Vector3;
import Handler = Laya.Handler;

import QSequenceItem from "./QSequenceItem";
import QDebug from "./QDebug";
import QUtil from "./QUtil";
/**
 * 动作序列
 */
namespace fastline.framework
{
	export class QSequence
	{
		constructor() { }

		private listItem: Array<QSequenceItem> = new Array<QSequenceItem>();
		private autoRecovery: boolean = true;
		private caller : any;

		private static poolSequence: Array<QSequence> = new Array<QSequence>();

		private static listRunSequence: Array<QSequence> = new Array<QSequence>();

		public static create(autoRecovery: boolean = true): QSequence
		{
			let item: QSequence;

			if (QSequence.poolSequence.length > 0)
			{
				item = QSequence.poolSequence.shift();
			}
			if (item == null)
			{
				item = new QSequence();
			}

			item.autoRecovery = autoRecovery;

			return item;
		}
		// public static create(caller : any, autoRecovery: boolean = true): QSequence
		// {
		// 	let item: QSequence;

		// 	if (QSequence.poolSequence.length > 0)
		// 	{
		// 		item = QSequence.poolSequence.shift();
		// 	}
		// 	if (QUtil.isNullOrEmpty(item))
		// 	{
		// 		item = new QSequence();
		// 	}
		// 	item.caller = caller;

		// 	QSequence.listRunSequence.push(item);
		// 	item.autoRecovery = autoRecovery;

		// 	// QDebug.logError("===create poolSequence.length: " + QSequence.poolSequence.length);
		// 	// QDebug.logError("===create listRunSequence.length: " + QSequence.listRunSequence.length);

		// 	return item;
		// }

		public static clearAll(caller : any)
		{
			// QDebug.log("before poolSequence.length: " + QSequence.poolSequence.length);
			// QDebug.log("before listRunSequence.length: " + QSequence.listRunSequence.length);

			for(let i = QSequence.listRunSequence.length - 1; i >= 0; i--)
			{
				let sequence = QSequence.listRunSequence[i];
				if(sequence.caller == caller)
				{
					sequence.clear();
					QSequence.listRunSequence.splice(i, 1);
				}
			}

			// QDebug.log("end poolSequence.length: " + QSequence.poolSequence.length);
			// QDebug.log("end listRunSequence.length: " + QSequence.listRunSequence.length);
		}

		private clear(): QSequence
		{
			this.time = 0;
			Laya.timer.clear(this, this.update);
			return this;
		}

		public recovery(): void
		{
			QSequence.poolSequence.push(this.clear());

			// QDebug.logError("===recovery poolSequence.length: " + QSequence.poolSequence.length);
			// QDebug.logError("===recovery listRunSequence.length: " + QSequence.listRunSequence.length);
		}

		public destroy(): void
		{
			if (this.listItem != null)
			{
				for (let i = this.listItem.length - 1; i >= 0; i--)
				{
					let item = this.listItem[i];
					item.recovery();
					this.listItem.splice(i, 1);
				}
			}

			this.recovery();
		}
		public add(startTime: number, callback: Function, caller: any, param: any = null): void
		{
			let handler = Handler.create(caller, callback, param, false);
			let item = new QSequenceItem(startTime, handler);
			this.listItem.push(item);
		}

		public start(): void
		{
			this.time = 0;
			Laya.timer.frameLoop(1, this, this.update);
		}

		private time: number = 0;
		private update(): void
		{
			if (this.listItem.length > 0)
			{
				this.time += Laya.timer.delta * 0.001;

				for (let i = this.listItem.length - 1; i >= 0; i--)
				{
					let item = this.listItem[i];
					if (this.time >= item.startTime)
					{
						item.handler.run();
						item.recovery();
						this.listItem.splice(i, 1);
					}
				}
			}

			if (this.listItem.length == 0)
			{
				if (this.autoRecovery)
				{
					this.recovery();
				}
				else
				{
					this.clear();
				}
			}
		}
	}
}

export default fastline.framework.QSequence;