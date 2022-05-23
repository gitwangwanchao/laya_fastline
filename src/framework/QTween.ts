import Vector3 = Laya.Vector3;
import Sprite3D = Laya.Sprite3D;

namespace fastline.framework
{
	export class QTween extends Laya.Script3D
	{
		public sprite3D: Laya.Sprite3D = null;
		public transform: Laya.Transform3D = null;
		public from: Laya.Vector3 = null;
		public to: Laya.Vector3 = null;
		public duration: number = 0;
		public delay: number = 0;
		public executeTime: number = 0;
		public callback: Function = null;
		public caller: any = null;
		public isLocal : boolean = false;

		protected isUpdate: boolean = false;
		protected tempVec3: Vector3 = new Vector3();

		public onAwake() : void
		{
			this.sprite3D = this.owner as Sprite3D;
			this.transform = this.sprite3D.transform;
		}

		public onStart() : void
		{

		}

		public onUpdate(): void
		{
			if (!this.isUpdate) return;

			if (this.delay > 0)
			{
				this.delay -= Laya.timer.delta * 0.001;
			}
			else
			{
				if (this.executeTime < this.duration)
				{
					this.executeTime += Laya.timer.delta * 0.001;
					this.executeOn();
				}
				else
				{
					this.executeEnd();

					if (this.callback != null)
					{
						this.callback.apply(this.caller);
					}

					this.destroy();
					// this.sprite3D.remove.removeComponentByType(this);
					// this.enabled = false;
					// this.isUpdate = false;
				}
			}
		}

		public initParam(from: Laya.Vector3, to: Laya.Vector3, duration: number, isLocal : boolean = false, delay: number = 0, callback: Function = null, caller: any = null): void
		{
			this.from = from;
			this.to = to;
			this.duration = duration;
			this.isLocal = isLocal;
			this.delay = delay;
			this.callback = callback;
			this.caller = caller;
			this.executeTime = 0;
			this.isUpdate = true;
		}

		public executeOn(): void { }

		public executeEnd(): void { }

		public stop(): void
		{
			this.isUpdate = false;
			this.enabled = false;
		}
	}
}

export default fastline.framework.QTween;