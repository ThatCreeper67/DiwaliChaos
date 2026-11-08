// PreloadScene.js - Generates all procedural pixel art textures and loads external PNG assets
import { TextureGenerator } from '../utils/TextureGenerator.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // List of external PNG assets from public/assets/
    const externalAssets = [
      { key: 'spr_bazaar_bg', path: 'assets/BAZAAR.png' },
      { key: 'spr_autovalebhaiya', path: 'assets/autovalebhaiya.png' },
      { key: 'spr_backdoor', path: 'assets/backdoor.png' },
      { key: 'spr_chaabhi', path: 'assets/chaabhi.png' },
      { key: 'spr_chintu', path: 'assets/chintu.png' },
      { key: 'spr_door', path: 'assets/door.png' },
      { key: 'spr_ladoo', path: 'assets/ladoo.png' },
      { key: 'spr_man1', path: 'assets/man1.png' },
      { key: 'spr_man2', path: 'assets/man2.png' },
      { key: 'spr_mataji', path: 'assets/mataji.png' },
      { key: 'spr_phooljhadi', path: 'assets/phooljhadipng.png' },
      { key: 'spr_pitaji', path: 'assets/pitaji.png' },
      { key: 'spr_sabjivalebhaiya', path: 'assets/sabjivalebhaiya.png' },
      { key: 'spr_sandook', path: 'assets/sandook.png' },
      { key: 'spr_sharmaji', path: 'assets/sharmaJi.png' },
      { key: 'spr_sharmaji2', path: 'assets/sharmaJi2.png' },
      { key: 'spr_sharmaji3', path: 'assets/sharmaJi3.png' },
      { key: 'spr_sutlibomb', path: 'assets/sutlibomb.png' },
      { key: 'spr_woman1', path: 'assets/woman1.png' },
      { key: 'spr_woman2', path: 'assets/woman2.png' }
    ];

    // Load file error handling
    this.load.on('loaderror', (fileObj) => {
      console.warn(`[AssetLoader] Warning: Failed to load asset "${fileObj.key}" from "${fileObj.src}"`);
    });

    externalAssets.forEach(asset => {
      this.load.image(asset.key, asset.path);
    });
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

    // Generate all procedural pixel textures (preserves 100% existing procedural textures)
    TextureGenerator.createAllTextures(this);

    // Subtle fade-in then transition to Main Menu
    this.time.delayedCall(300, () => {
      this.cameras.main.fade(300, 13, 9, 20, false, (cam, progress) => {
        if (progress === 1) {
          this.scene.start('MainMenuScene');
        }
      });
    });
  }
}
