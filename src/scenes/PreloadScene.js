// PreloadScene.js - Generates all procedural pixel art textures and transitions to MainMenu
import { TextureGenerator } from '../utils/TextureGenerator.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d0914);

    const title = this.add.text(width / 2, height / 2 - 40, 'DIWALI CHAOS', {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '28px',
      color: '#ff9933'
    }).setOrigin(0.5);

    const subtitle = this.add.text(width / 2, height / 2 + 10, 'PREPARING CRACKERS & SWEETS...', {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '16px',
      color: '#ffd700'
    }).setOrigin(0.5);

    // Generate all procedural pixel textures
    TextureGenerator.createAllTextures(this);

    // Subtle fade-in then transition to Main Menu
    this.time.delayedCall(400, () => {
      this.cameras.main.fade(300, 13, 9, 20, false, (cam, progress) => {
        if (progress === 1) {
          this.scene.start('MainMenuScene');
        }
      });
    });
  }
}
