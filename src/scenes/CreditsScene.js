// CreditsScene.js - Final Victory Sequence, Father's Punchline, Global Stopwatch Stop & End Credits
import { soundManager } from '../systems/SoundSystem.js';
import { globalTimer } from '../systems/TimerManager.js';
import { RecordManager } from '../systems/RecordManager.js';
import { DialogueManager } from '../systems/DialogueManager.js';

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Stop global stopwatch and register official run record!
    const finalElapsedMs = globalTimer.getElapsedMs();
    const finalTimeString = globalTimer.stop();

    // Register personal completion record
    const record = RecordManager.addRun(finalElapsedMs, finalTimeString);
    const pb = RecordManager.getPersonalBest();
    const isNewPb = pb && pb.runNumber === record.runNumber;

    soundManager.playMusic('credits');

    // Stage 1: Cinematic outside Sharma Ji's fortress gate
    this.playCinematicSequence(width, height, finalTimeString, isNewPb);
  }

  playCinematicSequence(width, height, finalTimeString, isNewPb) {
    // Night street outside fortress gate
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0d2e, 0x1a0d2e, 0x07040d, 0x07040d, 1);
    bg.fillRect(0, 0, width, height);

    // Fortress gates & street paver
    for (let x = 0; x < width; x += 32) {
      this.add.image(x + 16, height - 16, 'tile_bazaar_ground');
      this.add.image(x + 16, height - 48, 'tile_bazaar_ground');
    }

    // Festive diyas on street
    for (let x = 80; x < width; x += 160) {
      this.add.image(x, height - 70, 'obj_diya').setDisplaySize(24, 24);
    }

    // Characters in the scene
    // Chintu (Player) on left, rescued Phooljhadi beside him!
    const chintu = this.add.image(280, height - 70, 'player_right_0').setDisplaySize(44, 44);
    const phooljhadi = this.add.image(230, height - 60, 'phooljhadi').setDisplaySize(38, 38);

    // Heart animations over Phooljhadi!
    const heart = this.add.image(230, height - 90, 'ui_heart_full').setDisplaySize(20, 20);
    this.tweens.add({
      targets: heart,
      y: height - 110,
      alpha: 0.2,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Father waiting patiently on the right with his newspaper!
    const father = this.add.image(620, height - 75, 'father_left_0').setDisplaySize(48, 54);

    this.dialogue = new DialogueManager(this);

    // Cinematic dialogue sequence preserving the final joke:
    this.time.delayedCall(1000, () => {
      const script = [
        {
          speaker: 'CHINTU',
          portrait: 'portrait_player',
          text: 'Phooljhadi is safe! We defeated Sharma Ji and his 17 society rules!'
        },
        {
          speaker: 'PHOOLJHADI',
          portrait: 'portrait_phooljhadi',
          text: '*Happy festive barks & tail wagging!*'
        },
        {
          speaker: 'PAPA',
          portrait: 'portrait_father',
          text: 'Beta. Ghar chalein?'
        }
      ];

      this.dialogue.startDialogue(script, () => {
        // Roll credits after punchline!
        this.rollCredits(width, height, finalTimeString, isNewPb);
      });
    });
  }

  rollCredits(width, height, finalTimeString, isNewPb) {
    // Dim the scene smoothly
    const overlay = this.add.graphics();
    overlay.fillStyle(0x0a0515, 0.92);
    overlay.fillRect(0, 0, width, height);

    const container = this.add.container(width / 2, height + 50);

    // Congratulations Title
    const title = this.add.text(0, 0, 'VICTORY - DIWALI CHAOS', {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '26px',
      color: '#ff9933'
    }).setOrigin(0.5);
    container.add(title);

    // Final Time & Personal Record Notice
    const timeBanner = this.add.text(0, 50, `COMPLETION TIME: ${finalTimeString}`, {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '18px',
      color: '#ffd700'
    }).setOrigin(0.5);
    container.add(timeBanner);

    if (isNewPb) {
      const pbNotice = this.add.text(0, 85, '★ NEW PERSONAL BEST! ★', {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '14px',
        color: '#76ff03'
      }).setOrigin(0.5);
      container.add(pbNotice);
    }

    const credits = [
      '',
      'A Game of Festivity, Stealth, and Desi Neighborhood Politics',
      '',
      '--- THE CAST ---',
      'Chintu : The Fearless Kid',
      'Phooljhadi : The Beloved Indie Dog',
      'Papa : The Omnipresent Bazaar Patroller',
      'Mummy : The Belan-Wielding Kitchen Queen',
      'Sharma Ji : The Feared Society President',
      'Ramesh Kaka : The Faithful Sweet Halwai',
      'Society Aunties : The Besan Laddoo Distributors',
      '',
      '--- PRODUCTION ---',
      'Story, Architecture & Systems : Antigravity Pair-Programming',
      'Music & Audio Synthesis : Web Audio API Chiptune Engine',
      'Pixel Art & Textures : Procedural Canvas Pixel Generator',
      '',
      'HAPPY DIWALI TO ALL!',
      'May your festival be filled with sweets, light, and harmless laughter!'
    ];

    credits.forEach((text, idx) => {
      const line = this.add.text(0, 120 + idx * 28, text, {
        fontFamily: "'Outfit', sans-serif",
        fontSize: '16px',
        color: text.startsWith('---') ? '#ff9800' : '#ffffff',
        fontStyle: text.startsWith('---') ? 'bold' : 'normal'
      }).setOrigin(0.5);
      container.add(line);
    });

    // Tween the credits upward
    const scrollDistance = height + 750;
    this.tweens.add({
      targets: container,
      y: -650,
      duration: 18000,
      ease: 'Linear',
      onComplete: () => {
        this.showFinalOptions(width, height);
      }
    });

    // Also allow skipping credits by clicking
    const skipZone = this.add.zone(0, 0, width, height).setOrigin(0).setInteractive();
    skipZone.once('pointerdown', () => {
      this.tweens.killTweensOf(container);
      container.y = -650;
      this.showFinalOptions(width, height);
      skipZone.destroy();
    });
  }

  showFinalOptions(width, height) {
    const endContainer = this.add.container(width / 2, height / 2).setDepth(2000);

    const box = this.add.graphics();
    box.fillStyle(0x191029, 0.95);
    box.fillRoundedRect(-220, -120, 440, 240, 12);
    box.lineStyle(2, 0xff9933, 1);
    box.strokeRoundedRect(-220, -120, 440, 240, 12);
    endContainer.add(box);

    const congrats = this.add.text(0, -75, 'RUN COMPLETED!', {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '18px',
      color: '#ffd700'
    }).setOrigin(0.5);
    endContainer.add(congrats);

    // Buttons
    this.createFinalButton(endContainer, 0, -15, 'VIEW PERSONAL RECORDS', () => {
      this.scene.start('MainMenuScene');
    });

    this.createFinalButton(endContainer, 0, 50, 'PLAY AGAIN (NEW GAME)', () => {
      globalTimer.start();
      this.scene.start('BazaarScene');
    });
  }

  createFinalButton(container, x, y, text, callback) {
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1b42, 1);
    bg.fillRoundedRect(x - 160, y - 20, 320, 40, 6);
    bg.lineStyle(2, 0xffb74d, 0.7);
    bg.strokeRoundedRect(x - 160, y - 20, 320, 40, 6);
    container.add(bg);

    const label = this.add.text(x, y, text, {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(label);

    const zone = this.add.zone(x, y, 320, 40).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0xe65100, 1);
      bg.fillRoundedRect(x - 160, y - 20, 320, 40, 6);
      bg.lineStyle(2, 0xffd700, 1);
      bg.strokeRoundedRect(x - 160, y - 20, 320, 40, 6);
      soundManager.playMenuHover();
    });
    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x2a1b42, 1);
      bg.fillRoundedRect(x - 160, y - 20, 320, 40, 6);
      bg.lineStyle(2, 0xffb74d, 0.7);
      bg.strokeRoundedRect(x - 160, y - 20, 320, 40, 6);
    });
    zone.on('pointerdown', () => {
      soundManager.playMenuSelect();
      callback();
    });
    container.add(zone);
  }
}
