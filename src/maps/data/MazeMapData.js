// MazeMapData.js - Level 4: Backdoor Maze Map Definition (34 cols x 24 rows)

export const MazeMapData = {
  id: 'backdoor_maze',
  name: 'Level 4: Backdoor Maze',
  tileSize: 32,
  cols: 34,
  rows: 24,
  bounds: { width: 1088, height: 768 },
  musicTrack: 'maze',
  playerSpawn: { x: 48, y: 48, facing: 'down' },

  layers: {
    ground: {
      defaultTile: 'tile_bazaar_ground',
      tint: 0x445566 // Dark night garden tint
    },
    collisionGrid: [
      "1111111111111111111111111111111111",
      "1000100000100000100000100000000001",
      "1010101110101110101110101111111101",
      "1010001000100010001000101000000101",
      "1011111011111011111011101011110101",
      "1000001010000000001000101010010101",
      "1111101010111111101110101010010101",
      "1000101000100000100010001011010101",
      "1010101111101110111011111001010101",
      "1010000000101000001000001101010001",
      "1011111110101011101111101001011101",
      "1000000010001010000000101011000101",
      "1111111011111010111110101001110101",
      "1000001000001010100010101100010101",
      "1011101111101010101010100111010101",
      "1010000000100010001000110001010001",
      "1010111110111111111110111101011111",
      "1010100010000000000010000101000001",
      "1010101011111111111011110101111101",
      "1000101000000000001000010100000101",
      "1110101111111111101111010111110101",
      "1000100000000000100001000000010001",
      "1011111111111110111101111111011101",
      "1111111111111111111111111111111111"
    ]
  },

  environmentProps: [
    { texture: 'obj_diya', gridPos: { c: 1, r: 1 }, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', gridPos: { c: 5, r: 5 }, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', gridPos: { c: 17, r: 7 }, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', gridPos: { c: 13, r: 13 }, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', gridPos: { c: 22, r: 17 }, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', gridPos: { c: 17, r: 21 }, size: { w: 20, h: 20 }, animate: 'float' },
    { texture: 'obj_diya', gridPos: { c: 31, r: 21 }, size: { w: 20, h: 20 }, animate: 'float' }
  ],

  gameplayObjects: [
    {
      id: 'maze_exit_gate',
      texture: 'obj_exit_service_lane',
      gridPos: { c: 32, r: 21 },
      size: { w: 40, h: 40 },
      isSolid: false,
      depth: 25
    }
  ],

  collectibles: [
    { id: 'laddoo_m1', type: 'laddoo', count: 1, gridPos: { c: 9, r: 1 } },
    { id: 'laddoo_m2', type: 'laddoo', count: 1, gridPos: { c: 1, r: 7 } },
    { id: 'laddoo_m3', type: 'laddoo', count: 1, gridPos: { c: 25, r: 3 } },
    { id: 'laddoo_m4', type: 'laddoo', count: 1, gridPos: { c: 7, r: 19 } },
    { id: 'laddoo_m5', type: 'laddoo', count: 1, gridPos: { c: 23, r: 13 } }
  ]
};
