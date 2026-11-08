// MapCoordinates.js - Coordinate transformation utilities between grid (col, row) and world (x, y) pixels

export class MapCoordinates {
  /**
   * Convert grid column and row to center pixel coordinates
   * @param {number} col - Column index (0-based)
   * @param {number} row - Row index (0-based)
   * @param {number} tileSize - Size of a tile in pixels (default 32)
   * @returns {{x: number, y: number}}
   */
  static gridToWorldCenter(col, row, tileSize = 32) {
    return {
      x: Math.floor(col * tileSize + tileSize / 2),
      y: Math.floor(row * tileSize + tileSize / 2)
    };
  }

  /**
   * Convert grid column and row to top-left pixel coordinates
   * @param {number} col
   * @param {number} row
   * @param {number} tileSize
   * @returns {{x: number, y: number}}
   */
  static gridToWorldTopLeft(col, row, tileSize = 32) {
    return {
      x: col * tileSize,
      y: row * tileSize
    };
  }

  /**
   * Convert world pixel coordinate to grid column and row
   * @param {number} x
   * @param {number} y
   * @param {number} tileSize
   * @returns {{col: number, row: number}}
   */
  static worldToGrid(x, y, tileSize = 32) {
    return {
      col: Math.floor(x / tileSize),
      row: Math.floor(y / tileSize)
    };
  }

  /**
   * Calculate Y-depth sorting based on foot position
   * @param {number} y - Center Y position
   * @param {number} height - Total height of sprite
   * @param {number} baseDepth - Base depth offset (default 10)
   * @returns {number}
   */
  static calculateFootDepth(y, height = 32, baseDepth = 10) {
    const footY = y + height / 2;
    return baseDepth + Math.floor(footY);
  }

  /**
   * Check if grid column and row are within bounds
   * @param {number} col
   * @param {number} row
   * @param {number} cols
   * @param {number} rows
   * @returns {boolean}
   */
  static isWithinGrid(col, row, cols, rows) {
    return col >= 0 && col < cols && row >= 0 && row < rows;
  }
}
