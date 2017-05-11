/// <reference path="/babylon/babylon.2.5.d.ts"/>
/// <reference path="Scene.ts"/>
/// <reference path="/src/game.ts"/>

class Simple extends Scene {

    constructor(game:Game, name:string) {
        super(game, name);

        BABYLON.SceneLoader.Load("", "assets/map/mapkaiso_lowpoly.babylon", game.engine, function (scene) {
            game.scene = scene;
            let assetsManager = new BABYLON.AssetsManager(scene);
            scene.executeWhenReady(function () {


                scene.debugLayer.show();
                ///1
                var dialogUser = new CASTORGUI.GUIPanel("Panel1", {w: 300, h: 50, x: 10, y: 20}, game.gui);
                dialogUser.setVisible(true);
                dialogUser.add(new CASTORGUI.GUIText("You", {size:15, text:"You", x: 10}, game.gui, true));
                var hpBar = new CASTORGUI.GUIProgress("hpbar_you", {w:280,h:20,x:10,y:20, value: 100}, game.gui);
                hpBar.setVisible(false);
                game.guiElements.hpBar = hpBar;
                dialogUser.add(hpBar);

                ///2
                var dialogEnemy = new CASTORGUI.GUIPanel("Panel2", {w: 300, h: 50, x: 10, y: 100}, game.gui);
                dialogEnemy.setVisible(true);
                dialogEnemy.add(new CASTORGUI.GUIText("Enemy", {size:15, text:"Enemy", x: 10}, game.gui, true));
                var hpBarEnemy = new CASTORGUI.GUIProgress("hpbar_enemy", {w:280,h:20,x:10,y:20, value: 100}, game.gui);
                hpBarEnemy.setVisible(false);
                game.guiElements.hpBarEnemy = hpBarEnemy;
                dialogEnemy.add(hpBarEnemy);

                //new CASTORGUI.GUIButton("gui.button.inventory", {x:15,y:35, value:"Inventory"}, game.gui, function() {
                //    console.log('inwentory');
                //    alert('Inwentory');
                //})


                var dialog = new CASTORGUI.GUIPanel("Panel", {w: 400, h: 100, x: 15, y: (game.gui.getCanvasSize().height - 110)}, game.gui);
                dialog.setVisible(true);
                dialog.add(new CASTORGUI.GUIText("textDialog", {size:15, text:"Chat"}, game.gui, true));

                var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, 0), scene);
                camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
                camera.orthoTop = 15;
                camera.orthoBottom = 0;
                camera.orthoLeft = -15;
                camera.orthoRight = 15;
                var ratio = window.innerWidth / window.innerHeight ;
                var zoom = camera.orthoTop;
                var newWidth = zoom * ratio;
                camera.orthoLeft = -Math.abs(newWidth);
                camera.orthoRight = newWidth;
                camera.orthoBottom = -Math.abs(zoom);
                scene.activeCamera = camera;

                scene.activeCamera.attachControl(game.canvas);

                scene.lights = scene.lights.slice(2);
                this.light = scene.lights[0];
                this.light.intensity = 2;
                game.shadowGenerator = new BABYLON.ShadowGenerator(2048, this.light);
                game.shadowGenerator.bias = -0.24;
                game.shadowGenerator.setDarkness(0.5);
                game.shadowGenerator.usePoissonSampling = true;
                game.shadowGenerator.useExponentialShadowMap = true;
                game.shadowGenerator.useBlurExponentialShadowMap = true;

                var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
                var physicsPlugin = new BABYLON.CannonJSPlugin();
                scene.enablePhysics(gravityVector, physicsPlugin);

                var shadowGenerator = game.shadowGenerator;

                for (var i = 0; i < scene.meshes.length; i++) {
                    var sceneMesh = scene.meshes[i];
                    var meshName = scene.meshes[i]['name'];

                    if (meshName == "Cone") {
                        var smokeParticlesA = new BABYLON.ParticleSystem("particles", 1000, scene);
                        smokeParticlesA.particleTexture = new BABYLON.Texture("/assets/Smoke3.png", scene);
                        smokeParticlesA.emitter = sceneMesh;
                        smokeParticlesA.minEmitBox = new BABYLON.Vector3(-0.5, 1, -0.5); // Starting all from
                        smokeParticlesA.maxEmitBox = new BABYLON.Vector3(0.5, 1, 0.5); // To...

                        smokeParticlesA.color1 = new BABYLON.Color4(0.05, 0.05, 0.05, 0.75);
                        smokeParticlesA.color2 = new BABYLON.Color4(0.15, 0.15, 0.15, 0.75);
                        smokeParticlesA.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);

                        smokeParticlesA.minSize = 1.0;
                        smokeParticlesA.maxSize = 2.0;

                        smokeParticlesA.minLifeTime = 0.4;
                        smokeParticlesA.maxLifeTime = 0.8;

                        smokeParticlesA.emitRate = 50;

                        // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
                        smokeParticlesA.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;

                        smokeParticlesA.gravity = new BABYLON.Vector3(0, 0, 0);

                        smokeParticlesA.direction1 = new BABYLON.Vector3(-1.5, 8, -1.5);
                        smokeParticlesA.direction2 = new BABYLON.Vector3(1.5, 8, 1.5);

                        smokeParticlesA.minAngularSpeed = -10.0;
                        smokeParticlesA.maxAngularSpeed = 10.0;

                        smokeParticlesA.minEmitPower = 0.5;
                        smokeParticlesA.maxEmitPower = 1.5;
                        smokeParticlesA.updateSpeed = 0.005;

                        smokeParticlesA.start();

                    }
                        if (meshName.search("ground") >= 0) {
                            sceneMesh.receiveShadows = true;

                            sceneMesh.physicsImpostor = new BABYLON.PhysicsImpostor(sceneMesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution:0 }, scene);

                        } else if (
                            meshName.search("Cylinder.004") >= 0 ||
                            meshName.search("Cylinder.005") >= 0 ||
                            meshName.search("Cylinder.007") >= 0 ||
                            meshName.search("Cylinder.008") >= 0 ||
                            meshName.search("Cylinder.010") >= 0 ||
                            meshName.search("Cylinder.003_") >= 0 ||
                            meshName.search("Cylinder.009") >= 0

                        ) {
                        sceneMesh.physicsImpostor = new BABYLON.PhysicsImpostor(sceneMesh, BABYLON.PhysicsImpostor.CylinderImpostor, { mass:0.2, restitution:0 }, scene);
                         } else {
                        shadowGenerator.getShadowMap().renderList.push(sceneMesh);
                        sceneMesh.physicsImpostor = new BABYLON.PhysicsImpostor(sceneMesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution:0.1 }, scene);
                        }

                    sceneMesh.receiveShadows = true;
                }

                new Items(assetsManager, game);
                new Characters(assetsManager, game);
                 //new Environment(assetsManager, game);


                //var ground = BABYLON.Mesh.CreateBox("ground2", 16, 16, 1, scene);
                //ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5 }, scene);

                assetsManager.load();
                let enemy = null;
                assetsManager.onFinish = function () {
                    game.client.connect('127.0.0.1:3003');
                    enemy = new Enemy(game);
                    window.addEventListener("keydown", function (event) {
                        game.controller.handleKeyUp(event);
                    });

                    window.addEventListener("keyup", function (event) {
                        game.controller.handleKeyDown(event);
                    }, false);
                };

                game.engine.runRenderLoop(() => {
                    scene.render();

                    if(game.player && enemy) {
                        enemy.character.mesh.lookAt(game.player.character.mesh.position);

                        if (game.player.character.items.weapon.intersectsMesh(enemy.character.mesh, false)) {
                            enemy.character.mesh.material.emissiveColor = new BABYLON.Color4(1, 0, 0, 1);
                            var value = game.guiElements.hpBarEnemy.getValue();
                            game.guiElements.hpBarEnemy.updateValue(value-1);

                        } else {
                            enemy.character.mesh.material.emissiveColor = new BABYLON.Color4(0, 0, 0, 0);
                        }

                        if (enemy.character.items.weapon.intersectsMesh(game.player.character.mesh, false)) {
                            console.log(game.guiElements);
                            game.player.character.mesh.material.emissiveColor = new BABYLON.Color4(1, 0, 0, 1);
                            var value = game.guiElements.hpBar.getValue();
                            game.guiElements.hpBar.updateValue(value-1);
                        } else {
                            game.player.character.mesh.material.emissiveColor = new BABYLON.Color4(0, 0, 0, 0);
                        }
                    }

                    if(game.guiElements.hpBarEnemy.getValue() <= 0) {
                        game.guiElements.hpBarEnemy.updateValue(100);
                    }
                    
                });

            });
        });

    }


}