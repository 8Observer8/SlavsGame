import {Game} from "../Game";
import {TooltipMesh} from "../GUI/Tooltips/TooltipMesh";
import {GoToMeshAndRunAction} from "../Actions/GoToMeshAndRunAction";
import {DroppedItem} from "../Particles/DroppedItem";
import * as BABYLON from 'babylonjs';

export class RandomSpecialItem {

    public mesh: BABYLON.AbstractMesh;
    public tooltip: TooltipMesh;

    /**
     *
     * @param {Game} game
     * @param randomSpecialItemData
     * @param randomSpecialItemKey
     */
    constructor(game: Game, randomSpecialItemData, randomSpecialItemKey) {
        let scene = game.getBabylonScene();
        let tooltip;
        let position = randomSpecialItemData.position;
        let randomItemMesh = game.getSceneManger().assets.natureGrain.createClone(randomSpecialItemData.specialItem.meshName);

        randomItemMesh.position = new BABYLON.Vector3(position.x, position.y, position.z);
        randomItemMesh.isPickable = true;

        let particleSystem = new DroppedItem(game, randomItemMesh);
        particleSystem.particleSystem.start();

        this.mesh = randomItemMesh;
        this.mesh.actionManager = new BABYLON.ActionManager(scene);
        this.tooltip = new TooltipMesh(randomItemMesh, randomSpecialItemData.specialItem.name);
        this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            function () {
                GoToMeshAndRunAction.execute(game, randomItemMesh, () => {
                    game.socketClient.socket.emit('pickRandomItem', randomSpecialItemKey);
                });
            })
        );

    }

}
