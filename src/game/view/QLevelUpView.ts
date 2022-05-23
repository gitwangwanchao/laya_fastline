import QBaseUI from "../core/QBaseUI";
import { ui } from "../../ui/layaMaxUI";
import QCfgMgr from "../core/QCfgMgr";
import QGameConst from "../data/QGameConst";
import QUtil from "../../framework/QUtil";
import QMergeData from "../data/QMergeData";
import QUIMgr from "../core/QUIMgr";
import QSoundMgr from "../core/QSoundMgr";
import QGameData from "../data/QGameData";

namespace game.view
{
    export class QLevelUpView extends QBaseUI
    {
        public scene: ui.view.LevelUpUI ;
        private carInfo:any;
        private pos_list_1:any = [{"x":310,"y":753}];
        private pos_list_2:any = [{"x":236,"y":753}, {"x":391,"y":753}];
        private add_cord:boolean = false; // 增加车位
        private add_d:boolean = false;   // 增加钻石
        private add_g:boolean = false;  // 增加金币
        public init():void
        {
            
            this.add_cord = false;
            this.add_d = false;
            this.add_g = false;
            this.scene = new ui.view.LevelUpUI();
            QUtil.doUIPopAnim(this.scene.AnchorCenter);
            var count = 0;
            var __index = 0;
            var level =  QMergeData.instance.getUserLevel();
            this.scene.lab_level.text = level;
            QUIMgr.instance.RegisterBtnClickWithAnim(this.scene.btnConfirm, this, this.onClickBtnConfirm, ["btnConfirm"]);

            this.scene.ani1.play(0,true);

            var newinfo = QCfgMgr.instance.getLevelInfo(level);
            if (newinfo.max_plane > QMergeData.instance.getGameCarSlot()){
                this.add_cord = true;
                count += 1;
                __index  = 1;
            }
            if (newinfo.reward_diamond != 0) {
                count += 1;
                __index  = 2;
            }
            if (newinfo.level_up_reward != 0) {
                count += 1;
                __index  = 3;
            }
            this.scene.lbl_btn.text = (count != 0) ? "领取奖励" : "确定";
            this.scene.lbl_huode.visible = (count != 0);
            this.scene.box_diamond.visible = false;
            this.scene.box_card.visible = false;
            this.scene.box_gold.visible = false;
            if (count == 1) {
                if (__index == 1) {
                    this.scene.box_card.visible = true;
                    this.scene.box_card.x = this.pos_list_1[0].x;
                    this.scene.box_card.y = this.pos_list_1[0].y;
                } else if (__index == 2){
                    this.scene.box_diamond.visible = true;
                    this.scene.box_diamond.x = this.pos_list_1[0].x;
                    this.scene.box_diamond.y = this.pos_list_1[0].y;
                    this.scene.lab_diamond_count.text = "x"+ newinfo.reward_diamond;
                    this.add_d = true;
                } else if (__index == 3) {
                    this.scene.box_gold.visible = true;
                    this.scene.box_gold.x = this.pos_list_1[0].x;
                    this.scene.box_gold.y = this.pos_list_1[0].y;
                    this.scene.lab_gold_count.text = "x"+ QUtil.formatNumberStr(newinfo.level_up_reward+"");
                    this.add_g = true;
                }
            } else if (count == 2){
                if (newinfo.reward_diamond !=0 && newinfo.level_up_reward != 0){
                    this.scene.box_diamond.visible = true;
                    this.scene.box_diamond.x = this.pos_list_2[0].x;
                    this.scene.box_diamond.y = this.pos_list_2[0].y;
                    this.scene.lab_diamond_count.text = "x"+ newinfo.reward_diamond;
                    this.add_d = true;
                    this.scene.box_gold.visible = true;
                    this.scene.box_gold.x = this.pos_list_2[1].x;
                    this.scene.box_gold.y = this.pos_list_2[1].y;
                    this.scene.lab_gold_count.text = "x"+ QUtil.formatNumberStr(newinfo.level_up_reward+"");
                    this.add_g = true;
                }else {
                    this.scene.box_card.visible = true;
                    this.scene.box_card.x = this.pos_list_2[0].x;
                    this.scene.box_card.y = this.pos_list_2[0].y;
                    if (__index == 2) {
                        this.scene.box_diamond.visible = true;
                        this.scene.box_diamond.x = this.pos_list_2[1].x;
                        this.scene.box_diamond.y = this.pos_list_2[1].y;
                        this.scene.lab_diamond_count.text = "x"+ newinfo.reward_diamond;
                        this.add_d = true;
                    } else if(__index ==3 ) {
                        this.scene.box_gold.visible = true;
                        this.scene.box_gold.x = this.pos_list_2[1].x;
                        this.scene.box_gold.y = this.pos_list_2[1].y;
                        this.scene.lab_gold_count.text = "x"+ QUtil.formatNumberStr(newinfo.level_up_reward+"");
                        this.add_g = true;
                    }
                }
            }            
        }

        private onClickBtnConfirm():void
        {
            var level =  QMergeData.instance.getUserLevel();
            this.scene.lab_level.text  = level;
            var newinfo = QCfgMgr.instance.getLevelInfo(level);
            if(this.add_cord == true) {
                QMergeData.instance.addGameCarSlot();
            }
            if (this.add_d == true) {
                QMergeData.instance.addGameDiamond(newinfo.reward_diamond);
                QGameData.instance.playResFlyAni(this.scene.box_diamond,null,{type: 2,countType: 0},null);
            }
            if (this.add_g == true) {
                QMergeData.instance.addGameGold(newinfo.level_up_reward + "");
                QGameData.instance.playResFlyAni(this.scene.box_gold,null,{type: 1,countType: 0},null);
            }
            QSoundMgr.instance.playSfx(QSoundMgr.instance.soundInfo_wav.siginGetDiamond);
            QUIMgr.instance.removeUI(QUIMgr.UI_LevelUp);
        }
    }
}
export default game.view.QLevelUpView;