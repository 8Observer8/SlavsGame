/// <reference path="game.ts"/>
/// <reference path="characters/monsters/monster.ts"/>

class SocketIOClient {
    protected game:Game;
    public socket;
    public characters = [];
    public activePlayer = Number;

    constructor(game:Game) {
        this.game = game;
    }

    public connect(socketUrl:string) {
        this.socket = io.connect(socketUrl);

        this.playerConnected();
    }

    /**
     * @returns {SocketIOClient}
     */
    public playerConnected() {
        let self = this;
        let game = this.game;

        this.socket.on('clientConnected', function (data) {
            game.remotePlayers = [];
            self.characters = data.characters;
            self
                .updatePlayers()
                .removePlayer()
                .connectPlayer()
                .refreshPlayer()
                .refreshPlayerEquip()
                .refreshEnemyEquip()
                .showDroppedItem()
                .showPlayerQuests()
                .refreshPlayerQuests()
                .addExperience()
                .newLvl()
                .attributeAdded()
                .skillsLearned();
        });

        return this;
    }

    /**
     * @returns {SocketIOClient}
     */
    protected addExperience() {
        let game = this.game;
        this.socket.on('addExperience', function (data) {
            game.player.addExperience(data.experience);
            game.gui.playerLogsPanel.addText('Earned ' + data.experience + ' experience.', 'yellow');

        });

        return this;
    }

    /**
     * @returns {SocketIOClient}
     */
    protected attributeAdded() {
        let game = this.game;
        let self = this;
        this.socket.on('attributeAdded', function (data) {
            self.characters = data.characters;
            game.player.freeAttributesPoints = self.characters[self.activePlayer].freeAttributesPoints;
            let attributes = self.characters[self.activePlayer].attributes;
            game.player.setCharacterStatistics(attributes);

            game.gui.attributes.refreshPopup();
        });

        return this;
    }

    /**
     * @returns {SocketIOClient}
     */
    protected skillsLearned() {
        let game = this.game;
        let self = this;
        this.socket.on('skillLearned', function (data) {
            self.characters = data.characters;
            game.player.freeSkillPoints = self.characters[self.activePlayer].freeSkillPoints;
            game.player.setCharacterSkills(self.characters[self.activePlayer].skills);

            game.gui.skills.refreshPopup();
        });

        return this;
    }

    /**
     * @returns {SocketIOClient}
     */
    protected newLvl() {
        let self = this;
        let game = this.game;
        this.socket.on('newLvl', function (data) {
            game.player.freeAttributesPoints = data.freeAttributesPoints;
            game.gui.attributes.refreshPopup();

            game.player.setNewLvl();
        });

        return this;
    }

    /**
     * @returns {SocketIOClient}
     */
    protected showPlayerQuests() {
        let game = this.game;
        let questManager = new Quests.QuestManager(game);
        this.socket.on('quests', function (data) {
            game.quests = [];

            let questPromise = new Promise(function (resolve, reject) {
                data.quests.forEach(function (quest, key) {
                    if (quest) {
                        let questObject = questManager.transformQuestDatabaseDataToObject(quest);
                        data.playerQuests.forEach(function (playerQuest, key) {
                            if (playerQuest.questId == quest.questId) {
                                questObject.isActive = true;
                            }

                        });

                        game.quests.push(questObject);
                    }
                    resolve();
                });

            });

            questPromise.then(function () {
                document.dispatchEvent(game.events.questsReceived);
            });

        });

        return this;
    }

    protected refreshPlayerQuests() {
        let game = this.game;
        this.socket.on('refreshQuestsStatus', function (quest) {
            for (let gameQuest of game.quests) {
                if (gameQuest.getQuestId() == quest.questId) {
                    gameQuest.isActive = true;
                    for (let npc of game.npcs) {
                        npc.refreshTooltipColor();
                    }

                }
            }
        });

        return this;
    }

    /**
     * @returns {SocketIOClient}
     */
    protected refreshPlayer() {
        let game = this.game;
        let self = this;
        let playerName = Game.randomNumber(1, 100);

        this.socket.on('showPlayer', function (data) {
            self.activePlayer = data.activePlayer;
            let activeCharacter = self.characters[self.activePlayer];

            game.player = new Player(game, data.id, playerName, true, activeCharacter);
            game.player.setItems(activeCharacter.items);
            let activeCharacter = data.characters[data.activePlayer];
            game.player.mesh.position = new BABYLON.Vector3(activeCharacter.positionX, activeCharacter.positionY, activeCharacter.positionZ);
            game.player.refreshCameraPosition();
            document.dispatchEvent(game.events.playerConnected);

            let octree = game.sceneManager.octree;
            if (octree) {
                octree.dynamicContent.push(game.player.mesh);
                octree.dynamicContent.push(game.player.attackArea);
                octree.dynamicContent.push(game.controller.ball);
                game.player.inventory.getEquipedItems().forEach(function (item) {
                    if (item) {
                        game.sceneManager.octree.dynamicContent.push(item.mesh);
                    }
                });
            }
        });

        return this;
    }

    /**
     * @returns {SocketIOClient}
     */
    protected refreshEnemyEquip() {
        let game = this.game;
        let self = this;

        this.socket.on('updateEnemyEquip', function (playerUpdated) {
            if (game.player) {
                self.game.remotePlayers.forEach(function (socketRemotePlayer) {
                    if (playerUpdated.id == socketRemotePlayer.id) {
                        socketRemotePlayer.setItems(playerUpdated.characters[playerUpdated.activePlayer].items);
                    }
                });
            }
        });

        return this;
    }

    /**
     * @returns {SocketIOClient}
     */
    protected refreshPlayerEquip() {
        let game = this.game;

        this.socket.on('updatePlayerEquip', function (items) {
            game.player.removeItems();
            game.player.setItems(items);
            if (game.gui.inventory.opened) {
                game.gui.inventory.refreshPopup();
            }
        });

        return this;
    }

    /**
     * @returns {SocketIOClient}
     */
    protected showDroppedItem() {
        let game = this.game;
        this.socket.on('showDroppedItem', function (data) {
            let itemManager = new Items.ItemManager(game);
            let item = itemManager.getItemUsingId(data.items, null);
            let enemy = game.enemies[data.enemyId];
            Items.DroppedItem.showItem(game, item, enemy, data.itemsKey);
        });

        return this;
    }

    /**
     * @returns {SocketIOClient}
     */
    public showEnemies() {
        let game = this.game;

        this.socket.on('showEnemies', function (data) {
            data.forEach(function (enemyData, key) {
                let position = new BABYLON.Vector3(enemyData.position.x, enemyData.position.y, enemyData.position.z);
                let rotationQuaternion = new BABYLON.Quaternion(enemyData.rotation.x, enemyData.rotation.y, enemyData.rotation.z, enemyData.rotation.w);
                let enemy = game.enemies[key];

                if (enemy) {
                    enemy.target = enemyData.target;
                    enemy.mesh.position = position;
                    enemy.mesh.rotationQuaternion = rotationQuaternion;
                    enemy.runAnimationWalk(false);
                } else {
                    let newMonster;
                    if (enemyData.type == 'worm') {
                        newMonster = new Worm(key, data.id, game, position, rotationQuaternion);
                    } else if (enemyData.type == 'bigWorm') {
                        newMonster = new BigWorm(key, data.id, game, position, rotationQuaternion);
                    } else if (enemyData.type == 'bandit') {
                        newMonster = new Bandit.Bandit(key, game, position, rotationQuaternion);
                    }
                    if (newMonster) {
                        if (game.sceneManager.octree) {
                            game.sceneManager.octree.dynamicContent.push(newMonster.mesh);
                            game.sceneManager.octree.dynamicContent.push(newMonster.attackArea);
                            game.sceneManager.octree.dynamicContent.push(newMonster.visibilityArea);
                        }
                    }
                }
            });
        });

        return this;
    }

    protected connectPlayer() {
        let game = this.game;

        this.socket.on('newPlayerConnected', function (data) {
            if (game.player) {
                data.forEach(function (socketRemotePlayer) {
                    let remotePlayerKey = null;

                    if (socketRemotePlayer.id !== game.player.id) {
                        game.remotePlayers.forEach(function (remotePlayer, key) {
                            if (remotePlayer.id == socketRemotePlayer.id) {
                                remotePlayerKey = key;

                                return;
                            }
                        });

                        if (remotePlayerKey === null) {
                            let activePlayer = socketRemotePlayer.characters[socketRemotePlayer.activePlayer];
                            let player = new Player(game, socketRemotePlayer.id, socketRemotePlayer.name, false);
                            player.mesh.position = new BABYLON.Vector3(activePlayer.positionX, activePlayer.positionY, activePlayer.positionZ);
                            player.setItems(activePlayer.items);

                            game.remotePlayers.push(player);
                        }
                    }
                });
            }
        });

        return this;
    }

    /**
     * @returns {SocketIOClient}
     */
    protected updatePlayers() {
        var game = this.game;
        let activeTargetPoints = [];
        this.socket.on('updatePlayer', function (updatedPlayer) {
            let remotePlayerKey = null;
            let player = null;
            game.remotePlayers.forEach(function (remotePlayer, key) {
                if (remotePlayer.id == updatedPlayer.id) {
                    remotePlayerKey = key;
                    return;
                }
            });
            if (remotePlayerKey == null) {
                player = game.player;
                remotePlayerKey = -1;
            } else {
                player = game.remotePlayers[remotePlayerKey];
            }

            if (updatedPlayer.attack == true) {
                let mesh = player.mesh;
                let targetPoint = updatedPlayer.targetPoint;
                if (targetPoint) {
                    let targetPointVector3 = new BABYLON.Vector3(targetPoint.x, 0, targetPoint.z);
                    mesh.lookAt(targetPointVector3);
                }
                player.runAnimationHit(AbstractCharacter.ANIMATION_ATTACK, null, null);
                return;
            }
            if (activeTargetPoints[remotePlayerKey] !== undefined) {
                self.game.getScene().unregisterBeforeRender(activeTargetPoints[remotePlayerKey]);
            }

            if (updatedPlayer.targetPoint) {
                let mesh = player.mesh;
                let targetPoint = updatedPlayer.targetPoint;
                let targetPointVector3 = new BABYLON.Vector3(targetPoint.x, 0, targetPoint.z);
                mesh.lookAt(targetPointVector3);

                activeTargetPoints[remotePlayerKey] = function () {
                    if (player.mesh.intersectsPoint(targetPointVector3)) {
                        self.game.getScene().unregisterBeforeRender(activeTargetPoints[remotePlayerKey]);
                        if(player.isControllable) {
                            game.controller.targetPoint = null;
                            game.controller.ball.visibility = 0;
                        }

                        if (player.animation) {
                            player.animation.stop();
                        }

                    } else {
                        let rotation = mesh.rotation;
                        if (mesh.rotationQuaternion) {
                            rotation = mesh.rotationQuaternion.toEulerAngles();
                        }
                        rotation.negate();
                        let forwards = new BABYLON.Vector3(-parseFloat(Math.sin(rotation.y)) / player.getWalkSpeed(), 0, -parseFloat(Math.cos(rotation.y)) / player.getWalkSpeed());
                        mesh.moveWithCollisions(forwards);
                        mesh.position.y = 0;

                        player.runAnimationWalk(false);
                    }

                }

                self.game.getScene().registerBeforeRender(activeTargetPoints[remotePlayerKey]);
            }


        });

        this.socket.on('updatePlayerPosition', function (updatedPlayer) {
            let remotePlayerKey = null;
            game.remotePlayers.forEach(function (remotePlayer, key) {
                if (remotePlayer.id == updatedPlayer.id) {
                    remotePlayerKey = key;
                    return;
                }
            });

            if (remotePlayerKey != null) {
                let player = game.remotePlayers[remotePlayerKey];

                player.mesh.position = new BABYLON.Vector3(updatedPlayer.p.x, updatedPlayer.p.y, updatedPlayer.p.z);
                player.mesh.rotationQuaternion = new BABYLON.Quaternion(updatedPlayer.r.x, updatedPlayer.r.y, updatedPlayer.r.z, updatedPlayer.r.w);
            }
        });

        return this;
    }

    /**
     *
     * @returns {SocketIOClient}
     */
    protected removePlayer() {
        var app = this.game;

        this.socket.on('removePlayer', function (id) {
            app.remotePlayers.forEach(function (remotePlayer, key) {
                if (remotePlayer.id == id) {
                    let player = app.remotePlayers[key];
                    player.removeFromWorld();
                    app.remotePlayers.splice(key, 1);
                }
            });
        });

        return this;
    }


}