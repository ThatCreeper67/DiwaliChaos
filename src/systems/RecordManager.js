// RecordManager.js - Manages personal run completion records in LocalStorage

const STORAGE_KEY = 'diwali_chaos_personal_records';

export class RecordManager {
  static getRecords() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load records:', e);
      return [];
    }
  }

  static addRun(completionTimeMs, timeString) {
    const records = this.getRecords();
    const runNumber = records.length + 1;
    const dateStr = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newRecord = {
      runNumber,
      completionTimeMs,
      timeString,
      date: dateStr
    };

    records.push(newRecord);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save record:', e);
    }

    return newRecord;
  }

  static getPersonalBest() {
    const records = this.getRecords();
    if (records.length === 0) return null;
    return records.reduce((best, curr) => {
      return curr.completionTimeMs < best.completionTimeMs ? curr : best;
    }, records[0]);
  }

  static getTotalRuns() {
    return this.getRecords().length;
  }

  static clearRecords() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      console.error('Failed to clear records:', e);
      return false;
    }
  }
}
