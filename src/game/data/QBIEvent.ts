/**
 * BI 事件
 */
namespace game.data
{
	export class QBIEvent
	{
	public static loadingSuccess : number = 20001;//加载成功人数

    public static onClickStartGame : number = 20002;//点击开始游戏的人数

    public static finishOneUsCar : number = 20003;//完成一次枪

    public static onClickFastBuyCar : number = 20004;//点击快速购买枪的人数

    public static userShareOrVideoQuicken : number = 20005;//使用分享/视频加速的人数

    public static userDiamondQuicken : number = 20006;//使用钻石加速的人数

    public static inShopBuyCar: number = 20007;//在商店内购买枪的人数

    public static successGainCollect : number = 20008;//成功领取收藏奖励

    public static successComDailyCheck : number = 20009;//成功普通签到

    public static successDoubleDailyCheck : number = 20010;//成功双倍签到

    public static successTurnDial : number = 20011; // 成功转动转盘

    public static successMoreMutipleAward : number = 20012;//成功领取下次3倍/下次6倍

    public static successAddDialTimes : number = 20013;//成功添加转盘次数

    public static resultDoubleAward : number = 20014;//结算双倍奖励领取

    public static successSellCar : number = 20015;//成功卖出枪

    public static successGetThreeAward : number = 20016;//成功领取三倍奖励

    public static successGetFiveAward : number = 20017;//成功领取五倍奖励

    public static successRevive : number = 20018;//成功复活[关卡ID]

    public static shopGetFreeCar : number = 20019;//商城获得免费车辆

    public static useGunLevel : number = 20020;//玩家使用枪数据[枪等级ID]

    public static getCommonOffLineAward : number = 20021;//获取普通离线奖励

    public static getDoubleOffLineAward : number = 20022;//获取双倍离线奖励

    public static getFirstCarDiamond : number = 20023;//领取第一次合成枪的钻石

    public static onClickSecondLevel : number = 20024;//点击第二关的开始游戏

    public static passTrack : number = 20025;//用户通关数据[关卡ID,是否通关(成功0 ,失败1)]

    public static unlockNewCar : number = 20026;//解锁新枪[枪等级]

    public static getOneDiamondGiftAward : number = 20027;//获取一次钻石礼包奖励

	public static getFiveDiamondGiftAward : number =20028;//获取五次钻石礼包奖励
	

	public static unlockingUav : number =20029; // 解锁无人机
	public static clickTheSelectionOfUav : number =20030; // 机枪无人机选择按钮点击
	public static clickTheMissileUavSelection : number =20031;	// 导弹无人机选择按钮点击
	public static clickTheFrisbeeDroneSelection : number =20032;// 飞盘无人机选择按钮点击
	public static clickTheTrackingDroneSelection : number =20033;	// 追踪弹无人机选择按钮点击
	public static unlockingSecondaryWeapon : number =20034;	// 解锁副武器
	public static secondaryWeaponUpgradeLevel : number =20035;	// 副武器升级等级
	public static modifyTheNickname : number =20036;	// 修改昵称
	public static copyTheNickname : number =20037;	// 复制昵称
	public static goToTheAutoRacingInterface : number =20038;	// 进去选择赛车界面
	public static clickTheSelectInRacingInterface : number =20039;	// 赛车界面点击选择按钮
	public static clickThePrivilegeTAB : number =20040;	// 点击特权标签
	public static buyingPrivileges : number =20041;	// 购买特权
	public static clickOnTheEmptyBag : number =20042;	// 点击空头包
	public static clickOnTheDiamondGetDropBag : number =20043;	// 点击钻石获得空投包
	public static shareVideoGetAirdropPackage : number =20044;	// 点击视频/分享获得空投包
	public static successfullyObtained4AirdropPackages : number =20045;	// 成功获得4辆赛车空投包
	public static successfullyObtained5AirdropPackages : number =20046;	// 成功获得5倍收益空投包
	public static clickOnTheSoundSwitch : number =20047; // 点击声音开关
	public static clickTheSelectLevelButton : number =20048;	// 点击选择关卡按钮
	public static selectNumberOfLevels : number =20049;	// 选择关卡数
	public static diamondPurchaseCar : number =20050;	// 钻石购买车
	public static diamondsForDollars : number =20051;	// 钻石兑换美钞
	public static pauseTimesOfGameInterface	: number =20052;// 游戏界面暂停次数
	public static doubleYourDollarBills : number =20053; // 拾取美钞双倍次数
	public static pickupIncreasesBarrageCount : number =20054;	// 拾取增加弹幕次数
	public static numberOfMedicalBagPickup : number =20055;	// 拾取医疗包次数
	public static pickupAcceleration : number =20056;	// 拾取加速次数
	public static doubleSettlement : number =20057;	// 结算单倍领取
	public static settlement3TimesGet : number =20058;	// 结算3倍领取

	}
}

export default game.data.QBIEvent;

