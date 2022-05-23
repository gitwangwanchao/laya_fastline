/**
 * 日志管理
 */
module fastline.framework
{
	export class QDebug
	{
		public static isDebug: boolean = false;
		public static isWxMiniGame: boolean = Laya.Browser.onMiniGame;
		public static customWxDebug: boolean = false;	// 微信环境下显示debug

		public static setDebug(isDebug : boolean)
		{
			this.isDebug = isDebug;
		}

		public static log(txt: string): void
		{
			if (this.isDebug)
			{
				console.log(txt);
			}
		}

		public static logWarning(txt: string): void
		{
			if (QDebug.isDebug)
			{
				if (QDebug.isWxMiniGame)
				{
					console.warn("[W] " + txt);
				}
				else
				{
					console.info("\x1b[33m[W] " + txt + "\x1b[0m");
				}
			}
		}

		public static logError(txt: string): void
		{
			if (QDebug.isDebug)
			{
				if (QDebug.isWxMiniGame)
				{
					console.error("[E] " + txt);
				}
				else
				{
					console.error("\x1b[31m[E] " + txt + "\x1b[0m");
				}
			}
		}
		public static I(txt: string): void
		{
			if (QDebug.isDebug)
			{
				if(QDebug.isWxMiniGame)
				{
					console.log(`%c[I] ` + txt, `color: #006ff5`);
				}
				else
				{
					console.info("\x1b[34m[I] " + txt +"\x1b[0m");
				}
			}
		}
		public static P(txt: string): void
		{
			if (QDebug.isDebug)
			{
				if(QDebug.isWxMiniGame)
				{
					console.log(`%c[P] ` + txt, `color: #00a957`);
				}
				else
				{
					console.info("\x1b[32m[P] " + txt +"\x1b[0m");
				}
			}
		}
		public static D(txt: string): void
		{
			if (QDebug.isDebug)
			{
				if(QDebug.isWxMiniGame)
				{
					console.log(`%c[D] ` + txt, `color: #f01663`);
				}
				else
				{
					console.info("\x1b[35m[D] " + txt +"\x1b[0m");
				}
			}
		}
		public static W(txt: string): void
		{
			if (QDebug.isDebug)
			{
				if(QDebug.isWxMiniGame)
				{
					console.warn("[W] " + txt);
				}
				else
				{
					console.info("\x1b[33m[W] " + txt +"\x1b[0m");
				}
				
			}
		}
		public static E(txt: string): void
		{
			if (this.isDebug)
			{
				if(QDebug.isWxMiniGame)
				{
					console.error("[E] " + txt);
				}
				else
				{
					console.error("\x1b[31m[E] " + txt +"\x1b[0m");
				}
			}
		}

		public static printVector3(str: string, vec: Laya.Vector3): void
		{
			console.log(str + " x " + vec.x + " y " + vec.y + " z " + vec.z);
		}
	}
}

export default fastline.framework.QDebug;