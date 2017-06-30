/// <reference path="Controller.ts"/>

class Mouse extends Controller {

    public registerControls(scene: BABYLON.Scene) {
        let self = this;
        var ball = BABYLON.Mesh.CreateSphere("sphere", 2, 0.25, scene);
        ball.isPickable = false;

        scene.onPointerDown = function (evt, pickResult) {
            if (self.game.player && pickResult.pickedMesh.name == 'Forest_ground') {
                targetPoint = pickResult.pickedPoint;
                targetPoint.y = 0;
                ball.position = targetPoint.clone();
                self.game.player.mesh.lookAt(ball.position);
            }
        };

        scene.registerBeforeRender(function () {
            if (self.game.player && targetPoint) {
                if (!self.game.player.mesh.intersectsPoint(targetPoint)) {
                    self.game.controller.forward = true;
                } else {
                    self.game.controller.forward = false;
                    targetPoint = null;
                }
            }
        });
    }



}