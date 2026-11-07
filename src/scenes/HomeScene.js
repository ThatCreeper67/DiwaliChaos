// HomeScene.js - Level 3: Home Infiltration: Operation Mummy's Kitchen
import { Player } from '../entities/Player.js';
import { Mother } from '../entities/Mother.js';
import { HUD } from '../ui/HUD.js';
import { DialogueManager } from '../systems/DialogueManager.js';
import { soundManager } from '../systems/SoundSystem.js';
import { SaveManager } from '../systems/SaveManager.js';
import { globalTimer } from '../systems/TimerManager.js';
import { inventory } from '../systems/InventoryManager.js';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('HomeScene');
  }

  create() {
    const mapWidth = 960;
    const mapHeight = 640;

    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    soundManager.playMusic('home');

    // Separate collision vs cover/vision obstacles
    this.walls = this.physics.add.staticGroup();
    this.coverObstacles = [];
    this.interactables = [];

    // State machine for mission sequence
    this.hasKey = false;
    this.hasBombs = false;
    this.triedMainDoor = false;

    this.buildHouse(mapWidth, mapHeight);

    // Player starts at Main Entrance (bottom center)
    this.player = new Player(this, 320, 560);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.physics.add.collider(this.player, this.walls);

    // Mother AI waypoints across kitchen, corridor, living room, dining
    const motherWaypoints = [
      { x: 740, y: 160 }, // Kitchen stove
      { x: 580, y: 220 }, // Dining table
      { x: 380, y: 320 }, // Living room corridor
      { x: 680, y: 320 }, // Kitchen entrance
      { x: 500, y: 440 }  // Corridor
    ];
    this.mother = new Mother(this, 740, 160, motherWaypoints);
    this.physics.add.collider(this.mother, this.walls);

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

  buildHouse(width, height) {
    // 1. Flooring
    // Living room & corridors: Marble
    for (let x = 0; x < width; x += 32) {
      for (let y = 0; y < height; y += 32) {
        if (x >= 600 && y <= 300) {
          // Kitchen floor checkered
          this.add.image(x + 16, y + 16, 'tile_kitchen');
        } else {
          this.add.image(x + 16, y + 16, 'tile_marble');
        }
      }
    }

    // 2. Exterior Perimeter Walls
    for (let x = 0; x < width; x += 32) {
      this.createWall(x + 16, 16);
      this.createWall(x + 16, height - 16);
    }
    for (let y = 32; y < height - 32; y += 32) {
      this.createWall(16, y + 16);
      this.createWall(width - 16, y + 16);
    }

    // 3. Interior Walls separating rooms
    // Bedroom Partition (Left side: x: 40-280, y: 40-360)
    for (let y = 40; y <= 240; y += 32) {
      this.createWall(280, y);
    }
    for (let x = 40; x <= 200; x += 32) {
      this.createWall(x, 360);
    }

    // Kitchen Partition (Top Right: x: 600-920, y: 40-300)
    for (let y = 40; y <= 200; y += 32) {
      this.createWall(600, y);
    }
    for (let x = 600; x <= 800; x += 32) {
      this.createWall(x, 300);
    }

    // Storage / Puja Room Wall
    for (let x = 40; x <= 220; x += 32) {
      this.createWall(x, 480);
    }

    // 4. Doors
    // Main Entrance (Bottom: 320, 608)
    this.mainEntrance = this.createWall(320, 624, 'obj_door_locked');
    this.interactables.push({
      x: 320,
      y: 590,
      radius: 45,
      prompt: '[E] Main Entrance',
      action: () => this.tryMainDoor()
    });

    // Backdoor (Top right kitchen backdoor: 912, 64)
    this.backdoor = this.createWall(912, 32, 'obj_door_locked');
    this.interactables.push({
      x: 912,
      y: 64,
      radius: 50,
      prompt: '[E] Kitchen Backdoor',
      action: () => this.tryBackdoor()
    });

    // 5. Furniture & Cover Obstacles
    // Living Room Sofa (Center-left)
    const sofa1 = this.createFurniture(440, 360, 'obj_sofa', 60, 32);
    this.coverObstacles.push(sofa1);

    // Dining Table (Center)
    const diningTable = this.createFurniture(520, 220, 'obj_sofa', 50, 30);
    this.coverObstacles.push(diningTable);

    // Kitchen Counter & LPG Cylinder (Kitchen: top right)
    const counter1 = this.createFurniture(760, 64, 'obj_kitchen_counter', 60, 28);
    const counter2 = this.createFurniture(840, 64, 'obj_kitchen_counter', 60, 28);
    const lpg = this.createFurniture(880, 120, 'obj_lpg', 20, 28);
    this.coverObstacles.push(counter1, counter2, lpg);

    // Locked Kitchen Storage Box (The Sutli bomb stash!)
    this.storageBox = this.createFurniture(720, 80, 'obj_storage_box', 34, 28);
    this.coverObstacles.push(this.storageBox);

    this.interactables.push({
      x: 720,
      y: 110,
      radius: 45,
      prompt: '[E] Kitchen Storage Box',
      action: () => this.interactStorageBox()
    });

    // Bedroom Furniture: Key on Study Table (x: 120, y: 120)
    const bed = this.createFurniture(100, 200, 'obj_sofa', 56, 32);
    this.coverObstacles.push(bed);

    this.keySprite = this.add.image(140, 100, 'item_key').setDisplaySize(22, 22);
    this.tweens.add({
      targets: this.keySprite,
      scale: 1.25,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    this.interactables.push({
      x: 140,
      y: 100,
      radius: 45,
      prompt: '[E] Pick up Brass Key',
      action: () => this.collectKey()
    });

    // Laddoo snack in bedroom
    this.createLaddooPickup(200, 160);
    this.createLaddooPickup(460, 480);
  }

  createWall(x, y, texture = 'tile_wall_interior') {
    const wall = this.walls.create(x, y, texture);
    wall.setImmovable(true);
    wall.refreshBody();
    this.coverObstacles.push(wall);
    return wall;
  }

  createFurniture(x, y, texture, bodyW, bodyH) {
    const furn = this.walls.create(x, y, texture);
    furn.body.setSize(bodyW, bodyH);
    furn.setImmovable(true);
    furn.refreshBody();
    return furn;
  }

  createLaddooPickup(x, y) {
    const laddoo = this.physics.add.image(x, y, 'item_laddoo').setDisplaySize(20, 20);
    this.physics.add.overlap(this.player, laddoo, () => {
      soundManager.playLaddooPickup();
      inventory.addLaddoo(1);
      this.hud.showPopupMessage('+1 LADDOO!', '#ffd700');
      this.hud.updateHUD();
      laddoo.destroy();
    });
  }

  collectKey() {
    if (this.hasKey) return;
    this.hasKey = true;
    inventory.hasKitchenKey = true;
    soundManager.playUnlockDoor();

    this.keySprite.destroy();
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

      // Door is locked from outside!
      this.hud.showPopupMessage('LOCKED! Papa locked the front door from outside!', '#ff5252', 3500);
      this.hud.setObjective('Front door locked! Escape through the Kitchen BACKDOOR!');

      // Highlight kitchen backdoor
      this.backdoor.setTexture('obj_door_open');
      this.tweens.add({
        targets: this.backdoor,
        alpha: 0.5,
        duration: 400,
        yoyo: true,
        repeat: -1
      });
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
      // Restart current level only!
      this.scene.restart();
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
