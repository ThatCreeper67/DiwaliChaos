// InventoryManager.js - Tracks player health, laddoos, sutli bombs, and keys

export class InventoryManager {
  constructor() {
    this.maxHealth = 4;
    this.currentHealth = 4;

    // Laddoo system:
    // Total collected: never decreases, tracks quest completion
    // Held: available to eat for healing
    this.totalLaddoosCollected = 0;
    this.laddoosHeld = 0;
    this.requiredSocietyLaddoos = 10; // Configurable target for Level 2

    // Sutli bombs
    this.sutliBombs = 0;

    // Keys
    this.hasKitchenKey = false;
  }

  reset() {
    this.maxHealth = 4;
    this.currentHealth = 4;
    this.totalLaddoosCollected = 0;
    this.laddoosHeld = 0;
    this.sutliBombs = 0;
    this.hasKitchenKey = false;
  }

  // Health
  damage(amount = 1) {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    return this.currentHealth;
  }

  heal(amount = 1) {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    return this.currentHealth;
  }

  isDead() {
    return this.currentHealth <= 0;
  }

  // Laddoos
  addLaddoo(count = 1) {
    this.totalLaddoosCollected += count;
    this.laddoosHeld += count;
  }

  eatLaddoo() {
    if (this.laddoosHeld > 0 && this.currentHealth < this.maxHealth) {
      this.laddoosHeld--;
      this.heal(1);
      return true; // Successfully healed
    }
    return false;
  }

  // Sutli Bombs
  addSutliBombs(count = 15) {
    this.sutliBombs += count;
  }

  useSutliBomb() {
    if (this.sutliBombs > 0) {
      this.sutliBombs--;
      return true;
    }
    return false;
  }

  // State export/import for saving
  exportState() {
    return {
      maxHealth: this.maxHealth,
      currentHealth: this.currentHealth,
      totalLaddoosCollected: this.totalLaddoosCollected,
      laddoosHeld: this.laddoosHeld,
      sutliBombs: this.sutliBombs,
      hasKitchenKey: this.hasKitchenKey
    };
  }

  importState(state) {
    if (!state) return;
    this.maxHealth = state.maxHealth ?? 4;
    this.currentHealth = state.currentHealth ?? 4;
    this.totalLaddoosCollected = state.totalLaddoosCollected ?? 0;
    this.laddoosHeld = state.laddoosHeld ?? 0;
    this.sutliBombs = state.sutliBombs ?? 0;
    this.hasKitchenKey = state.hasKitchenKey ?? false;
  }
}

export const inventory = new InventoryManager();
