// Father.js - Father (Papa) AI with patrol pathing, line-of-sight cone, and detection mechanics
import { soundManager } from '../systems/SoundSystem.js';

export class Father extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, patrolPoints = []) {
    super(scene, x, y, 'father_down_0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(20, 20);
    this.setOffset(8, 20);

    this.patrolPoints = patrolPoints;
    this.currentPointIndex = 0;
    this.patrolSpeed = 85;
    this.pauseDuration = 1800; // Time spent surveying at each patrol point
    this.isPaused = false;
    this.pauseTimer = 0;

    this.facingDirection = 'down';
    this.animTimer = 0;
    this.animFrame = 0;

    // Vision cone properties
    this.visionRange = 210;
    this.visionAngle = Math.PI / 3; // 60 degree cone
    this.visionGraphics = scene.add.graphics().setDepth(50);

    // Alert indicator above head
    this.alertIcon = scene.add.image(this.x, this.y - 32, 'ui_detection_alert')
      .setDepth(200)
      .setVisible(false);

    // Detection timer
    this.detectionTime = 0;
    this.detectionThreshold = 800; // ms in direct sight before caught
    this.hasSpottedPlayer = false;
  }

  update(time, delta, player, obstacles) {
    if (!player || !player.active) return;

    // Update patrol movement
    this.handlePatrol(delta);

    // Update vision cone & check line of sight
    this.checkVision(player, obstacles, delta);

    // Update alert icon position
    this.alertIcon.setPosition(this.x, this.y - 30);
  }

  handlePatrol(delta) {
    if (this.patrolPoints.length === 0) return;

    if (this.isPaused) {
      this.setVelocity(0, 0);
      this.pauseTimer -= delta;
      if (this.pauseTimer <= 0) {
        this.isPaused = false;
        this.currentPointIndex = (this.currentPointIndex + 1) % this.patrolPoints.length;
      }
      return;
    }

    const target = this.patrolPoints[this.currentPointIndex];
    const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);

    if (dist < 8) {
      // Reached waypoint, survey area
      this.isPaused = true;
      this.pauseTimer = this.pauseDuration;
      this.setVelocity(0, 0);
      return;
    }

    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    const vx = Math.cos(angle) * this.patrolSpeed;
    const vy = Math.sin(angle) * this.patrolSpeed;
    this.setVelocity(vx, vy);

    // Determine facing direction
    if (Math.abs(vx) > Math.abs(vy)) {
      this.facingDirection = vx > 0 ? 'right' : 'left';
    } else {
      this.facingDirection = vy > 0 ? 'down' : 'up';
    }

    // Animation frames
    this.animTimer += delta;
    if (this.animTimer > 150) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
      const textureKey = `father_${this.facingDirection}_${this.animFrame}`;
      if (this.scene.textures.exists(textureKey)) {
        this.setTexture(textureKey);
      }
    }
  }

  checkVision(player, obstacles, delta) {
    this.visionGraphics.clear();

    // Calculate facing angle in radians
    let dirAngle = 0;
    if (this.facingDirection === 'right') dirAngle = 0;
    else if (this.facingDirection === 'left') dirAngle = Math.PI;
    else if (this.facingDirection === 'down') dirAngle = Math.PI / 2;
    else if (this.facingDirection === 'up') dirAngle = -Math.PI / 2;

    const startAngle = dirAngle - this.visionAngle / 2;
    const endAngle = dirAngle + this.visionAngle / 2;

    // Draw vision cone on ground
    const coneColor = this.hasSpottedPlayer ? 0xff1744 : 0xffeb3b;
    const coneAlpha = this.hasSpottedPlayer ? 0.35 : 0.15;
    this.visionGraphics.fillStyle(coneColor, coneAlpha);
    this.visionGraphics.beginPath();
    this.visionGraphics.moveTo(this.x, this.y);
    this.visionGraphics.arc(this.x, this.y, this.visionRange, startAngle, endAngle);
    this.visionGraphics.closePath();
    this.visionGraphics.fill();

    // Check if player is within vision cone
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    let playerInSight = false;

    if (dist <= this.visionRange) {
      const angleToPlayer = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      const angleDiff = Phaser.Math.Angle.Normalize(angleToPlayer - dirAngle);

      if (Math.abs(angleDiff) <= this.visionAngle / 2 || Math.abs(angleDiff - Math.PI * 2) <= this.visionAngle / 2) {
        // Within arc! Now check if any environmental obstacle blocks line of sight
        const isBlocked = this.isLineOfSightBlocked(this.x, this.y, player.x, player.y, obstacles);
        if (!isBlocked) {
          playerInSight = true;
        }
      }
    }

    if (playerInSight) {
      if (!this.hasSpottedPlayer) {
        this.hasSpottedPlayer = true;
        this.alertIcon.setVisible(true);
        soundManager.playAlert();
      }
      this.detectionTime += delta;
      const pct = Math.min(100, (this.detectionTime / this.detectionThreshold) * 100);
      if (this.scene.hud) {
        this.scene.hud.setDetection(pct, 'DAD DETECTED! Run!');
      }

      if (this.detectionTime >= this.detectionThreshold) {
        // Player caught!
        this.triggerCaught(player);
      }
    } else {
      if (this.detectionTime > 0) {
        this.detectionTime = Math.max(0, this.detectionTime - delta * 1.5);
        const pct = Math.min(100, (this.detectionTime / this.detectionThreshold) * 100);
        if (this.scene.hud) {
          this.scene.hud.setDetection(pct);
        }
      }
      if (this.detectionTime === 0 && this.hasSpottedPlayer) {
        this.hasSpottedPlayer = false;
        this.alertIcon.setVisible(false);
      }
    }
  }

  isLineOfSightBlocked(x1, y1, x2, y2, obstacles) {
    if (!obstacles || obstacles.length === 0) return false;
    const ray = new Phaser.Geom.Line(x1, y1, x2, y2);

    for (const obj of obstacles) {
      if (!obj.active) continue;
      const bounds = obj.getBounds ? obj.getBounds() : new Phaser.Geom.Rectangle(obj.x - 16, obj.y - 16, 32, 32);
      if (Phaser.Geom.Intersects.LineToRectangle(ray, bounds)) {
        return true;
      }
    }
    return false;
  }

  triggerCaught(player) {
    player.canMove = false;
    this.setVelocity(0, 0);
    this.isPaused = true;
    soundManager.playCaught();

    if (this.scene.handlePlayerCaught) {
      this.scene.handlePlayerCaught('Father caught you! "Padhai karne ke time bazaar mein kya kar rahe ho?!"');
    }
  }

  destroy(fromScene) {
    if (this.visionGraphics) this.visionGraphics.destroy();
    if (this.alertIcon) this.alertIcon.destroy();
    super.destroy(fromScene);
  }
}
