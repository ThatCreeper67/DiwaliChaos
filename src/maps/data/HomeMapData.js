// HomeMapData.js - Level 3: Home Infiltration Map Definition (30 cols x 20 rows)

export const HomeMapData = {
  id: 'home_infiltration',
  name: 'Level 3: Home Infiltration (Mummy’s Kitchen)',
  tileSize: 32,
  cols: 30,
  rows: 20,
  bounds: { width: 960, height: 640 },
  musicTrack: 'home',
  playerSpawn: { x: 320, y: 560, facing: 'up' },

  layers: {
    ground: {
      defaultTile: 'tile_marble',
      regions: [
        {
          tile: 'tile_kitchen',
          region: { c1: 19, r1: 1, c2: 29, r2: 9 }
        }
      ]
    }
  },

  environmentProps: [
    { texture: 'obj_diya', gridPos: { c: 2, r: 14 }, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', gridPos: { c: 15, r: 18 }, size: { w: 20, h: 20 }, animate: 'float' }
  ],

  gameplayObjects: [
    // --- EXTERIOR WALLS ---
    // Top wall
    ...Array.from({ length: 30 }, (_, i) => ({
      id: `wall_top_${i}`,
      texture: 'tile_wall_interior',
      gridPos: { c: i, r: 0 },
      isSolid: true,
      blocksVision: true
    })),
    // Bottom wall (leaving gap at c: 10 for main entrance)
    ...Array.from({ length: 30 }, (_, i) => ({
      id: `wall_bottom_${i}`,
      texture: 'tile_wall_interior',
      gridPos: { c: i, r: 19 },
      isSolid: true,
      blocksVision: true
    })),
    // Left wall
    ...Array.from({ length: 18 }, (_, i) => ({
      id: `wall_left_${i + 1}`,
      texture: 'tile_wall_interior',
      gridPos: { c: 0, r: i + 1 },
      isSolid: true,
      blocksVision: true
    })),
    // Right wall
    ...Array.from({ length: 18 }, (_, i) => ({
      id: `wall_right_${i + 1}`,
      texture: 'tile_wall_interior',
      gridPos: { c: 29, r: i + 1 },
      isSolid: true,
      blocksVision: true
    })),

    // --- INTERIOR ROOM PARTITIONS ---
    // Bedroom vertical partition
    ...[1, 2, 3, 4, 5, 6, 7].map(r => ({
      id: `wall_bed_v_${r}`,
      texture: 'tile_wall_interior',
      gridPos: { c: 8, r },
      isSolid: true,
      blocksVision: true
    })),
    // Bedroom horizontal partition
    ...[1, 2, 3, 4, 5, 6].map(c => ({
      id: `wall_bed_h_${c}`,
      texture: 'tile_wall_interior',
      gridPos: { c, r: 11 },
      isSolid: true,
      blocksVision: true
    })),

    // Kitchen vertical partition
    ...[1, 2, 3, 4, 5, 6].map(r => ({
      id: `wall_kitch_v_${r}`,
      texture: 'tile_wall_interior',
      gridPos: { c: 18, r },
      isSolid: true,
      blocksVision: true
    })),
    // Kitchen horizontal partition
    ...[19, 20, 21, 22, 23, 24, 25].map(c => ({
      id: `wall_kitch_h_${c}`,
      texture: 'tile_wall_interior',
      gridPos: { c, r: 9 },
      isSolid: true,
      blocksVision: true
    })),

    // Puja / Storage partition
    ...[1, 2, 3, 4, 5, 6].map(c => ({
      id: `wall_puja_${c}`,
      texture: 'tile_wall_interior',
      gridPos: { c, r: 15 },
      isSolid: true,
      blocksVision: true
    })),

    // --- DOORS ---
    {
      id: 'main_entrance_door',
      texture: 'obj_door_locked',
      gridPos: { c: 10, r: 19 },
      bodySize: { w: 32, h: 32 },
      isSolid: true,
      blocksVision: true,
      depth: 30,
      interactable: {
        radius: 45,
        prompt: '[E] Main Entrance',
        actionType: 'main_door'
      }
    },
    {
      id: 'kitchen_backdoor',
      texture: 'obj_door_locked',
      gridPos: { c: 28, r: 1 },
      bodySize: { w: 32, h: 32 },
      isSolid: true,
      blocksVision: true,
      depth: 30,
      interactable: {
        radius: 50,
        prompt: '[E] Kitchen Backdoor',
        actionType: 'backdoor'
      }
    },

    // --- FURNITURE & NATURAL COVER OBSTACLES ---
    {
      id: 'living_sofa',
      texture: 'obj_sofa',
      x: 440,
      y: 360,
      bodySize: { w: 60, h: 32 },
      isSolid: true,
      blocksVision: true
    },
    {
      id: 'dining_table',
      texture: 'obj_sofa',
      x: 520,
      y: 220,
      bodySize: { w: 50, h: 30 },
      isSolid: true,
      blocksVision: true
    },
    {
      id: 'bedroom_bed',
      texture: 'obj_sofa',
      x: 100,
      y: 200,
      bodySize: { w: 56, h: 32 },
      isSolid: true,
      blocksVision: true
    },
    {
      id: 'kitchen_counter_1',
      texture: 'obj_kitchen_counter',
      x: 760,
      y: 64,
      bodySize: { w: 60, h: 28 },
      isSolid: true,
      blocksVision: true
    },
    {
      id: 'kitchen_counter_2',
      texture: 'obj_kitchen_counter',
      x: 840,
      y: 64,
      bodySize: { w: 60, h: 28 },
      isSolid: true,
      blocksVision: true
    },
    {
      id: 'kitchen_lpg',
      texture: 'obj_lpg',
      x: 880,
      y: 120,
      bodySize: { w: 20, h: 28 },
      isSolid: true,
      blocksVision: true
    },
    {
      id: 'storage_box_bombs',
      texture: 'obj_storage_box',
      x: 720,
      y: 80,
      bodySize: { w: 34, h: 28 },
      isSolid: true,
      blocksVision: true,
      interactable: {
        radius: 45,
        prompt: '[E] Kitchen Storage Box',
        actionType: 'storage_box'
      }
    }
  ],

  collectibles: [
    { id: 'key_study', type: 'key', x: 140, y: 100 },
    { id: 'laddoo_bed', type: 'laddoo', count: 1, x: 200, y: 160 },
    { id: 'laddoo_corridor', type: 'laddoo', count: 1, x: 460, y: 480 }
  ],

  npcs: [
    {
      id: 'mother',
      type: 'Mother',
      spawn: { x: 740, y: 160 },
      patrolWaypoints: [
        { x: 740, y: 160 },
        { x: 580, y: 220 },
        { x: 380, y: 320 },
        { x: 680, y: 320 },
        { x: 500, y: 440 }
      ]
    }
  ]
};
