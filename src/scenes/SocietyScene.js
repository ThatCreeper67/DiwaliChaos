// SocietyScene.js - Level 2: Society: Operation Laddoo Collection
import { Player } from '../entities/Player.js';
import { HUD } from '../ui/HUD.js';
import { DialogueManager } from '../systems/DialogueManager.js';
import { soundManager } from '../systems/SoundSystem.js';
import { SaveManager } from '../systems/SaveManager.js';
import { globalTimer } from '../systems/TimerManager.js';
import { inventory } from '../systems/InventoryManager.js';

export class SocietyScene extends Phaser.Scene {
  constructor() {
    super('SocietyScene');
  }

  create() {
    const mapWidth = 1400;
    const mapHeight = 900;

    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    soundManager.playMusic('society');

    this.obstacles = this.physics.add.staticGroup();
    this.interactables = [];
    this.collectedSocietyLaddoos = 0;
    this.targetLaddoos = inventory.requiredSocietyLaddoos; // 10

    this.buildMap(mapWidth, mapHeight);

    // Spawn Player
    this.player = new Player(this, 120, 450);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.physics.add.collider(this.player, this.obstacles);

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

  buildMap(width, height) {
    // 1. Society Roads and Lawn Tiles
    for (let x = 0; x < width; x += 32) {
      for (let y = 0; y < height; y += 32) {
        if (y >= 380 && y <= 520) {
          // Central asphalt road
          this.add.image(x + 16, y + 16, 'tile_society_road');
        } else {
          // Society lawns & gardens
          this.add.image(x + 16, y + 16, 'tile_lawn');
        }
      }
    }

    // 2. Perimeter Boundary Walls
    for (let x = 0; x < width; x += 32) {
      this.createWall(x + 16, 16);
      this.createWall(x + 16, height - 16);
    }
    for (let y = 32; y < height - 32; y += 32) {
      this.createWall(16, y + 16);
      this.createWall(width - 16, y + 16);
    }

    // 3. Society Buildings / Decorative House Blocks
    // Top Row Houses (Aunty Verma, Aunty Gupta, Sharma Ji's Outer Gate)
    this.createBuildingBlock(180, 160, 220, 140, 'BUILDING A (VERMA NIWAS)');
    this.createBuildingBlock(520, 160, 220, 140, 'BUILDING B (GUPTA MANSION)');
    this.createBuildingBlock(860, 160, 260, 140, 'SHARMA JI FORTRESS (LOCKED)');

    // Bottom Row Houses (Player Home Chintu's house, Vendor stalls)
    this.playerHouseVisual = this.createBuildingBlock(520, 720, 260, 140, "CHINTU'S HOUSE (HOME)");
    this.createBuildingBlock(180, 720, 220, 140, 'BUILDING C');
    this.createBuildingBlock(900, 720, 240, 140, 'SOCIETY CLUBHOUSE');

    // Player House Entrance Door
    this.homeDoor = this.obstacles.create(520, 650, 'obj_door_locked');
    this.homeDoor.setImmovable(true);
    this.homeDoor.refreshBody();

    // 4. Source 1: Aunties' Houses
    // Aunty Verma Door (Building A)
    this.setupAuntyHouse(180, 230, 'aunty_pink', 'AUNTY VERMA', [
      {
        speaker: 'AUNTY VERMA',
        portrait: 'portrait_player', // Aunty
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

    // Aunty Gupta Door (Building B)
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

    // 5. Source 2: Society Sweet Vendors & Stalls
    const stall1 = this.createObstacle(1150, 420, 'obj_stall', 60, 40);
    this.setupVendor(1150, 460, 'HALWAI VENDOR', [
      {
        speaker: 'SWEET VENDOR',
        portrait: 'portrait_shopkeeper',
        text: 'Shuddh Desi Ghee ke laddoos! 2 box tumhare liye beta!'
      }
    ], 2);

    // 6. Source 3: Laddoo Boxes scattered in society gardens & benches
    this.createLaddooBoxPickup(340, 450, 2);
    this.createLaddooBoxPickup(750, 430, 2);
    this.createLaddooBoxPickup(1250, 220, 2);
    this.createLaddooBoxPickup(340, 720, 2);
    this.createLaddooBoxPickup(1250, 720, 2);

    // Free individual laddoos
    this.createLaddooPickup(100, 320);
    this.createLaddooPickup(700, 320);
    this.createLaddooPickup(1050, 580);

    // Society Notice Boards & Rangolis
    this.createObstacle(720, 240, 'obj_notice_board', 36, 30);
    this.add.image(420, 450, 'obj_rangoli').setDisplaySize(48, 48);
    this.add.image(960, 450, 'obj_rangoli').setDisplaySize(48, 48);

    // Parked Scooters
    this.createObstacle(360, 390, 'obj_scooter', 44, 30);
    this.createObstacle(800, 490, 'obj_scooter', 44, 30);
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

  createBuildingBlock(x, y, w, h, label) {
    const bg = this.add.graphics();
    bg.fillStyle(0x3e2723, 1);
    bg.fillRect(x - w / 2, y - h / 2, w, h);
    bg.fillStyle(0xd7ccc8, 1);
    bg.fillRect(x - w / 2 + 4, y - h / 2 + 4, w - 8, h - 8);
    bg.lineStyle(3, 0xff9933, 0.8);
    bg.strokeRect(x - w / 2, y - h / 2, w, h);

    const txt = this.add.text(x, y - 20, label, {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#3e2723'
    }).setOrigin(0.5);

    // Physics collider for building
    const collider = this.obstacles.create(x, y, null);
    collider.setSize(w, h);
    collider.setVisible(false);
    collider.setImmovable(true);
    collider.refreshBody();

    return collider;
  }

  setupAuntyHouse(x, y, spriteKey, auntyName, script, laddooReward) {
    this.add.image(x, y, spriteKey);
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

  createLaddooBoxPickup(x, y, amount) {
    const box = this.physics.add.image(x, y, 'item_laddoo_box').setDisplaySize(26, 22);
    this.physics.add.overlap(this.player, box, () => {
      soundManager.playLaddooPickup();
      inventory.addLaddoo(amount);
      this.hud.showPopupMessage(`+${amount} LADDOO BOX!`, '#ffd700');
      this.updateObjectiveText();
      this.hud.updateHUD();
      box.destroy();
    });
  }

  createLaddooPickup(x, y) {
    const laddoo = this.physics.add.image(x, y, 'item_laddoo').setDisplaySize(20, 20);
    this.physics.add.overlap(this.player, laddoo, () => {
      soundManager.playLaddooPickup();
      inventory.addLaddoo(1);
      this.hud.showPopupMessage('+1 LADDOO!', '#ffd700');
      this.updateObjectiveText();
      this.hud.updateHUD();
      laddoo.destroy();
    });
  }

  unlockPlayerHome() {
    if (this.homeUnlocked) return;
    this.homeUnlocked = true;
    soundManager.playUnlockDoor();

    this.homeDoor.setTexture('obj_door_open');
    this.tweens.add({
      targets: this.homeDoor,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

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
      if (dist <= item.radius) {
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
