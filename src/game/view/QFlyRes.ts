import QGameData from "../data/QGameData";
import QSoundMgr from "../core/QSoundMgr";

const resPos = [
    {x: 0, y: -20},
    {x: -10, y: 0},{x: 15, y: 0},
    {x: -20, y: 20},{x: 0, y: 20},{x: 20, y: 20},
    {x: -30, y: 40},{x: -10, y: 40},{x: 10, y: 40},{x: 30, y: 40}
]

const countArr  = [6,10]

const moveSpeed = 1500 //2000像素每秒

namespace game.view{

    import layer = Laya.Scene;

    export class QFlyRes {

        private node: layer;
        
        public scheduleFuc: Function;

        public param: any;

        public cNodeArr: Array<any> = [];

        /**
         * type 0 美钞， 1金币， 2钻石
         * count 0少量， 2大量
         */

        public playFlyResAni(param){
            this.param = param;
            this.node = new layer();
            this.node.width  = Laya.stage.width;
            this.node.height = Laya.stage.height;
            this.node.mouseEnabled = true;
            Laya.stage.addChild(this.node);

            let fromPos = this.param.fromPos;
            let toPos   = this.param.toPos;
            let timeArr = [];
            for(let i = 0; i < countArr[this.param.countType]; i ++){
                let cNode = QGameData.instance.getResourcesNode(this.param.type);
                cNode.x   = resPos[i].x + fromPos.x;
                cNode.y   = resPos[i].y + fromPos.y;

                let time  = Math.sqrt(Math.pow(cNode.x - toPos.x,2) + Math.pow(cNode.y - toPos.y,2)) / moveSpeed;
                timeArr.push(Math.floor(time * 1000));
                cNode.visible = true;
                this.node.addChild(cNode);
                this.cNodeArr.push(cNode);
            }

            let count = 0;

            this.scheduleFuc = ()=>{
                if(!this.cNodeArr[count]){
                    Laya.timer.clear(this,this.scheduleFuc);
                    Laya.timer.once(timeArr[count - 1],this,this.removeSelf);
                    return;
                }
                this.playAni(this.cNodeArr[count],timeArr[count]);
                count++;
            }

            Laya.timer.loop(80,this,this.scheduleFuc)
            if(!this.param.closeSound){
                if(this.param.type == 1)
                {
                    QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.hecheng);
                }
                else if(this.param.type == 2)
                {
                    QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.siginGetDiamond);
                }
                else if(this.param.type == 0)
                {
                    QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.getMuchMoney);
                }
            }
        }

        public removeSelf(){
            for(let i = this.cNodeArr.length - 1; i >= 0; i--){
                QGameData.instance.returnResourcesNode(this.cNodeArr[i],this.param.type);
            }
            this.param.cb && this.param.cb();
            Laya.stage.removeChild(this.node);
        }

        public playAni(_n,_t){
            if(_n){
                Laya.Tween.to(_n,{x: this.param.toPos.x, y: this.param.toPos.y}, _t, null, Laya.Handler.create(this,()=>{
                    _n.visible = false;
                }));
            }
        }
        

    }
}

export default game.view.QFlyRes;