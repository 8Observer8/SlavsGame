/// <reference path="../Main.ts"/>
/// <reference path="../../../bower_components/babylonjs/dist/gui/babylon.gui.d.ts"/>
namespace GUI {
    export abstract class Popup {

        protected name: string;
        protected imageUrl: string;
        protected position: number;
        protected guiTexture: BABYLON.GUI.AdvancedDynamicTexture;
        protected guiMain: GUI.Main;
        protected container: BABYLON.GUI.Image;
        protected buttonClose: BABYLON.GUI.Control;

        constructor(guiMain: GUI.Main) {
            this.guiMain = guiMain;
        }

        /**
         * @returns {GUI.Popup}
         */
        protected initTexture() {
            this.guiTexture = this.guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('gui.' + this.name);

            let image = new BABYLON.GUI.Image('gui.popup.image.'+this.name, this.imageUrl);
            image.horizontalAlignment = this.position;
            image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            image.width = 0.33;
            image.height = 1;

            this.guiMain.registerBlockMoveCharacter(image);

            this.container = image;

            return this;
        }

        public abstract open();

        public abstract close()

        public abstract initData();
    }
}