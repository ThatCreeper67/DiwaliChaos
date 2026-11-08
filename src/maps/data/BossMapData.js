// BossMapData.js - Level 5: Sharma Ji's Fortress Map Definition (38 cols x 27 rows = 1216 x 864)

export const BossMapData = {
  id: 'sharma_fortress_boss',
  name: "Level 5: Sharma Ji's Fortress",
  tileSize: 32,
  cols: 38,
  rows: 27,
  bounds: { width: 1216, height: 864 },
  musicTrack: 'boss',
  playerSpawn: { x: 600, y: 750, facing: 'up' },

  aanganRect: {
    x: 380,
    y: 220,
    width: 440,
    height: 400
  },

  layers: {
    ground: {
      defaultTile: 'tile_marble',
      regions: [
        {
          tile: 'tile_aangan',
          region: { c1: 12, r1: 7, c2: 25, r2: 19 } // Central Aangan Courtyard
        }
      ]
    }
  },

  environmentProps: [
    // Safe Room Banner Labels
    {
      texture: 'obj_sofa',
      x: 200,
      y: 480,
      size: { w: 64, h: 36 },
      depth: 10
    },
    {
      texture: 'obj_sofa',
      x: 1000,
      y: 480,
      size: { w: 64, h: 36 },
      depth: 10
    },
    // Decorative Diyas in safe rooms
    { texture: 'obj_diya', x: 100, y: 180, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', x: 1100, y: 180, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', x: 500, y: 750, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', x: 700, y: 750, size: { w: 20, h: 20 }, animate: 'float' }
  ],

  gameplayObjects: [
    // Exterior Perimeter Walls
    ...Array.from({ length: 38 }, (_, i) => ({
      id: `wall_top_${i}`,
      texture: 'tile_wall_brick',
      gridPos: { c: i, r: 0 },
      isSolid: true,
      blocksVision: true
    })),
    ...Array.from({ length: 38 }, (_, i) => ({
      id: `wall_bottom_${i}`,
      texture: 'tile_wall_brick',
      gridPos: { c: i, r: 26 },
      isSolid: true,
      blocksVision: true
    })),
    ...Array.from({ length: 25 }, (_, i) => ({
      id: `wall_left_${i + 1}`,
      texture: 'tile_wall_brick',
      gridPos: { c: 0, r: i + 1 },
      isSolid: true,
      blocksVision: true
    })),
    ...Array.from({ length: 25 }, (_, i) => ({
      id: `wall_right_${i + 1}`,
      texture: 'tile_wall_brick',
      gridPos: { c: 37, r: i + 1 },
      isSolid: true,
      blocksVision: true
    })),

    // --- AANGAN COURTYARD BOUNDARY WALLS & ARCHWAYS ---
    // Top boundary of Aangan (gap at 560..640)
    ...Array.from({ length: 14 }, (_, i) => {
      const x = 380 + i * 32;
      if (x >= 560 && x <= 640) return null;
      return {
        id: `wall_aangan_top_${i}`,
        texture: 'tile_wall_fortress',
        x,
        y: 210,
        isSolid: true,
        blocksVision: true
      };
    }).filter(Boolean),

    // Bottom boundary of Aangan (gap at 540..660 for main entrance archway)
    ...Array.from({ length: 14 }, (_, i) => {
      const x = 380 + i * 32;
      if (x >= 540 && x <= 660) return null;
      return {
        id: `wall_aangan_bottom_${i}`,
        texture: 'tile_wall_fortress',
        x,
        y: 630,
        isSolid: true,
        blocksVision: true
      };
    }).filter(Boolean),

    // Left boundary of Aangan (doorway at 380..460)
    ...Array.from({ length: 13 }, (_, i) => {
      const y = 220 + i * 32;
      if (y >= 380 && y <= 460) return null;
      return {
        id: `wall_aangan_left_${i}`,
        texture: 'tile_wall_fortress',
        x: 370,
        y,
        isSolid: true,
        blocksVision: true
      };
    }).filter(Boolean),

    // Right boundary of Aangan (doorway at 380..460)
    ...Array.from({ length: 13 }, (_, i) => {
      const y = 220 + i * 32;
      if (y >= 380 && y <= 460) return null;
      return {
        id: `wall_aangan_right_${i}`,
        texture: 'tile_wall_fortress',
        x: 830,
        y,
        isSolid: true,
        blocksVision: true
      };
    }).filter(Boolean),

    // --- 3 MANDATORY ENVIRONMENTAL OBJECTIVE PROPS ---
    // Objective A: Decoration Disaster (in Right Safe Verandah)
    {
      id: 'obj_decor_console',
      texture: 'obj_boss_decor',
      x: 1020,
      y: 360,
      size: { w: 48, h: 48 },
      isSolid: false,
      depth: 25,
      interactable: {
        radius: 60,
        prompt: '[E] Trigger Decoration Disaster',
        actionType: 'objective_a'
      }
    },

    // Objective B: Society Announcement (in Left Safe Office)
    {
      id: 'obj_speaker_console',
      texture: 'obj_boss_speaker',
      x: 180,
      y: 360,
      size: { w: 48, h: 48 },
      isSolid: false,
      depth: 25,
      interactable: {
        radius: 60,
        prompt: '[E] Broadcast Society Announcement Feedback',
        actionType: 'objective_b'
      }
    },

    // Objective C: Grand Finale (on North Safe Terrace)
    {
      id: 'obj_finale_battery',
      texture: 'obj_boss_finale',
      x: 600,
      y: 140,
      size: { w: 48, h: 48 },
      isSolid: false,
      depth: 25,
      interactable: {
        radius: 60,
        prompt: '[E] Launch Grand Finale Cracker Battery',
        actionType: 'objective_c'
      }
    }
  ],

  collectibles: [
    { id: 'laddoo_safe_l', type: 'laddoo', count: 1, x: 140, y: 240 },
    { id: 'laddoo_safe_r', type: 'laddoo', count: 1, x: 1060, y: 240 },
    { id: 'laddoo_safe_b', type: 'laddoo', count: 1, x: 460, y: 750 }
  ],

  npcs: [
    {
      id: 'sharma_ji',
      type: 'SharmaJi',
      spawn: { x: 600, y: 400 }
    }
  ]
};
