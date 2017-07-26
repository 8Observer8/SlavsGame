/// <reference path="../Main.ts"/>
/// <reference path="../../../bower_components/babylonjs/dist/gui/babylon.gui.d.ts"/>
namespace GUI {
    export abstract class Popup {

        protected name: string;
        protected imageUrl: string;
        protected position: number;
        protected guiTexture: BABYLON.GUI.AdvancedDynamicTexture;
        protected guiMain: GUI.Main;
        protected container: BABYLON.GUI.StackPanel;
        protected containerBackground: BABYLON.GUI.Image;
        protected buttonClose: BABYLON.GUI.Control;

        constructor(guiMain: GUI.Main) {
            this.guiMain = guiMain;
        }

        /**
         * @returns {GUI.Popup}
         */
        protected initTexture() {
            this.guiTexture = this.guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('gui.' + this.name);

            let container = new BABYLON.GUI.StackPanel();
            container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            container.width = 0.33;
            container.height = 1;
            this.container = container;

            let image = new BABYLON.GUI.Image('gui.popup.image.'+this.name, this.imageUrl);
            image.horizontalAlignment = this.position;
            image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            image.width = 1;
            image.height = 1;

            this.guiMain.registerBlockMoveCharacter(image);
            this.container.addControl(image);
            this.containerBackground = image;

            return this;
        }

        public abstract open();

        public abstract close()

        public abstract initData();
    }
}