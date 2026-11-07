// SaveManager.js - Saves and loads game progress for the 'Continue' feature

const SAVE_KEY = 'diwali_chaos_saved_game';

export class SaveManager {
  static hasSavedGame() {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  static saveGame(sceneKey, inventoryData, timerMs) {
    try {
      const data = {
        sceneKey,
        inventory: inventoryData,
        timerMs,
        timestamp: Date.now()
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save game:', e);
      return false;
    }
  }

  static loadGame() {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load save:', e);
      return null;
    }
  }

  static clearSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {}
  }
}
