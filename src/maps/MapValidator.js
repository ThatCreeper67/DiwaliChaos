// MapValidator.js - Schema and bounds validation for data-driven maps

export class MapValidator {
  /**
   * Validate a level map data object
   * @param {object} mapData
   * @returns {{isValid: boolean, errors: string[], warnings: string[]}}
   */
  static validate(mapData) {
    const errors = [];
    const warnings = [];

    if (!mapData) {
      return { isValid: false, errors: ['Map data is null or undefined'], warnings: [] };
    }

    // 1. Required metadata
    if (!mapData.id) errors.push('Map is missing "id"');
    if (!mapData.name) warnings.push('Map is missing "name"');
    if (!mapData.tileSize || mapData.tileSize <= 0) errors.push('Map "tileSize" must be a positive integer');
    if (!mapData.cols || mapData.cols <= 0) errors.push('Map "cols" must be a positive integer');
    if (!mapData.rows || mapData.rows <= 0) errors.push('Map "rows" must be a positive integer');

    const tileSize = mapData.tileSize || 32;
    const cols = mapData.cols || 0;
    const rows = mapData.rows || 0;

    // 2. Bounds check
    if (!mapData.bounds || typeof mapData.bounds.width !== 'number' || typeof mapData.bounds.height !== 'number') {
      errors.push('Map is missing valid "bounds" { width, height }');
    } else {
      const minExpectedW = cols * tileSize;
      const minExpectedH = rows * tileSize;
      if (mapData.bounds.width < minExpectedW || mapData.bounds.height < minExpectedH) {
        warnings.push(`Map bounds (${mapData.bounds.width}x${mapData.bounds.height}) are smaller than grid size (${minExpectedW}x${minExpectedH})`);
      }
    }

    // 3. Player Spawn
    if (!mapData.playerSpawn) {
      errors.push('Map is missing "playerSpawn" { x, y }');
    } else {
      const { x, y } = mapData.playerSpawn;
      if (typeof x !== 'number' || typeof y !== 'number') {
        errors.push('"playerSpawn" x and y must be numbers');
      } else if (mapData.bounds && (x < 0 || x > mapData.bounds.width || y < 0 || y > mapData.bounds.height)) {
        errors.push(`"playerSpawn" (${x}, ${y}) is outside map bounds (0..${mapData.bounds.width}, 0..${mapData.bounds.height})`);
      }
    }

    // 4. Layers check
    if (!mapData.layers) {
      errors.push('Map is missing "layers" object');
    } else {
      if (!mapData.layers.ground) {
        warnings.push('Map "layers" is missing "ground" definition');
      }

      // Check collisionGrid if present
      if (mapData.layers.collisionGrid) {
        const grid = mapData.layers.collisionGrid;
        if (!Array.isArray(grid)) {
          errors.push('"collisionGrid" must be an array of rows');
        } else if (grid.length !== rows) {
          warnings.push(`"collisionGrid" row count (${grid.length}) does not match map rows (${rows})`);
        }
      }
    }

    // 5. Environmental props check
    if (mapData.environmentProps && Array.isArray(mapData.environmentProps)) {
      mapData.environmentProps.forEach((prop, idx) => {
        if (!prop.texture) errors.push(`Prop at index ${idx} is missing "texture"`);
        if (prop.gridPos) {
          const { c, r } = prop.gridPos;
          if (c < 0 || c >= cols || r < 0 || r >= rows) {
            warnings.push(`Prop "${prop.texture}" at index ${idx} gridPos (${c}, ${r}) is outside grid dimensions (${cols}x${rows})`);
          }
        }
      });
    }

    // 6. Gameplay objects check
    if (mapData.gameplayObjects && Array.isArray(mapData.gameplayObjects)) {
      mapData.gameplayObjects.forEach((obj, idx) => {
        if (!obj.id) warnings.push(`GameplayObject at index ${idx} is missing "id"`);
        if (obj.gridPos) {
          const { c, r } = obj.gridPos;
          if (c < 0 || c >= cols || r < 0 || r >= rows) {
            warnings.push(`GameplayObject "${obj.id || idx}" gridPos (${c}, ${r}) is outside grid dimensions (${cols}x${rows})`);
          }
        }
      });
    }

    // 7. Collectibles check
    if (mapData.collectibles && Array.isArray(mapData.collectibles)) {
      mapData.collectibles.forEach((item, idx) => {
        if (item.gridPos) {
          const { c, r } = item.gridPos;
          if (c < 0 || c >= cols || r < 0 || r >= rows) {
            warnings.push(`Collectible at index ${idx} gridPos (${c}, ${r}) is outside grid dimensions (${cols}x${rows})`);
          }
        }
      });
    }

    // 8. NPCs check
    if (mapData.npcs && Array.isArray(mapData.npcs)) {
      mapData.npcs.forEach((npc, idx) => {
        if (!npc.type) errors.push(`NPC at index ${idx} is missing "type"`);
        if (npc.spawn) {
          const { c, r } = npc.spawn;
          if (c < 0 || c >= cols || r < 0 || r >= rows) {
            warnings.push(`NPC "${npc.type}" spawn (${c}, ${r}) is outside grid dimensions (${cols}x${rows})`);
          }
        }
        if (npc.patrolWaypoints && Array.isArray(npc.patrolWaypoints)) {
          npc.patrolWaypoints.forEach((wp, wIdx) => {
            if (wp.c < 0 || wp.c >= cols || wp.r < 0 || wp.r >= rows) {
              warnings.push(`NPC "${npc.type}" waypoint ${wIdx} (${wp.c}, ${wp.r}) is outside grid dimensions`);
            }
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
