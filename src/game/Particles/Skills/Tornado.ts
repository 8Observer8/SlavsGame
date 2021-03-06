import {AbstractParticle} from "../AbstractParticle";
import * as BABYLON from 'babylonjs';

export class Tornado extends AbstractParticle {

    initParticleSystem() {
        let box = BABYLON.MeshBuilder.CreateBox("bx0", {size: 1}, this.game.getBabylonScene());
        box.visibility = 0;
        box.scaling = new BABYLON.Vector3(1, 1, 1);
        box.position = new BABYLON.Vector3(0, 0, 0);
        box.parent = this.emitter;

        box.attachToBone(this.emitter.skeleton.bones[13], this.emitter);

        let fireSystem = new BABYLON.ParticleSystem("particles", 1000, this.game.getBabylonScene());
        fireSystem.particleTexture = new BABYLON.Texture("assets/flare.png", this.game.getBabylonScene());
        fireSystem.emitter = box;
        fireSystem.minSize = 1;
        fireSystem.maxSize = 1.5;
        fireSystem.minEmitPower = 1;
        fireSystem.maxEmitPower = 1;
        fireSystem.minLifeTime = 0.2;
        fireSystem.maxLifeTime = 0.2;
        fireSystem.emitRate = 150;
        fireSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        fireSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0);
        fireSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
        fireSystem.gravity = new BABYLON.Vector3(0, -25, 0);
        fireSystem.direction1 = new BABYLON.Vector3(0, 0, 0);
        fireSystem.direction2 = new BABYLON.Vector3(0, 0, 0);
        fireSystem.color1 = new BABYLON.Color4(1, 1, 1, 1);
        fireSystem.color2 = new BABYLON.Color4(1, 1, 1, 1);
        fireSystem.updateSpeed = 0.01;

        this.particleSystem = fireSystem;
    }
}
