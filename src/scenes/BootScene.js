// BootScene.js - Initializes system configs and begins asset generation
import { soundManager } from '../systems/SoundSystem.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Hide HTML loading overlay once Phaser initializes
    const loader = document.getElementById('loading-overlay');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 400);
    }
  }

  create() {
    soundManager.init();
    this.scene.start('PreloadScene');
  }
}
