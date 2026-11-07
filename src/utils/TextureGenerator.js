// TextureGenerator.js - Generates all retro pixel-art textures and sprites
// This ensures 100% self-contained, crisp pixel art without broken asset URLs.

export class TextureGenerator {
  static createAllTextures(scene) {
    if (scene.textures.exists('player_idle')) return;

    this.createPlayerTextures(scene);
    this.createNPCTextures(scene);
    this.createBossTextures(scene);
    this.createEnvironmentTiles(scene);
    this.createItemTextures(scene);
    this.createUITextures(scene);
    this.createFXTextures(scene);
  }

  // Helper to create a canvas texture
  static makeCanvas(scene, key, width, height, drawFn) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawFn(ctx, width, height);
    scene.textures.addCanvas(key, canvas);
    return canvas;
  }

  // --- PLAYER TEXTURES (Kid Chintu in festive kurta) ---
  static createPlayerTextures(scene) {
    const directions = ['down', 'up', 'left', 'right'];
    
    // Draw 32x32 player frames for idle and 4-step walk cycle
    directions.forEach(dir => {
      for (let f = 0; f < 4; f++) {
        this.makeCanvas(scene, `player_${dir}_${f}`, 32, 32, (ctx) => {
          this.drawPlayer(ctx, dir, f);
        });
      }
    });

    // Also register a default 'player' texture
    this.makeCanvas(scene, 'player', 32, 32, (ctx) => {
      this.drawPlayer(ctx, 'down', 0);
    });
  }

  static drawPlayer(ctx, dir, frame) {
    const legOffset = (frame === 1) ? 2 : (frame === 3) ? -2 : 0;
    const bob = (frame === 1 || frame === 3) ? 1 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(16, 30, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs / Pyjama (Off-white / cream)
    ctx.fillStyle = '#f5f0dc';
    if (dir === 'down' || dir === 'up') {
      ctx.fillRect(11, 22 - bob, 4, 7 + legOffset);
      ctx.fillRect(17, 22 - bob, 4, 7 - legOffset);
      // Brown sandals (Mojari)
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(10, 28 + (legOffset > 0 ? 1 : 0), 5, 3);
      ctx.fillRect(17, 28 + (legOffset < 0 ? 1 : 0), 5, 3);
    } else if (dir === 'left') {
      ctx.fillRect(14, 22 - bob, 5, 7 + legOffset);
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(13, 28, 5, 3);
    } else {
      ctx.fillRect(13, 22 - bob, 5, 7 + legOffset);
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(14, 28, 5, 3);
    }

    // Festive Kurta (Vibrant Saffron / Orange with Gold trim)
    ctx.fillStyle = '#e65100'; // Rich festive saffron
    ctx.fillRect(10, 14 - bob, 12, 10);
    // Gold embroidery neckline
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(14, 14 - bob, 4, 5);
    ctx.fillRect(15, 19 - bob, 2, 4);

    // Arms
    ctx.fillStyle = '#ff9800';
    if (dir === 'down') {
      ctx.fillRect(8, 15 - bob + legOffset, 2, 6);
      ctx.fillRect(22, 15 - bob - legOffset, 2, 6);
      // Skin hands
      ctx.fillStyle = '#e0a96d';
      ctx.fillRect(8, 21 - bob + legOffset, 2, 2);
      ctx.fillRect(22, 21 - bob - legOffset, 2, 2);
    } else if (dir === 'up') {
      ctx.fillRect(8, 15 - bob - legOffset, 2, 6);
      ctx.fillRect(22, 15 - bob + legOffset, 2, 6);
    } else if (dir === 'left') {
      ctx.fillRect(12, 15 - bob, 3, 6);
      ctx.fillStyle = '#e0a96d';
      ctx.fillRect(11, 21 - bob, 3, 2);
    } else {
      ctx.fillRect(17, 15 - bob, 3, 6);
      ctx.fillStyle = '#e0a96d';
      ctx.fillRect(18, 21 - bob, 3, 2);
    }

    // Head / Face
    ctx.fillStyle = '#e0a96d'; // Skin tone
    ctx.fillRect(11, 6 - bob, 10, 9);

    // Hair (Dark wavy kid hair)
    ctx.fillStyle = '#21130d';
    ctx.fillRect(10, 4 - bob, 12, 4);
    ctx.fillRect(9, 6 - bob, 3, 4);
    ctx.fillRect(20, 6 - bob, 3, 4);

    // Facial features
    if (dir === 'down') {
      // Eyes
      ctx.fillStyle = '#111';
      ctx.fillRect(13, 9 - bob, 2, 2);
      ctx.fillRect(17, 9 - bob, 2, 2);
      // Tilak on forehead (festive red bindi/tilak)
      ctx.fillStyle = '#d32f2f';
      ctx.fillRect(15, 7 - bob, 2, 2);
      // Smile
      ctx.fillStyle = '#c2185b';
      ctx.fillRect(14, 12 - bob, 4, 1);
    } else if (dir === 'left') {
      ctx.fillStyle = '#111';
      ctx.fillRect(12, 9 - bob, 2, 2);
      ctx.fillStyle = '#d32f2f';
      ctx.fillRect(13, 7 - bob, 1, 2);
    } else if (dir === 'right') {
      ctx.fillStyle = '#111';
      ctx.fillRect(18, 9 - bob, 2, 2);
      ctx.fillStyle = '#d32f2f';
      ctx.fillRect(18, 7 - bob, 1, 2);
    }
  }

  // --- NPC TEXTURES ---
  static createNPCTextures(scene) {
    const directions = ['down', 'up', 'left', 'right'];

    // 1. FATHER (Papa - Tall, Maroon kurta, spectacles, mustache)
    directions.forEach(dir => {
      for (let f = 0; f < 4; f++) {
        this.makeCanvas(scene, `father_${dir}_${f}`, 36, 40, (ctx) => {
          this.drawFather(ctx, dir, f);
        });
      }
    });

    // 2. MOTHER (Mummy - Teal & Red saree, hair bun, rolling pin in hand)
    directions.forEach(dir => {
      for (let f = 0; f < 4; f++) {
        this.makeCanvas(scene, `mother_${dir}_${f}`, 32, 36, (ctx) => {
          this.drawMother(ctx, dir, f);
        });
      }
    });

    // 3. SHOPKEEPER (Ramesh Kaka - Yellow kurta, chef hat / sweet stall apron, mustache)
    this.makeCanvas(scene, 'shopkeeper', 32, 36, (ctx) => {
      this.drawShopkeeper(ctx);
    });

    // 4. SOCIETY AUNTY
    this.makeCanvas(scene, 'aunty_pink', 32, 36, (ctx) => {
      this.drawAunty(ctx, '#e91e63');
    });
    this.makeCanvas(scene, 'aunty_cyan', 32, 36, (ctx) => {
      this.drawAunty(ctx, '#00bcd4');
    });

    // 5. PHOOLJHADI (The beloved cute neighborhood mascot - wearing a festive ribbon!)
    this.makeCanvas(scene, 'phooljhadi', 32, 32, (ctx) => {
      this.drawPhooljhadi(ctx);
    });
  }

  static drawFather(ctx, dir, frame) {
    const legOffset = (frame === 1) ? 2 : (frame === 3) ? -2 : 0;
    const bob = (frame === 1 || frame === 3) ? 1 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(18, 38, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // White Pyjama
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(13, 26 - bob, 4, 10 + legOffset);
    ctx.fillRect(19, 26 - bob, 4, 10 - legOffset);
    // Formal sandals
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(12, 35 + (legOffset > 0 ? 1 : 0), 5, 3);
    ctx.fillRect(19, 35 + (legOffset < 0 ? 1 : 0), 5, 3);

    // Maroon/Crimson Kurta (Authoritative, dignified)
    ctx.fillStyle = '#880e4f';
    ctx.fillRect(11, 15 - bob, 14, 13);
    // Button placket
    ctx.fillStyle = '#ad1457';
    ctx.fillRect(17, 15 - bob, 2, 7);

    // Arms
    ctx.fillStyle = '#880e4f';
    if (dir === 'down') {
      ctx.fillRect(8, 16 - bob, 3, 9);
      ctx.fillRect(25, 16 - bob, 3, 9);
      // Newspaper rolled under one arm!
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(7, 21 - bob, 3, 7);
      ctx.fillStyle = '#333';
      ctx.fillRect(7, 23 - bob, 3, 1);
    } else {
      ctx.fillRect(9, 16 - bob, 3, 9);
      ctx.fillRect(24, 16 - bob, 3, 9);
    }

    // Head
    ctx.fillStyle = '#d7a16b';
    ctx.fillRect(13, 7 - bob, 10, 9);

    // Hair (black with dignified grey temples)
    ctx.fillStyle = '#212121';
    ctx.fillRect(12, 5 - bob, 12, 4);
    ctx.fillStyle = '#9e9e9e'; // Grey touch
    ctx.fillRect(11, 7 - bob, 2, 3);
    ctx.fillRect(23, 7 - bob, 2, 3);

    // Face features
    if (dir === 'down') {
      // Spectacles (Black frame)
      ctx.strokeStyle = '#212121';
      ctx.lineWidth = 1;
      ctx.strokeRect(13.5, 9.5 - bob, 3, 3);
      ctx.strokeRect(19.5, 9.5 - bob, 3, 3);
      ctx.beginPath();
      ctx.moveTo(16.5, 10.5 - bob);
      ctx.lineTo(19.5, 10.5 - bob);
      ctx.stroke();

      // Stern eyes behind glasses
      ctx.fillStyle = '#000';
      ctx.fillRect(14, 10 - bob, 2, 2);
      ctx.fillRect(20, 10 - bob, 2, 2);

      // Desi Mustache (Classic thick dad mustache)
      ctx.fillStyle = '#111';
      ctx.fillRect(15, 13 - bob, 6, 2);
    } else if (dir === 'left') {
      ctx.fillStyle = '#000';
      ctx.fillRect(13, 10 - bob, 2, 2);
      ctx.fillStyle = '#111';
      ctx.fillRect(12, 13 - bob, 3, 2);
    } else if (dir === 'right') {
      ctx.fillStyle = '#000';
      ctx.fillRect(21, 10 - bob, 2, 2);
      ctx.fillStyle = '#111';
      ctx.fillRect(21, 13 - bob, 3, 2);
    }
  }

  static drawMother(ctx, dir, frame) {
    const legOffset = (frame === 1) ? 2 : (frame === 3) ? -2 : 0;
    const bob = (frame === 1 || frame === 3) ? 1 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(16, 34, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Saree Skirt (Teal with golden border)
    ctx.fillStyle = '#00695c';
    ctx.fillRect(10, 18 - bob, 12, 14);
    // Saree gold border
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(10, 31 - bob, 12, 2);

    // Saree Pallu (Draped across shoulder - vibrant coral)
    ctx.fillStyle = '#d84315';
    ctx.fillRect(11, 14 - bob, 10, 8);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(9, 14 - bob, 2, 10);

    // Rolling Pin (Belan) in hand!
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(22, 17 - bob + legOffset, 3, 9);
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(23, 15 - bob + legOffset, 1, 2);
    ctx.fillRect(23, 26 - bob + legOffset, 1, 2);

    // Head
    ctx.fillStyle = '#deb887';
    ctx.fillRect(11, 6 - bob, 10, 9);

    // Hair (Traditional bun at the back/top with gajra flowers)
    ctx.fillStyle = '#1b1b1b';
    ctx.fillRect(10, 4 - bob, 12, 4);
    ctx.fillRect(9, 6 - bob, 2, 5);
    ctx.fillRect(21, 6 - bob, 2, 5);
    // Bun
    if (dir === 'up') {
      ctx.fillRect(13, 2 - bob, 6, 4);
      // White jasmine Gajra
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(12, 3 - bob, 8, 2);
    }

    if (dir === 'down') {
      // Big Red Bindi
      ctx.fillStyle = '#c62828';
      ctx.beginPath();
      ctx.arc(16, 8 - bob, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#111';
      ctx.fillRect(13, 10 - bob, 2, 1.5);
      ctx.fillRect(17, 10 - bob, 2, 1.5);
      // Red lip
      ctx.fillStyle = '#b71c1c';
      ctx.fillRect(15, 13 - bob, 2, 1);
    } else if (dir === 'left') {
      ctx.fillStyle = '#111';
      ctx.fillRect(12, 10 - bob, 2, 1.5);
    } else if (dir === 'right') {
      ctx.fillStyle = '#111';
      ctx.fillRect(18, 10 - bob, 2, 1.5);
    }
  }

  // --- BOSS: SHARMA JI ---
  static createBossTextures(scene) {
    const directions = ['down', 'up', 'left', 'right'];
    directions.forEach(dir => {
      for (let f = 0; f < 4; f++) {
        this.makeCanvas(scene, `sharma_${dir}_${f}`, 48, 52, (ctx) => {
          this.drawSharmaJi(ctx, dir, f, false);
        });
      }
    });

    // Stunned frame (spinning stars, eyes spiraling)
    this.makeCanvas(scene, 'sharma_stunned', 48, 52, (ctx) => {
      this.drawSharmaJi(ctx, 'down', 0, true);
    });

    // Attack frame (holding megaphone / rulebook high)
    this.makeCanvas(scene, 'sharma_attack', 48, 52, (ctx) => {
      this.drawSharmaJiAttack(ctx);
    });
  }

  static drawSharmaJi(ctx, dir, frame, isStunned) {
    const legOffset = (frame === 1) ? 2 : (frame === 3) ? -2 : 0;
    const bob = (frame === 1 || frame === 3) ? 1 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(24, 48, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Formal Trousers (Brown/khaki)
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(17, 34 - bob, 6, 12 + legOffset);
    ctx.fillRect(25, 34 - bob, 6, 12 - legOffset);
    // Black formal shoes
    ctx.fillStyle = '#111111';
    ctx.fillRect(15, 45 + (legOffset > 0 ? 1 : 0), 8, 4);
    ctx.fillRect(25, 45 + (legOffset < 0 ? 1 : 0), 8, 4);

    // Safari Suit / Nehru Jacket (Steel Blue with Society Badge)
    ctx.fillStyle = '#37474f';
    ctx.fillRect(14, 18 - bob, 20, 18);
    // Belly curve (Sharma Ji is well-fed!)
    ctx.fillStyle = '#455a64';
    ctx.fillRect(15, 22 - bob, 18, 13);
    // Gold Society Badge on pocket!
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(16, 21 - bob, 4, 3);
    ctx.fillStyle = '#c62828';
    ctx.fillRect(17, 22 - bob, 2, 1);

    // Arms
    ctx.fillStyle = '#37474f';
    ctx.fillRect(10, 19 - bob, 4, 12);
    ctx.fillRect(34, 19 - bob, 4, 12);

    // Rulebook under arm ("SOCIETY RULES 2026")
    ctx.fillStyle = '#b71c1c'; // Red hardcover
    ctx.fillRect(7, 24 - bob, 5, 8);
    ctx.fillStyle = '#fff';
    ctx.fillRect(8, 25 - bob, 3, 6);

    // Head
    ctx.fillStyle = '#d7a16b';
    ctx.fillRect(17, 7 - bob, 14, 12);

    // Hair (Receding hairline, comb-over)
    ctx.fillStyle = '#212121';
    ctx.fillRect(16, 6 - bob, 16, 4);
    ctx.fillRect(15, 8 - bob, 3, 7);
    ctx.fillRect(30, 8 - bob, 3, 7);
    // Bald top sheen
    ctx.fillStyle = '#eccba0';
    ctx.fillRect(20, 6 - bob, 8, 3);

    if (isStunned) {
      // Spiral eyes
      ctx.fillStyle = '#111';
      ctx.font = '10px monospace';
      ctx.fillText('@', 19, 16 - bob);
      ctx.fillText('@', 25, 16 - bob);
      // Dazed open mouth
      ctx.fillStyle = '#880e4f';
      ctx.fillRect(22, 17 - bob, 4, 3);
      // Stars around head
      ctx.fillStyle = '#ffeb3b';
      ctx.fillText('★', 12, 6);
      ctx.fillText('★', 32, 5);
      ctx.fillText('★', 23, 2);
    } else {
      if (dir === 'down') {
        // Angry furrowed thick eyebrows
        ctx.fillStyle = '#111';
        ctx.fillRect(19, 10 - bob, 4, 2);
        ctx.fillRect(25, 10 - bob, 4, 2);
        // Small glaring eyes
        ctx.fillRect(20, 12 - bob, 2, 2);
        ctx.fillRect(26, 12 - bob, 2, 2);
        // Thick Society President mustache
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(19, 15 - bob, 10, 3);
        // Double chin
        ctx.fillStyle = '#c48f5e';
        ctx.fillRect(20, 18 - bob, 8, 1);
      } else if (dir === 'left') {
        ctx.fillStyle = '#111';
        ctx.fillRect(18, 11 - bob, 3, 2);
        ctx.fillRect(17, 15 - bob, 4, 3);
      } else if (dir === 'right') {
        ctx.fillStyle = '#111';
        ctx.fillRect(27, 11 - bob, 3, 2);
        ctx.fillRect(27, 15 - bob, 4, 3);
      }
    }
  }

  static drawSharmaJiAttack(ctx) {
    // Sharma Ji shouting through his mega-loudspeaker!
    this.drawSharmaJi(ctx, 'down', 0, false);
    // Loudspeaker in hand
    ctx.fillStyle = '#ff9800';
    ctx.beginPath();
    ctx.moveTo(35, 22);
    ctx.lineTo(46, 16);
    ctx.lineTo(46, 28);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(44, 18, 2, 8);
    // Soundwaves
    ctx.strokeStyle = '#f44336';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(46, 22, 6, -Math.PI / 4, Math.PI / 4);
    ctx.stroke();
  }

  static drawShopkeeper(ctx) {
    // Ramesh Kaka
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(16, 33, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dhoti
    ctx.fillStyle = '#fff9c4';
    ctx.fillRect(11, 20, 10, 12);

    // Yellow Kurta & Red Apron
    ctx.fillStyle = '#fbc02d';
    ctx.fillRect(10, 12, 12, 10);
    ctx.fillStyle = '#d32f2f'; // Halwai red cloth
    ctx.fillRect(12, 14, 8, 10);

    // Head
    ctx.fillStyle = '#d7a16b';
    ctx.fillRect(11, 5, 10, 8);
    // White Gandhi Topi / Chef Cap
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 2, 12, 4);

    // Cheerful big mustache & smile
    ctx.fillStyle = '#111';
    ctx.fillRect(12, 8, 2, 2);
    ctx.fillRect(18, 8, 2, 2);
    ctx.fillRect(13, 10, 6, 2);
  }

  static drawAunty(ctx, sareeColor) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(16, 33, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Saree
    ctx.fillStyle = sareeColor;
    ctx.fillRect(10, 14, 12, 18);
    // Gold pallu border
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(10, 30, 12, 2);
    ctx.fillRect(10, 14, 3, 16);

    // Head
    ctx.fillStyle = '#e0a96d';
    ctx.fillRect(11, 6, 10, 8);
    // Hair
    ctx.fillStyle = '#212121';
    ctx.fillRect(10, 4, 12, 3);
    // Spectacles & Bindi
    ctx.fillStyle = '#d32f2f';
    ctx.fillRect(15, 7, 2, 2);
    ctx.fillStyle = '#111';
    ctx.fillRect(13, 9, 2, 1);
    ctx.fillRect(17, 9, 2, 1);
  }

  static drawPhooljhadi(ctx) {
    // Beloved cute mascot: A charming, spirited, golden indie dog with a festive marigold garland!
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(16, 28, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (Golden fawn indie coat)
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(9, 14, 14, 10);
    // Legs
    ctx.fillStyle = '#d35400';
    ctx.fillRect(10, 23, 3, 6);
    ctx.fillRect(13, 23, 3, 6);
    ctx.fillRect(18, 23, 3, 6);
    ctx.fillRect(21, 23, 3, 6);

    // Wagging tail
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(6, 12, 4, 3);
    ctx.fillRect(5, 10, 3, 3);

    // Head
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(19, 10, 9, 8);
    // Cute snout
    ctx.fillStyle = '#d35400';
    ctx.fillRect(25, 13, 4, 4);
    ctx.fillStyle = '#212121'; // Black nose
    ctx.fillRect(28, 13, 2, 2);

    // Big shiny dark eyes
    ctx.fillStyle = '#111';
    ctx.fillRect(22, 11, 2, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(22, 11, 1, 1);

    // Floppy ears
    ctx.fillStyle = '#b94a00';
    ctx.fillRect(18, 8, 4, 5);

    // Marigold Garland (Orange and yellow flowers around neck)
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = (i % 2 === 0) ? '#ff9800' : '#ffeb3b';
      ctx.fillRect(18 + (i * 2), 17, 2, 3);
    }
  }

  // --- ENVIRONMENT TILES & OBJECTS (32x32) ---
  static createEnvironmentTiles(scene) {
    // 1. Bazaar cobblestone
    this.makeCanvas(scene, 'tile_bazaar_ground', 32, 32, (ctx) => {
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#6d4c41';
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillRect(17, 1, 14, 14);
      ctx.fillRect(1, 17, 14, 14);
      ctx.fillRect(17, 17, 14, 14);
      ctx.fillStyle = '#4e342e';
      ctx.strokeRect(0, 0, 32, 32);
      // Festive flower petal sprinkles
      ctx.fillStyle = '#e91e63';
      ctx.fillRect(6, 6, 2, 2);
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(22, 20, 2, 2);
    });

    // 2. Society Asphalt & Pavers
    this.makeCanvas(scene, 'tile_society_road', 32, 32, (ctx) => {
      ctx.fillStyle = '#263238';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#37474f';
      ctx.fillRect(2, 2, 28, 28);
      // Yellow curb mark
      ctx.fillStyle = '#fbc02d';
      ctx.fillRect(0, 0, 4, 32);
    });

    // 3. Society Lawn (Lush grass with scattered marigolds)
    this.makeCanvas(scene, 'tile_lawn', 32, 32, (ctx) => {
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#388e3c';
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillRect(18, 16, 10, 10);
      // Marigolds
      ctx.fillStyle = '#ff9800';
      ctx.fillRect(8, 20, 3, 3);
      ctx.fillRect(24, 6, 3, 3);
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(9, 21, 1, 1);
      ctx.fillRect(25, 7, 1, 1);
    });

    // 4. House marble floor (White / cream with grid)
    this.makeCanvas(scene, 'tile_marble', 32, 32, (ctx) => {
      ctx.fillStyle = '#eceff1';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#cfd8dc';
      ctx.strokeRect(0, 0, 32, 32);
      // Subtle marble vein
      ctx.strokeStyle = '#b0bec5';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(4, 28);
      ctx.lineTo(16, 14);
      ctx.lineTo(28, 4);
      ctx.stroke();
    });

    // 5. Kitchen checkered tiles
    this.makeCanvas(scene, 'tile_kitchen', 32, 32, (ctx) => {
      ctx.fillStyle = '#b0bec5';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#37474f';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillRect(16, 16, 16, 16);
    });

    // 6. Courtyard / Aangan ornamental floor
    this.makeCanvas(scene, 'tile_aangan', 32, 32, (ctx) => {
      ctx.fillStyle = '#bf360c'; // Terracotta red clay
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#d84315';
      ctx.fillRect(2, 2, 28, 28);
      // Traditional mandala corner
      ctx.fillStyle = '#ffab00';
      ctx.fillRect(6, 6, 4, 4);
      ctx.fillRect(22, 6, 4, 4);
      ctx.fillRect(6, 22, 4, 4);
      ctx.fillRect(22, 22, 4, 4);
    });

    // 7. Walls
    // Brick Wall (Outdoor & Society boundary)
    this.makeCanvas(scene, 'tile_wall_brick', 32, 32, (ctx) => {
      ctx.fillStyle = '#424242';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(1, 1, 14, 6);
      ctx.fillRect(17, 1, 14, 6);
      ctx.fillRect(9, 9, 14, 6);
      ctx.fillRect(1, 17, 14, 6);
      ctx.fillRect(17, 17, 14, 6);
      ctx.fillRect(9, 25, 14, 6);
      // Grille / Top coping
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(0, 0, 32, 2);
    });

    // Indoor Painted Wall (Festive light yellow/mustard)
    this.makeCanvas(scene, 'tile_wall_interior', 32, 32, (ctx) => {
      ctx.fillStyle = '#f57f17';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#fbc02d';
      ctx.fillRect(2, 4, 28, 24);
      // Wooden skirting board
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(0, 28, 32, 4);
    });

    // Sharma Ji Fortress Ornamental Wall
    this.makeCanvas(scene, 'tile_wall_fortress', 32, 32, (ctx) => {
      ctx.fillStyle = '#212121';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#4a148c'; // Regal imperial purple/maroon
      ctx.fillRect(2, 2, 28, 28);
      ctx.fillStyle = '#ffd700'; // Gold society filigree
      ctx.fillRect(14, 4, 4, 24);
      ctx.fillRect(4, 14, 24, 4);
    });

    // 8. Maze Hedge / Wall
    this.makeCanvas(scene, 'tile_maze_wall', 32, 32, (ctx) => {
      ctx.fillStyle = '#1b5e20';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(3, 3, 26, 26);
      ctx.fillStyle = '#388e3c';
      ctx.fillRect(6, 6, 8, 8);
      ctx.fillRect(18, 16, 8, 8);
      // Night shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, 26, 32, 6);
    });

    // 9. Interactive Stall / Furniture
    // Sweet Stall
    this.makeCanvas(scene, 'obj_stall', 64, 48, (ctx) => {
      // Canopy (Red and white striped awning)
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = (i % 2 === 0) ? '#d32f2f' : '#ffffff';
        ctx.fillRect(i * 8, 0, 8, 18);
      }
      // Wooden table
      ctx.fillStyle = '#6d4c41';
      ctx.fillRect(4, 18, 56, 26);
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(6, 20, 52, 10);
      // Trays of Jalebi and Laddoo
      ctx.fillStyle = '#ff6f00'; // Jalebi coils
      ctx.fillRect(10, 22, 14, 6);
      ctx.fillStyle = '#ffb300'; // Laddoo pyramid
      ctx.fillRect(28, 21, 14, 7);
      ctx.fillStyle = '#ffd54f';
      ctx.fillRect(44, 22, 10, 6);
      // Sign: "RAMESH SWEETS"
      ctx.fillStyle = '#ffffff';
      ctx.font = '7px sans-serif';
      ctx.fillText('SWEETS', 18, 40);
    });

    // Indian Scooter (Chetak / Bajaj style)
    this.makeCanvas(scene, 'obj_scooter', 48, 36, (ctx) => {
      // Body (Classic Sky Blue)
      ctx.fillStyle = '#0288d1';
      ctx.fillRect(12, 12, 24, 14);
      // Side dome cover
      ctx.fillStyle = '#03a9f4';
      ctx.beginPath();
      ctx.ellipse(30, 20, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Seat (black leather)
      ctx.fillStyle = '#212121';
      ctx.fillRect(16, 8, 16, 5);
      // Handlebar and chrome headlight
      ctx.fillStyle = '#b0bec5';
      ctx.fillRect(8, 6, 6, 12);
      ctx.fillStyle = '#fffde7';
      ctx.fillRect(6, 8, 4, 5);
      // Wheels
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.ellipse(12, 28, 5, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(34, 28, 5, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Indian LPG Red Gas Cylinder
    this.makeCanvas(scene, 'obj_lpg', 24, 32, (ctx) => {
      ctx.fillStyle = '#d32f2f'; // Bharat / Indane red
      ctx.fillRect(4, 8, 16, 20);
      ctx.fillRect(6, 4, 12, 4);
      // Metal handle ring
      ctx.fillStyle = '#b71c1c';
      ctx.strokeRect(5, 2, 14, 6);
      // White seal
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 14, 4, 4);
    });

    // Kitchen Counter & Gas Stove
    this.makeCanvas(scene, 'obj_kitchen_counter', 64, 32, (ctx) => {
      ctx.fillStyle = '#37474f'; // Black granite slab
      ctx.fillRect(0, 0, 64, 32);
      ctx.fillStyle = '#263238';
      ctx.fillRect(2, 2, 60, 28);
      // Gas stove (2 burners)
      ctx.fillStyle = '#90a4ae';
      ctx.fillRect(8, 6, 24, 14);
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(14, 13, 4, 0, Math.PI * 2);
      ctx.arc(26, 13, 4, 0, Math.PI * 2);
      ctx.fill();
      // Blue burner flame!
      ctx.fillStyle = '#29b6f6';
      ctx.fillRect(13, 12, 2, 2);
      ctx.fillRect(25, 12, 2, 2);
      // Stainless steel dabbas (spice containers)
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(40, 8, 6, 8);
      ctx.fillRect(48, 8, 6, 8);
      ctx.fillRect(56, 8, 6, 8);
    });

    // Living Room Sofa (Floral printed Desi couch)
    this.makeCanvas(scene, 'obj_sofa', 64, 36, (ctx) => {
      ctx.fillStyle = '#8e24aa'; // Royal purple
      ctx.fillRect(4, 4, 56, 28);
      ctx.fillStyle = '#ab47bc';
      ctx.fillRect(8, 8, 48, 18);
      // Cushions with golden floral motif
      ctx.fillStyle = '#ffd54f';
      ctx.fillRect(14, 12, 10, 10);
      ctx.fillRect(28, 12, 10, 10);
      ctx.fillRect(42, 12, 10, 10);
    });

    // Large locked metal storage box (Sutli bomb chest in kitchen)
    this.makeCanvas(scene, 'obj_storage_box', 36, 32, (ctx) => {
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(2, 4, 32, 24);
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(4, 6, 28, 20);
      // Brass lock and bands
      ctx.fillStyle = '#ffb300';
      ctx.fillRect(2, 14, 32, 3);
      ctx.fillRect(15, 12, 6, 8);
      // Keyhole
      ctx.fillStyle = '#000';
      ctx.fillRect(17, 15, 2, 3);
    });

    // Door (Closed / Locked)
    this.makeCanvas(scene, 'obj_door_locked', 32, 40, (ctx) => {
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(0, 0, 32, 40);
      ctx.fillStyle = '#6d4c41';
      ctx.fillRect(3, 3, 26, 34);
      // Brass handle & padlock
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(24, 20, 4, 6);
      ctx.fillStyle = '#c62828';
      ctx.fillRect(12, 16, 8, 8);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(14, 18, 4, 4);
    });

    // Door (Open / Exit highlight)
    this.makeCanvas(scene, 'obj_door_open', 32, 40, (ctx) => {
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, 32, 40);
      // Glowing green / yellow portal hint
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(2, 2, 28, 36);
      ctx.fillStyle = '#76ff03';
      ctx.fillRect(6, 6, 20, 28);
    });

    // Rangoli Pattern on Ground
    this.makeCanvas(scene, 'obj_rangoli', 48, 48, (ctx) => {
      ctx.fillStyle = '#e91e63'; // Outer circle
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd600'; // Inner ring
      ctx.beginPath();
      ctx.arc(24, 24, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#00e676'; // Core star
      ctx.beginPath();
      ctx.arc(24, 24, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff'; // White dots/rice powder
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const x = 24 + Math.cos(angle) * 18;
        const y = 24 + Math.sin(angle) * 18;
        ctx.fillRect(x - 1, y - 1, 3, 3);
      }
    });

    // Diya (Flickering clay lamp)
    this.makeCanvas(scene, 'obj_diya', 24, 24, (ctx) => {
      // Earthen clay base
      ctx.fillStyle = '#bf360c';
      ctx.beginPath();
      ctx.ellipse(12, 16, 9, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Oil pool
      ctx.fillStyle = '#ff8f00';
      ctx.ellipse(12, 15, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Flame
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath();
      ctx.arc(12, 10, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff3d00';
      ctx.fillRect(11, 7, 2, 4);
    });

    // Fairy Light Strings (Horizontal)
    this.makeCanvas(scene, 'obj_fairy_lights', 64, 12, (ctx) => {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.quadraticCurveTo(32, 10, 64, 4);
      ctx.stroke();
      const colors = ['#f44336', '#ffeb3b', '#4caf50', '#00e5ff', '#e91e63'];
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.arc(8 + i * 12, 6 + (i === 2 ? 2 : 0), 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Society Notice Board
    this.makeCanvas(scene, 'obj_notice_board', 40, 36, (ctx) => {
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(2, 2, 36, 26);
      ctx.fillStyle = '#efebe9';
      ctx.fillRect(5, 5, 30, 20);
      // Rules notice
      ctx.fillStyle = '#d32f2f';
      ctx.font = 'bold 5px sans-serif';
      ctx.fillText('RULES', 11, 11);
      ctx.fillStyle = '#212121';
      ctx.fillRect(8, 14, 24, 2);
      ctx.fillRect(8, 18, 18, 2);
      // Legs
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(8, 28, 4, 8);
      ctx.fillRect(28, 28, 4, 8);
    });

    // Service Lane Exit Sign (Bazaar exit)
    this.makeCanvas(scene, 'obj_exit_service_lane', 40, 40, (ctx) => {
      ctx.fillStyle = '#00c853';
      ctx.fillRect(2, 2, 36, 36);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('EXIT ->', 5, 24);
    });
  }

  // --- ITEMS & COLLECTIBLES ---
  static createItemTextures(scene) {
    // 1. Laddoo (Single sweet - golden boondi laddoo with pistachio dot)
    this.makeCanvas(scene, 'item_laddoo', 20, 20, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(10, 16, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Motichoor Laddoo (Orange/Golden textured sphere)
      ctx.fillStyle = '#ff8f00';
      ctx.beginPath();
      ctx.arc(10, 10, 7, 0, Math.PI * 2);
      ctx.fill();

      // Texture dots
      ctx.fillStyle = '#ffc107';
      ctx.fillRect(7, 8, 2, 2);
      ctx.fillRect(11, 7, 2, 2);
      ctx.fillRect(9, 11, 2, 2);
      ctx.fillRect(12, 10, 2, 2);

      // Silver vark touch & green pistachio
      ctx.fillStyle = '#e0f7fa';
      ctx.fillRect(8, 7, 2, 1);
      ctx.fillStyle = '#2e7d32'; // Pista
      ctx.fillRect(10, 6, 2, 2);
    });

    // 2. Laddoo Box (Festive Mithai Box)
    this.makeCanvas(scene, 'item_laddoo_box', 28, 24, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(14, 20, 10, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Golden & Red Sweet Box
      ctx.fillStyle = '#c62828';
      ctx.fillRect(3, 4, 22, 14);
      ctx.fillStyle = '#ffd54f';
      ctx.strokeRect(3, 4, 22, 14);
      // Gold Ribbon
      ctx.fillRect(12, 4, 4, 14);
      ctx.fillRect(3, 9, 22, 4);
    });

    // 3. Sutli Bomb (Classic Indian Green Jute Twine Firecracker)
    this.makeCanvas(scene, 'item_sutli_bomb', 24, 24, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(12, 20, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Green twine wrapped cylinder
      ctx.fillStyle = '#2e7d32'; // Classic green wrapper
      ctx.fillRect(6, 8, 12, 11);
      // Jute twine strings crossed over
      ctx.strokeStyle = '#d7ccc8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(6, 11);
      ctx.lineTo(18, 16);
      ctx.moveTo(6, 16);
      ctx.lineTo(18, 11);
      ctx.stroke();

      // Fuse string coming out from top
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(12, 8);
      ctx.quadraticCurveTo(15, 4, 16, 2);
      ctx.stroke();
      // Fuse spark
      ctx.fillStyle = '#ff5722';
      ctx.fillRect(15, 1, 2, 2);
    });

    // 4. Golden Kitchen Key
    this.makeCanvas(scene, 'item_key', 20, 20, (ctx) => {
      ctx.fillStyle = '#ffd700';
      // Ring
      ctx.beginPath();
      ctx.arc(7, 7, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(7, 7, 2, 0, Math.PI * 2);
      ctx.fill();
      // Stem
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(9, 6, 8, 3);
      ctx.fillRect(14, 9, 2, 3);
      ctx.fillRect(16, 9, 2, 4);
    });

    // 5. Boss Objective A: Festive Decoration Switch / Wire
    this.makeCanvas(scene, 'obj_boss_decor', 48, 48, (ctx) => {
      ctx.fillStyle = '#37474f';
      ctx.fillRect(8, 8, 32, 32);
      ctx.fillStyle = '#ff9800'; // Electric warning
      ctx.fillRect(10, 10, 28, 28);
      // Festive light chandelier / tangled string overload
      ctx.fillStyle = '#d50000';
      ctx.fillRect(14, 14, 20, 8);
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(14, 24, 20, 8);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText('LIGHTS', 12, 22);
    });

    // 6. Boss Objective B: Society Announcement Speaker Console
    this.makeCanvas(scene, 'obj_boss_speaker', 48, 48, (ctx) => {
      ctx.fillStyle = '#424242';
      ctx.fillRect(6, 6, 36, 36);
      ctx.fillStyle = '#616161';
      ctx.fillRect(8, 8, 32, 32);
      // Microphone & Amplifiers
      ctx.fillStyle = '#ff5252';
      ctx.fillRect(12, 12, 24, 6);
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(14, 22, 20, 12);
      // Dials
      ctx.fillStyle = '#ffd600';
      ctx.fillRect(16, 25, 4, 4);
      ctx.fillRect(26, 25, 4, 4);
    });

    // 7. Boss Objective C: Grand Finale Firecracker Battery
    this.makeCanvas(scene, 'obj_boss_finale', 48, 48, (ctx) => {
      ctx.fillStyle = '#b71c1c';
      ctx.fillRect(6, 6, 36, 36);
      ctx.fillStyle = '#d32f2f';
      ctx.fillRect(8, 8, 32, 32);
      // Rocket launcher battery pipes
      ctx.fillStyle = '#ffd600';
      for (let x = 12; x <= 32; x += 10) {
        for (let y = 12; y <= 32; y += 10) {
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#212121';
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffd600';
        }
      }
    });
  }

  // --- UI TEXTURES ---
  static createUITextures(scene) {
    // 1. Heart (Full)
    this.makeCanvas(scene, 'ui_heart_full', 20, 20, (ctx) => {
      ctx.fillStyle = '#f44336';
      this.drawHeart(ctx, 10, 10, 8);
    });

    // 2. Heart (Empty)
    this.makeCanvas(scene, 'ui_heart_empty', 20, 20, (ctx) => {
      ctx.fillStyle = '#424242';
      this.drawHeart(ctx, 10, 10, 8);
    });

    // 3. Vision Detection Eye
    this.makeCanvas(scene, 'ui_detection_alert', 24, 24, (ctx) => {
      ctx.fillStyle = '#ff1744';
      ctx.beginPath();
      ctx.arc(12, 12, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('!', 9, 18);
    });

    // 4. Portrait Icons for Dialogue
    this.makeCanvas(scene, 'portrait_player', 48, 48, (ctx) => {
      ctx.fillStyle = '#e65100';
      ctx.fillRect(0, 0, 48, 48);
      ctx.fillStyle = '#21130d';
      ctx.fillRect(10, 6, 28, 12);
      ctx.fillStyle = '#e0a96d';
      ctx.fillRect(12, 14, 24, 22);
      ctx.fillStyle = '#d32f2f'; // Tilak
      ctx.fillRect(22, 16, 4, 5);
      ctx.fillStyle = '#111'; // Eyes
      ctx.fillRect(16, 22, 4, 4);
      ctx.fillRect(28, 22, 4, 4);
    });

    this.makeCanvas(scene, 'portrait_father', 48, 48, (ctx) => {
      ctx.fillStyle = '#880e4f';
      ctx.fillRect(0, 0, 48, 48);
      ctx.fillStyle = '#212121';
      ctx.fillRect(10, 6, 28, 10);
      ctx.fillStyle = '#d7a16b';
      ctx.fillRect(12, 14, 24, 24);
      // Specs
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2;
      ctx.strokeRect(14, 20, 8, 8);
      ctx.strokeRect(26, 20, 8, 8);
      // Mustache
      ctx.fillStyle = '#111';
      ctx.fillRect(16, 30, 16, 5);
    });

    this.makeCanvas(scene, 'portrait_mother', 48, 48, (ctx) => {
      ctx.fillStyle = '#00695c';
      ctx.fillRect(0, 0, 48, 48);
      ctx.fillStyle = '#1b1b1b';
      ctx.fillRect(10, 6, 28, 12);
      ctx.fillStyle = '#deb887';
      ctx.fillRect(12, 16, 24, 22);
      ctx.fillStyle = '#c62828'; // Bindi
      ctx.beginPath();
      ctx.arc(24, 19, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    this.makeCanvas(scene, 'portrait_sharma', 48, 48, (ctx) => {
      ctx.fillStyle = '#37474f';
      ctx.fillRect(0, 0, 48, 48);
      ctx.fillStyle = '#d7a16b';
      ctx.fillRect(10, 14, 28, 24);
      ctx.fillStyle = '#212121';
      ctx.fillRect(8, 8, 32, 8);
      ctx.fillStyle = '#eccba0';
      ctx.fillRect(16, 8, 16, 6);
      // Angry eyes & thick mustache
      ctx.fillStyle = '#111';
      ctx.fillRect(14, 22, 6, 4);
      ctx.fillRect(28, 22, 6, 4);
      ctx.fillRect(14, 28, 20, 6);
    });

    this.makeCanvas(scene, 'portrait_shopkeeper', 48, 48, (ctx) => {
      ctx.fillStyle = '#fbc02d';
      ctx.fillRect(0, 0, 48, 48);
      ctx.fillStyle = '#ffffff'; // Topi
      ctx.fillRect(10, 6, 28, 10);
      ctx.fillStyle = '#d7a16b';
      ctx.fillRect(12, 16, 24, 22);
      ctx.fillStyle = '#111';
      ctx.fillRect(14, 28, 20, 5);
    });

    this.makeCanvas(scene, 'portrait_phooljhadi', 48, 48, (ctx) => {
      ctx.fillStyle = '#ff8f00';
      ctx.fillRect(0, 0, 48, 48);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(10, 10, 28, 26);
      ctx.fillStyle = '#111'; // Shiny eyes
      ctx.fillRect(14, 18, 5, 5);
      ctx.fillRect(28, 18, 5, 5);
      ctx.fillStyle = '#fff';
      ctx.fillRect(15, 19, 2, 2);
      ctx.fillRect(29, 19, 2, 2);
      ctx.fillStyle = '#b94a00'; // Ears
      ctx.fillRect(6, 12, 6, 12);
      ctx.fillRect(36, 12, 6, 12);
    });
  }

  static drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2, x, y + size);
    ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
    ctx.fill();
  }

  // --- FX TEXTURES ---
  static createFXTextures(scene) {
    // 1. Sparkle particle
    this.makeCanvas(scene, 'fx_sparkle', 8, 8, (ctx) => {
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(3, 0, 2, 8);
      ctx.fillRect(0, 3, 8, 2);
    });

    // 2. Smoke puff particle
    this.makeCanvas(scene, 'fx_smoke', 12, 12, (ctx) => {
      ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
      ctx.beginPath();
      ctx.arc(6, 6, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Shockwave / Stun Ring
    this.makeCanvas(scene, 'fx_shockwave', 32, 32, (ctx) => {
      ctx.strokeStyle = '#ff9800';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(16, 16, 12, 0, Math.PI * 2);
      ctx.stroke();
    });
  }
}
