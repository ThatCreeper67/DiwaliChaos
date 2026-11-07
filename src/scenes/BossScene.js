// BossScene.js - Level 5: Sharma Ji's Fortress (Boss Encounter)
// Sharma Ji is strictly confined to the central aangan.
// Player can seek refuge in side rooms to heal and plan.
// 15 Sutli bombs distract Sharma Ji while player triggers 3 mandatory environmental objectives in any order.
import { Player } from '../entities/Player.js';
import { SharmaJi } from '../entities/SharmaJi.js';
import { HUD } from '../ui/HUD.js';
import { DialogueManager } from '../systems/DialogueManager.js';
import { soundManager } from '../systems/SoundSystem.js';
import { SaveManager } from '../systems/SaveManager.js';
import { globalTimer } from '../systems/TimerManager.js';
import { inventory } from '../systems/InventoryManager.js';

export class BossScene extends Phaser.Scene {
  constructor() {
    super('BossScene');
  }

  create() {
    const mapWidth = 1200;
    const mapHeight = 840;

    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    soundManager.playMusic('boss');

    this.walls = this.physics.add.staticGroup();
    this.projectiles = this.physics.add.group();
    this.bossProjectiles = this.physics.add.group();
    this.interactables = [];

    // Environmental Objectives State
    this.objectives = {
      decorDisaster: false, // Objective A
      announcement: false,  // Objective B
      grandFinale: false    // Objective C
    };

    // Central Aangan bounds: strictly for Sharma Ji!
    // x: 380 to 820, y: 220 to 620
    this.aanganRect = new Phaser.Geom.Rectangle(380, 220, 440, 400);

    this.buildFortress(mapWidth, mapHeight);

    // Spawn Player in the Entrance Vestibule (Safe side room at bottom)
    this.player = new Player(this, 600, 750);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // Spawn Sharma Ji in the central Aangan
    this.boss = new SharmaJi(this, 600, 400, this.aanganRect);

    // Collisions
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.boss, this.walls);

    // Player takes damage if physically caught by Sharma Ji (unless he is stunned!)
    this.physics.add.overlap(this.player, this.boss, () => {
      if (!this.boss.isStunned && !this.player.isInvulnerable) {
        this.damagePlayer('Sharma Ji slapped you with the 2026 Society Bye-Laws!');
      }
    });

    // Boss projectiles (Rulebook flyers) hitting player
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

    // Setup Phooljhadi (Kidnapped Mascot) tied at the back of the aangan
    this.phooljhadi = this.add.image(600, 240, 'phooljhadi').setDepth(25);
    this.tweens.add({
      targets: this.phooljhadi,
      scaleX: 1.1,
      duration: 300,
      yoyo: true,
      repeat: -1
    });

    this.hud = new HUD(this);
    this.dialogue = new DialogueManager(this);
    this.updateBossObjectiveText();

    // Interaction key
    this.input.keyboard.on('keydown-E', () => {
      if (!this.dialogue.isActive()) {
        this.checkInteractions();
      }
    });

    // Opening warning
    this.time.delayedCall(800, () => {
      this.hud.showPopupMessage('SAFE IN SIDE ROOMS! Distract Sharma Ji with bombs to trigger objectives!', '#ffd700', 4500);
    });
  }

  buildFortress(width, height) {
    // 1. Flooring
    for (let x = 0; x < width; x += 32) {
      for (let y = 0; y < height; y += 32) {
        if (this.aanganRect.contains(x + 16, y + 16)) {
          // Central Aangan: Terracotta ornamental courtyard tiles
          this.add.image(x + 16, y + 16, 'tile_aangan');
        } else {
          // Surrounding Interior rooms: Polished marble floor
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

    // 3. Aangan Boundaries (Pillars & Archways separating courtyard from interior rooms)
    // The player can freely walk between rooms and courtyard, but Sharma Ji is clamped to the courtyard!
    // Top boundary of Aangan (with gap for Phooljhadi viewing)
    for (let x = 380; x <= 820; x += 32) {
      if (x < 560 || x > 640) {
        this.createWall(x, 210, 'tile_wall_fortress');
      }
    }
    // Bottom boundary of Aangan (with archway entrance)
    for (let x = 380; x <= 820; x += 32) {
      if (x < 540 || x > 660) {
        this.createWall(x, 630, 'tile_wall_fortress');
      }
    }
    // Left boundary of Aangan (with doorway into Left Safe Study)
    for (let y = 220; y <= 620; y += 32) {
      if (y < 380 || y > 460) {
        this.createWall(370, y, 'tile_wall_fortress');
      }
    }
    // Right boundary of Aangan (with doorway into Right Safe Verandah)
    for (let y = 220; y <= 620; y += 32) {
      if (y < 380 || y > 460) {
        this.createWall(830, y, 'tile_wall_fortress');
      }
    }

    // 4. Safe Side Rooms Layout
    // Left Safe Room: Society Committee Office / Study (Houses Objective B: Society Announcement)
    this.add.text(200, 240, 'SOCIETY OFFICE\n(SAFE ROOM)', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#4caf50',
      align: 'center'
    }).setOrigin(0.5);

    // Right Safe Room: Verandah & Store (Houses Objective A: Decoration Disaster)
    this.add.text(1000, 240, 'VERANDAH\n(SAFE ROOM)', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#4caf50',
      align: 'center'
    }).setOrigin(0.5);

    // North Safe Room: Terrace Entrance (Houses Objective C: Grand Finale)
    this.add.text(600, 100, 'TERRACE BATTERY\n(SAFE ROOM)', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#4caf50',
      align: 'center'
    }).setOrigin(0.5);

    // 5. Environmental Objective Props
    // OBJECTIVE A: Decoration Disaster (Overload festive light power console in Verandah)
    this.objA_sprite = this.add.image(1020, 360, 'obj_boss_decor').setDisplaySize(48, 48);
    this.interactables.push({
      x: 1020,
      y: 360,
      radius: 60,
      prompt: '[E] Trigger Decoration Disaster',
      action: () => this.activateObjectiveA()
    });

    // OBJECTIVE B: Society Announcement (Sabotage Public Address console in Office)
    this.objB_sprite = this.add.image(180, 360, 'obj_boss_speaker').setDisplaySize(48, 48);
    this.interactables.push({
      x: 180,
      y: 360,
      radius: 60,
      prompt: '[E] Broadcast Society Announcement Feedback',
      action: () => this.activateObjectiveB()
    });

    // OBJECTIVE C: Grand Finale (Ignite aerial fireworks battery on Terrace)
    this.objC_sprite = this.add.image(600, 140, 'obj_boss_finale').setDisplaySize(48, 48);
    this.interactables.push({
      x: 600,
      y: 140,
      radius: 60,
      prompt: '[E] Launch Grand Finale Cracker Battery',
      action: () => this.activateObjectiveC()
    });

    // Safety Furniture / Sofas in Safe Rooms
    this.createWall(200, 480, 'obj_sofa');
    this.createWall(1000, 480, 'obj_sofa');

    // Free Laddoos in Safe Rooms for emergency healing
    this.createLaddooPickup(140, 240);
    this.createLaddooPickup(1060, 240);
    this.createLaddooPickup(460, 750);
  }

  createWall(x, y, texture = 'tile_wall_interior') {
    const wall = this.walls.create(x, y, texture);
    wall.setImmovable(true);
    wall.refreshBody();
    return wall;
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

  // Spawns player's Sutli bomb projectile
  spawnBomb(x, y, angle) {
    const bomb = this.projectiles.create(x, y, 'item_sutli_bomb').setDisplaySize(20, 20);
    const speed = 280;
    bomb.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    // Auto-explode after 1.2s if no direct hit
    this.time.delayedCall(1200, () => {
      if (bomb.active) {
        // Area stun check
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

    // Damage flash & knockback
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
      // Restart boss fight with full health (Timer continues!)
      inventory.heal(4);
      this.scene.restart();
    });
  }

  // --- OBJECTIVE A: DECORATION DISASTER ---
  activateObjectiveA() {
    if (this.objectives.decorDisaster) {
      this.hud.showPopupMessage('Decoration Disaster already triggered!');
      return;
    }

    this.objectives.decorDisaster = true;
    soundManager.playObjectiveComplete();

    // Visual Chandelier / Lights electrical short effect
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

  // --- OBJECTIVE B: SOCIETY ANNOUNCEMENT ---
  activateObjectiveB() {
    if (this.objectives.announcement) {
      this.hud.showPopupMessage('Announcement feedback already broadcasted!');
      return;
    }

    this.objectives.announcement = true;
    soundManager.playObjectiveComplete();

    // Sonic shockwave animation
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

  // --- OBJECTIVE C: GRAND FINALE ---
  activateObjectiveC() {
    if (this.objectives.grandFinale) {
      this.hud.showPopupMessage('Grand Finale battery already ignited!');
      return;
    }

    this.objectives.grandFinale = true;
    soundManager.playObjectiveComplete();

    // Aerial rockets explosion shower
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

    // Clear saved checkpoint
    SaveManager.clearSave();

    // Final dialogue with defeated Sharma Ji
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
      // Transition to final victory credits sequence
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
      if (dist <= item.radius) {
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
