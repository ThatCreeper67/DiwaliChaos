// SocietyMapData.js - Level 2: Operation Laddoo Collection Map Definition (44 cols x 29 rows = 1408 x 928)

export const SocietyMapData = {
  id: 'society_operation_laddoo',
  name: 'Level 2: Society Operation Laddoo',
  tileSize: 32,
  cols: 44,
  rows: 29,
  bounds: { width: 1408, height: 928 },
  musicTrack: 'society',
  playerSpawn: { x: 120, y: 450, facing: 'right' },

  layers: {
    ground: {
      defaultTile: 'tile_lawn',
      regions: [
        {
          tile: 'tile_society_road',
          region: { c1: 0, r1: 12, c2: 43, r2: 16 }
        }
      ]
    }
  },

  environmentProps: [
    // Rangolis
    { texture: 'obj_rangoli', x: 420, y: 450, size: { w: 48, h: 48 }, depth: 5, animate: 'spin' },
    { texture: 'obj_rangoli', x: 960, y: 450, size: { w: 48, h: 48 }, depth: 5, animate: 'spin' },

    // Notice Board
    { texture: 'obj_notice_board', x: 720, y: 240, size: { w: 36, h: 30 }, depth: 15 },

    // Scooters
    { texture: 'obj_scooter', x: 360, y: 390, size: { w: 44, h: 30 }, depth: 15 },
    { texture: 'obj_scooter', x: 800, y: 490, size: { w: 44, h: 30 }, depth: 15 },

    // Diyas
    { texture: 'obj_diya', x: 200, y: 390, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', x: 600, y: 390, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', x: 1000, y: 390, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', x: 400, y: 510, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', x: 800, y: 510, size: { w: 20, h: 20 }, animate: 'float' }
  ],

  gameplayObjects: [
    // Perimeter Walls
    ...Array.from({ length: 44 }, (_, i) => ({
      id: `wall_top_${i}`,
      texture: 'tile_wall_brick',
      gridPos: { c: i, r: 0 },
      isSolid: true,
      blocksVision: true
    })),
    ...Array.from({ length: 44 }, (_, i) => ({
      id: `wall_bottom_${i}`,
      texture: 'tile_wall_brick',
      gridPos: { c: i, r: 28 },
      isSolid: true,
      blocksVision: true
    })),
    ...Array.from({ length: 27 }, (_, i) => ({
      id: `wall_left_${i + 1}`,
      texture: 'tile_wall_brick',
      gridPos: { c: 0, r: i + 1 },
      isSolid: true,
      blocksVision: true
    })),
    ...Array.from({ length: 27 }, (_, i) => ({
      id: `wall_right_${i + 1}`,
      texture: 'tile_wall_brick',
      gridPos: { c: 43, r: i + 1 },
      isSolid: true,
      blocksVision: true
    })),

    // --- BUILDINGS (Solid Obstacles) ---
    {
      id: 'building_a_verma',
      texture: 'tile_wall_interior',
      x: 180,
      y: 160,
      bodySize: { w: 220, h: 140 },
      size: { w: 220, h: 140 },
      isSolid: true,
      blocksVision: true
    },
    {
      id: 'building_b_gupta',
      texture: 'tile_wall_interior',
      x: 520,
      y: 160,
      bodySize: { w: 220, h: 140 },
      size: { w: 220, h: 140 },
      isSolid: true,
      blocksVision: true
    },
    {
      id: 'building_sharma_fortress',
      texture: 'tile_wall_fortress',
      x: 860,
      y: 160,
      bodySize: { w: 260, h: 140 },
      size: { w: 260, h: 140 },
      isSolid: true,
      blocksVision: true
    },
    {
      id: 'building_c',
      texture: 'tile_wall_interior',
      x: 180,
      y: 720,
      bodySize: { w: 220, h: 140 },
      size: { w: 220, h: 140 },
      isSolid: true,
      blocksVision: true
    },
    {
      id: 'building_chintu_home',
      texture: 'tile_wall_interior',
      x: 520,
      y: 720,
      bodySize: { w: 260, h: 140 },
      size: { w: 260, h: 140 },
      isSolid: true,
      blocksVision: true
    },
    {
      id: 'building_clubhouse',
      texture: 'tile_wall_interior',
      x: 900,
      y: 720,
      bodySize: { w: 240, h: 140 },
      size: { w: 240, h: 140 },
      isSolid: true,
      blocksVision: true
    },

    // Player House Entrance Door
    {
      id: 'home_door',
      texture: 'obj_door_locked',
      x: 520,
      y: 650,
      bodySize: { w: 32, h: 40 },
      isSolid: true,
      blocksVision: true,
      depth: 30
    },

    // Halwai Vendor Sweet Stall
    {
      id: 'vendor_stall',
      texture: 'obj_stall',
      x: 1150,
      y: 420,
      bodySize: { w: 60, h: 40 },
      isSolid: true,
      blocksVision: true
    }
  ],

  collectibles: [
    // Laddoo Boxes (count = 2)
    { id: 'box_1', type: 'laddoo_box', count: 2, x: 340, y: 450 },
    { id: 'box_2', type: 'laddoo_box', count: 2, x: 750, y: 430 },
    { id: 'box_3', type: 'laddoo_box', count: 2, x: 1250, y: 220 },
    { id: 'box_4', type: 'laddoo_box', count: 2, x: 340, y: 720 },
    { id: 'box_5', type: 'laddoo_box', count: 2, x: 1250, y: 720 },

    // Free individual laddoos
    { id: 'laddoo_s1', type: 'laddoo', count: 1, x: 100, y: 320 },
    { id: 'laddoo_s2', type: 'laddoo', count: 1, x: 700, y: 320 },
    { id: 'laddoo_s3', type: 'laddoo', count: 1, x: 1050, y: 580 }
  ]
};
