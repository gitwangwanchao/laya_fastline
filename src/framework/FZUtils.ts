import Vector3 = Laya.Vector3;
import Sprite3D = Laya.Sprite3D;
import Transform3D = Laya.Transform3D;
import UIComponent = Laya.UIComponent;

import FZConst from "./FZConst";
import FZDebug from "./FZDebug";
import FZGameStatus from "../game/data/FZGameStatus";
import FZEventManager from "./FZEventManager";
import FZEvent from "../game/data/FZEvent";
/**
 * 公共函数
 */
namespace fastline.framework
{
	export class FZUtils
	{
		constructor() { }

		public static readHeightWidthRatio: number = -1;
		public static readHeightWidthRatioSquare: number = -1;

		// 判断是否存在
		public static isNullOrEmpty(param: any): boolean
		{
			if (param == null || param == undefined || (typeof (param) == "string" && param == ""))
			{
				return true;
			}
			return false;
		}

        /**
         * 对一个标签进行数字滚动
         * @param label 标签对象
         * @param beginValue 开始值
         * @param finalValue 终点值
         * @param type 滚动类型(0: 增  1:减)
         * @param beginWord 数字前面显示的String
         * @param endWord 数字后面显示的String
         * @param endCallback 结束回调
         * @param numPerFrame 每毫秒增加的数值(默认1)
         * @param keepNum 保留的小数位数，速度设置为小数时使用，默认为0，即保留整数
         * @param enableAdapter 是否让速度随终点值增加而增加，超过500的，每500增加一倍，默认关闭
         */
        public static BeginNumRoll(label: Laya.Label,beginValue : number,finalValue: number,type : number = 0 ,beginWord : string = null, endWord : string = null,endCallback: Function = null,numPerFrame: number = 1, keepNum: number = 0)
        {
            let tempData =
            {
				"rollCounter": 0,
                "rollValue": beginValue
            };

			this.begainNumRollHandler(label, tempData,beginValue,finalValue,type,beginWord,endWord,numPerFrame, keepNum,endCallback);
            Laya.timer.loop(numPerFrame, this, this.begainNumRollHandler, [label, tempData,beginValue,finalValue,type,beginWord,endWord,numPerFrame, keepNum,endCallback]);
		}

		public static begainNumRollHandler(label: Laya.Label, tempData: any, beginValue : number,finalValue: number,type:number ,beginWord : string, endWord : string,numPerFrame: number, keepNum: number, callback: Function):void
		{
			if(type==FZGameStatus.NumRollType.AddType)
			{
				tempData.rollValue += numPerFrame;
			}
			else if(type == FZGameStatus.NumRollType.ReduceType)
			{
				tempData.rollValue -= numPerFrame;
			}
			
			if ((tempData.rollValue < finalValue && type == FZGameStatus.NumRollType.AddType) || (tempData.rollValue >= finalValue && type == FZGameStatus.NumRollType.ReduceType))
			{
				label.text =beginWord+tempData.rollValue.toFixed(keepNum).toString()+endWord;
				tempData.rollCounter++;
			}
			else
			{
				label.text = beginWord+finalValue.toString()+endWord;
				Laya.timer.clear(this, this.begainNumRollHandler);
				tempData.rollCounter = 0;
				tempData.rollValue = beginValue;
				if (callback != null) callback();
			}
		}

		public static clearNullRollHandler():void
		{
			Laya.timer.clear(this,this.begainNumRollHandler);
		}

		// 适配判断
		public static phoneScreenAdaptive():boolean
		{
			return (Laya.Browser.height / Laya.Browser.width > 1.5);
		}
		// 长屏
		public static isSlimSceen():boolean {
			return (Laya.Browser.height / Laya.Browser.width >= 2);
		}

		/**
		 * 长数字格式化
		 * @param num 数字
		 * @param fix_len 可选,保留的小数位
		 */
		public static formatNumberStr(num: string, fix_len: number = 1): string {
			num =  FZUtils.scienceNum(num);
			let symbol = [
			'',   'K',  'M',  'B',  'T',
			'aa', 'bb', 'cc', 'dd', 'ee',
			'ff', 'gg', 'hh', 'ii', 'jj',
			'kk', 'll', 'mm', 'nn', 'oo',
			'pp', 'qq', 'rr', 'ss', 'tt',"uu","vv","ww","xx","yy","zz"];
			let length = num.length;
			var count = Math.floor((length-1)/3);
			if (count == 0){
				// FZDebug.D("长数字格式化 = " + num);
				return num;
			}
			var num_d = num.substr(0, length - count*3);
			var num_de = num.substr(num_d.length, 1);
			var str_num = num_d + "." + num_de + symbol[count];
			// FZDebug.D("长数字格式化 = " + str_num);
			return str_num;
		}

		/**
		 * 大数加法
		 */
		public static StrAdd( a: string, b: string): string {
			var zong = [];
			//把a,b较大的放在前面
			// FZDebug.D("加法 a = " + a + "    b = " + b);
			zong = this.getMax(a, b);
			//创建fen数组
			var fen = [];
			//把zong数组里面的元素分成单个数字
			zong[0] = zong[0].split('');
			zong[1] = zong[1].split('');
			//创建加0变量
			var jialing;
			//判断两个参数是否相同长度
			if(!(zong[0].length == zong[1].length)) {
				//创建0
				jialing = new Array(zong[0].length-zong[1].length+1).join('0');
				//把0放进zong[1]前面
				zong[1] = jialing.split('').concat(zong[1]);
			}
			//创建补充上一位的数字
			var next = 0;
			//从个位数起对应单个计算
			for(var i=(zong[0].length-1); i>=0; i--) {
				//求和
				var he = Number(zong[0][i]) + Number(zong[1][i]) + next;
				//把求和的个位数先放进数组
				fen.unshift(he%10);
				//把求和的十位数放进补充上一位的数字，留在下一次循环使用
				next = Math.floor(he/10);
				//判断最后一次如果求和的结果为两位数则把求和的十位数加在最前面
				if(i == 0 && !(next==0)) {
					fen.unshift(next);										
				}						
			}
			//把最后的结果转化成字符串
			var result = fen.join('');
			//返回字符串
			return result;
		}

		//大数减法
		public static StrSubtract(a: string, b:string):string {
			var zong = [];
			FZDebug.D("减数据 a = " + a + "    b = " + b);
			//把a,b较大的放在前面
			zong = this.getMax(a, b);
			if(zong.length == 3) {
				return "";
			}	
			zong[0] = zong[0].split('');
			zong[1] = zong[1].split('');
			var fen = [];
			var jialing;
			if(!(zong[0].length == zong[1].length)) {
				jialing = new Array(zong[0].length-zong[1].length+1).join('0');
				zong[1] = jialing.split('').concat(zong[1]);
			}
			var next = 0;
			for(var i=(zong[0].length-1); i>=0; i--) {
				var cha = Number(zong[0][i]) - Number(zong[1][i]) - next;
				next = 0;
				if(cha<0) {
					cha = cha + 10;
					next = 1;
				}
				fen.unshift(cha%10);					
			}
			var result = fen.join('');
			FZDebug.D(" 结果=  " + result );
			if(result.length !=1 && result.substr(0,1) == "0") {
				result = this.shanchuling(result);
			}
			return result;	
		}
		
		//大数乘法
		public static  StrMultip(a:string, b:string) {
			FZDebug.D("乘法 a = " + a + "    b = " + b);
			var zong = [];
			var fen = [];
			zong = this.getMax(a, b);
	
			zong[0] = zong[0].split('');
			zong[1] = zong[1].split('');
			//获取b的长度,处理乘法分配率的乘法
			for(var j=(zong[1].length-1); j>=0; j--) {
				var next = 0;
				var fentemp = []; 
				var jialing = '';
				//获取a的长度处理乘法
				for(var i=(zong[0].length-1); i>=0; i--) {
					var ji = Number(zong[0][i]) * Number(zong[1][j]) + next;
					fentemp.unshift(ji%10);
					next = Math.floor(ji/10);
					if(i == 0 && !(next==0)) {
						fentemp.unshift(next);										
					}
				}
				//后面添加0
				jialing = new Array((zong[1].length-(j+1))+1).join('0');
				fentemp.push(jialing);			
				fen[j] = fentemp.join('');				
			}
			//处理乘法后的求和
			var cishu = fen.length;
			for(var k=1; k<cishu; k++) {
				var hebing = this.StrAdd(fen[0], fen[1]);
				fen.splice(0,2,hebing);
			}
			
			var result = fen.join('');
			if(result.substr(0,1) == "0") {
				result = this.shanchuling(result);
			}	
			return result;
		}

		public static getMax(a: string, b:string ):any {
			var result = [a, b];
			//如果a长度小于b长度
			if(a.length<b.length)
			{
				//b放前面
				result[0] = b;
				result[1] = a;
				//返回result长度为3，为了减法的不够减而准备
				result[2] = 'not';
				//返回最终数组
				return result;
			}
			//如果a长度等于b长度
			if(a.length == b.length) {
				//循环对比a,b里面的单个元素
				for(var i=0; i<a.length; i++) {
					if(result[0][i]>result[1][i]) {
						result[0] = a;
						result[1] = b;
						return result;
					}
					if(result[0][i]<result[1][i]) {
						result[0] = b;
						result[1] = a;
						result[2] = 'not';
						return result;					
					}
					//假如全部相等，当最后一个元素，以上条件都不执行，则执行默认的返回结果
					if(i == a.length-1) {
						return result;
					}				
				}
			}
			if(a.length>b.length) {
				return result;				
			}
		}
		

		//删除字符串前面多余的0
		public static shanchuling(result:string):string  {
			//首先判断是否全部都是0，是的话直接返回一个0
			if(result == "0") {
				result = "0";
				//返回最终字符串
				return result;
			}
			//把字符串分割成数组
			var result1 = result.split('');	
			//获取数组长度
			var hebing = result1.length;

			
			for(var j=0; j<hebing; j++) {
				//判断数组首位是否为0
				if(result1[j] == "0") {
					//把数组首位删掉
					result = result.substr(1, result.length-1);
					// FZDebug.D("result 1= " + result);
					if (j == hebing-1) {
						result = "0";
					}
				}
				else {
					//删除完了就跳出循环
					// FZDebug.D("result 2= " + result);
					return result;	
				}
			}
			//返回最终字符串
			return result;		
		}


		/**
		 * 判断 大数 大小
		 * 0 小于
		 * 1 大于
		 * 2 等于
		 */
		public static StrJudge(a: string, b:string ):any {
			
			//如果a长度小于b长度
			if(a.length<b.length)
			{
				//返回最终数组
				return 0;
			}
			//如果a长度等于b长度
			if(a.length == b.length) {
				//循环对比a,b里面的单个元素
				for(var i=0; i<a.length; i++) {
					if(a[i]>b[i]) {
						return 1;
					}
					if(a[i]<b[i]) {
						return 0;					
					}
					//假如全部相等，当最后一个元素，以上条件都不执行，则执行默认的返回结果
					if(i == a.length-1) {
						return 2;
					}				
				}
			}
			if(a.length>b.length) {
				return 1;				
			}
		}
		/**
		 * 大数除法
		 */
		public static bigDivide = (str1, str2) => {
			let resultArr = []
			let remainPart = 0
			for (let i = 0; i < str1.length; i++) {
				let currentNumber = parseInt(str1.charAt(i))
				let intePart = Math.floor((remainPart * 10 + currentNumber) / str2)
				remainPart = (remainPart * 10 + currentNumber) % str2
				resultArr.push(intePart)
			}
			var str = FZUtils.shanchuling(resultArr.join(''));
			return str;
		}
		/**
		 * 显示diaog
		 * @param box 
		 * @param handler 
		 */
		public static doUIPopAnim(box : any, handler:Laya.Handler = null)
		{
			box.scale(0, 0);
			Laya.Tween.to(box, {scaleX : 1, scaleY : 1}, 300, Laya.Ease.backOut, handler);
		}

		/**
		 * 关闭diaog
		 * @param box 
		 * @param handler 
		 */
		public static doUICloseAnim(box : any, handler:Laya.Handler = null)
		{
			box.scale(1, 1);
			Laya.Tween.to(box, {scaleX : 0, scaleY : 0}, 300, Laya.Ease.backIn, handler);
		}

		/**
		 * 关闭diaog
		 */
		private static isStartPlay:boolean = true;
		public static playBtnScaleAni(btn : any,callback:Laya.Handler = null):void
        {
			if(this.isStartPlay)
			{
				this.isStartPlay = false;
				var oldSX = btn.scaleX;
				var oldSY = btn.scaleY;
				var factor = 0.95;

				Laya.Tween.to(btn,{scaleX:oldSX*factor,scaleY:oldSY*factor},100,Laya.Ease.linearIn,Laya.Handler.create(this,function(){
					Laya.Tween.to(btn,{scaleX:oldSX,scaleY:oldSY},100,Laya.Ease.linearIn,Laya.Handler.create(this,()=>{
						if(!FZUtils.isNullOrEmpty(callback)) callback.run();
						this.isStartPlay = true;
					}));
				}));
			}
		}

		public  static JudgeRectangular (rect1:any,rect2:any):any {
			if (rect1.x >= rect2.x && rect1.x >= rect2.x + rect2.width) {  
				return false;  
			} else if (rect1.x <= rect2.x && rect1.x + rect1.width <= rect2.x) {  
				return false;  
			} else if (rect1.y >= rect2.y && rect1.y >= rect2.y + rect2.height) {  
				return false;  
			} else if (rect1.y <= rect2.y && rect1.y + rect1.height <= rect2.y) {  
				return false;  
			}  
			return true;
		  }
		// /**
		//  * 把stage的全局坐标转换为本地坐标。
		//  * @param point 转化坐标
		//  * @param createNewPoint 
		//  */
		//   public static globalToLocal(point:Laya.Point, obj:Laya.Sprite,createNewPoint:Boolean = false):any {
		// 	//if (!_displayedInStage || !point) return point;
		// 	if (createNewPoint) {
		// 		point = new Laya.Point(point.x, point.y);
		// 	}
        //             //此处的this指的是调用此API的对象
		// 	var ele:Laya.Sprite = obj;
		// 	var list:any = [];
		// 	while (ele) {
		// 		if (ele == Laya.stage) break;
		// 		list.push(ele);
		// 		ele = ele.parent as Laya.Sprite;
		// 	}
		// 	var i:number = list.length - 1;
		// 	while (i >= 0) {
		// 		ele = list[i];
		// 		point = ele.fromParentPoint(point);
		// 		i--;
		// 	}
		// 	return point;
		// }

		// /**
		//  * 把本地坐标转换为相对stage的全局坐标。
		//  */
		// public static localToGlobal(point:Laya.Point, obj: Laya.Sprite,createNewPoint:Boolean = false):any {
		// 	//if (!_displayedInStage || !point) return point;
		// 	if (createNewPoint === true) {
		// 		point = new Laya.Point(point.x, point.y);
		// 	}
        //             //此处的this指的是调用此API的对象
		// 	var ele:Laya.Sprite = obj;
		// 	while (ele) {
		// 		if (ele == Laya.stage) break;
		// 		point = ele.toParentPoint(point);
		// 		ele = ele.parent as Laya.Sprite;
		// 	}
			
		// 	return point;
		// }
		public static getAngle(px,py,mx,my):any
        {  //获得人物中心和鼠标坐标连线，与y轴正半轴之间的夹角
            var x = Math.abs(px-mx);
            var y = Math.abs(py-my);
            var z = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
            var cos = y/z;
            var radina = Math.acos(cos);//用反三角函数求弧度
            var angle = Math.floor(180/(Math.PI/radina));//将弧度转换成角度
    
            if(mx>px&&my>py){//鼠标在第四象限
                angle = 180 - angle;
            }
    
            if(mx==px&&my>py){//鼠标在y轴负方向上
                angle = 180;
            }
    
            if(mx>px&&my==py){//鼠标在x轴正方向上
                angle = 90;
            }
    
            if(mx<px&&my>py){//鼠标在第三象限
                angle = 180+angle;
            }
    
            if(mx<px&&my==py){//鼠标在x轴负方向
                angle = 270;
            }
    
            if(mx<px&&my<py){//鼠标在第二象限
                angle = 360 - angle;
            }
            return angle;
		}
		public static readFile(listRes,index ,success:any){
			FZ.wxFileUtil.readFile(listRes[index],function(){
				if (index == listRes.length-1) {
					if (success){
						success();
					}
				}else {
					FZUtils.readFile(listRes,index+1,success);
				}
			}, function(){
			});
		}

		public static downloadFile(path, successFunc, failFunc){
			FZUtils.removeSavedFile();
			var fileManager = Laya.Browser.window.wx.getFileSystemManager();
			var downloadTask =  Laya.Browser.window.wx.downloadFile({
				url:path,
				success:function(data){
					FZDebug.D("download success!!"+JSON.stringify(data));
					FZ.BiLog.clickStat(FZ.clickStatEventType.downZipSuccess,[]);
					FZDebug.D(data.tempFilePath);
					FZDebug.D("--"+Laya.Browser.window.wx.env.USER_DATA_PATH);
					FZUtils.unzipFile(data.tempFilePath, Laya.Browser.window.wx.env.USER_DATA_PATH+"/v" + FZ.SystemInfo.version ,successFunc);
				},fail:function(e){
					FZDebug.D("download fail: "+e.errMsg);
					FZ.BiLog.clickStat(FZ.clickStatEventType.downZipFailed,[]);
					Laya.timer.once(500, this, function(){
						if (failFunc){
							failFunc();
						}
					})
				}
			});
		}
		public static unzipFile(path, targetPath,successFunc){
			var fileManager = Laya.Browser.window.wx.getFileSystemManager();
			FZ.BiLog.clickStat(FZ.clickStatEventType.upZipStart,[]);
			fileManager.unzip({
				zipFilePath:path,
				targetPath:targetPath,
				success:function(){
					FZ.BiLog.clickStat(FZ.clickStatEventType.upZipSuccess,[]);
					if (successFunc){
						successFunc();
					}
				},fail:function(e){
					FZDebug.D("unzip fail: "+e.errMsg);
					FZ.BiLog.clickStat(FZ.clickStatEventType.upZipFailed,[]);
					// FZUtils.removeSavedFile();
					Laya.timer.once(500, this, function(){
						FZUtils.unzipFile(path, targetPath,successFunc);
					});
				}
			});
		}
		public static removeSavedFile() : void
		{
			if(Laya.Browser.onMiniGame)
			{
				let wx = Laya.Browser.window.wx;
				let fsm = wx.getFileSystemManager();
				
				fsm.readdir({
				dirPath: wx.env.USER_DATA_PATH, /// 获取文件列表
				success(res) {
					// console.error("readdir: " + JSON.stringify(res));
					res.files.forEach((val) => { // 遍历文件列表里的数据
						if (val.indexOf("v") != -1) {
							fsm.rmdir({
								dirPath: `${wx.env.USER_DATA_PATH}/${val}`,
								recursive: true,
								fail: (res)=>
								{
								console.log(JSON.stringify(res));
								}
							});
						}
					})
				}
				});
			}
		}

		public static getHeightWidthRatio(): number
		{
			if (FZUtils.readHeightWidthRatio == -1)
			{
				if (Laya.stage.scaleMode == Laya.Stage.SCALE_FIXED_WIDTH)
				{
					let realRadio = Laya.Browser.height / Laya.Browser.width;
					let stardardRadio = FZConst.DesignHeight / FZConst.DesignWidth;
					// console.log("Laya.Browser.height:" + Laya.Browser.height);
					// console.log("Laya.Browser.width:" + Laya.Browser.width);
					// console.log("realRadio" + realRadio);
					FZUtils.readHeightWidthRatio = realRadio / stardardRadio;
				} else
				{
					FZUtils.readHeightWidthRatio = 1;
				}
			}
			return FZUtils.readHeightWidthRatio;
		}

		public static  scienceNum(value):string{ 
			if(value != null){ 
				var num=0; 
				if((num=value.indexOf('E'))!=-1||(num=value.indexOf('e'))!=-1){ 
				var doubleStr=value.substring(0,num); 
				var eStr=value.substring(num+1,value.length); 
				eStr=parseInt(eStr); 
				var doubleStrList=doubleStr.split('.'); 
				var doubleStr1=doubleStrList[0]; 
				var doubleStr2=doubleStrList[1]; 
				
				if(doubleStr2.length>eStr){ 
				var nums=doubleStr2.substring(0,eStr); 
				var nume=doubleStr2.substring(eStr,doubleStr2.length); 
				doubleStr=doubleStr1+nums+'.'+nume; 
				} 
				else if(doubleStr2.length<eStr){ 
				var indexNum=eStr-doubleStr2.length; 
				//用0补齐 
				var str=''; 
				for(var i=0;i<indexNum;i++){ 
					str+='0'; 
				} 
				doubleStr=doubleStr1+doubleStr2+str; 
				} 
				else{ 
				doubleStr=doubleStr1+doubleStr2; 
				} 
				value=doubleStr; 
				//千分位 
				} 
			} 
			return value; 
		   } 
		   //适配3D场景，修改Camera Fov
			public static setCameraFov(camera: Laya.Camera): void
			{
			if (Laya.stage.scaleMode == Laya.Stage.SCALE_FIXED_WIDTH)
			{
				camera.fieldOfView *= this.getHeightWidthRatio();
			}
		}
	}
}
export default fastline.framework.FZUtils;