namespace fastline.framework
{
    export class QGuideUtils{


        public calculateRectSize(nodeArr: Array<any>): Object {
            if(nodeArr.length){
                let centerPos = {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                }
                let allX = 0;
                let allY = 0;
                let allW = 0;
                let allH = 0;
                for(let i = 0; i < nodeArr.length; i++){
                    let c = (nodeArr[i] as Laya.Sprite).localToGlobal(new Laya.Point(0, 0));
                    allX+=c.x;
                    allY+=c.y;
                    allW+=nodeArr[i].width;
                    allH+=nodeArr[i].height;
                }
                centerPos.x = allX / nodeArr.length;
                centerPos.y = allH / nodeArr.length;
                centerPos.width = allW / nodeArr.length;
                centerPos.height = allH / nodeArr.length;
                return centerPos; 
            }
            return {};
        }
    }
}

export default fastline.framework.QGuideUtils;