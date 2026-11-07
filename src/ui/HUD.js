// HUD.js - Game HUD overlay (Stopwatch, Health, Inventory, Objectives, Detection Meter, Pause Menu)
import { globalTimer } from '../systems/TimerManager.js';
import { inventory } from '../systems/InventoryManager.js';
import { soundManager } from '../systems/SoundSystem.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;
    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(900);

    this.heartSprites = [];
    this.timerText = null;
    this.laddooText = null;
    this.bombText = null;
    this.objectiveTitle = null;
    this.objectiveDesc = null;

    // Detection meter elements
    this.detectionContainer = null;
    this.detectionBar = null;
    this.detectionWarningText = null;

    // Interaction prompt
    this.promptContainer = null;
    this.promptText = null;

    // Pause menu elements
    this.pauseContainer = null;
    this.isPaused = false;

    this.createHUD();
    this.createPauseMenu();
  }

  createHUD() {
    const cam = this.scene.cameras.main;

    // --- TOP BAR BACKGROUND ---
    const topBar = this.scene.add.graphics();
    topBar.fillStyle(0x0e0917, 0.85);
    topBar.fillRect(0, 0, cam.width, 48);
    topBar.lineStyle(2, 0xff9933, 0.7);
    topBar.lineBetween(0, 48, cam.width, 48);
    this.container.add(topBar);

    // 1. TOP-LEFT: GLOBAL STOPWATCH
    const timerBg = this.scene.add.graphics();
    timerBg.fillStyle(0x21153b, 0.9);
    timerBg.fillRoundedRect(12, 8, 140, 32, 6);
    timerBg.lineStyle(1.5, 0xffd700, 0.8);
    timerBg.strokeRoundedRect(12, 8, 140, 32, 6);
    this.container.add(timerBg);

    // Diya icon next to timer
    const diyaIcon = this.scene.add.image(28, 24, 'obj_diya').setDisplaySize(20, 20);
    this.container.add(diyaIcon);

    this.timerText = this.scene.add.text(44, 15, '00:00:00', {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '13px',
      color: '#ffd54f'
    });
    this.container.add(this.timerText);

    // 2. HEALTH HEARTS
    const healthX = 175;
    for (let i = 0; i < inventory.maxHealth; i++) {
      const heart = this.scene.add.image(healthX + i * 26, 24, 'ui_heart_full').setDisplaySize(22, 22);
      this.heartSprites.push(heart);
      this.container.add(heart);
    }

    // 3. INVENTORY ITEMS (Laddoos & Sutli Bombs)
    // Laddoo UI
    const laddooIcon = this.scene.add.image(315, 24, 'item_laddoo').setDisplaySize(22, 22);
    this.container.add(laddooIcon);

    this.laddooText = this.scene.add.text(332, 16, 'LADDOOS: 0 (HELD: 0)', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffb74d'
    });
    this.container.add(this.laddooText);

    // Sutli Bomb UI (Visible when bombs are acquired)
    this.bombIcon = this.scene.add.image(540, 24, 'item_sutli_bomb').setDisplaySize(22, 22);
    this.container.add(this.bombIcon);

    this.bombText = this.scene.add.text(558, 16, 'BOMBS: 0', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#81c784'
    });
    this.container.add(this.bombText);

    // 4. TOP-RIGHT: PAUSE BUTTON
    const pauseBtn = this.scene.add.graphics();
    pauseBtn.fillStyle(0x311b92, 0.9);
    pauseBtn.fillRoundedRect(cam.width - 95, 8, 85, 32, 6);
    pauseBtn.lineStyle(1.5, 0xff9933, 0.8);
    pauseBtn.strokeRoundedRect(cam.width - 95, 8, 85, 32, 6);
    this.container.add(pauseBtn);

    const pauseLabel = this.scene.add.text(cam.width - 52, 24, 'PAUSE', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#fff'
    }).setOrigin(0.5);
    this.container.add(pauseLabel);

    const pauseHit = this.scene.add.zone(cam.width - 95, 8, 85, 32).setOrigin(0).setInteractive({ useHandCursor: true });
    pauseHit.on('pointerdown', () => this.togglePause());
    this.container.add(pauseHit);

    // 5. OBJECTIVE TRACKER (Below top bar)
    const objBg = this.scene.add.graphics();
    objBg.fillStyle(0x130d24, 0.8);
    objBg.fillRoundedRect(12, 56, 440, 34, 6);
    objBg.lineStyle(1, 0xffb74d, 0.4);
    objBg.strokeRoundedRect(12, 56, 440, 34, 6);
    this.container.add(objBg);

    this.objectiveTitle = this.scene.add.text(22, 60, 'OBJECTIVE:', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ff9800'
    });
    this.container.add(this.objectiveTitle);

    this.objectiveDesc = this.scene.add.text(100, 60, '', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '13px',
      color: '#ffffff'
    });
    this.container.add(this.objectiveDesc);

    // 6. DETECTION METER CONTAINER (for stealth levels)
    this.detectionContainer = this.scene.add.container(cam.width / 2, 72);
    this.detectionContainer.setVisible(false);

    const detBg = this.scene.add.graphics();
    detBg.fillStyle(0x000000, 0.85);
    detBg.fillRoundedRect(-140, -14, 280, 28, 6);
    detBg.lineStyle(1.5, 0xff5252, 0.8);
    detBg.strokeRoundedRect(-140, -14, 280, 28, 6);
    this.detectionContainer.add(detBg);

    this.detectionBar = this.scene.add.graphics();
    this.detectionContainer.add(this.detectionBar);

    this.detectionWarningText = this.scene.add.text(0, 0, 'DETECTION', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.detectionContainer.add(this.detectionWarningText);

    this.container.add(this.detectionContainer);

    // 7. CONTEXTUAL PROMPT (Bottom center)
    this.promptContainer = this.scene.add.container(cam.width / 2, cam.height - 35);
    const pBg = this.scene.add.graphics();
    pBg.fillStyle(0x0e0917, 0.9);
    pBg.fillRoundedRect(-200, -14, 400, 28, 6);
    pBg.lineStyle(1.5, 0xffd700, 0.7);
    pBg.strokeRoundedRect(-200, -14, 400, 28, 6);
    this.promptContainer.add(pBg);

    this.promptText = this.scene.add.text(0, 0, '', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '14px',
      color: '#fff'
    }).setOrigin(0.5);
    this.promptContainer.add(this.promptText);
    this.promptContainer.setVisible(false);
    this.container.add(this.promptContainer);

    // Escape key pauses
    this.scene.input.keyboard.on('keydown-ESC', () => this.togglePause());

    // 'H' key shortcut to heal using held laddoo
    this.scene.input.keyboard.on('keydown-H', () => {
      if (inventory.eatLaddoo()) {
        soundManager.playEatLaddoo();
        this.showPopupMessage('+1 HEART RESTORED!');
        this.updateHUD();
      } else if (inventory.laddoosHeld <= 0) {
        this.showPopupMessage('No laddoos left to eat!');
      } else {
        this.showPopupMessage('Health is already full!');
      }
    });
  }

  setObjective(text) {
    if (this.objectiveDesc) {
      this.objectiveDesc.setText(text);
    }
  }

  showPrompt(msg) {
    this.promptText.setText(msg);
    this.promptContainer.setVisible(true);
  }

  hidePrompt() {
    this.promptContainer.setVisible(false);
  }

  setDetection(percent, customWarning = null) {
    if (percent <= 0) {
      this.detectionContainer.setVisible(false);
      return;
    }
    this.detectionContainer.setVisible(true);
    const pct = Math.min(100, Math.max(0, percent));

    this.detectionBar.clear();
    const fillWidth = (pct / 100) * 260;
    const color = pct < 50 ? 0xffeb3b : pct < 80 ? 0xff9800 : 0xff1744;
    this.detectionBar.fillStyle(color, 0.9);
    this.detectionBar.fillRoundedRect(-130, -10, fillWidth, 20, 4);

    if (customWarning) {
      this.detectionWarningText.setText(customWarning);
    } else {
      this.detectionWarningText.setText(`DETECTION: ${Math.round(pct)}%`);
    }
  }

  updateHUD() {
    // 1. Timer
    this.timerText.setText(globalTimer.getTimeString());

    // 2. Hearts
    for (let i = 0; i < inventory.maxHealth; i++) {
      if (i < inventory.currentHealth) {
        this.heartSprites[i].setTexture('ui_heart_full');
      } else {
        this.heartSprites[i].setTexture('ui_heart_empty');
      }
    }

    // 3. Laddoos
    this.laddooText.setText(`LADDOOS: ${inventory.totalLaddoosCollected} (HELD: ${inventory.laddoosHeld})`);

    // 4. Sutli Bombs
    this.bombText.setText(`BOMBS: ${inventory.sutliBombs}`);
  }

  showPopupMessage(text, color = '#ffd700', duration = 2000) {
    const cam = this.scene.cameras.main;
    const msg = this.scene.add.text(cam.width / 2, 110, text, {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '14px',
      color: color,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    this.scene.tweens.add({
      targets: msg,
      y: 90,
      alpha: 0,
      duration: duration,
      ease: 'Power2',
      onComplete: () => msg.destroy()
    });
  }

  // --- PAUSE MENU ---
  createPauseMenu() {
    const cam = this.scene.cameras.main;
    this.pauseContainer = this.scene.add.container(0, 0);
    this.pauseContainer.setScrollFactor(0);
    this.pauseContainer.setDepth(1500);
    this.pauseContainer.setVisible(false);

    // Dim overlay
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x0a0612, 0.85);
    overlay.fillRect(0, 0, cam.width, cam.height);
    this.pauseContainer.add(overlay);

    // Menu Card
    const menuWidth = 460;
    const menuHeight = 440;
    const menuX = (cam.width - menuWidth) / 2;
    const menuY = (cam.height - menuHeight) / 2;

    const card = this.scene.add.graphics();
    card.fillStyle(0x181028, 1);
    card.fillRoundedRect(menuX, menuY, menuWidth, menuHeight, 12);
    card.lineStyle(3, 0xff9933, 1);
    card.strokeRoundedRect(menuX, menuY, menuWidth, menuHeight, 12);
    this.pauseContainer.add(card);

    // Title
    const title = this.scene.add.text(cam.width / 2, menuY + 40, 'GAME PAUSED', {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '20px',
      color: '#ffd700'
    }).setOrigin(0.5);
    this.pauseContainer.add(title);

    // Menu Buttons
    const buttons = [
      { text: 'RESUME', cb: () => this.togglePause() },
      { text: 'RESTART LEVEL', cb: () => this.restartLevel() },
      { text: 'TOGGLE MUTE', cb: () => this.toggleMute() },
      { text: 'CONTROLS / HELP', cb: () => this.showControlsHelp() },
      { text: 'MAIN MENU', cb: () => this.goToMainMenu() }
    ];

    buttons.forEach((btn, idx) => {
      const btnY = menuY + 100 + idx * 56;
      const bGraphic = this.scene.add.graphics();
      bGraphic.fillStyle(0x2a1b42, 1);
      bGraphic.fillRoundedRect(cam.width / 2 - 160, btnY, 320, 42, 6);
      bGraphic.lineStyle(2, 0xffb74d, 0.7);
      bGraphic.strokeRoundedRect(cam.width / 2 - 160, btnY, 320, 42, 6);
      this.pauseContainer.add(bGraphic);

      const bText = this.scene.add.text(cam.width / 2, btnY + 21, btn.text, {
        fontFamily: "'Outfit', sans-serif",
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5);
      this.pauseContainer.add(bText);

      const zone = this.scene.add.zone(cam.width / 2 - 160, btnY, 320, 42).setOrigin(0).setInteractive({ useHandCursor: true });
      zone.on('pointerover', () => {
        bGraphic.clear();
        bGraphic.fillStyle(0xe65100, 1);
        bGraphic.fillRoundedRect(cam.width / 2 - 160, btnY, 320, 42, 6);
        bGraphic.lineStyle(2, 0xffd700, 1);
        bGraphic.strokeRoundedRect(cam.width / 2 - 160, btnY, 320, 42, 6);
        soundManager.playMenuHover();
      });
      zone.on('pointerout', () => {
        bGraphic.clear();
        bGraphic.fillStyle(0x2a1b42, 1);
        bGraphic.fillRoundedRect(cam.width / 2 - 160, btnY, 320, 42, 6);
        bGraphic.lineStyle(2, 0xffb74d, 0.7);
        bGraphic.strokeRoundedRect(cam.width / 2 - 160, btnY, 320, 42, 6);
      });
      zone.on('pointerdown', () => {
        soundManager.playMenuSelect();
        btn.cb();
      });
      this.pauseContainer.add(zone);
    });
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      globalTimer.pause();
      this.scene.physics.pause();
      this.pauseContainer.setVisible(true);
    } else {
      globalTimer.resumeTimer();
      this.scene.physics.resume();
      this.pauseContainer.setVisible(false);
    }
  }

  restartLevel() {
    this.isPaused = false;
    this.pauseContainer.setVisible(false);
    this.scene.physics.resume();
    globalTimer.resumeTimer(); // Timer never resets on restart!
    this.scene.scene.restart();
  }

  toggleMute() {
    soundManager.setMute(!soundManager.isMuted);
    this.showPopupMessage(soundManager.isMuted ? 'AUDIO MUTED' : 'AUDIO UNMUTED');
  }

  showControlsHelp() {
    const cam = this.scene.cameras.main;
    const helpCard = this.scene.add.container(0, 0).setDepth(2000);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0e0917, 0.95);
    bg.fillRoundedRect(cam.width / 2 - 250, cam.height / 2 - 170, 500, 340, 10);
    bg.lineStyle(2, 0xffd700, 1);
    bg.strokeRoundedRect(cam.width / 2 - 250, cam.height / 2 - 170, 500, 340, 10);
    helpCard.add(bg);

    const title = this.scene.add.text(cam.width / 2, cam.height / 2 - 130, 'CONTROLS & SHORTCUTS', {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '15px',
      color: '#ffd700'
    }).setOrigin(0.5);
    helpCard.add(title);

    const controls = [
      'WASD / ARROWS : Move Chintu',
      'E : Interact / Talk / Search',
      'H : Eat Laddoo (Heals 1 Heart)',
      'LEFT CLICK / SPACE : Throw Sutli Bomb (Boss arena)',
      'ESC : Pause Menu'
    ];

    controls.forEach((c, i) => {
      const text = this.scene.add.text(cam.width / 2 - 210, cam.height / 2 - 80 + i * 36, c, {
        fontFamily: "'Outfit', sans-serif",
        fontSize: '16px',
        color: '#ffffff'
      });
      helpCard.add(text);
    });

    const closeBtn = this.scene.add.text(cam.width / 2, cam.height / 2 + 130, '[ CLICK ANYWHERE TO CLOSE ]', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ff9800'
    }).setOrigin(0.5);
    helpCard.add(closeBtn);

    const clickZone = this.scene.add.zone(0, 0, cam.width, cam.height).setOrigin(0).setInteractive();
    clickZone.on('pointerdown', () => {
      helpCard.destroy();
    });
  }

  goToMainMenu() {
    this.isPaused = false;
    this.pauseContainer.setVisible(false);
    this.scene.physics.resume();
    soundManager.stopMusic();
    this.scene.scene.start('MainMenuScene');
  }

  destroy() {
    this.container.destroy();
  }
}
