// MazeScene.js - Level 4: Backdoor Maze (Data-Driven via MapLoader)
import { Player } from '../entities/Player.js';
import { HUD } from '../ui/HUD.js';
import { soundManager } from '../systems/SoundSystem.js';
import { SaveManager } from '../systems/SaveManager.js';
import { globalTimer } from '../systems/TimerManager.js';
import { inventory } from '../systems/InventoryManager.js';
import { MapLoader } from '../maps/MapLoader.js';
import { MazeMapData } from '../maps/data/MazeMapData.js';
import { MapCoordinates } from '../maps/MapCoordinates.js';

export class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
  }

  create() {
    soundManager.playMusic('maze');

    // 1. Data-Driven Map Construction
    const loader = new MapLoader(this);
    this.mapInstance = loader.loadMap(MazeMapData);
    this.walls = this.mapInstance.collisionGroup;

    // 2. Spawn Player at defined spawn point
    const spawn = this.mapInstance.playerSpawn;
    this.player = new Player(this, spawn.x, spawn.y);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // 3. Collision
    this.physics.add.collider(this.player, this.walls);

    // 4. Collectibles Interaction
    this.mapInstance.collectibleSprites.forEach(itemSprite => {
      this.physics.add.overlap(this.player, itemSprite, () => {
        soundManager.playLaddooPickup();
        inventory.addLaddoo(itemSprite.collectibleCount || 1);
        this.hud.showPopupMessage(`+${itemSprite.collectibleCount || 1} LADDOO!`, '#ffd700');
        this.hud.updateHUD();
        itemSprite.destroy();
      });
    });

    // 5. Setup Exit Trigger Zone at (c: 32, r: 21)
    const exitPos = MapCoordinates.gridToWorldCenter(32, 21, MazeMapData.tileSize);
    const exitVisual = this.mapInstance.namedObjects.get('maze_exit_gate');
    if (exitVisual) {
      this.tweens.add({
        targets: exitVisual,
        alpha: 0.4,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }

    const exitTrigger = this.add.zone(exitPos.x, exitPos.y, 40, 60);
    this.physics.add.existing(exitTrigger, true);
    this.physics.add.overlap(this.player, exitTrigger, () => {
      this.completeMaze();
    });

    // 6. HUD
    this.hud = new HUD(this);
    this.hud.setObjective('Navigate the backdoor maze to reach Sharma Ji’s fortress!');

    this.time.delayedCall(600, () => {
      this.hud.showPopupMessage('NO MAP! Explore carefully and watch for dead ends!', '#ff9800', 4000);
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
