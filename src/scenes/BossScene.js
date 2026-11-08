// BossScene.js - Level 5: Sharma Ji's Fortress (Data-Driven via MapLoader)
import { Player } from '../entities/Player.js';
import { SharmaJi } from '../entities/SharmaJi.js';
import { HUD } from '../ui/HUD.js';
import { DialogueManager } from '../systems/DialogueManager.js';
import { soundManager } from '../systems/SoundSystem.js';
import { SaveManager } from '../systems/SaveManager.js';
import { globalTimer } from '../systems/TimerManager.js';
import { inventory } from '../systems/InventoryManager.js';
import { MapLoader } from '../maps/MapLoader.js';
import { BossMapData } from '../maps/data/BossMapData.js';

export class BossScene extends Phaser.Scene {
  constructor() {
    super('BossScene');
  }

  create() {
    soundManager.playMusic('boss');

    // 1. Load Data-Driven Map
    const loader = new MapLoader(this);
    this.mapInstance = loader.loadMap(BossMapData);
    this.walls = this.mapInstance.collisionGroup;
    this.interactables = this.mapInstance.interactables;
    this.aanganRect = this.mapInstance.aanganRect || new Phaser.Geom.Rectangle(380, 220, 440, 400);

    this.projectiles = this.physics.add.group();
    this.bossProjectiles = this.physics.add.group();

    // Environmental Objectives State
    this.objectives = {
      decorDisaster: false, // Objective A
      announcement: false,  // Objective B
      grandFinale: false    // Objective C
    };

    // Safe Room Room Text Labels
    this.add.text(200, 240, 'SOCIETY OFFICE\n(SAFE ROOM)', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#4caf50',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(1000, 240, 'VERANDAH\n(SAFE ROOM)', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#4caf50',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(600, 100, 'TERRACE BATTERY\n(SAFE ROOM)', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#4caf50',
      align: 'center'
    }).setOrigin(0.5);

    // 2. Spawn Player
    const spawn = this.mapInstance.playerSpawn;
    this.player = new Player(this, spawn.x, spawn.y);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // 3. Spawn Sharma Ji in central Aangan
    this.boss = new SharmaJi(this, 600, 400, this.aanganRect);

    // 4. Collisions
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.boss, this.walls);

    // Physical damage if caught by Sharma Ji (unless stunned)
    this.physics.add.overlap(this.player, this.boss, () => {
      if (!this.boss.isStunned && !this.player.isInvulnerable) {
        this.damagePlayer('Sharma Ji slapped you with the 2026 Society Bye-Laws!');
      }
    });

    // Boss rule flyers hitting player
    this.physics.add.overlap(this.player, this.bossProjectiles, (player, proj) => {
      proj.destroy();
      if (!this.player.isInvulnerable) {
        this.damagePlayer('Hit by an Official Society Fine Notice!');
      }
    });

    // Sutli bomb hitting Sharma Ji
    this.physics.add.overlap(this.boss, this.projectiles, (boss, bomb) => {
      bomb.destroy();
      this.boss.hitByBomb();
      this.hud.showPopupMessage('SHARMA JI IS STUNNED! QUICK, ACTIVATE OBJECTIVES!', '#ffeb3b', 2500);
    });

    // Bomb hitting walls
    this.physics.add.collider(this.projectiles, this.walls, (bomb) => {
      soundManager.playBombExplosion();
      bomb.destroy();
    });

    // Collectibles in safe rooms
    this.mapInstance.collectibleSprites.forEach(item => {
      this.physics.add.overlap(this.player, item, () => {
        soundManager.playLaddooPickup();
        inventory.addLaddoo(item.collectibleCount || 1);
        this.hud.showPopupMessage('+1 LADDOO!', '#ffd700');
        this.hud.updateHUD();
        item.destroy();
      });
    });

    // 5. Setup Phooljhadi Mascot
    this.phooljhadi = this.add.image(600, 240, 'phooljhadi').setDepth(25);
    this.tweens.add({
      targets: this.phooljhadi,
      scaleX: 1.1,
      duration: 300,
      yoyo: true,
      repeat: -1
    });

    // 6. Wire Objectives Action Callbacks
    this.interactables.forEach(item => {
      if (item.actionType === 'objective_a') {
        item.action = () => this.activateObjectiveA();
      } else if (item.actionType === 'objective_b') {
        item.action = () => this.activateObjectiveB();
      } else if (item.actionType === 'objective_c') {
        item.action = () => this.activateObjectiveC();
      }
    });

    // 7. HUD & Dialogue Manager
    this.hud = new HUD(this);
    this.dialogue = new DialogueManager(this);
    this.updateBossObjectiveText();

    this.input.keyboard.on('keydown-E', () => {
      if (!this.dialogue.isActive()) {
        this.checkInteractions();
      }
    });

    this.time.delayedCall(800, () => {
      this.hud.showPopupMessage('SAFE IN SIDE ROOMS! Distract Sharma Ji with bombs to trigger objectives!', '#ffd700', 4500);
    });
  }

  // Spawns player's Sutli bomb projectile
  spawnBomb(x, y, angle) {
    const bomb = this.projectiles.create(x, y, 'item_sutli_bomb').setDisplaySize(20, 20);
    const speed = 280;
    bomb.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    this.time.delayedCall(1200, () => {
      if (bomb.active) {
        const distToBoss = Phaser.Math.Distance.Between(bomb.x, bomb.y, this.boss.x, this.boss.y);
        if (distToBoss < 85) {
          this.boss.hitByBomb();
        }
        soundManager.playBombExplosion();
        bomb.destroy();
      }
    });
  }

  // Spawns boss rule flyers
  spawnRuleFlyer(x, y, angle) {
    const flyer = this.bossProjectiles.create(x, y, 'obj_notice_board').setDisplaySize(20, 16);
    const speed = 190;
    flyer.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.time.delayedCall(2200, () => {
      if (flyer.active) flyer.destroy();
    });
  }

  damagePlayer(reason) {
    this.player.isInvulnerable = true;
    inventory.damage(1);
    soundManager.playCaught();
    this.hud.showPopupMessage(reason, '#ff1744', 2500);
    this.hud.updateHUD();

    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.player.isInvulnerable = false;
        this.player.setAlpha(1);
      }
    });

    if (inventory.isDead()) {
      this.handlePlayerDefeated();
    }
  }

  handlePlayerDefeated() {
    this.player.canMove = false;
    this.player.setVelocity(0, 0);

    this.dialogue.startDialogue([
      {
        speaker: 'SHARMA JI',
        portrait: 'portrait_sharma',
        text: 'NO ONE DEFIES THE SOCIETY PRESIDENT! I told you Diwali celebrations are strictly regulated!'
      }
    ], () => {
      inventory.heal(4);
      this.scene.restart();
    });
  }

  activateObjectiveA() {
    if (this.objectives.decorDisaster) {
      this.hud.showPopupMessage('Decoration Disaster already triggered!');
      return;
    }

    this.objectives.decorDisaster = true;
    soundManager.playObjectiveComplete();

    for (let i = 0; i < 8; i++) {
      const spark = this.add.image(600 + Phaser.Math.Between(-80, 80), 380 + Phaser.Math.Between(-60, 60), 'fx_sparkle')
        .setDisplaySize(32, 32);
      this.tweens.add({
        targets: spark,
        scale: 2,
        alpha: 0,
        duration: 800,
        onComplete: () => spark.destroy()
      });
    }

    this.hud.showPopupMessage('OBJECTIVE A: DECORATION DISASTER ACTIVATED!', '#ffd700', 3500);
    this.boss.applyObjectiveDamage(30, 'Decoration Disaster');
    this.boss.shout('MY 10,000 RUPEES IMPORTED LIGHTS! RUINED!');
    this.updateBossObjectiveText();
  }

  activateObjectiveB() {
    if (this.objectives.announcement) {
      this.hud.showPopupMessage('Announcement feedback already broadcasted!');
      return;
    }

    this.objectives.announcement = true;
    soundManager.playObjectiveComplete();

    const ring = this.add.image(600, 400, 'fx_shockwave').setDisplaySize(40, 40);
    this.tweens.add({
      targets: ring,
      scale: 6,
      alpha: 0,
      duration: 1000,
      onComplete: () => ring.destroy()
    });

    this.hud.showPopupMessage('OBJECTIVE B: SOCIETY ANNOUNCEMENT BROADCASTED!', '#ffd700', 3500);
    this.boss.applyObjectiveDamage(35, 'Society Announcement');
    this.boss.shout('MY EARS! SHUT DOWN THE LOUDSPEAKER!');
    this.updateBossObjectiveText();
  }

  activateObjectiveC() {
    if (this.objectives.grandFinale) {
      this.hud.showPopupMessage('Grand Finale battery already ignited!');
      return;
    }

    this.objectives.grandFinale = true;
    soundManager.playObjectiveComplete();

    for (let i = 0; i < 15; i++) {
      this.time.delayedCall(i * 120, () => {
        soundManager.playBombExplosion();
        const boom = this.add.image(600 + Phaser.Math.Between(-120, 120), 380 + Phaser.Math.Between(-100, 100), 'fx_shockwave')
          .setTint(Phaser.Utils.Array.GetRandom([0xff1744, 0xffeb3b, 0x00e676, 0x2979ff]));
        this.tweens.add({
          targets: boom,
          scale: 3,
          alpha: 0,
          duration: 500,
          onComplete: () => boom.destroy()
        });
      });
    }

    this.hud.showPopupMessage('OBJECTIVE C: GRAND FINALE FIREWORKS UNLEASHED!', '#ffd700', 3500);
    this.boss.applyObjectiveDamage(35, 'Grand Finale');
    this.boss.shout('SPECTACULAR... WAIT, THIS IS AN UNAUTHORIZED FINALE!');
    this.updateBossObjectiveText();
  }

  updateBossObjectiveText() {
    const doneCount = (this.objectives.decorDisaster ? 1 : 0) +
                      (this.objectives.announcement ? 1 : 0) +
                      (this.objectives.grandFinale ? 1 : 0);

    this.hud.setObjective(`Activate 3 Mandatory Objectives: ${doneCount} / 3 Completed!`);
  }

  handleBossVictory() {
    this.player.canMove = false;
    this.player.setVelocity(0, 0);

    SaveManager.clearSave();

    this.dialogue.startDialogue([
      {
        speaker: 'SHARMA JI',
        portrait: 'portrait_sharma',
        text: 'Congratulations! You have successfully violated 17 society rules.'
      },
      {
        speaker: 'CHINTU',
        portrait: 'portrait_player',
        text: 'And I rescued Phooljhadi! Happy Diwali, Uncle!'
      }
    ], () => {
      this.cameras.main.fade(800, 0, 0, 0, false, (cam, progress) => {
        if (progress === 1) {
          this.scene.start('CreditsScene');
        }
      });
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

  update(time, delta) {
    this.player.update(time, delta);
    this.hud.updateHUD();

    if (this.boss && this.boss.active) {
      this.boss.update(time, delta, this.player);
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
