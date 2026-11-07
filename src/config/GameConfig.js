// GameConfig.js - Phaser 3 configuration
import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene.js';
import { PreloadScene } from '../scenes/PreloadScene.js';
import { MainMenuScene } from '../scenes/MainMenuScene.js';
import { BazaarScene } from '../scenes/BazaarScene.js';
import { SocietyScene } from '../scenes/SocietyScene.js';
import { HomeScene } from '../scenes/HomeScene.js';
import { MazeScene } from '../scenes/MazeScene.js';
import { BossScene } from '../scenes/BossScene.js';
import { CreditsScene } from '../scenes/CreditsScene.js';

export const GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 960,
  height: 640,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    BazaarScene,
    SocietyScene,
    HomeScene,
    MazeScene,
    BossScene,
    CreditsScene
  ]
};
