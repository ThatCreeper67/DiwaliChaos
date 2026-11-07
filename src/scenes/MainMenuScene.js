// MainMenuScene.js - Main Menu with New Game, Continue, Personal Records, Settings, and Credits
import { soundManager } from '../systems/SoundSystem.js';
import { globalTimer } from '../systems/TimerManager.js';
import { inventory } from '../systems/InventoryManager.js';
import { SaveManager } from '../systems/SaveManager.js';
import { RecordManager } from '../systems/RecordManager.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background gradient effect
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0933, 0x1a0933, 0x0a0515, 0x0a0515, 1);
    bg.fillRect(0, 0, width, height);

    // Decorative Rangoli in background center
    const rangoli = this.add.image(width / 2, height / 2 + 50, 'obj_rangoli')
      .setDisplaySize(280, 280)
      .setAlpha(0.2);
    this.tweens.add({
      targets: rangoli,
      angle: 360,
      duration: 50000,
      repeat: -1
    });

    // Decorative Hanging Diyas & Lights
    for (let x = 60; x < width; x += 120) {
      const diya = this.add.image(x, 40, 'obj_diya').setDisplaySize(32, 32);
      this.tweens.add({
        targets: diya,
        y: 44,
        duration: 800 + (x % 300),
        yoyo: true,
        repeat: -1
      });
    }

    // Floating festive sparkles
    for (let i = 0; i < 20; i++) {
      const spark = this.add.image(Phaser.Math.Between(20, width - 20), Phaser.Math.Between(20, height - 20), 'fx_sparkle')
        .setAlpha(Phaser.Math.FloatBetween(0.2, 0.8))
        .setScale(Phaser.Math.FloatBetween(0.8, 1.6));
      this.tweens.add({
        targets: spark,
        alpha: 0.1,
        y: '-=25',
        duration: Phaser.Math.Between(1500, 3000),
        yoyo: true,
        repeat: -1
      });
    }

    // Title Banner
    const title = this.add.text(width / 2, 130, 'DIWALI CHAOS', {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '44px',
      color: '#ff9933',
      stroke: '#4a148c',
      strokeThickness: 10,
      shadow: { blur: 15, color: '#ffb74d', fill: true }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scale: 1.03,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const subtitle = this.add.text(width / 2, 180, 'OPERATION RESCUE PHOOLJHADI', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '18px',
      fontStyle: '800',
      color: '#ffd700',
      letterSpacing: 4
    }).setOrigin(0.5);

    // Menu Options
    const hasSave = SaveManager.hasSavedGame();
    const menuItems = [
      { text: 'NEW GAME', cb: () => this.startNewGame() },
      { text: 'CONTINUE', cb: () => this.continueGame(), disabled: !hasSave },
      { text: 'PERSONAL RECORDS', cb: () => this.showRecords() },
      { text: 'SETTINGS', cb: () => this.showSettings() },
      { text: 'CREDITS', cb: () => this.showCredits() }
    ];

    const startY = 240;
    menuItems.forEach((item, index) => {
      const btnY = startY + index * 56;
      this.createMenuButton(width / 2, btnY, item.text, item.cb, item.disabled);
    });

    // Footer info
    this.add.text(width / 2, height - 25, 'Use WASD to move • E to interact • ESC for pause menu', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '13px',
      color: '#9e9e9e'
    }).setOrigin(0.5);

    // Play menu music on first user click
    this.input.once('pointerdown', () => {
      soundManager.playMusic('menu');
    });
  }

  createMenuButton(x, y, text, callback, disabled = false) {
    const btnWidth = 320;
    const btnHeight = 44;

    const bg = this.add.graphics();
    const normalColor = disabled ? 0x211c27 : 0x241638;
    const strokeColor = disabled ? 0x4a4353 : 0xff9933;

    bg.fillStyle(normalColor, 0.95);
    bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
    bg.lineStyle(2, strokeColor, 1);
    bg.strokeRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);

    const label = this.add.text(x, y, text, {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '18px',
      fontStyle: 'bold',
      color: disabled ? '#616161' : '#ffffff'
    }).setOrigin(0.5);

    if (disabled) return;

    const zone = this.add.zone(x, y, btnWidth, btnHeight).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => {
      soundManager.playMenuHover();
      bg.clear();
      bg.fillStyle(0xe65100, 1);
      bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
      bg.lineStyle(2, 0xffd700, 1);
      bg.strokeRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
      label.setColor('#ffffff');
    });

    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(normalColor, 0.95);
      bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
      bg.lineStyle(2, strokeColor, 1);
      bg.strokeRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
      label.setColor('#ffffff');
    });

    zone.on('pointerdown', () => {
      soundManager.playMenuSelect();
      callback();
    });
  }

  startNewGame() {
    SaveManager.clearSave();
    inventory.reset();
    globalTimer.start(); // Start global stopwatch from 00:00:00
    this.cameras.main.fade(400, 0, 0, 0, false, (cam, progress) => {
      if (progress === 1) {
        this.scene.start('BazaarScene');
      }
    });
  }

  continueGame() {
    const save = SaveManager.loadGame();
    if (!save) return;

    inventory.importState(save.inventory);
    globalTimer.setTime(save.timerMs || 0);
    globalTimer.resumeTimer();

    this.cameras.main.fade(400, 0, 0, 0, false, (cam, progress) => {
      if (progress === 1) {
        this.scene.start(save.sceneKey || 'BazaarScene');
      }
    });
  }

  // --- PERSONAL RECORDS MODAL ---
  showRecords() {
    const { width, height } = this.cameras.main;
    const modal = this.add.container(0, 0).setDepth(2000);

    const dim = this.add.graphics();
    dim.fillStyle(0x0a0515, 0.9);
    dim.fillRect(0, 0, width, height);
    modal.add(dim);

    const boxWidth = 620;
    const boxHeight = 480;
    const boxX = (width - boxWidth) / 2;
    const boxY = (height - boxHeight) / 2;

    const box = this.add.graphics();
    box.fillStyle(0x191029, 1);
    box.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    box.lineStyle(3, 0xff9933, 1);
    box.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    modal.add(box);

    const title = this.add.text(width / 2, boxY + 36, 'PERSONAL RECORDS', {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '20px',
      color: '#ffd700'
    }).setOrigin(0.5);
    modal.add(title);

    const records = RecordManager.getRecords();
    const pb = RecordManager.getPersonalBest();

    const pbText = pb
      ? `PERSONAL BEST: ${pb.timeString} (Run #${pb.runNumber})`
      : 'NO COMPLETED RUNS YET! ESCAPE HOME & DEFEAT SHARMA JI!';
    const pbDisplay = this.add.text(width / 2, boxY + 75, pbText, {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#4caf50'
    }).setOrigin(0.5);
    modal.add(pbDisplay);

    // Records Table Header
    const tableHeader = this.add.text(boxX + 35, boxY + 115, 'RUN      TIME        DATE', {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '12px',
      color: '#ff9800'
    });
    modal.add(tableHeader);

    // Line items (Show up to 6 latest or top records)
    if (records.length === 0) {
      const emptyMsg = this.add.text(width / 2, boxY + 200, 'Complete the story to register your run!', {
        fontFamily: "'Outfit', sans-serif",
        fontSize: '16px',
        color: '#bdbdbd'
      }).setOrigin(0.5);
      modal.add(emptyMsg);
    } else {
      const displayRecords = [...records].reverse().slice(0, 6);
      displayRecords.forEach((r, idx) => {
        const rowY = boxY + 145 + idx * 34;
        const isPb = pb && pb.runNumber === r.runNumber;
        const color = isPb ? '#76ff03' : '#ffffff';

        const rowText = `#${r.runNumber.toString().padEnd(6)} ${r.timeString.padEnd(11)} ${r.date} ${isPb ? ' ★ PB' : ''}`;
        const row = this.add.text(boxX + 35, rowY, rowText, {
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '11px',
          color: color
        });
        modal.add(row);
      });
    }

    // Clear Records button
    if (records.length > 0) {
      const clearBtn = this.add.text(boxX + 40, boxY + boxHeight - 45, '[ CLEAR HISTORY ]', {
        fontFamily: "'Outfit', sans-serif",
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#e53935'
      }).setInteractive({ useHandCursor: true });

      clearBtn.on('pointerdown', () => {
        if (window.confirm('Are you sure you want to delete all personal records?')) {
          RecordManager.clearRecords();
          modal.destroy();
          this.showRecords();
        }
      });
      modal.add(clearBtn);
    }

    // Close button
    const closeBtn = this.add.text(boxX + boxWidth - 140, boxY + boxHeight - 45, '[ CLOSE X ]', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      soundManager.playMenuHover();
      modal.destroy();
    });
    modal.add(closeBtn);
  }

  // --- SETTINGS MODAL ---
  showSettings() {
    const { width, height } = this.cameras.main;
    const modal = this.add.container(0, 0).setDepth(2000);

    const dim = this.add.graphics();
    dim.fillStyle(0x0a0515, 0.9);
    dim.fillRect(0, 0, width, height);
    modal.add(dim);

    const boxWidth = 500;
    const boxHeight = 380;
    const boxX = (width - boxWidth) / 2;
    const boxY = (height - boxHeight) / 2;

    const box = this.add.graphics();
    box.fillStyle(0x191029, 1);
    box.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    box.lineStyle(3, 0xff9933, 1);
    box.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    modal.add(box);

    const title = this.add.text(width / 2, boxY + 40, 'SETTINGS', {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '20px',
      color: '#ffd700'
    }).setOrigin(0.5);
    modal.add(title);

    // Mute Audio Option
    const muteLabel = this.add.text(boxX + 50, boxY + 110, 'AUDIO STATUS:', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff'
    });
    modal.add(muteLabel);

    const muteBtn = this.add.text(boxX + 280, boxY + 110, soundManager.isMuted ? '[ MUTED ]' : '[ ENABLED ]', {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '14px',
      color: soundManager.isMuted ? '#e53935' : '#4caf50'
    }).setInteractive({ useHandCursor: true });

    muteBtn.on('pointerdown', () => {
      soundManager.setMute(!soundManager.isMuted);
      muteBtn.setText(soundManager.isMuted ? '[ MUTED ]' : '[ ENABLED ]');
      muteBtn.setColor(soundManager.isMuted ? '#e53935' : '#4caf50');
    });
    modal.add(muteBtn);

    // Music Volume
    const musicLabel = this.add.text(boxX + 50, boxY + 170, 'MUSIC VOLUME:', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff'
    });
    modal.add(musicLabel);

    const musicVolText = this.add.text(boxX + 280, boxY + 170, `[ ${Math.round(soundManager.musicVolume * 100)}% ]`, {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '14px',
      color: '#ffd700'
    }).setInteractive({ useHandCursor: true });

    musicVolText.on('pointerdown', () => {
      let next = soundManager.musicVolume + 0.25;
      if (next > 1.05) next = 0.25;
      soundManager.setMusicVolume(next);
      musicVolText.setText(`[ ${Math.round(soundManager.musicVolume * 100)}% ]`);
    });
    modal.add(musicVolText);

    // SFX Volume
    const sfxLabel = this.add.text(boxX + 50, boxY + 230, 'SFX VOLUME:', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff'
    });
    modal.add(sfxLabel);

    const sfxVolText = this.add.text(boxX + 280, boxY + 230, `[ ${Math.round(soundManager.sfxVolume * 100)}% ]`, {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '14px',
      color: '#ffd700'
    }).setInteractive({ useHandCursor: true });

    sfxVolText.on('pointerdown', () => {
      let next = soundManager.sfxVolume + 0.25;
      if (next > 1.05) next = 0.25;
      soundManager.setSfxVolume(next);
      sfxVolText.setText(`[ ${Math.round(soundManager.sfxVolume * 100)}% ]`);
      soundManager.playMenuSelect();
    });
    modal.add(sfxVolText);

    // Close
    const closeBtn = this.add.text(width / 2, boxY + 310, '[ SAVE & CLOSE ]', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ff9800'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      soundManager.playMenuHover();
      modal.destroy();
    });
    modal.add(closeBtn);
  }

  // --- CREDITS MODAL ---
  showCredits() {
    const { width, height } = this.cameras.main;
    const modal = this.add.container(0, 0).setDepth(2000);

    const dim = this.add.graphics();
    dim.fillStyle(0x0a0515, 0.92);
    dim.fillRect(0, 0, width, height);
    modal.add(dim);

    const boxWidth = 560;
    const boxHeight = 440;
    const boxX = (width - boxWidth) / 2;
    const boxY = (height - boxHeight) / 2;

    const box = this.add.graphics();
    box.fillStyle(0x191029, 1);
    box.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    box.lineStyle(3, 0xff9933, 1);
    box.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    modal.add(box);

    const title = this.add.text(width / 2, boxY + 36, 'DIWALI CHAOS', {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '22px',
      color: '#ffd700'
    }).setOrigin(0.5);
    modal.add(title);

    const lines = [
      'Story & Concept: The Indian Society Diwali Odyssey',
      'Engine: Phaser 3 + HTML5 Canvas & Web Audio API',
      'Pixel Art & Music: 100% Procedurally Synthesized',
      '',
      'Starring:',
      'Chintu (The Hero Kid)',
      'Phooljhadi (The Beloved Mascot Dog)',
      'Papa (Patroller of Bazaar)',
      'Mummy (Kitchen Commander)',
      'Sharma Ji (Society President & Final Boss)',
      '',
      'Happy Diwali & Happy Gaming!'
    ];

    lines.forEach((line, idx) => {
      const text = this.add.text(width / 2, boxY + 80 + idx * 24, line, {
        fontFamily: "'Outfit', sans-serif",
        fontSize: '15px',
        color: idx === 0 || idx === 11 ? '#ff9800' : '#ffffff'
      }).setOrigin(0.5);
      modal.add(text);
    });

    const closeBtn = this.add.text(width / 2, boxY + boxHeight - 35, '[ BACK TO MENU ]', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      soundManager.playMenuHover();
      modal.destroy();
    });
    modal.add(closeBtn);
  }
}
