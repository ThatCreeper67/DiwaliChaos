// HomeScene.js - Level 3: Home Infiltration: Operation Mummy's Kitchen (Data-Driven via MapLoader)
import { Player } from '../entities/Player.js';
import { Mother } from '../entities/Mother.js';
import { HUD } from '../ui/HUD.js';
import { DialogueManager } from '../systems/DialogueManager.js';
import { soundManager } from '../systems/SoundSystem.js';
import { SaveManager } from '../systems/SaveManager.js';
import { globalTimer } from '../systems/TimerManager.js';
import { inventory } from '../systems/InventoryManager.js';
import { MapLoader } from '../maps/MapLoader.js';
import { HomeMapData } from '../maps/data/HomeMapData.js';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('HomeScene');
  }

  create() {
    soundManager.playMusic('home');

    // 1. Load Data-Driven Map
    const loader = new MapLoader(this);
    this.mapInstance = loader.loadMap(HomeMapData);
    this.walls = this.mapInstance.collisionGroup;
    this.coverObstacles = this.mapInstance.visionObstacles;
    this.interactables = this.mapInstance.interactables;

    // State machine for mission sequence
    this.hasKey = false;
    this.hasBombs = false;
    this.triedMainDoor = false;

    // Doors from map
    this.mainEntrance = this.mapInstance.namedObjects.get('main_entrance_door');
    this.backdoor = this.mapInstance.namedObjects.get('kitchen_backdoor');

    // 2. Spawn Player
    const spawn = this.mapInstance.playerSpawn;
    this.player = new Player(this, spawn.x, spawn.y);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.physics.add.collider(this.player, this.walls);

    // 3. Mother AI from map NPC definition
    const motherConfig = this.mapInstance.npcConfigs.find(n => n.type === 'Mother') || {
      spawn: { x: 740, y: 160 },
      patrolWaypoints: [
        { x: 740, y: 160 },
        { x: 580, y: 220 },
        { x: 380, y: 320 },
        { x: 680, y: 320 },
        { x: 500, y: 440 }
      ]
    };
    this.mother = new Mother(this, motherConfig.spawn.x, motherConfig.spawn.y, motherConfig.patrolWaypoints);
    this.physics.add.collider(this.mother, this.walls);

    // 4. Collectibles handling
    this.mapInstance.collectibleSprites.forEach(item => {
      if (item.collectibleType === 'key') {
        this.keySprite = item;
      }
      this.physics.add.overlap(this.player, item, () => {
        if (item.collectibleType === 'laddoo') {
          soundManager.playLaddooPickup();
          inventory.addLaddoo(item.collectibleCount || 1);
          this.hud.showPopupMessage(`+${item.collectibleCount || 1} LADDOO!`, '#ffd700');
          this.hud.updateHUD();
          item.destroy();
        }
      });
    });

    // 5. Wire Custom Interaction Handlers
    this.interactables.forEach(item => {
      if (item.actionType === 'main_door') {
        item.action = () => this.tryMainDoor();
      } else if (item.actionType === 'backdoor') {
        item.action = () => this.tryBackdoor();
      } else if (item.actionType === 'storage_box') {
        item.action = () => this.interactStorageBox();
      }
    });

    // Key pickup interactable
    this.interactables.push({
      id: 'key_pickup',
      x: 140,
      y: 100,
      radius: 45,
      prompt: '[E] Pick up Brass Key',
      action: () => this.collectKey()
    });

    // 6. HUD & Dialogue Manager
    this.hud = new HUD(this);
    this.dialogue = new DialogueManager(this);
    this.hud.setObjective('Find the Key in the Bedroom to unlock kitchen storage!');

    this.input.keyboard.on('keydown-E', () => {
      if (!this.dialogue.isActive()) {
        this.checkInteractions();
      }
    });

    this.time.delayedCall(600, () => {
      this.hud.showPopupMessage('TIP: Use walls & furniture as natural cover from Mummy!', '#ffd700', 4000);
    });
  }

  collectKey() {
    if (this.hasKey) return;
    this.hasKey = true;
    inventory.hasKitchenKey = true;
    soundManager.playUnlockDoor();

    if (this.keySprite && this.keySprite.active) {
      this.keySprite.destroy();
    }
    this.hud.setObjective('Key Acquired! Sneak into the Kitchen and unlock the Storage Box!');
    this.hud.showPopupMessage('KITCHEN KEY ACQUIRED!', '#ffd700', 3000);
  }

  interactStorageBox() {
    if (this.hasBombs) {
      this.hud.showPopupMessage('Storage box is empty!');
      return;
    }

    if (!this.hasKey) {
      this.hud.showPopupMessage('Locked! Needs the brass key from bedroom!', '#ff5252', 2500);
      return;
    }

    // Unlock box and collect 15 Sutli bombs!
    this.hasBombs = true;
    inventory.addSutliBombs(15);
    soundManager.playObjectiveComplete();

    this.hud.showPopupMessage('15 SUTLI BOMBS ACQUIRED!', '#76ff03', 4000);
    this.hud.updateHUD();
    this.hud.setObjective('Escape the house! Try the Main Entrance!');
  }

  tryMainDoor() {
    if (!this.hasBombs) {
      this.hud.showPopupMessage('Cannot leave empty handed! Find the Sutli bombs first!');
      return;
    }

    if (!this.triedMainDoor) {
      this.triedMainDoor = true;
      soundManager.playAlert();

      // Door is locked from outside
      this.hud.showPopupMessage('LOCKED! Papa locked the front door from outside!', '#ff5252', 3500);
      this.hud.setObjective('Front door locked! Escape through the Kitchen BACKDOOR!');

      // Highlight kitchen backdoor
      if (this.backdoor) {
        this.backdoor.setTexture('obj_door_open');
        this.tweens.add({
          targets: this.backdoor,
          alpha: 0.5,
          duration: 400,
          yoyo: true,
          repeat: -1
        });
      }
    } else {
      this.hud.showPopupMessage('Front door is locked! Head to the Kitchen BACKDOOR!');
    }
  }

  tryBackdoor() {
    if (!this.hasBombs) {
      this.hud.showPopupMessage('Collect the 15 Sutli bombs before escaping!');
      return;
    }

    // Success! Escape through backdoor
    this.player.canMove = false;
    this.player.setVelocity(0, 0);
    soundManager.playObjectiveComplete();

    this.hud.showPopupMessage('ESCAPED TO BACKDOOR ALLEY!', '#ffd700', 2500);

    // Auto-save checkpoint
    SaveManager.saveGame('MazeScene', inventory.exportState(), globalTimer.getElapsedMs());

    this.time.delayedCall(1200, () => {
      this.cameras.main.fade(400, 0, 0, 0, false, (cam, progress) => {
        if (progress === 1) {
          this.scene.start('MazeScene');
        }
      });
    });
  }

  handlePlayerCaught(message) {
    this.player.canMove = false;
    this.player.setVelocity(0, 0);

    this.dialogue.startDialogue([
      {
        speaker: 'MUMMY',
        portrait: 'portrait_mother',
        text: message
      }
    ], () => {
      this.scene.restart();
    });
  }

  checkInteractions() {
    for (const item of this.interactables) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y);
      if (dist <= item.radius && item.action) {
        item.action();
        return;
      }
    }
  }

  update(time, delta) {
    this.player.update(time, delta);
    this.hud.updateHUD();

    if (this.mother && this.mother.active) {
      this.mother.update(time, delta, this.player, this.coverObstacles);
    }

    let nearPrompt = null;
    for (const item of this.interactables) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y);
      if (dist <= item.radius) {
        nearPrompt = item.prompt;
        break;
      }
    }

    if (nearPrompt && !this.dialogue.isActive()) {
      this.hud.showPrompt(nearPrompt);
    } else {
      this.hud.hidePrompt();
    }
  }
}
