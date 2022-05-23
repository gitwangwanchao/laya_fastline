import QDebug from "./QDebug";

/**
 * 监听事件管理
 */
namespace fastline.framework
{
	export class QEventParam
	{
		public eventId: string;
		public handler: Laya.Handler;
		public param: any;
		public delay: number;
		public isTimerHandlerEvent: boolean = false;

		constructor(eventId: string, handler: Laya.Handler = null, delay: number = -1, isTimerHandlerEvent: boolean = false)
		{
			this.eventId = eventId;
			this.handler = handler;
			this.delay = delay;
		}

		public doCallback(): void
		{
			if (this.param != null)
			{
				this.handler.runWith(this.param);
			}
			else
			{
				this.handler.run();
			}
		}
	}

	export class QEventMgr
	{
		private constructor() { }

		private static _instance: QEventMgr;
		public static get instance(): QEventMgr
		{
			if (QEventMgr._instance == null)
			{
				QEventMgr._instance = new QEventMgr();
			}
			return QEventMgr._instance;
		}
		
		public static destroy(): void
		{
			QEventMgr._instance = null;
		}

		private dicEvent: { [key: string]: Array<QEventParam>; } = {};

		public register(eventId: string, callback: Function, caller: any): void
		{
			if (this.dicEvent[eventId] == null)
			{
				this.dicEvent[eventId] = new Array<QEventParam>();
			}
			this.dicEvent[eventId].push(new QEventParam(eventId, Laya.Handler.create(caller, callback, null, false)));
		}

		public unregister(eventId: string, callback: Function, caller: any): void
		{
			let listEvent: Array<QEventParam> = this.dicEvent[eventId];

			if (listEvent != null)
			{
				for (let i = listEvent.length - 1; i >= 0; i--)
				{
					if (listEvent[i] && listEvent[i].handler.caller == caller && listEvent[i].handler.method == callback)
					{
						listEvent[i].handler.recover();
						listEvent.splice(i, 1);
					}
				}
			}
		}

		public sendEvent(eventId: string, param: any = null): void
		{
			// if (eventId == "GAME_VIEW_GAME_RESURRECT") {
			// 	QDebug.D("sendEvent: " + eventId);
			// }
			
			let listEvent: Array<QEventParam> = this.dicEvent[eventId];
			if (listEvent != null)
			{
				for (let i = 0; i < listEvent.length; i++)
				{
					listEvent[i].param = param;
					listEvent[i].doCallback();
				}
			}
		}

		public sendTimerEvent(eventId: string, param: any, delay: number): void
		{
			let listEvent: Array<QEventParam> = this.dicEvent[eventId];
			if (listEvent != null)
			{
				for (let i = 0; i < listEvent.length; i++)
				{
					listEvent[i].param = param;
					listEvent[i].delay = delay;
				}
			}
		}

		public sendTimerHandlerEvent(eventId: string, callback: Function, caller: any, param: any, delay: number): void
		{
			if (this.dicEvent[eventId] == null)
			{
				this.dicEvent[eventId] = new Array<QEventParam>();
			}
			this.dicEvent[eventId].push(new QEventParam(eventId, Laya.Handler.create(caller, callback, null, false), delay, true));
		}

		private tempKey: any;
		private tempLength: number;
		private tempListEvent: Array<QEventParam>;

		public update(): void
		{
			for (this.tempKey in this.dicEvent)
			{
				this.tempListEvent = this.dicEvent[this.tempKey];
				this.tempLength = this.tempListEvent.length;

				for (let i = length - 1; i >= 0; i--)
				{
					if (this.tempListEvent[i].delay > 0)
					{
						this.tempListEvent[i].delay -= Laya.timer.delta * 0.001;

						if (this.tempListEvent[i].delay < 0)
						{
							this.tempListEvent[i].delay = -1;
							this.tempListEvent[i].doCallback();

							if (this.tempListEvent[i].isTimerHandlerEvent)
							{
								this.tempListEvent[i].handler.recover();
								this.tempListEvent.splice(i, 1);
							}
						}
					}
				}
			}
		}
	}
}

export default fastline.framework.QEventMgr;