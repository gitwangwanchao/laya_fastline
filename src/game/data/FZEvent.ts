/**
 * 监听事件列表
 */
namespace game.data
{
    export class FZEvent
    {
        public static GAME_ENTER_HALL: string = "GAME_ENTER_HALL";
        public static GAME_DOWN_RESET : string = "GAME_DOWN_RESET";//资源重新加载完成
        public static RES_LOAD_FINISHED : string = "RES_LOAD_FINISHED";//资源加载完成
        public static UPDATE_RES_LOADING_PROGRESS : string = "UPDATE_RES_LOADING_PROGRESS";
        public static LOAD_RES_ERROR : string = "LOAD_RES_ERROR";
        public static MAIN_VIEW_UPDATE_GAME_GOLD : string = "MAIN_VIEW_UPDATE_GAME_GOLD";
        public static MAIN_VIEW_TOUCH_DOWN : string = "MAIN_VIEW_TOUCH_DOWN";
        public static MAIN_VIEW_TOUCH_SELECTED : string = "MAIN_VIEW_TOUCH_SELECTED";
        public static MAIN_VIEW_TOUCH_OUT : string = "MAIN_VIEW_TOUCH_OUT";
        public static MAIN_VIEW_SHOW_PROMPT : string = "MAIN_VIEW_SHOW_PROMPT"; // 显示提示状态
        public static MAIN_VIEW_TOUCH_UP : string = "MAIN_VIEW_TOUCH_UP"; // 按钮抬起
        public static MAIN_VIEW_TOUCH_UP_MERGE_SUCCESS : string = "MAIN_VIEW_TOUCH_UP_MERGE_SUCCESS"; // 按钮抬起 合成
        public static MAIN_VIEW_TOUCH_UP_EXCHANGE_SUCCESS : string = "MAIN_VIEW_TOUCH_UP_EXCHANGE_SUCCESS"; // 按钮抬起 切换
        public static MAIN_VIEW_TOUCH_UP_CAR_INDEX : string = "MAIN_VIEW_TOUCH_UP_CAR_INDEX"; // 刷新位置
        public static MAIN_VIEW_UPDATE_CAR_SLOT: string = "MAIN_VIEW_UPDATE_CAR_SLOT"; // 刷新车位
        public static MAIN_VIEW_CAR_SELL:string = "MAIN_VIEW_CAR_SELL";// 出售
        public static MAIN_VIEW_GAIN_EXPERIENCE:string = "MAIN_VIEW_GAIN_EXPERIENCE"; // 获得经验
        public static MAIN_VIEW_UPDATE_EXPERIENCE:string = "MAIN_VIEW_UPDATE_EXPERIENCE"; //刷新经验
        public static MAIN_VIEW_UPDATE:string = "MAIN_VIEW_UPDATE";// 刷新
        public static MAIN_VIEW_UPDATE_GOLD_SPEED:string = "MAIN_VIEW_UPDATE_GOLD_SPEED"; //刷新金币获得速度
        public static MAIN_VIEW_UPDATE_LEVEL:string = "MAIN_VIEW_UPDATE_LEVEL"; // 升级
        public static MAIN_VIEW_MERGE_NEW_CAR:string = "MAIN_VIEW_MERGE_NEW_CAR"; // 合成新车
        public static MAIN_VIEW_UPDATE_DIAMOND:string = "MAIN_VIEW_UPDATE_DIAMOND"; // 刷新钻石
        public static MAIN_VIEW_UPDATE_GAME_CASH:string = "MAIN_VIEW_UPDATE_GAME_CASH";
        public static MAIN_VIEW_ClEAN_TIMER:string = "MAIN_VIEW_ClEAN_TIMER"; // 暂停一切定时器
        public static MAIN_VIEW_RESTART_TIMER:string = "MAIN_VIEW_RESTART_TIMER"; // 恢复一切定时器
        public static MAIN_VIEW_REMOVE_CAR_UI:string = "MAIN_VIEW_REMOVE_CAR_UI"; // 删除 合并车的UI (不要调用 只用于切场景调用)
        public static MAIN_VIEW_CHANGE_PRICE:string = "MAIN_VIEW_CHANGE_PRICE"; // 更改价格
        public static MAIN_VIEW_UPDATE_BUY_CAR:string = "MAIN_VIEW_UPDATE_BUY_CAR";// 刷新最新购买车
        public static MAIN_REFRESH_LUCKY_RED_POINT:string = "MAIN_REFRESH_LUCKY_RED_POINT";//主界面刷新抽奖红点提示
        public static GAME_VIEW_GAME_START:string = "GAME_VIEW_GAME_START"; // 开始游戏
        public static GAME_VIEW_GAME_STOP:string = "GAME_VIEW_GAME_STOP"; // 游戏暂停
        public static GAME_VIEW_GAME_RUNNING:string = "GAME_VIEW_GAME_RUNNING"; // 游戏恢复
        public static GAME_VIEW_GAME_JUDGE_BULLET_POS:string = "GAME_VIEW_GAME_JUDGE_BULLET_POS"; // 判断子弹 
        public static GAME_VIEW_GAME_BULLET_HIT: string = "GAME_VIEW_GAME_BULLET_HIT";// 子弹击中
        public static GET_JCDL_CONFIG_SUCCESS : string = "GET_JCDL_CONFIG_SUCCESS"; // 加载config 成功
        public static GAME_VIEW_BOSS_START:string = "GAME_VIEW_BOSS_START"  // BOSS 来袭
        public static GAME_VIEW_BOSS_OVER:string = "GAME_VIEW_BOSS_OVER"  // BOSS 死亡
        public static GAME_VIEW_GAME_WIN:string = "GAME_VIEW_GAME_WIN" // 游戏胜利
        public static GAME_VIEW_GAME_FAIL:string = "GAME_VIEW_GAME_STATE_FAIL" // 游戏失败
        public static GAME_VIEW_RUNNING_CHANGE_DATA:string = "GAME_VIEW_RUNNING_CHANGE_DATA"  // 游戏中更改数据
        public static GAME_VIEW_GAME_ENEMY_OVER:string = "GAME_VIEW_GAME_ENEMY_OVER";// 小怪全部死亡
        public static GAME_VIEW_CREATE_PROBS: string = "GAME_VIEW_CREATE_PROBS"; // 创建道具
        public static GAME_VIEW_GAME_PLAY_SPRINT:string = "GAME_VIEW_GAME_PLAY_SPRINT";// 冲刺
        public static GAME_VIEW_GAME_PLAY_SPRINT_START:string = "GAME_VIEW_GAME_PLAY_SPRINT_START";// 冲刺
        public static GAME_VIEW_GAME_PLAY_SPRINT_CANNEL:string = "GAME_VIEW_GAME_PLAY_SPRINT_CANNEL";// 取消冲刺
        public static GAME_VIEW_GAME_CHANGE_HP:string = "GAME_VIEW_GAME_CHANGE_HP"; // 更改血量
        public static GAME_VIEW_GAME_OVER:string = "GAME_VIEW_GAME_OVER"; // 游戏结束
        public static GAME_VIEW_GAME_WEAPONS_COIN:string = "GAME_VIEW_GAME_WEAPONS_COIN";// 银币刷新
        public static MAIN_VIEW_CLOSE_DRAWER:string = "MAIN_VIEW_CLOSE_DRAWER"; //收回抽屉
        public static MAIN_UPDATE_SIGIN_NOTICE:string = "MAIN_UPDATE_SIGIN_NOTICE"; //刷新签到提醒
        public static GAME_VIEW_UPDATE_AIRCRAFT_DATA:string = "GAME_VIEW_UPDATE_AIRCRAFT_DATA"; // 刷新飞行器数据
        public static GAME_VIEW_UPDATE_AIRCRAFT_FIRE:string = "GAME_VIEW_UPDATE_AIRCRAFT_FIRE"; // 飞行器开火
        public static WX_ON_SHOW:string = "WX_ON_SHOW";
        public static WX_ON_HIDE:string = "WX_ON_HIDE";
        public static GAME_HIDE : string = "GAME_HIDE";
        public static GAME_SHOW : string = "GAME_SHOW";
        public static GAME_VIEW_GAME_RESURRECT:string = "GAME_VIEW_GAME_RESURRECT"; // 复活
        public static AIR_DROP_SUCCESS_VIDEO:string ="AIR_DROP_SUCCESS_VIDEO"; // 使用空投包
        public static GAME_VIEW_GAME_ITME_EFFECT:string ="GAME_VIEW_GAME_ITME_EFFECT_1";// 激发道具效果
        public static GAME_VIEW_GAME_ITME_EFFECT_REMOVE:string ="GAME_VIEW_GAME_ITME_EFFECT_REMOVE"; // 道具倒计时结束
        public static GAME_CHANGE_CUR_USE_CAR:string ="GAME_CHANGE_CUR_USE_CAR"; // 更改当前使用赛车
        public static GAME_ADD_ITEM_CAR_COUNT:string ="GAME_ADD_ITEM_CAR_COUNT";
        public static GAME_VIEW_GAME_RESURRECT_MAP:string ="GAME_VIEW_GAME_RESURRECT_MAP"; // 复活 地图逻辑
        public static GAME_VIEW_GAME_PLAY_EFFECT:string = "GAME_VIEW_GAME_PLAY_EFFECT";// 玩家战车播放特效
        public static GAME_VIEW_GAME_PLAY_WIN_ANIMATION:string = "GAME_VIEW_GAME_PLAY_WIN_ANIMATION";// 播发胜利动画
        public static GAME_UPDATE_POINT_SHOW:string = "GAME_UPDATE_POINT_SHOW";
        public static SOFT_GUIDE_INTERVENTION:string = "SOFT_GUIDE_INTERVENTION";
        public static BOSS_START_SHOOT:string = "BOSS_START_SHOOT"; //BOSS射击
        //wx
        public static PLAY_VIDEO_AD_SUCCESS : string = "PLAY_VIDEO_AD_SUCCESS";
		public static PUSH_VIDEO_AD_FAIL : string = "PUSH_VIDEO_AD_FAIL";//拉取视频失败
        public static MANUAL_CLOSE_VIDEO_AD : string = "MANUAL_CLOSE_VIDEO_AD";//手动关闭视频
        public static PUSH_VIDEO_AD_SUCCESS : string = "PUSH_VIDEO_AD_SUCCESS";
        public static GAME_VIEW_GAME_PLAY_GAME_OVER:string = "GAME_VIEW_GAME_PLAY_GAME_OVER";
        
		public static SHARE_SUCCESS : string = "SHARE_SUCCESS";//分享成功
		public static SHARE_FAIL : string = "SHARE_FAIL";//分享失败
        public static SHARE_CANCEL : string = "SHARE_CANCEL";//分享取消
        
        public static GAIN_GIFTS_SUCCESS : string = "GAIN_GIFTS_SUCCESS";//获取物品成功（包含分享、视频、内购、金币）
		public static GAIN_GIFTS_FAIL : string = "GAIN_GIFTS_FAIL";//获取物品失败
        public static GAIN_GIFTS_CANCEL : string = "GAIN_GIFTS_CANCEL";//获取物品取消
        public static MAIN_VIEW_CAR_SELECT_CAR : string = "MAIN_VIEW_CAR_SELECT_CAR";// 选择车辆
        public static FAKE_SHARE_RETURN : string = "FAKE_SHARE_RETURN";
        public static VIDEO_UNLOCK_TRACK : string = "VIDEO_UNLOCK_TRACK";
        public static GAME_VIEW_GAME_RESURRECT_START:string = "GAME_VIEW_GAME_RESURRECT_START";// 点击复活
        public static GAME_VIEW_GAME_RESURRECT_FAIL:string = "GAME_VIEW_GAME_RESURRECT_FAIL";// 复活倒计时结束
        public static FREE_GET_GOLD:string = "FREE_GET_GOLD";// 免费获取金币 
        public static UPDATE_SHARE_CONFIG:string = "UPDATE_SHARE_CONFIG";
        public static GAME_GUIDE_CTRL: string = "GAME_GUIDE_CTRL"; //新手引导控制
        public static GAME_FLYRES_CTRL: string = "GAME_FLYRES_CTRL"; //飞金币资源
        public static GAME_LVUPFLYRES_CTRL: string = "GAME_LVUPFLYRES_CTRL" //升级武器界面的飞资源
        public static UPDATE_NEXT_REWARD_TIMES: string = "UPDATE_NEXT_REWARD_TIMES";
        public static GAME_VIEW_GAME_CHANGE_GAME_WIN_STATE:string = "GAME_VIEW_GAME_CHANGE_GAME_WIN_STATE";
        
        public static GAME_VIEW_GAME_MAP_STOP:string = "GAME_VIEW_GAME_MAP_STOP";// 小怪全部死亡
        public static EVNET_ENTER_GAME:string = "EVNET_ENTER_GAME";// 进入游戏
        public static HIT_OBSTACLES:string = "HIT_OBSTACLES";// 碰到障碍物

        public static CAR_SELL_PRICE: string = "CAR_SELL_PRICE";// 汽车卖出去的价格监听
        public static IN_CLEAN: string = "IN_CLEAN";// 将汽车拖进垃圾桶
        public static OUT_CLEAN: string = "OUT_CLEAN";// 移出垃圾桶

        public static WEAPON_FULL_LEVEL: string = "let fullLevel = true";// 所有武器满级
        public static MAIN_VIEW_WEAPON : string = "MAIN_VIEW_WEAPON";// 主界面监听所有武器是否满级，红点显示
        public static UPDATE_DAILY_DIAMOND_RED_POINT: string = "UPDATE_DAILY_DIAMOND_RED_POINT";// 每日钻石红点

        public static GET_GIFT_SUCCESS : string = "GET_GIFT_SUCCESS";// 在线宝箱获取成功
        public static MAIN_VIEW_UPDATE_UI : string = "MAIN_VIEW_UPDATE_UI";//刷新UI

        public static DELETE_CAR_TRASH_GUIDE:string = "DELETE_CAR_TRASH_GUIDE";    //  删除车辆 引导
        public static DELETE_CAR_TRASH_STATE:string = "DELETE_CAR_TRASH_STATE";    //  删除车辆 引导 状态变化

        public static OBS_GUIDE = "OBS_GUIDE";// 障碍物引导
        // public static IN_OBS_GUIDE = "IN_OBS_GUIDE";// 控制第一关障碍物只出现一次且重新进入第一关的时候仍然会出现障碍物
        public static GAME_CURRENT_TIME = "GAME_CURRENT_TIME";// 缓动
        public static DEPUTY_PROBATION_OVER = "DEPUTY_PROBATION_OVER";//副武器试用结束
        public static ON_UPDATE_WEAPONLEVEL_UI = "ON_UPDATE_WEAPONLEVEL_UI";//刷新升级界面
        
        public static SHARE_FAIL_CALLBACK = "SHARE_FAIL_CALLBACK";//刷新失败弹窗回调响应

        public static CONTIMUE_GUIDE_ENTER = "CONTIMUE_GUIDE_ENTER";//继续游戏进入引导
        // public static WEAPON_GUIDE = "WEAPON_GUIDE";  //武器引导
        public static FORCE_GUIDE_START = "FORCE_GUIDE_START";//继续下一步强制引导
        public static GAME_FAIL_NO_CONTINUE = "GAME_FAIL_NO_CONTINUE";  //玩家死亡时隐藏长按继续游戏
        public static ON_CREATE_AIRDROP = "ON_CREATE_AIRDROP"; // 播放空投动作
        public static MAIN_OPEN_AIRDROP = "MAIN_OPEN_AIRDROP"; // 展示主界面空投
        public static CLOSE_AIRDROP = "CLOSE_AIRDROP";  // 关闭主界面空投
        public static UPDATE_AIRDROP_RED_NUM = "UPDATE_AIRDROP_RED_NUM";//刷新空投数量
        public static UVA_CAN_CHOOSE = "UVA_CAN_CHOOSE";  //武器可选择事件，更新主界面武器升级红点提示
        public static FRESHAIRDROPSTATE = "FRESHAIRDROPSTATE";  //刷新空投状态

        public static MORE_GAME_NUM = "MORE_GAME_NUM";  //剩余试玩次数
        public static JCDL_SUCCESS = "JCDL_SUCCESS";  //试玩成功事件
        public static JCDL_CAN_CLICK = "JCDL_CAN_CLICK";  //交叉导流可点击
        
    }
}

export default game.data.FZEvent;