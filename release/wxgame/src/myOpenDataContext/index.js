class RankListRender {
  constructor() {
    this.init();
  }

  init() {
    this.canvas = wx.getSharedCanvas();
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.rankListData = null;
    this.jsonData = {};
    this.myIndex = 0;
    this.userInfo = {}
    this.shareTicket = null;
    this.lastTopStarCount = 0;
    this.startScrollY = 50;
    this.endScrollY = 0;
    this.currentScrollY = 0;
    this.imgCache = {};
    this.getUserInfo();
  }

  getUserInfo() {
    wx.getUserInfo({
      openIdList: ['selfOpenId'],
      lang: 'zh_CN',
      success: (res) => {
        this.userInfo.nickname = res.data[0].nickName
        this.userInfo.avatarUrl = res.data[0].avatarUrl
      },
      fail: (res) => {
        reject(res)
      }
    })
  }


  listen() {
    wx.onMessage(data => {
      if (data.message == undefined) {
        return
      }

      console.log("onMessage: " + data.message);

      let jsonData = JSON.parse(data.message)
      this.jsonData = jsonData;

      switch (jsonData.tag) {
        case "showRankList":
          this.getFriendTrackStorage();
          break;
        case "showInGameRank":
          this.lastTopStarCount = -1;
          this.getFriendTrackStorage();

          break;
        case "rankListScroll":
          this.scrollRankList();
          break;  
      }
    })
  }


  getFriendTrackStorage() {
    /**元素高度 */
    const CELL_HEIGHT = 106;
    /**元素（行）间距 */
    const CELL_SPACE_Y = 10;
    
    wx.getFriendCloudStorage({
      keyList: [this.jsonData.key],
      
      success: res => {
        this.rankListData = res.data;
        console.log("friend len: " + this.rankListData.length + ", " + JSON.stringify(res.data))
        let list = [];
        for(let i=this.rankListData.length-1; i>=0; i--)
        {
            if(this.rankListData[i].KVDataList.length > 0)
            {
              list.push(this.rankListData[i]);
            }
        }
        this.rankListData = list;
        this.rankListData.sort((a, b) => b.KVDataList[0].value - a.KVDataList[0].value);
        if (this.jsonData.tag == "showRankList")
        {
          this.currentScrollY = this.startScrollY;
          this.endScrollY = this.canvas.height - this.rankListData.length*(CELL_HEIGHT+CELL_SPACE_Y) + CELL_SPACE_Y;
          this.drawRankList(this.jsonData)
        }else if(this.jsonData.tag == "showInGameRank")
        {
          for (let i = 0; i < this.rankListData.length; i++) {
            if (this.rankListData[i].avatarUrl == this.userInfo.avatarUrl && this.rankListData[i].nickname == this.userInfo.nickname) {
              this.myIndex = i;
              break;
            }
          }
          this.drawInGameRank(this.jsonData);
        }
      }
    })
  }

  scrollRankList(){
    if(this.currentScrollY+this.jsonData.deltaY > this.startScrollY){
        this.currentScrollY = this.startScrollY;
    }else if(this.currentScrollY+this.jsonData.deltaY < this.endScrollY){
        this.currentScrollY = this.endScrollY;
    }else{
        this.currentScrollY += this.jsonData.deltaY;
    }
    this.drawRankList(this.jsonData);
  }


  drawRankList(jsonData) {
    /**元素高度 */
    const CELL_HEIGHT = 106;
    /**元素（行）间距 */
    const CELL_SPACE_Y = 10;
    /**头像长宽 */
    const HEAD_WH = 80;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    console.log("w:" + this.canvas.width + ", h: " + this.canvas.height);

    let totalCount = this.rankListData.length;

    /**本页起始索引 */
    let start = Math.floor((this.startScrollY-this.currentScrollY)/(CELL_HEIGHT+CELL_SPACE_Y));
    /**本页结束索引 */
    let end = start+Math.floor(this.canvas.height/(CELL_HEIGHT+CELL_SPACE_Y))+1;
    
    if(end >= totalCount ) end = totalCount;
    console.log("start:"+start+"  end:"+end);

    /**元素左上角x */
    let x = 8;
    /**元素左上角y */
    let y = this.currentScrollY + start*(CELL_HEIGHT+CELL_SPACE_Y);
    //console.log("this.currentScrollY:"+this.currentScrollY);

    for (let i = start; i < end; i++) {
      switch(i+1)
      {
            case 1:
                this.drawImage("res/Texture/item_bg_1.png", x , y - 50, 567, 106, (x,y)=>
                {
                  this.drawImage("res/Texture/item_star_1.png", x + 20, y - 31, 70, 70,()=>
                  {
                    this.drawText((i + 1).toString(), x + 53, y + 20, "45px SimHei", "#0b223e", "center");
                  }, [x,y]);
                  this.drawInCellInfo(i,x,y);
                }, [x,y]);
            break;

            case 2:
                this.drawImage("res/Texture/item_bg_2.png", x , y - 50, 567, 106, (x,y)=>
                { 
                  this.drawImage("res/Texture/item_star_2.png", x + 20, y - 31, 70, 70,()=>
                  {
                    this.drawText((i + 1).toString(), x + 53, y + 20, "45px SimHei", "#0b223e", "center");
                  }, [x,y]);
                  this.drawInCellInfo(i,x,y);
                }, [x,y]);
            break;

            case 3:
                this.drawImage("res/Texture/item_bg_3.png", x , y - 50, 567, 106, (x,y)=>
                {   
                  this.drawImage("res/Texture/item_star_3.png", x + 20, y - 31, 70, 70,()=>
                  {
                    this.drawText((i + 1).toString(), x + 53, y + 20, "45px SimHei", "#0b223e", "center");
                  }, [x,y]);
                  this.drawInCellInfo(i,x,y);
                }, [x,y]);
            break;

            default:
                this.drawImage("res/Texture/item_bg_other.png", x , y - 50, 567, 106, (x,y)=>
                {  
                  this.drawImage("res/Texture/item_star_other.png", x + 20, y - 31, 70, 70,()=>
                  {
                    this.drawText((i + 1).toString(), x + 53, y + 20, "45px SimHei", "#0b223e", "center");
                  }, [x,y]);
                  this.drawInCellInfo(i,x,y);
                }, [x,y]);
            break;
      }     

      //this.drawImage("res/Texture/rank_star.png", x + 465 , y-25, 43, 42);

      
      
      //y位置下移一个元素的高度加一个间距
      y = y + CELL_HEIGHT + CELL_SPACE_Y;
    }
  }

  drawInCellInfo(i,x,y){
    //昵称
    this.drawText(this.ClipText(this.rankListData[i].nickname, 8), x + 180, y + 15, "40px SimHei", 'black',"left");
    
    if(this.jsonData.key == "trackCount"){
      //关卡数量
      this.drawText(this.rankListData[i].KVDataList[0].value, x + 480, y+15, "40px Arial", 'red' ,"right");
      this.drawText("关", x + 495, y+15, "40px Arial", 'black' ,"left");
    }else{
      this.drawText(this.rankListData[i].KVDataList[0].value, x + 500, y+15, "40px Arial", 'red' ,"right");
      this.drawText("$", x + 515, y+15, "40px Arial", 'black' ,"left");
    }
    //头像
    this.drawImage(this.rankListData[i].avatarUrl, x + 100, y - 30, 65, 65);
  }

  drawInGameRank(jsonData) {
    if (jsonData.trackCount < this.lastTopStarCount) return;

    let length = this.rankListData.length;
    let index = 0;
    let differStarCount;
    
    for (let i = length - 1; i >= 0; i--) {
      if (jsonData.trackCount < this.rankListData[i].KVDataList[0].value) {
        index = i;
        differStarCount = this.rankListData[i].KVDataList[0].value-jsonData.trackCount;
        this.lastTopStarCount = this.rankListData[i].KVDataList[0].value;
        break;
      }
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let x = 142;
    let y = 9;
    
    //昵称
    //this.drawText(this.ClipText(this.rankListData[i].nickname, 8), x, y + 68, "24px Arial", "black", "center");
    //分值
    //this.drawText(this.rankListData[index].KVDataList[0].value, x, y + 98, "24px Arial", "black", "center");
     //头像
    this.drawImage(this.rankListData[index].avatarUrl, x-135, y+6, 72, 72);
    
    if(index == 0 && this.myIndex == index)
    {
      this.drawText("你是", x-7, y+35, "30px SimHei", "#ffffff", "center");
      this.drawText("第一名!", x, y+70, "30px SimHei", "#ffffff", "center");
    }
    else
    { 
      this.drawText("还有"+differStarCount+"关", x-60, y+35, "30px SimHei", "#ffffff", "left");
      this.drawText("超越他!", x-60, y+70, "30px SimHei", "#ffffff", "left");
    }
  }

  

    /**
   * 按字符长度截取字符串，超出限制的自动添加省略号，如果没有达到限制，则返回原字符串
   * @param {string} str 原字符串
   * @param {number} maxLength 最大长度，1个汉字长度为2
   * @param {string} points 省略号，默认为"..."
   */
  ClipText(str, maxLength, points = "...")
  {
      let len = 0;
      let c1_count = 0;
      let c2_count = 0;
      for (let i = 0; i < str.length; i++)
      {
          let c = str.charCodeAt(i);
          //单字节加1
          if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f))
          {
              len++;
              //如果增加以后的长度超过限制，则截取当前的字符数
              if (len > maxLength)
              {
                  return str.substr(0, c1_count + c2_count) + points;
              }
              c1_count++;
          }
          else
          {
              len += 2;
              //如果增加以后的长度超过限制，则截取当前的字符数
              if (len > maxLength)
              {
                  return str.substr(0, c1_count + c2_count) + points;
              }
              c2_count++;
          }
      }
      //如果没有达到限制，则返回原字符串
      return str;
  }

  /**
   * 绘画字体
   * @param {*} text 内容
   * @param {*} x X的位置(左上角)
   * @param {*} y Y的位置(左上角)
   * @param {*} fontSize 字体大小
   * @param {*} color 颜色
   * @param {*} align 对齐方式
   */
  drawText(text, x, y, fontSize, color, align) {
    this.ctx.font = fontSize || "26px Arial";
    this.ctx.fillStyle = color || "black";
    this.ctx.textAlign = align || "left";
    this.ctx.baseLine = "middle";

    this.ctx.fillText(text, x, y);
  }

  /**
   * 绘制图片
   * @param {*} url 图片路径,本地相对路径是从wxgame开始(不包含)
   * @param {*} x X的位置(左上角)
   * @param {*} y y的位置(左上角)
   * @param {*} w 宽度
   * @param {*} h 高度
   * @param {*} callback 绘制图片完成时的回调函数
   * @param {*} args args 回调参数
   */
  drawImage(url, x, y, w, h, callback = null, args = null) {
    
    if(!this.imgCache[url]){
        let img = wx.createImage();
        img.src = url;
        img._xx = x;
        img._yy = y;
        img._ww = w;
        img._hh = h;
        img.callback = callback;
        img.args = args;
        img.srcUrl = url;
        img.onload = (param) => {
          // this.ctx.drawImage(img, img._xx, img._yy, img._ww, img._hh);
          this.imgCache[param.target.srcUrl] = param.target;
          this.ctx.drawImage(param.target, param.target._xx, param.target._yy, param.target._ww, param.target._hh);
          if (img.callback != undefined && img.callback != null) param.target.callback.apply(this, param.target.args);
        };
    }else{
        this.ctx.drawImage(this.imgCache[url], x, y, w, h);
        if (callback != undefined && callback != null) callback.apply(this, args);
    }
  }
}

const renderer = new RankListRender();
renderer.listen();