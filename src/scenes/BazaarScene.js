// BazaarScene.js - Level 1: Bazaar Escape
import { Player } from '../entities/Player.js';
import { Father } from '../entities/Father.js';
import { HUD } from '../ui/HUD.js';
import { DialogueManager } from '../systems/DialogueManager.js';
import { soundManager } from '../systems/SoundSystem.js';
import { SaveManager } from '../systems/SaveManager.js';
import { globalTimer } from '../systems/TimerManager.js';
import { inventory } from '../systems/InventoryManager.js';

export class BazaarScene extends Phaser.Scene {
  constructor() {
    super('BazaarScene');
  }

  create() {
    const mapWidth = 1200;
    const mapHeight = 800;

    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    // Audio
    soundManager.playMusic('bazaar');

    // Groups
    this.obstacles = this.physics.add.staticGroup();
    this.interactables = [];

    // Build bazaar environment
    this.buildMap(mapWidth, mapHeight);

    // Spawn Player
    this.player = new Player(this, 120, 680);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // Collisions
    this.physics.add.collider(this.player, this.obstacles);

    // Spawn Father AI with patrol route around central market plazas
    const patrolPoints = [
      { x: 380, y: 350 },
      { x: 720, y: 350 },
      { x: 720, y: 620 },
      { x: 420, y: 620 },
      { x: 420, y: 480 },
      { x: 260, y: 480 }
    ];
    this.father = new Father(this, 380, 350, patrolPoints);
    this.physics.add.collider(this.father, this.obstacles);

    // HUD & Dialogue Manager
    this.hud = new HUD(this);
    this.hud.setObjective('Escape Bazaar without getting spotted by Father');
    this.dialogue = new DialogueManager(this);

    // Initial warning dialog / message
    this.time.delayedCall(800, () => {
      this.hud.showPopupMessage('WARNING: Do not get in the sight of your Father!', '#ff5252', 3500);
    });

    // Helpful shopkeeper (Ramesh Kaka)
    this.serviceLaneRevealed = false;
    this.setupShopkeeper();

    // Interaction handler for 'E' key
    this.input.keyboard.on('keydown-E', () => {
      if (!this.dialogue.isActive()) {
        this.checkInteractions();
      }
    });
  }

  buildMap(width, height) {
    // 1. Cobblestone Ground Tiles
    for (let x = 0; x < width; x += 32) {
      for (let y = 0; y < height; y += 32) {
        this.add.image(x + 16, y + 16, 'tile_bazaar_ground');
      }
    }

    // 2. Perimeter Boundary Walls (Brick)
    for (let x = 0; x < width; x += 32) {
      // Top wall
      this.createWall(x + 16, 16);
      // Bottom wall
      this.createWall(x + 16, height - 16);
    }
    for (let y = 32; y < height - 32; y += 32) {
      // Left wall
      this.createWall(16, y + 16);
      // Right wall (leave a gap for secret service lane at x: width - 16, y: 160-260)
      if (y < 160 || y > 260) {
        this.createWall(width - 16, y + 16);
      }
    }

    // Secret Service Lane exit gate (initially blocked by crates/shutter)
    this.exitBlocker = this.obstacles.create(width - 16, 210, 'tile_wall_brick').refreshBody();
    this.exitGateVisual = this.add.image(width - 40, 210, 'obj_exit_service_lane').setVisible(false);

    // 3. Stalls and Market Layout (Cover obstacles for sneaking)
    // Sweet Stall (Ramesh Kaka's Shop)
    this.shopStall = this.createObstacle(920, 260, 'obj_stall', 60, 40);

    // Decorative / Cover Stalls
    this.createObstacle(320, 220, 'obj_stall', 60, 40);
    this.createObstacle(620, 220, 'obj_stall', 60, 40);
    this.createObstacle(540, 520, 'obj_stall', 60, 40);

    // Scooters (cover)
    this.createObstacle(220, 360, 'obj_scooter', 44, 30);
    this.createObstacle(780, 500, 'obj_scooter', 44, 30);
    this.createObstacle(440, 700, 'obj_scooter', 44, 30);

    // Society Notice Board
    this.createObstacle(160, 540, 'obj_notice_board', 36, 30);

    // Decorative Rangoli and Diyas
    this.add.image(480, 380, 'obj_rangoli').setDisplaySize(48, 48);
    this.add.image(740, 640, 'obj_rangoli').setDisplaySize(48, 48);

    // Hanging fairy light garlands across bazaar
    for (let x = 80; x < width - 80; x += 64) {
      this.add.image(x, 60, 'obj_fairy_lights').setDepth(20);
    }

    // Diyas lining the streets
    const diyaPositions = [
      { x: 100, y: 640 }, { x: 260, y: 640 }, { x: 620, y: 720 },
      { x: 880, y: 640 }, { x: 380, y: 160 }, { x: 740, y: 160 }
    ];
    diyaPositions.forEach(pos => {
      this.add.image(pos.x, pos.y, 'obj_diya').setDisplaySize(20, 20);
    });

    // Free Laddoos scattered in bazaar as taste-testers
    this.createLaddooPickup(200, 200);
    this.createLaddooPickup(850, 680);
    this.createLaddooPickup(520, 380);
  }

  createWall(x, y) {
    const wall = this.obstacles.create(x, y, 'tile_wall_brick');
    wall.setImmovable(true);
    wall.refreshBody();
    return wall;
  }

  createObstacle(x, y, texture, bodyW, bodyH) {
    const obs = this.obstacles.create(x, y, texture);
    obs.body.setSize(bodyW, bodyH);
    obs.setImmovable(true);
    obs.refreshBody();
    return obs;
  }

  createLaddooPickup(x, y) {
    const laddoo = this.physics.add.image(x, y, 'item_laddoo').setDisplaySize(20, 20);
    this.tweens.add({
      targets: laddoo,
      y: y - 4,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    this.physics.add.overlap(this.player, laddoo, () => {
      soundManager.playLaddooPickup();
      inventory.addLaddoo(1);
      this.hud.showPopupMessage('+1 LADDOO!', '#ffd700');
      this.hud.updateHUD();
      laddoo.destroy();
    });
  }

  setupShopkeeper() {
    // NPC Ramesh Kaka standing by the stall at 960, 220
    this.shopkeeper = this.add.image(950, 220, 'shopkeeper').setDepth(30);

    this.interactables.push({
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
    if (this.exitBlocker) {
      this.exitBlocker.destroy();
      this.exitBlocker = null;
    }

    // Highlight exit lane
    this.exitGateVisual.setVisible(true);
    this.tweens.add({
      targets: this.exitGateVisual,
      alpha: 0.4,
      duration: 400,
      yoyo: true,
      repeat: -1
    });

    this.hud.setObjective('Escape through the secret Service Lane on the right!');
    this.hud.showPopupMessage('SERVICE LANE UNLOCKED!', '#76ff03', 3000);

    // Setup exit trigger zone
    const exitZone = this.add.zone(1180, 210, 40, 100);
    this.physics.add.existing(exitZone, true);
    this.physics.add.overlap(this.player, exitZone, () => {
      this.completeLevel();
    });
  }

  checkInteractions() {
    for (const item of this.interactables) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y);
      if (dist <= item.radius) {
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
      // Restart current level only (Timer continues uninterrupted!)
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
