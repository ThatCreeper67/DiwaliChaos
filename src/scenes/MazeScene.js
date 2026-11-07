// MazeScene.js - Level 4: Backdoor Maze (Moderate Difficulty, No Minimap, Handcrafted)
import { Player } from '../entities/Player.js';
import { HUD } from '../ui/HUD.js';
import { soundManager } from '../systems/SoundSystem.js';
import { SaveManager } from '../systems/SaveManager.js';
import { globalTimer } from '../systems/TimerManager.js';
import { inventory } from '../systems/InventoryManager.js';

export class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
  }

  create() {
    const cols = 34;
    const rows = 24;
    const tileSize = 32;
    const mapWidth = cols * tileSize;
    const mapHeight = rows * tileSize;

    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    soundManager.playMusic('maze');

    this.walls = this.physics.add.staticGroup();

    // Handcrafted maze grid (1 = Wall/Hedge, 0 = Walkable path)
    const mazeGrid = [
      // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1: Entrance at (1,1)
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1], // 2
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1], // 3
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1], // 4
      [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1], // 5
      [1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1], // 6
      [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1], // 7
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1], // 8
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1], // 9
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1], // 10
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1], // 11
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1], // 12
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1], // 13
      [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1], // 14
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1], // 15
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1], // 16
      [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1], // 17
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1], // 18
      [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1], // 19
      [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1], // 20
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // 21
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1], // 22: Exit at (22, 32)
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 23
    ];

    // Build Tiles & Wall Colliders
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * tileSize + tileSize / 2;
        const y = r * tileSize + tileSize / 2;

        // Ground is dark night cobblestone
        this.add.image(x, y, 'tile_bazaar_ground').setTint(0x445566);

        if (mazeGrid[r][c] === 1) {
          const wall = this.walls.create(x, y, 'tile_maze_wall');
          wall.setImmovable(true);
          wall.refreshBody();
        }
      }
    }

    // Exit portal at (row 21-22, col 32)
    const exitX = 32 * tileSize + tileSize / 2;
    const exitY = 21 * tileSize + tileSize / 2;

    this.exitVisual = this.add.image(exitX, exitY, 'obj_exit_service_lane').setDepth(20);
    this.tweens.add({
      targets: this.exitVisual,
      alpha: 0.4,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Atmospheric Diyas placed along select intersections as guidance markers
    const lanterns = [
      { c: 1, r: 1 }, { c: 5, r: 5 }, { c: 17, r: 7 }, { c: 13, r: 13 },
      { c: 22, r: 17 }, { c: 17, r: 21 }, { c: 31, r: 21 }
    ];
    lanterns.forEach(pt => {
      this.add.image(pt.c * tileSize + 16, pt.r * tileSize + 16, 'obj_diya').setDisplaySize(20, 20);
    });

    // Optional Laddoo Pickups in tricky dead ends
    this.createLaddooPickup(9 * tileSize + 16, 1 * tileSize + 16);
    this.createLaddooPickup(1 * tileSize + 16, 7 * tileSize + 16);
    this.createLaddooPickup(25 * tileSize + 16, 3 * tileSize + 16);
    this.createLaddooPickup(7 * tileSize + 16, 19 * tileSize + 16);
    this.createLaddooPickup(23 * tileSize + 16, 13 * tileSize + 16);

    // Player enters at (1, 1)
    this.player = new Player(this, 1 * tileSize + 16, 1 * tileSize + 16);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.physics.add.collider(this.player, this.walls);

    // Exit Trigger Zone
    const exitTrigger = this.add.zone(exitX, exitY, 40, 60);
    this.physics.add.existing(exitTrigger, true);
    this.physics.add.overlap(this.player, exitTrigger, () => {
      this.completeMaze();
    });

    // HUD
    this.hud = new HUD(this);
    this.hud.setObjective('Navigate the backdoor maze to reach Sharma Ji’s fortress!');

    this.time.delayedCall(600, () => {
      this.hud.showPopupMessage('NO MAP! Explore carefully and watch for dead ends!', '#ff9800', 4000);
    });
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

  completeMaze() {
    this.player.canMove = false;
    this.player.setVelocity(0, 0);
    soundManager.playObjectiveComplete();

    this.hud.showPopupMessage('MAZE CONQUERED! ENTERING FORTRESS...', '#ffd700', 2500);

    // Save checkpoint
    SaveManager.saveGame('BossScene', inventory.exportState(), globalTimer.getElapsedMs());

    this.time.delayedCall(1200, () => {
      this.cameras.main.fade(400, 0, 0, 0, false, (cam, progress) => {
        if (progress === 1) {
          this.scene.start('BossScene');
        }
      });
    });
  }

  update(time, delta) {
    this.player.update(time, delta);
    this.hud.updateHUD();
  }
}
