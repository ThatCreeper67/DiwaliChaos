// main.js - Application bootstrap
import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig.js';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Phaser.Game(GameConfig);
  window.__DIWALI_CHAOS_GAME__ = game;
});
