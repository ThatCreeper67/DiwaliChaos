// Mother.js - Mother (Mummy) AI with controlled random patrol, progressive detection meter, and cover occlusion
import { soundManager } from '../systems/SoundSystem.js';

export class Mother extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, waypoints = []) {
    super(scene, x, y, 'mother_down_0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(18, 18);
    this.setOffset(7, 16);

    this.waypoints = waypoints;
    this.targetIndex = 0;
    this.speed = 70;
    this.state = 'patrolling'; // 'patrolling', 'cooking', 'investigating'
    this.pauseTimer = 0;

    this.facingDirection = 'down';
    this.animTimer = 0;
    this.animFrame = 0;

    // Vision properties
    this.visionRange = 190;
    this.visionAngle = Math.PI / 2.8; // ~64 degrees
    this.visionGraphics = scene.add.graphics().setDepth(50);

    // Progressive detection meter
    this.detectionMeter = 0;
    this.maxDetection = 100;
    this.detectionRate = 35; // % per second in direct sight
    this.decayRate = 25; // % per second when hidden
    this.isAlerted = false;

    // Alert sprite above head
    this.alertIcon = scene.add.image(this.x, this.y - 28, 'ui_detection_alert')
      .setDepth(200)
      .setVisible(false);
  }

  update(time, delta, player, coverObjects) {
    if (!player || !player.active) return;

    this.handleMovement(delta);
    this.checkVision(player, coverObjects, delta);
    this.alertIcon.setPosition(this.x, this.y - 26);
  }

  handleMovement(delta) {
    if (this.state === 'cooking') {
      this.setVelocity(0, 0);
      this.pauseTimer -= delta;
      if (this.pauseTimer <= 0) {
        this.state = 'patrolling';
        // Pick next random waypoint
        if (this.waypoints.length > 0) {
          this.targetIndex = (this.targetIndex + 1 + Math.floor(Math.random() * (this.waypoints.length - 1))) % this.waypoints.length;
        }
      }
      return;
    }

    if (this.waypoints.length === 0) return;

    const target = this.waypoints[this.targetIndex];
    const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);

    if (dist < 10) {
      // Pause for a domestic activity (cooking / organizing)
      this.state = 'cooking';
      this.pauseTimer = 2000 + Math.random() * 2500;
      this.setVelocity(0, 0);

      // Randomly change facing direction while cooking/observing
      const dirs = ['down', 'up', 'left', 'right'];
      this.facingDirection = dirs[Math.floor(Math.random() * dirs.length)];
      const tex = `mother_${this.facingDirection}_0`;
      if (this.scene.textures.exists(tex)) this.setTexture(tex);
      return;
    }

    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    const vx = Math.cos(angle) * this.speed;
    const vy = Math.sin(angle) * this.speed;
    this.setVelocity(vx, vy);

    if (Math.abs(vx) > Math.abs(vy)) {
      this.facingDirection = vx > 0 ? 'right' : 'left';
    } else {
      this.facingDirection = vy > 0 ? 'down' : 'up';
    }

    this.animTimer += delta;
    if (this.animTimer > 160) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
      const tex = `mother_${this.facingDirection}_${this.animFrame}`;
      if (this.scene.textures.exists(tex)) this.setTexture(tex);
    }
  }

  checkVision(player, coverObjects, delta) {
    this.visionGraphics.clear();

    let dirAngle = 0;
    if (this.facingDirection === 'right') dirAngle = 0;
    else if (this.facingDirection === 'left') dirAngle = Math.PI;
    else if (this.facingDirection === 'down') dirAngle = Math.PI / 2;
    else if (this.facingDirection === 'up') dirAngle = -Math.PI / 2;

    const startAngle = dirAngle - this.visionAngle / 2;
    const endAngle = dirAngle + this.visionAngle / 2;

    const coneColor = this.detectionMeter > 60 ? 0xff1744 : this.detectionMeter > 25 ? 0xff9800 : 0xffeb3b;
    const coneAlpha = this.detectionMeter > 60 ? 0.35 : 0.15;
    this.visionGraphics.fillStyle(coneColor, coneAlpha);
    this.visionGraphics.beginPath();
    this.visionGraphics.moveTo(this.x, this.y);
    this.visionGraphics.arc(this.x, this.y, this.visionRange, startAngle, endAngle);
    this.visionGraphics.closePath();
    this.visionGraphics.fill();

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    let playerInSight = false;

    if (dist <= this.visionRange) {
      const angleToPlayer = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      const angleDiff = Phaser.Math.Angle.Normalize(angleToPlayer - dirAngle);

      if (Math.abs(angleDiff) <= this.visionAngle / 2 || Math.abs(angleDiff - Math.PI * 2) <= this.visionAngle / 2) {
        // In visual arc, test if cover blocks view
        const isBlocked = this.isLineOfSightBlocked(this.x, this.y, player.x, player.y, coverObjects);
        if (!isBlocked) {
          playerInSight = true;
        }
      }
    }

    if (playerInSight) {
      if (!this.isAlerted) {
        this.isAlerted = true;
        this.alertIcon.setVisible(true);
        soundManager.playAlert();
      }

      this.detectionMeter = Math.min(this.maxDetection, this.detectionMeter + (this.detectionRate * delta / 1000));
      if (this.scene.hud) {
        this.scene.hud.setDetection(this.detectionMeter, `MUMMY SUSPICION: ${Math.round(this.detectionMeter)}%`);
      }

      if (this.detectionMeter >= this.maxDetection) {
        this.triggerCaught(player);
      }
    } else {
      if (this.detectionMeter > 0) {
        this.detectionMeter = Math.max(0, this.detectionMeter - (this.decayRate * delta / 1000));
        if (this.scene.hud) {
          this.scene.hud.setDetection(this.detectionMeter);
        }
      }
      if (this.detectionMeter === 0 && this.isAlerted) {
        this.isAlerted = false;
        this.alertIcon.setVisible(false);
      }
    }
  }

  isLineOfSightBlocked(x1, y1, x2, y2, coverObjects) {
    if (!coverObjects || coverObjects.length === 0) return false;
    const ray = new Phaser.Geom.Line(x1, y1, x2, y2);

    for (const obj of coverObjects) {
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
    this.state = 'cooking';
    this.pauseTimer = 999999;
    soundManager.playCaught();

    if (this.scene.handlePlayerCaught) {
      this.scene.handlePlayerCaught('Mummy caught you! "Kitchen mein patakhe dhoond rahe the?! Belan kahan hai mera?!"');
    }
  }

  destroy(fromScene) {
    if (this.visionGraphics) this.visionGraphics.destroy();
    if (this.alertIcon) this.alertIcon.destroy();
    super.destroy(fromScene);
  }
}
