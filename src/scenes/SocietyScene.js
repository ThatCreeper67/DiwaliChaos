// SocietyScene.js - Level 2: Society: Operation Laddoo Collection (Data-Driven via MapLoader)
import { Player } from '../entities/Player.js';
import { HUD } from '../ui/HUD.js';
import { DialogueManager } from '../systems/DialogueManager.js';
import { soundManager } from '../systems/SoundSystem.js';
import { SaveManager } from '../systems/SaveManager.js';
import { globalTimer } from '../systems/TimerManager.js';
import { inventory } from '../systems/InventoryManager.js';
import { MapLoader } from '../maps/MapLoader.js';
import { SocietyMapData } from '../maps/data/SocietyMapData.js';

export class SocietyScene extends Phaser.Scene {
  constructor() {
    super('SocietyScene');
  }

  create() {
    soundManager.playMusic('society');

    // 1. Load Data-Driven Map
    const loader = new MapLoader(this);
    this.mapInstance = loader.loadMap(SocietyMapData);
    this.obstacles = this.mapInstance.collisionGroup;
    this.interactables = this.mapInstance.interactables;
    this.targetLaddoos = inventory.requiredSocietyLaddoos; // 10

    // Reference to home door
    this.homeDoor = this.mapInstance.namedObjects.get('home_door');
    this.homeUnlocked = false;

    // 2. Spawn Player
    const spawn = this.mapInstance.playerSpawn;
    this.player = new Player(this, spawn.x, spawn.y);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.physics.add.collider(this.player, this.obstacles);

    // 3. Collectibles Handling
    this.mapInstance.collectibleSprites.forEach(item => {
      this.physics.add.overlap(this.player, item, () => {
        soundManager.playLaddooPickup();
        const amt = item.collectibleCount || 1;
        inventory.addLaddoo(amt);
        this.hud.showPopupMessage(`+${amt} ${item.collectibleType === 'laddoo_box' ? 'LADDOO BOX' : 'LADDOO'}!`, '#ffd700');
        this.updateObjectiveText();
        this.hud.updateHUD();
        item.destroy();
      });
    });

    // 4. Setup Aunties & Vendors
    this.setupAuntyHouse(180, 230, 'aunty_pink', 'AUNTY VERMA', [
      {
        speaker: 'AUNTY VERMA',
        portrait: 'portrait_player',
        text: 'Arre Chintu beta! Happy Diwali! Yeh lo taaza Besan ke Laddoo khao!'
      },
      {
        speaker: 'AUNTY VERMA',
        portrait: 'portrait_player',
        text: 'Beta, tumhare parents ko pata hai tum yahan akele ghoom rahe ho?'
      },
      {
        speaker: 'CHINTU',
        portrait: 'portrait_player',
        text: 'Haan Aunty, society project ke liye survey kar raha hoon! Thank you!'
      }
    ], 3);

    this.setupAuntyHouse(520, 230, 'aunty_cyan', 'AUNTY GUPTA', [
      {
        speaker: 'AUNTY GUPTA',
        portrait: 'portrait_player',
        text: 'Chintu! Sharma Ji subah se round laga rahe hain, keh rahe hain cracker bursting banned hai!'
      },
      {
        speaker: 'AUNTY GUPTA',
        portrait: 'portrait_player',
        text: 'Society rules ke according, laddoo distribution requires permission... par tum mere favorite ho, yeh lo Motichoor!'
      }
    ], 3);

    this.setupVendor(1150, 460, 'HALWAI VENDOR', [
      {
        speaker: 'SWEET VENDOR',
        portrait: 'portrait_shopkeeper',
        text: 'Shuddh Desi Ghee ke laddoos! 2 box tumhare liye beta!'
      }
    ], 2);

    // 5. HUD & Dialogue Manager
    this.hud = new HUD(this);
    this.dialogue = new DialogueManager(this);
    this.updateObjectiveText();

    // Contextual interaction key
    this.input.keyboard.on('keydown-E', () => {
      if (!this.dialogue.isActive()) {
        this.checkInteractions();
      }
    });

    // Society welcome dialogue
    this.time.delayedCall(500, () => {
      this.hud.showPopupMessage('GOKULDHAM RESIDENCY - OPERATION LADDOO', '#ffd700', 3000);
    });
  }

  updateObjectiveText() {
    const remaining = Math.max(0, this.targetLaddoos - inventory.totalLaddoosCollected);
    if (remaining > 0) {
      this.hud.setObjective(`Collect Laddoos for society festival: ${inventory.totalLaddoosCollected} / ${this.targetLaddoos}`);
    } else {
      this.hud.setObjective('Goal Met! Go to YOUR HOUSE door to infiltrate kitchen!');
      this.unlockPlayerHome();
    }
  }

  setupAuntyHouse(x, y, spriteKey, auntyName, script, laddooReward) {
    this.add.image(x, y, spriteKey).setDepth(20);
    let visited = false;

    this.interactables.push({
      x,
      y,
      radius: 50,
      prompt: `[E] Visit ${auntyName}`,
      action: () => {
        if (visited) {
          this.hud.showPopupMessage(`${auntyName} has already given you laddoos!`);
          return;
        }

        this.player.canMove = false;
        this.player.setVelocity(0, 0);

        this.dialogue.startDialogue(script, () => {
          this.player.canMove = true;
          visited = true;
          inventory.addLaddoo(laddooReward);
          soundManager.playLaddooPickup();
          this.hud.showPopupMessage(`+${laddooReward} LADDOOS FROM ${auntyName}!`, '#ffd700', 2500);
          this.updateObjectiveText();
          this.hud.updateHUD();
        });
      }
    });
  }

  setupVendor(x, y, name, script, laddooReward) {
    let bought = false;
    this.interactables.push({
      x,
      y,
      radius: 60,
      prompt: `[E] Talk to ${name}`,
      action: () => {
        if (bought) {
          this.hud.showPopupMessage('Vendor is packaging sweets for society!');
          return;
        }
        this.player.canMove = false;
        this.player.setVelocity(0, 0);

        this.dialogue.startDialogue(script, () => {
          this.player.canMove = true;
          bought = true;
          inventory.addLaddoo(laddooReward);
          soundManager.playLaddooPickup();
          this.hud.showPopupMessage(`+${laddooReward} LADDOOS FROM VENDOR!`, '#ffd700', 2500);
          this.updateObjectiveText();
          this.hud.updateHUD();
        });
      }
    });
  }

  unlockPlayerHome() {
    if (this.homeUnlocked) return;
    this.homeUnlocked = true;
    soundManager.playUnlockDoor();

    if (this.homeDoor) {
      this.homeDoor.setTexture('obj_door_open');
      this.tweens.add({
        targets: this.homeDoor,
        alpha: 0.5,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }

    this.hud.showPopupMessage("YOUR HOME UNLOCKED! ENTER WITH 'E'!", '#76ff03', 3500);

    this.interactables.push({
      x: 520,
      y: 650,
      radius: 50,
      prompt: '[E] Enter Your House (Infiltrate Kitchen)',
      action: () => this.enterHome()
    });
  }

  enterHome() {
    this.player.canMove = false;
    this.player.setVelocity(0, 0);
    soundManager.playObjectiveComplete();

    // Auto-save checkpoint
    SaveManager.saveGame('HomeScene', inventory.exportState(), globalTimer.getElapsedMs());

    this.cameras.main.fade(400, 0, 0, 0, false, (cam, progress) => {
      if (progress === 1) {
        this.scene.start('HomeScene');
      }
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
