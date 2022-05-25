import FZBaseUI from "../core/FZBaseUI";
import { ui } from "../../ui/layaMaxUI";
import FZCfgManager from "../core/FZCfgManager";
import FZGameStatus from "../data/FZGameStatus";
import FZUtils from "../../framework/FZUtils";
import FZMergeDateManager from "../data/FZMergeDateManager";
import FZUIManager from "../core/FZUIManager";
import FZSoundManager from "../core/FZSoundManager";
import FZGameData from "../data/FZGameData";

namespace game.view
{
    export class FZLevelUpUI extends FZBaseUI
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
            FZUtils.doUIPopAnim(this.scene.AnchorCenter);
            var count = 0;
            var __index = 0;
            var level =  FZMergeDateManager.instance.getUserLevel();
            this.scene.lab_level.text = level;
            FZUIManager.instance.RegisterBtnClickWithAnim(this.scene.btnConfirm, this, this.onClickBtnConfirm, ["btnConfirm"]);

            this.scene.ani1.play(0,true);

            var newinfo = FZCfgManager.instance.getLevelInfo(level);
            if (newinfo.max_plane > FZMergeDateManager.instance.getGameCarSlot()){
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
                    this.scene.lab_gold_count.text = "x"+ FZUtils.formatNumberStr(newinfo.level_up_reward+"");
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
                    this.scene.lab_gold_count.text = "x"+ FZUtils.formatNumberStr(newinfo.level_up_reward+"");
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
                        this.scene.lab_gold_count.text = "x"+ FZUtils.formatNumberStr(newinfo.level_up_reward+"");
                        this.add_g = true;
                    }
                }
            }            
        }

        private onClickBtnConfirm():void
        {
            var level =  FZMergeDateManager.instance.getUserLevel();
            this.scene.lab_level.text  = level;
            var newinfo = FZCfgManager.instance.getLevelInfo(level);
            if(this.add_cord == true) {
                FZMergeDateManager.instance.addGameCarSlot();
            }
            if (this.add_d == true) {
                FZMergeDateManager.instance.addGameDiamond(newinfo.reward_diamond);
                FZGameData.instance.playResFlyAni(this.scene.box_diamond,null,{type: 2,countType: 0},null);
            }
            if (this.add_g == true) {
                FZMergeDateManager.instance.addGameGold(newinfo.level_up_reward + "");
                FZGameData.instance.playResFlyAni(this.scene.box_gold,null,{type: 1,countType: 0},null);
            }
            FZSoundManager.instance.playSfx(FZSoundManager.instance.soundInfo_wav.siginGetDiamond);
            FZUIManager.instance.removeUI(FZUIManager.UI_LevelUp);
        }
    }
}
export default game.view.FZLevelUpUI;