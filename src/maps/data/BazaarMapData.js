// BazaarMapData.js - Level 1: Bazaar Escape Map Definition (38 cols x 25 rows = 1216 x 800)

export const BazaarMapData = {
  id: 'bazaar_escape',
  name: 'Level 1: Bazaar Escape',
  tileSize: 32,
  cols: 38,
  rows: 25,
  bounds: { width: 1216, height: 800 },
  musicTrack: 'bazaar',
  playerSpawn: { x: 120, y: 680, facing: 'up' },

  layers: {
    ground: {
      defaultTile: 'tile_bazaar_ground'
    }
  },

  environmentProps: [
    // Rangolis
    { texture: 'obj_rangoli', x: 480, y: 380, size: { w: 48, h: 48 }, depth: 5, animate: 'spin' },
    { texture: 'obj_rangoli', x: 740, y: 640, size: { w: 48, h: 48 }, depth: 5, animate: 'spin' },

    // Diyas along pathways
    { texture: 'obj_diya', x: 100, y: 640, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', x: 260, y: 640, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', x: 620, y: 720, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', x: 880, y: 640, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', x: 380, y: 160, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', x: 740, y: 160, size: { w: 20, h: 20 }, animate: 'float' },

    // Hanging fairy lights
    ...Array.from({ length: 17 }, (_, i) => ({
      texture: 'obj_fairy_lights',
      x: 80 + i * 64,
      y: 60,
      size: { w: 64, h: 12 },
      depth: 20
    }))
  ],

  gameplayObjects: [
    // Top Perimeter Wall
    ...Array.from({ length: 38 }, (_, i) => ({
      id: `wall_top_${i}`,
      texture: 'tile_wall_brick',
      gridPos: { c: i, r: 0 },
      isSolid: true,
      blocksVision: true
    })),
    // Bottom Perimeter Wall
    ...Array.from({ length: 38 }, (_, i) => ({
      id: `wall_bottom_${i}`,
      texture: 'tile_wall_brick',
      gridPos: { c: i, r: 24 },
      isSolid: true,
      blocksVision: true
    })),
    // Left Perimeter Wall
    ...Array.from({ length: 23 }, (_, i) => ({
      id: `wall_left_${i + 1}`,
      texture: 'tile_wall_brick',
      gridPos: { c: 0, r: i + 1 },
      isSolid: true,
      blocksVision: true
    })),
    // Right Perimeter Wall (leaving service lane gap at r: 5..8)
    ...Array.from({ length: 23 }, (_, i) => {
      const r = i + 1;
      if (r >= 5 && r <= 8) return null; // service lane exit opening
      return {
        id: `wall_right_${r}`,
        texture: 'tile_wall_brick',
        gridPos: { c: 37, r },
        isSolid: true,
        blocksVision: true
      };
    }).filter(Boolean),

    // Exit Gate Wall Blocker (destroyed when Ramesh Kaka reveals lane)
    {
      id: 'exit_blocker',
      texture: 'tile_wall_brick',
      gridPos: { c: 37, r: 6 },
      isSolid: true,
      blocksVision: true
    },

    // Exit Visual Indicator
    {
      id: 'exit_gate_visual',
      texture: 'obj_exit_service_lane',
      x: 1170,
      y: 210,
      size: { w: 40, h: 40 },
      isSolid: false,
      visible: false,
      depth: 25
    },

    // --- MARKET STALLS & COVER OBSTACLES ---
    // Ramesh Kaka's Sweet Stall
    {
      id: 'stall_ramesh_kaka',
      texture: 'obj_stall',
      x: 920,
      y: 260,
      bodySize: { w: 60, h: 40 },
      isSolid: true,
      blocksVision: true
    },
    // Decorative Market Stalls
    {
      id: 'stall_flowers',
      texture: 'obj_stall',
      x: 320,
      y: 220,
      bodySize: { w: 60, h: 40 },
      isSolid: true,
      blocksVision: true
    },
    {
      id: 'stall_firecrackers',
      texture: 'obj_stall',
      x: 620,
      y: 220,
      bodySize: { w: 60, h: 40 },
      isSolid: true,
      blocksVision: true
    },
    {
      id: 'stall_diyas',
      texture: 'obj_stall',
      x: 540,
      y: 520,
      bodySize: { w: 60, h: 40 },
      isSolid: true,
      blocksVision: true
    },

    // Scooters
    {
      id: 'scooter_1',
      texture: 'obj_scooter',
      x: 220,
      y: 360,
      bodySize: { w: 44, h: 30 },
      isSolid: true,
      blocksVision: true
    },
    {
      id: 'scooter_2',
      texture: 'obj_scooter',
      x: 780,
      y: 500,
      bodySize: { w: 44, h: 30 },
      isSolid: true,
      blocksVision: true
    },
    {
      id: 'scooter_3',
      texture: 'obj_scooter',
      x: 440,
      y: 700,
      bodySize: { w: 44, h: 30 },
      isSolid: true,
      blocksVision: true
    },

    // Notice Board
    {
      id: 'notice_board',
      texture: 'obj_notice_board',
      x: 160,
      y: 540,
      bodySize: { w: 36, h: 30 },
      isSolid: true,
      blocksVision: true
    }
  ],

  collectibles: [
    { id: 'laddoo_b1', type: 'laddoo', count: 1, x: 200, y: 200 },
    { id: 'laddoo_b2', type: 'laddoo', count: 1, x: 850, y: 680 },
    { id: 'laddoo_b3', type: 'laddoo', count: 1, x: 520, y: 380 }
  ],

  npcs: [
    {
      id: 'father',
      type: 'Father',
      spawn: { x: 380, y: 350 },
      patrolWaypoints: [
        { x: 380, y: 350 },
        { x: 720, y: 350 },
        { x: 720, y: 620 },
        { x: 420, y: 620 },
        { x: 420, y: 480 },
        { x: 260, y: 480 }
      ]
    }
  ]
};
