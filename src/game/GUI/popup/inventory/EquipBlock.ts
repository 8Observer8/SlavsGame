import {Inventory} from "../Inventory";
import {Item} from "../../../Player/Items/Item";
import {TooltipHelper} from "../../Tooltips/TooltipHelper";
import {Control, Rectangle, Image} from 'babylonjs-gui';

export abstract class EquipBlock {
    protected inventory: Inventory;

    protected item: Item;
    protected blockWidth: string;
    protected blockHeight: string;
    protected blockTop: string;
    protected blockLeft: string;
    protected verticalAlignment: number;

    public block: Rectangle;
    public image: Image;

    constructor(inventory: Inventory) {
        this.inventory = inventory;
    }

    protected createBlockWithImage() {
        if (this.item) {
            let panelItem = new Rectangle();
            panelItem.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            panelItem.verticalAlignment = this.verticalAlignment;
            panelItem.thickness = 0;
            panelItem.width = this.blockWidth;
            panelItem.height = this.blockHeight;
            panelItem.top = this.blockTop;
            panelItem.left = this.blockLeft;
            panelItem.isPointerBlocker = true;

            this.inventory.container.addControl(panelItem);
            this.block = panelItem;
            this.createImage();

            let blockWidth = this.blockWidth;
            let blockHeight = this.blockHeight;
            let blockTop = this.blockTop;
            let blockLeft = this.blockLeft;
            panelItem.width = blockWidth;
            panelItem.height = blockHeight;
            panelItem.top = blockTop;
            panelItem.left = blockLeft;
        }
        return this;
    }

    protected createImage() {
        let self = this;
        let item = this.item;

        if (item.statistics) {
            let image = this.inventory.createItemImage(item);
            TooltipHelper.createTooltipOnInventoryItemButton(self.inventory.guiTexture, item, image, function () {
                self.inventory.guiMain.game.player.inventory.emitEquip(self.item);
                self.inventory.guiTexture.removeControl(self.block);
                self.inventory.showItems();
                self.inventory.guiMain.attributes.refreshPopup();
            });

            this.block.addControl(image);
        }

        return this;
    }

}
