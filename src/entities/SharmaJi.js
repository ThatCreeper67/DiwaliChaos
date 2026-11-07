// SharmaJi.js - Boss AI entity for Sharma Ji
// Strictly bounded to the central aangan; cannot enter interior rooms.
// Susceptible to Sutli bomb distractions (stuns), defeated via 3 mandatory environmental objectives.
import { soundManager } from '../systems/SoundSystem.js';

export class SharmaJi extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, aanganBounds) {
    super(scene, x, y, 'sharma_down_0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(26, 26);
    this.setOffset(11, 22);

    this.aanganBounds = aanganBounds; // Rectangle { x, y, width, height }
    this.maxHealth = 100;
    this.health = 100;

    // Movement & state
    this.speed = 100;
    this.state = 'patrol'; // 'patrol', 'pursue', 'attack', 'stunned'
    this.facingDirection = 'down';

    // Stun status (from Sutli bombs)
    this.stunTimer = 0;
    this.isStunned = false;

    // Attack cooldowns
    this.attackCooldown = 0;
    this.attackInterval = 3000;

    // Boss Phase
    this.phase = 1; // 1: 100-75%, 2: 75-30%, 3: 30-0%
    this.completedObjectivesCount = 0;

    // Dialogue quotes tracker
    this.hasShoutedPhase2 = false;
    this.hasShoutedPhase3 = false;

    // Animation timer
    this.animTimer = 0;
    this.animFrame = 0;

    // Health bar graphics
    this.hpBar = scene.add.graphics().setDepth(200);

    // Initial dialogue
    scene.time.delayedCall(1000, () => {
      this.shout('WHO GAVE YOU PERMISSION TO ENTER?!');
    });
  }

  update(time, delta, player) {
    if (!player || !player.active) return;

    this.updatePhase();
    this.drawBossHPBar();

    if (this.isStunned) {
      this.setVelocity(0, 0);
      this.setTexture('sharma_stunned');
      this.stunTimer -= delta;
      if (this.stunTimer <= 0) {
        this.isStunned = false;
        this.setTexture(`sharma_${this.facingDirection}_0`);
      }
      return;
    }

    // Check if player is inside the aangan bounds
    const playerInAangan = this.aanganBounds.contains(player.x, player.y);

    if (playerInAangan) {
      this.state = 'pursue';
      this.handlePursuit(player, delta);
    } else {
      this.state = 'patrol';
      this.handlePatrolInAangan(delta);
    }

    // Keep Sharma Ji strictly bounded inside central aangan!
    this.clampToAangan();
  }

  updatePhase() {
    if (this.health <= 30 && this.phase < 3) {
      this.phase = 3;
      this.speed = 135;
      this.attackInterval = 1800;
      if (!this.hasShoutedPhase3) {
        this.hasShoutedPhase3 = true;
        this.shout('I WILL CALL YOUR FATHER!');
      }
    } else if (this.health <= 75 && this.phase < 2) {
      this.phase = 2;
      this.speed = 115;
      this.attackInterval = 2400;
      if (!this.hasShoutedPhase2) {
        this.hasShoutedPhase2 = true;
        this.shout('I AM THE PRESIDENT OF THIS SOCIETY!');
      }
    }
  }

  handlePursuit(player, delta) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    const vx = Math.cos(angle) * this.speed;
    const vy = Math.sin(angle) * this.speed;
    this.setVelocity(vx, vy);

    if (Math.abs(vx) > Math.abs(vy)) {
      this.facingDirection = vx > 0 ? 'right' : 'left';
    } else {
      this.facingDirection = vy > 0 ? 'down' : 'up';
    }

    this.animateWalk(delta);

    // Megaphone sonic shout attack
    this.attackCooldown += delta;
    if (this.attackCooldown >= this.attackInterval) {
      this.attackCooldown = 0;
      this.performMegaphoneAttack(player);
    }
  }

  handlePatrolInAangan(delta) {
    // Wander around central courtyard
    this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    if (!this.patrolTarget || Phaser.Math.Distance.Between(this.x, this.y, this.patrolTarget.x, this.patrolTarget.y) < 15) {
      this.patrolTarget = {
        x: Phaser.Math.Between(this.aanganBounds.x + 30, this.aanganBounds.x + this.aanganBounds.width - 30),
        y: Phaser.Math.Between(this.aanganBounds.y + 30, this.aanganBounds.y + this.aanganBounds.height - 30)
      };
    }

    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.patrolTarget.x, this.patrolTarget.y);
    const vx = Math.cos(angle) * (this.speed * 0.6);
    const vy = Math.sin(angle) * (this.speed * 0.6);
    this.setVelocity(vx, vy);

    this.facingDirection = vx > 0 ? 'right' : 'left';
    this.animateWalk(delta);
  }

  clampToAangan() {
    // Strictly clamp position to interior of aangan
    const minX = this.aanganBounds.x + 20;
    const maxX = this.aanganBounds.x + this.aanganBounds.width - 20;
    const minY = this.aanganBounds.y + 20;
    const maxY = this.aanganBounds.y + this.aanganBounds.height - 20;

    if (this.x < minX) { this.x = minX; this.setVelocityX(0); }
    if (this.x > maxX) { this.x = maxX; this.setVelocityX(0); }
    if (this.y < minY) { this.y = minY; this.setVelocityY(0); }
    if (this.y > maxY) { this.y = maxY; this.setVelocityY(0); }
  }

  performMegaphoneAttack(player) {
    soundManager.playSharmaShout();
    this.setTexture('sharma_attack');

    // Spawn rule flyer projectiles towards player
    if (this.scene.spawnRuleFlyer) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this.scene.spawnRuleFlyer(this.x, this.y, angle);
      if (this.phase >= 2) {
        this.scene.spawnRuleFlyer(this.x, this.y, angle - 0.35);
        this.scene.spawnRuleFlyer(this.x, this.y, angle + 0.35);
      }
    }

    this.scene.time.delayedCall(450, () => {
      if (!this.isStunned) {
        this.setTexture(`sharma_${this.facingDirection}_0`);
      }
    });
  }

  animateWalk(delta) {
    this.animTimer += delta;
    if (this.animTimer > 150) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
      const tex = `sharma_${this.facingDirection}_${this.animFrame}`;
      if (this.scene.textures.exists(tex)) {
        this.setTexture(tex);
      }
    }
  }

  // Sutli bomb hits Sharma Ji: creates harmless cartoon stun distraction!
  hitByBomb() {
    this.isStunned = true;
    this.stunTimer = 3500; // 3.5 seconds stun
    this.setVelocity(0, 0);
    this.setTexture('sharma_stunned');
    soundManager.playBombExplosion();

    // Visual star shockwave
    const shock = this.scene.add.image(this.x, this.y - 10, 'fx_shockwave').setDepth(210);
    this.scene.tweens.add({
      targets: shock,
      scale: 2.2,
      alpha: 0,
      duration: 600,
      onComplete: () => shock.destroy()
    });

    this.shout('WHAT IS THIS NONSENSE?!');
  }

  // Environmental objective completed: causes major health reduction!
  applyObjectiveDamage(damagePercent, objectiveName) {
    this.completedObjectivesCount++;
    this.health = Math.max(0, this.health - damagePercent);

    soundManager.playObjectiveComplete();

    // Stun boss heavily on objective completion
    this.isStunned = true;
    this.stunTimer = 4000;
    this.setVelocity(0, 0);
    this.setTexture('sharma_stunned');

    if (this.health <= 0) {
      this.triggerDefeat();
    }
  }

  triggerDefeat() {
    this.setVelocity(0, 0);
    this.isStunned = true;
    this.stunTimer = 999999;
    soundManager.playCaught();

    if (this.scene.handleBossVictory) {
      this.scene.handleBossVictory();
    }
  }

  shout(text) {
    const bubble = this.scene.add.container(this.x, this.y - 45).setDepth(300);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xffffff, 0.95);
    bg.fillRoundedRect(-120, -14, 240, 28, 6);
    bg.lineStyle(2, 0xd32f2f, 1);
    bg.strokeRoundedRect(-120, -14, 240, 28, 6);
    bubble.add(bg);

    const txt = this.scene.add.text(0, 0, text, {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#d32f2f'
    }).setOrigin(0.5);
    bubble.add(txt);

    this.scene.tweens.add({
      targets: bubble,
      y: this.y - 60,
      alpha: 0,
      duration: 2500,
      delay: 1000,
      onComplete: () => bubble.destroy()
    });
  }

  drawBossHPBar() {
    this.hpBar.clear();
    const cam = this.scene.cameras.main;
    const barWidth = 340;
    const barHeight = 16;
    const x = (cam.width - barWidth) / 2;
    const y = 88;

    // HP background
    this.hpBar.fillStyle(0x0e0917, 0.9);
    this.hpBar.fillRoundedRect(x - 5, y - 5, barWidth + 10, barHeight + 10, 6);
    this.hpBar.lineStyle(2, 0xd32f2f, 0.8);
    this.hpBar.strokeRoundedRect(x - 5, y - 5, barWidth + 10, barHeight + 10, 6);

    // HP fill
    const pct = Math.max(0, this.health / this.maxHealth);
    const fillColor = pct > 0.5 ? 0x43a047 : pct > 0.25 ? 0xfb8c00 : 0xe53935;
    this.hpBar.fillStyle(fillColor, 1);
    this.hpBar.fillRoundedRect(x, y, barWidth * pct, barHeight, 4);
  }

  destroy(fromScene) {
    if (this.hpBar) this.hpBar.destroy();
    super.destroy(fromScene);
  }
}
