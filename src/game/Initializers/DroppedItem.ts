import {Game} from "../Game";
import {Item} from "../Player/Items/Item";
import {BounceAnimation} from "../Animations/BounceAnimation";
import {TooltipMesh} from "../GUI/Tooltips/TooltipMesh";
import {DroppedItem as DroppedItemParticles} from "../Particles/DroppedItem";
import * as BABYLON from 'babylonjs';
import {GoToMeshAndRunAction} from "../Actions/GoToMeshAndRunAction";

export class DroppedItem {

    private itemSpriteManager: BABYLON.SpriteManager;
    private itemSprite: BABYLON.Sprite;
    private mesh: BABYLON.AbstractMesh;
    private tooltipMesh: TooltipMesh;
    private game: Game;
    private itemName: String;

    constructor(game: Game, item: Item, position: BABYLON.Vector3, itemDropKey: number) {
            let scene = game.getBabylonScene();

            let droppedItemBox = BABYLON.Mesh.CreateBox(item.name + '_Box', 3, scene, false);
            droppedItemBox.checkCollisions = false;
            droppedItemBox.visibility = 0;
            droppedItemBox.position.x = position.x;
            droppedItemBox.position.z = position.z;
            droppedItemBox.position.y = 1;

            let itemSpriteManager = new BABYLON.SpriteManager("playerManager",'assets/Miniatures/' + item.image + '.png', 1, {width: 512, height: 512}, scene);
            let itemSprite = new BABYLON.Sprite("player", itemSpriteManager);
            itemSprite.width = 1.8;
            itemSprite.height = 1.8;
            itemSprite.position.x = position.x;
            itemSprite.position.z = position.z;
            itemSprite.position.y = 4;
            itemSpriteManager.layerMask = 2;

            const animationBounce = BounceAnimation.getAnimation();
            //@ts-ignore
            itemSprite.animations.push(animationBounce);
            scene.beginAnimation(itemSprite, 0, 30, true);

            droppedItemBox.actionManager = new BABYLON.ActionManager(scene);
            droppedItemBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger,
                () => {
                    GoToMeshAndRunAction.execute(game, droppedItemBox, () => {
                        game.socketClient.socket.emit('addDroppedItem', itemDropKey);
                    });
                }));

            let particleSystem = new DroppedItemParticles(game, droppedItemBox);
            particleSystem.particleSystem.start();
            droppedItemBox.freezeWorldMatrix();

            this.tooltipMesh = new TooltipMesh(droppedItemBox, item.name);
            this.itemSprite = itemSprite;
            this.itemSpriteManager = itemSpriteManager;
            this.mesh = droppedItemBox;
            this.game = game;
            this.itemName = item.name;
        }

        public pickItem() {
            this.game.gui.playerLogsQuests.addText(this.itemName + '  has been picked up.', 'green');
            this.mesh.dispose();
            this.tooltipMesh.container.dispose();
            this.itemSprite.dispose();
            this.itemSpriteManager.dispose();
        }
    }
