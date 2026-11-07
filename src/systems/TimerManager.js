// TimerManager.js - Centralized Full-Game Stopwatch
// Measures gameplay time across all 5 levels, persists through deaths/restarts, pauses on pause menu.

export class TimerManager {
  constructor() {
    this.elapsedTimeMs = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.lastTimestamp = 0;
  }

  start() {
    this.elapsedTimeMs = 0;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTimestamp = performance.now();
  }

  resumeTimer() {
    if (!this.isRunning) return;
    this.isPaused = false;
    this.lastTimestamp = performance.now();
  }

  pause() {
    if (this.isRunning && !this.isPaused) {
      this.update();
      this.isPaused = true;
    }
  }

  stop() {
    if (this.isRunning) {
      this.update();
      this.isRunning = false;
      this.isPaused = false;
    }
    return this.getTimeString();
  }

  update() {
    if (!this.isRunning || this.isPaused) return;
    const now = performance.now();
    const delta = now - this.lastTimestamp;
    this.elapsedTimeMs += delta;
    this.lastTimestamp = now;
  }

  getElapsedMs() {
    this.update();
    return Math.floor(this.elapsedTimeMs);
  }

  // Returns formatted string HH:MM:SS (e.g. 00:24:38)
  getTimeString() {
    const totalMs = this.getElapsedMs();
    const totalSeconds = Math.floor(totalMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  // Restore state (for save game continue)
  setTime(ms) {
    this.elapsedTimeMs = ms;
    this.lastTimestamp = performance.now();
  }
}

export const globalTimer = new TimerManager();
