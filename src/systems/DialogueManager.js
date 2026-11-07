// DialogueManager.js - Retro dialogue overlay with typewriter effect, portraits, and audio blips
import { soundManager } from './SoundSystem.js';

export class DialogueManager {
  constructor(scene) {
    this.scene = scene;
    this.dialogueQueue = [];
    this.currentDialogue = null;
    this.isTyping = false;
    this.typewriterTimer = null;
    this.fullText = '';
    this.displayedText = '';
    this.charIndex = 0;
    this.onCompleteCallback = null;

    this.container = null;
    this.boxBg = null;
    this.portrait = null;
    this.nameText = null;
    this.messageText = null;
    this.promptText = null;

    this.createUI();
  }

  createUI() {
    const cam = this.scene.cameras.main;
    const width = 760;
    const height = 130;
    const x = (cam.width - width) / 2;
    const y = cam.height - height - 20;

    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(1000);
    this.container.setVisible(false);

    // Box background
    this.boxBg = this.scene.add.graphics();
    this.boxBg.fillStyle(0x1a1226, 0.95);
    this.boxBg.fillRoundedRect(x, y, width, height, 10);
    this.boxBg.lineStyle(3, 0xff9933, 1);
    this.boxBg.strokeRoundedRect(x, y, width, height, 10);
    this.container.add(this.boxBg);

    // Portrait frame
    const portraitBg = this.scene.add.graphics();
    portraitBg.fillStyle(0x2a1b40, 1);
    portraitBg.fillRoundedRect(x + 15, y + 15, 80, 80, 6);
    portraitBg.lineStyle(2, 0xffd700, 1);
    portraitBg.strokeRoundedRect(x + 15, y + 15, 80, 80, 6);
    this.container.add(portraitBg);

    // Portrait sprite
    this.portrait = this.scene.add.image(x + 55, y + 55, 'portrait_player');
    this.portrait.setDisplaySize(70, 70);
    this.container.add(this.portrait);

    // Speaker Name
    this.nameText = this.scene.add.text(x + 115, y + 15, 'SPEAKER', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 3
    });
    this.container.add(this.nameText);

    // Dialogue Text
    this.messageText = this.scene.add.text(x + 115, y + 42, '', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '17px',
      color: '#ffffff',
      wordWrap: { width: width - 140 },
      lineSpacing: 5
    });
    this.container.add(this.messageText);

    // Continue prompt
    this.promptText = this.scene.add.text(x + width - 180, y + height - 25, '[E / CLICK to next]', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '13px',
      color: '#ffb74d'
    });
    this.container.add(this.promptText);

    // Pulse prompt animation
    this.scene.tweens.add({
      targets: this.promptText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Input listener to advance
    this.advanceHandler = () => this.handleAdvance();
    this.scene.input.keyboard.on('keydown-E', this.advanceHandler);
    this.scene.input.keyboard.on('keydown-SPACE', this.advanceHandler);
    this.scene.input.on('pointerdown', this.advanceHandler);
  }

  startDialogue(dialogueList, onComplete) {
    this.dialogueQueue = [...dialogueList];
    this.onCompleteCallback = onComplete;
    this.container.setVisible(true);
    this.next();
  }

  next() {
    if (this.dialogueQueue.length === 0) {
      this.close();
      return;
    }

    const item = this.dialogueQueue.shift();
    this.nameText.setText(item.speaker || '');
    if (item.portrait && this.scene.textures.exists(item.portrait)) {
      this.portrait.setTexture(item.portrait);
    }

    this.fullText = item.text || '';
    this.displayedText = '';
    this.charIndex = 0;
    this.messageText.setText('');
    this.isTyping = true;

    if (this.typewriterTimer) clearInterval(this.typewriterTimer);

    this.typewriterTimer = setInterval(() => {
      if (this.charIndex < this.fullText.length) {
        this.displayedText += this.fullText[this.charIndex];
        this.messageText.setText(this.displayedText);
        if (this.charIndex % 3 === 0) {
          soundManager.playDialogueBlip();
        }
        this.charIndex++;
      } else {
        this.isTyping = false;
        clearInterval(this.typewriterTimer);
      }
    }, 20);
  }

  handleAdvance() {
    if (!this.container || !this.container.visible) return;

    if (this.isTyping) {
      // Skip typewriter to show full text immediately
      clearInterval(this.typewriterTimer);
      this.isTyping = false;
      this.messageText.setText(this.fullText);
    } else {
      soundManager.playMenuHover();
      this.next();
    }
  }

  close() {
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    this.container.setVisible(false);
    if (this.onCompleteCallback) {
      const cb = this.onCompleteCallback;
      this.onCompleteCallback = null;
      cb();
    }
  }

  isActive() {
    return this.container && this.container.visible;
  }

  destroy() {
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    if (this.scene && this.scene.input) {
      this.scene.input.keyboard.off('keydown-E', this.advanceHandler);
      this.scene.input.keyboard.off('keydown-SPACE', this.advanceHandler);
      this.scene.input.off('pointerdown', this.advanceHandler);
    }
  }
}
