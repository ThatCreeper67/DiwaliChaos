// Player.js - Player Kid (Chintu) entity with movement, animation, throwing Sutli bombs, and interaction
import { soundManager } from '../systems/SoundSystem.js';
import { inventory } from '../systems/InventoryManager.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setSize(18, 16);
    this.setOffset(7, 16); // Feet hitbox for top-down perspective

    this.speed = 175;
    this.currentDirection = 'down';
    this.isMoving = false;
    this.isThrowing = false;
    this.canMove = true;

    // Movement keys
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = {
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // Animation frame counter
    this.animTimer = 0;
    this.animFrame = 0;

    // Left mouse button throws Sutli bomb
    scene.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown() && this.canMove) {
        this.attemptThrowBomb(pointer);
      }
    });

    // Spacebar alternative to throw bomb in aim direction
    scene.input.keyboard.on('keydown-SPACE', () => {
      if (this.canMove) {
        this.attemptThrowBombInFacingDir();
      }
    });
  }

  update(time, delta) {
    if (!this.canMove) {
      this.setVelocity(0, 0);
      return;
    }

    let vx = 0;
    let vy = 0;

    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    if (left) {
      vx -= this.speed;
      this.currentDirection = 'left';
    } else if (right) {
      vx += this.speed;
      this.currentDirection = 'right';
    }

    if (up) {
      vy -= this.speed;
      this.currentDirection = 'up';
    } else if (down) {
      vy += this.speed;
      this.currentDirection = 'down';
    }

    // Normalize diagonal movement speed
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.setVelocity(vx, vy);

    this.isMoving = vx !== 0 || vy !== 0;

    // Walk animation cycling
    if (this.isMoving) {
      this.animTimer += delta;
      if (this.animTimer > 120) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4;
        const textureKey = `player_${this.currentDirection}_${this.animFrame}`;
        if (this.scene.textures.exists(textureKey)) {
          this.setTexture(textureKey);
        }
      }
    } else {
      this.animFrame = 0;
      const textureKey = `player_${this.currentDirection}_0`;
      if (this.scene.textures.exists(textureKey)) {
        this.setTexture(textureKey);
      }
    }
  }

  attemptThrowBomb(pointer) {
    // Only in boss arena or where player has bombs
    if (inventory.sutliBombs <= 0) return;

    // Convert screen coordinates to world coordinates
    const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, worldPoint.x, worldPoint.y);

    if (inventory.useSutliBomb()) {
      soundManager.playBombThrow();
      if (this.scene.hud) this.scene.hud.updateHUD();
      this.spawnBombProjectile(angle);
    }
  }

  attemptThrowBombInFacingDir() {
    if (inventory.sutliBombs <= 0) return;

    let angle = 0;
    if (this.currentDirection === 'up') angle = -Math.PI / 2;
    else if (this.currentDirection === 'down') angle = Math.PI / 2;
    else if (this.currentDirection === 'left') angle = Math.PI;
    else if (this.currentDirection === 'right') angle = 0;

    if (inventory.useSutliBomb()) {
      soundManager.playBombThrow();
      if (this.scene.hud) this.scene.hud.updateHUD();
      this.spawnBombProjectile(angle);
    }
  }

  spawnBombProjectile(angle) {
    if (this.scene.spawnBomb) {
      this.scene.spawnBomb(this.x, this.y, angle);
    }
  }
}
