// BazaarScene.js - Level 1: Bazaar Escape (Data-Driven via MapLoader)
import { Player } from '../entities/Player.js';
import { Father } from '../entities/Father.js';
import { HUD } from '../ui/HUD.js';
import { DialogueManager } from '../systems/DialogueManager.js';
import { soundManager } from '../systems/SoundSystem.js';
import { SaveManager } from '../systems/SaveManager.js';
import { globalTimer } from '../systems/TimerManager.js';
import { inventory } from '../systems/InventoryManager.js';
import { MapLoader } from '../maps/MapLoader.js';
import { BazaarMapData } from '../maps/data/BazaarMapData.js';

export class BazaarScene extends Phaser.Scene {
  constructor() {
    super('BazaarScene');
  }

  create() {
    soundManager.playMusic('bazaar');

    // 1. Load Data-Driven Map
    const loader = new MapLoader(this);
    this.mapInstance = loader.loadMap(BazaarMapData);
    this.obstacles = this.mapInstance.collisionGroup;
    this.interactables = this.mapInstance.interactables;

    // References to dynamic objects
    this.exitBlocker = this.mapInstance.namedObjects.get('exit_blocker');
    this.exitGateVisual = this.mapInstance.namedObjects.get('exit_gate_visual');
    this.serviceLaneRevealed = false;

    // 2. Spawn Player
    const spawn = this.mapInstance.playerSpawn;
    this.player = new Player(this, spawn.x, spawn.y);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.physics.add.collider(this.player, this.obstacles);

    // 3. Spawn Father AI from Map Data
    const fatherConfig = this.mapInstance.npcConfigs.find(n => n.type === 'Father') || {
      spawn: { x: 380, y: 350 },
      patrolWaypoints: [
        { x: 380, y: 350 },
        { x: 720, y: 350 },
        { x: 720, y: 620 },
        { x: 420, y: 620 },
        { x: 420, y: 480 },
        { x: 260, y: 480 }
      ]
    };
    this.father = new Father(this, fatherConfig.spawn.x, fatherConfig.spawn.y, fatherConfig.patrolWaypoints);
    this.physics.add.collider(this.father, this.obstacles);

    // 4. Collectibles
    this.mapInstance.collectibleSprites.forEach(item => {
      this.physics.add.overlap(this.player, item, () => {
        soundManager.playLaddooPickup();
        inventory.addLaddoo(item.collectibleCount || 1);
        this.hud.showPopupMessage(`+${item.collectibleCount || 1} LADDOO!`, '#ffd700');
        this.hud.updateHUD();
        item.destroy();
      });
    });

    // 5. Setup Shopkeeper NPC (Ramesh Kaka)
    this.setupShopkeeper();

    // 6. HUD & Dialogue Manager
    this.hud = new HUD(this);
    this.hud.setObjective('Escape Bazaar without getting spotted by Father');
    this.dialogue = new DialogueManager(this);

    // Initial warning dialog / message
    this.time.delayedCall(800, () => {
      this.hud.showPopupMessage('WARNING: Do not get in the sight of your Father!', '#ff5252', 3500);
    });

    // Interaction handler for 'E' key
    this.input.keyboard.on('keydown-E', () => {
      if (!this.dialogue.isActive()) {
        this.checkInteractions();
      }
    });
  }

  setupShopkeeper() {
    this.shopkeeper = this.add.image(950, 220, 'shopkeeper').setDepth(30);

    this.interactables.push({
      id: 'npc_ramesh_kaka',
      x: 950,
      y: 240,
      radius: 65,
      prompt: '[E] Talk to Ramesh Kaka',
      action: () => this.talkToShopkeeper()
    });
  }

  talkToShopkeeper() {
    this.player.canMove = false;
    this.player.setVelocity(0, 0);

    const script = [
      {
        speaker: 'RAMESH KAKA',
        portrait: 'portrait_shopkeeper',
        text: 'Arre beta! Sharma Ji ke spies everywhere hain. Tumhare papa bhi idhar hi ghoom rahe hain!'
      },
      {
        speaker: 'CHINTU',
        portrait: 'portrait_player',
        text: 'Mujhe bahar nikalna hai! Sharma Ji ne Phooljhadi ko bandh ke rakha hai!'
      },
      {
        speaker: 'RAMESH KAKA',
        portrait: 'portrait_shopkeeper',
        text: 'Mere stall ke peeche ek service lane hai. Yeh laddoos khao aur jaldi niklo bina Papa ke samne aaye!'
      }
    ];

    this.dialogue.startDialogue(script, () => {
      this.player.canMove = true;
      if (!this.serviceLaneRevealed) {
        this.revealServiceLane();
      }
    });
  }

  revealServiceLane() {
    this.serviceLaneRevealed = true;
    soundManager.playUnlockDoor();

    // Remove the blocking wall
    if (this.exitBlocker && this.exitBlocker.active) {
      this.exitBlocker.destroy();
      this.exitBlocker = null;
    }

    // Highlight exit lane
    if (this.exitGateVisual) {
      this.exitGateVisual.setVisible(true);
      this.tweens.add({
        targets: this.exitGateVisual,
        alpha: 0.4,
        duration: 400,
        yoyo: true,
        repeat: -1
      });
    }

    this.hud.setObjective('Escape through the secret Service Lane on the right!');
    this.hud.showPopupMessage('SERVICE LANE UNLOCKED!', '#76ff03', 3000);

    // Setup exit trigger zone
    const exitZone = this.add.zone(1190, 210, 50, 100);
    this.physics.add.existing(exitZone, true);
    this.physics.add.overlap(this.player, exitZone, () => {
      this.completeLevel();
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

  handlePlayerCaught(message) {
    this.player.canMove = false;
    this.player.setVelocity(0, 0);

    this.dialogue.startDialogue([
      {
        speaker: 'PAPA',
        portrait: 'portrait_father',
        text: message
      }
    ], () => {
      this.scene.restart();
    });
  }

  completeLevel() {
    this.player.canMove = false;
    this.player.setVelocity(0, 0);
    soundManager.playObjectiveComplete();

    this.hud.showPopupMessage('BAZAAR ESCAPED!', '#ffd700', 2500);

    // Auto-save checkpoint
    SaveManager.saveGame('SocietyScene', inventory.exportState(), globalTimer.getElapsedMs());

    this.time.delayedCall(1200, () => {
      this.cameras.main.fade(400, 0, 0, 0, false, (cam, progress) => {
        if (progress === 1) {
          this.scene.start('SocietyScene');
        }
      });
    });
  }

  update(time, delta) {
    this.player.update(time, delta);
    this.hud.updateHUD();

    // Update Father AI & passing obstacles for vision occlusion
    if (this.father && this.father.active) {
      this.father.update(time, delta, this.player, this.obstacles.getChildren());
    }

    // Update interaction prompts
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
