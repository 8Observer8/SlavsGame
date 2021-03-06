import {Game} from "../Game";
import {Monster} from "../Characters/Monster";
import {GoToMeshAndRunAction} from "./GoToMeshAndRunAction";

export class AttackActions {

    private game: Game;
    private attackOnce: boolean;
    private attackedMonster: Monster;
    private checkAttackObserver;
    private intervalAttackRegisteredFunction;

    constructor(game: Game) {
        this.game = game;
    }

    public attackMonster(monster: Monster): void {
        let game = this.game;
        let self = this;

        if (!game.player.isAnySkillIsInUse()) {
            this.cancelCheckAttack();
            game.controller.attackPoint = monster.meshForMove;
            game.controller.targetPoint = null;
            this.attackOnce = false;
            this.attackedMonster = monster;

            GoToMeshAndRunAction.execute(game, monster.meshForMove, () => {
                game.player.runAnimationDeathOrStand();
                game.player.unregisterMoveWithCollision(true);
                self.checkAttackObserver = game.getBabylonScene().onBeforeRenderObservable.add(() => {
                    self.checkAttack(() => {
                        self.intervalAttackRegisteredFunction = setInterval(() => {
                            self.intervalAttackFunction();
                        }, 100);
                    });
                });
            });
        }
    }

    public abbadonMonsterAttack(): void {
        clearInterval(this.intervalAttackRegisteredFunction);
        this.cancelCheckAttack();
        this.game.controller.attackPoint = null;
    }

    public attackOnlyOnce(): void {
        this.attackOnce = true;
        clearInterval(this.intervalAttackRegisteredFunction);
    }

    public cancelCheckAttack(): void {
        this.game.getBabylonScene().onBeforeRenderObservable.remove(this.checkAttackObserver);
    }

    private intervalAttackFunction(): void {
        let game = this.game;
        if (!game.player.isAnySkillIsInUse()) {
            game.socketClient.socket.emit('attack', {
                attack: this.attackedMonster.id,
                targetPoint: this.attackedMonster.meshForMove.position,
                rotation: this.attackedMonster.meshForMove.rotation,
            });
        }
    }

    private checkAttack(actionAfterCheck: Function): void {
        let game = this.game;

        if (game.player.monstersToAttack[this.attackedMonster.id] == !undefined) {
            this.intervalAttackFunction();
            game.getBabylonScene().onBeforeRenderObservable.remove(this.checkAttackObserver);

            if(!this.attackOnce) {
                actionAfterCheck();
            }
        }

    }

}
