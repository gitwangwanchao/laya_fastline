
import Vector3 = Laya.Vector3;
import Handler = Laya.Handler;

import FZSequenceItem from "./FZSequenceItem";
import FZDebug from "./FZDebug";
import FZUtils from "./FZUtils";
/**
 * 动作序列
 */
namespace fastline.framework
{
	export class FZSequence
	{
		constructor() { }

		private listItem: Array<FZSequenceItem> = new Array<FZSequenceItem>();
		private autoRecovery: boolean = true;
		private caller : any;

		private static poolSequence: Array<FZSequence> = new Array<FZSequence>();

		private static listRunSequence: Array<FZSequence> = new Array<FZSequence>();

		public static create(autoRecovery: boolean = true): FZSequence
		{
			let item: FZSequence;

			if (FZSequence.poolSequence.length > 0)
			{
				item = FZSequence.poolSequence.shift();
			}
			if (item == null)
			{
				item = new FZSequence();
			}

			item.autoRecovery = autoRecovery;

			return item;
		}
		// public static create(caller : any, autoRecovery: boolean = true): FZSequence
		// {
		// 	let item: FZSequence;

		// 	if (FZSequence.poolSequence.length > 0)
		// 	{
		// 		item = FZSequence.poolSequence.shift();
		// 	}
		// 	if (FZUtils.isNullOrEmpty(item))
		// 	{
		// 		item = new FZSequence();
		// 	}
		// 	item.caller = caller;

		// 	FZSequence.listRunSequence.push(item);
		// 	item.autoRecovery = autoRecovery;

		// 	// FZDebug.logError("===create poolSequence.length: " + FZSequence.poolSequence.length);
		// 	// FZDebug.logError("===create listRunSequence.length: " + FZSequence.listRunSequence.length);

		// 	return item;
		// }

		public static clearAll(caller : any)
		{
			// FZDebug.log("before poolSequence.length: " + FZSequence.poolSequence.length);
			// FZDebug.log("before listRunSequence.length: " + FZSequence.listRunSequence.length);

			for(let i = FZSequence.listRunSequence.length - 1; i >= 0; i--)
			{
				let sequence = FZSequence.listRunSequence[i];
				if(sequence.caller == caller)
				{
					sequence.clear();
					FZSequence.listRunSequence.splice(i, 1);
				}
			}

			// FZDebug.log("end poolSequence.length: " + FZSequence.poolSequence.length);
			// FZDebug.log("end listRunSequence.length: " + FZSequence.listRunSequence.length);
		}

		private clear(): FZSequence
		{
			this.time = 0;
			Laya.timer.clear(this, this.update);
			return this;
		}

		public recovery(): void
		{
			FZSequence.poolSequence.push(this.clear());

			// FZDebug.logError("===recovery poolSequence.length: " + FZSequence.poolSequence.length);
			// FZDebug.logError("===recovery listRunSequence.length: " + FZSequence.listRunSequence.length);
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
			let item = new FZSequenceItem(startTime, handler);
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

export default fastline.framework.FZSequence;