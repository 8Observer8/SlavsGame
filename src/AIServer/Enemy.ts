import * as BABYLON from "babylonjs";
import {Room} from "./Room";

export class Enemy {
    mesh: BABYLON.AbstractMesh;
    key: number;
    target: number;
    attack: boolean;
    activeObserver: BABYLON.Observer<any>;
    walkSpeed: number;
    visibilityAreaMesh: BABYLON.AbstractMesh;
    availableCharactersToAttack: boolean[];
    attackInterval;

    constructor(id: number, walkSpeed: number, position: BABYLON.Vector3, scene: BABYLON.Scene) {
        let box = BABYLON.Mesh.CreateBox(id.toString(), 3, scene, false);
        box.checkCollisions = false;
        box.position = position
        let visibilityArea = BABYLON.MeshBuilder.CreateBox('enemy_visivilityArea', {
            width: 30,
            height: 1,
            size: 30
        }, scene);
        visibilityArea.visibility = 0.5;
        visibilityArea.parent = box;

        this.mesh = box;
        this.visibilityAreaMesh = visibilityArea;
        this.key = id;
        this.attack = false;
        this.target = null;
        this.availableCharactersToAttack = [];
        this.walkSpeed = walkSpeed;
        this.attackInterval = null;
    }

    public clearActiveTarget(room: Room) {
        console.log('BABYLON: unregister observer and interval for enemy - ' + this.key);
        room.scene.onBeforeRenderObservable.remove(this.activeObserver);
        clearInterval(this.attackInterval);
        this.mesh.dispose();
    }
}
