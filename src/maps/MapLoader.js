// MapLoader.js - Data-driven map parser and layer builder for Diwali Chaos
import { MapValidator } from './MapValidator.js';
import { MapCoordinates } from './MapCoordinates.js';
import { soundManager } from '../systems/SoundSystem.js';
import { inventory } from '../systems/InventoryManager.js';

export class MapLoader {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Load and construct a level map from MapData
   * @param {object} mapData - Schema-compliant map definition
   * @returns {object} Instantiated map resources and references
   */
  loadMap(mapData) {
    // 1. Validation
    const validation = MapValidator.validate(mapData);
    if (!validation.isValid) {
      console.error(`[MapLoader] Map validation failed for "${mapData?.id || 'unknown'}":`, validation.errors);
      throw new Error(`Invalid map definition: ${validation.errors.join('; ')}`);
    }
    if (validation.warnings.length > 0) {
      console.warn(`[MapLoader] Map warnings for "${mapData.id}":`, validation.warnings);
    }

    const tileSize = mapData.tileSize || 32;
    const { cols, rows, bounds } = mapData;

    // 2. Set Physics World & Camera Bounds
    if (this.scene.physics && this.scene.physics.world) {
      this.scene.physics.world.setBounds(0, 0, bounds.width, bounds.height);
    }
    if (this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.setBounds(0, 0, bounds.width, bounds.height);
    }

    // 3. Initialize Collections
    const collisionGroup = this.scene.physics.add.staticGroup();
    const visionObstacles = [];
    const interactables = [];
    const namedObjects = new Map();
    const collectibleSprites = [];

    // 4. Build Ground Layer
    this.buildGroundLayer(mapData.layers?.ground, cols, rows, tileSize);

    // 5. Build Collision Grid (if 2D matrix provided)
    if (mapData.layers?.collisionGrid) {
      this.buildCollisionGrid(mapData.layers.collisionGrid, cols, rows, tileSize, collisionGroup, visionObstacles);
    }

    // 6. Build Environment / Decorative Props (with foot-based depth sorting)
    if (mapData.environmentProps) {
      this.buildEnvironmentProps(mapData.environmentProps, tileSize, namedObjects);
    }

    // 7. Build Gameplay Objects (Walls, Furniture, Doors, Consoles)
    if (mapData.gameplayObjects) {
      this.buildGameplayObjects(mapData.gameplayObjects, tileSize, collisionGroup, visionObstacles, interactables, namedObjects);
    }

    // 8. Build Collectibles
    if (mapData.collectibles) {
      this.buildCollectibles(mapData.collectibles, tileSize, collectibleSprites);
    }

    // 9. Extract Aangan Courtyard Rectangle (for Boss level)
    let aanganRect = null;
    if (mapData.aanganRect) {
      aanganRect = new Phaser.Geom.Rectangle(
        mapData.aanganRect.x,
        mapData.aanganRect.y,
        mapData.aanganRect.width,
        mapData.aanganRect.height
      );
    }

    return {
      mapData,
      collisionGroup,
      visionObstacles,
      interactables,
      namedObjects,
      collectibleSprites,
      playerSpawn: mapData.playerSpawn,
      npcConfigs: mapData.npcs || [],
      aanganRect
    };
  }

  // --- SAFE TEXTURE RETRIEVAL ---
  getSafeTexture(key, defaultFallback = null) {
    if (this.scene.textures.exists(key)) {
      return key;
    }
    console.warn(`[MapLoader] Warning: Texture key "${key}" not found in Phaser TextureManager!`);
    return defaultFallback || key;
  }

  // --- LAYER BUILDERS ---
  buildGroundLayer(groundConfig, cols, rows, tileSize) {
    if (!groundConfig) return;

    const defaultTile = groundConfig.defaultTile || 'tile_bazaar_ground';
    const groundTint = groundConfig.tint || null;

    // Check if regions exist
    const regions = groundConfig.regions || [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const { x, y } = MapCoordinates.gridToWorldCenter(c, r, tileSize);
        
        let tileKey = defaultTile;
        let tileTint = groundTint;

        // Check if cell falls into any override region
        for (const reg of regions) {
          const { c1, r1, c2, r2 } = reg.region;
          if (c >= c1 && c <= c2 && r >= r1 && r <= r2) {
            tileKey = reg.tile;
            if (reg.tint) tileTint = reg.tint;
            break;
          }
        }

        const safeKey = this.getSafeTexture(tileKey);
        const img = this.scene.add.image(x, y, safeKey).setDepth(0);
        if (tileTint !== null) {
          img.setTint(tileTint);
        }
      }
    }
  }

  buildCollisionGrid(collisionGrid, cols, rows, tileSize, collisionGroup, visionObstacles) {
    for (let r = 0; r < rows; r++) {
      const rowData = collisionGrid[r];
      if (!rowData) continue;

      for (let c = 0; c < cols; c++) {
        const char = typeof rowData === 'string' ? rowData[c] : rowData[c];
        if (char === '1' || char === 1 || char === 'W') {
          const { x, y } = MapCoordinates.gridToWorldCenter(c, r, tileSize);
          const wallKey = this.getSafeTexture('tile_maze_wall', 'tile_wall_brick');
          const wall = collisionGroup.create(x, y, wallKey);
          wall.setImmovable(true);
          wall.refreshBody();
          wall.setDepth(1);
          visionObstacles.push(wall);
        }
      }
    }
  }

  buildEnvironmentProps(props, tileSize, namedObjects) {
    props.forEach((prop, idx) => {
      const pos = prop.gridPos
        ? MapCoordinates.gridToWorldCenter(prop.gridPos.c, prop.gridPos.r, tileSize)
        : { x: prop.x || 0, y: prop.y || 0 };

      const safeKey = this.getSafeTexture(prop.texture);
      const sprite = this.scene.add.image(pos.x, pos.y, safeKey);

      if (prop.size) {
        sprite.setDisplaySize(prop.size.w, prop.size.h);
      }
      if (prop.alpha !== undefined) sprite.setAlpha(prop.alpha);
      if (prop.tint !== undefined) sprite.setTint(prop.tint);

      // Depth sorting based on foot position
      const height = prop.size ? prop.size.h : sprite.height;
      const depth = prop.depth !== undefined
        ? prop.depth
        : MapCoordinates.calculateFootDepth(pos.y, height, 5);
      sprite.setDepth(depth);

      // Optional animation / effects
      if (prop.animate === 'spin') {
        this.scene.tweens.add({
          targets: sprite,
          angle: 360,
          duration: prop.duration || 40000,
          repeat: -1
        });
      } else if (prop.animate === 'float') {
        this.scene.tweens.add({
          targets: sprite,
          y: pos.y - 4,
          duration: 600,
          yoyo: true,
          repeat: -1
        });
      }

      if (prop.id) {
        namedObjects.set(prop.id, sprite);
      }
    });
  }

  buildGameplayObjects(objects, tileSize, collisionGroup, visionObstacles, interactables, namedObjects) {
    objects.forEach(obj => {
      const pos = obj.gridPos
        ? MapCoordinates.gridToWorldCenter(obj.gridPos.c, obj.gridPos.r, tileSize)
        : { x: obj.x || 0, y: obj.y || 0 };

      const safeKey = obj.texture ? this.getSafeTexture(obj.texture) : null;
      let gameObject = null;

      if (obj.isSolid !== false) {
        // Create as static Arcade Physics body
        gameObject = collisionGroup.create(pos.x, pos.y, safeKey);
        if (obj.bodySize) {
          gameObject.body.setSize(obj.bodySize.w, obj.bodySize.h);
        }
        if (obj.bodyOffset) {
          gameObject.body.setOffset(obj.bodyOffset.x, obj.bodyOffset.y);
        }
        gameObject.setImmovable(true);
        gameObject.refreshBody();

        // Register in vision occlusion if it blocks sight
        if (obj.blocksVision !== false) {
          visionObstacles.push(gameObject);
        }
      } else if (safeKey) {
        gameObject = this.scene.add.image(pos.x, pos.y, safeKey);
      }

      if (gameObject) {
        if (obj.size) {
          gameObject.setDisplaySize(obj.size.w, obj.size.h);
        }
        if (obj.visible === false) {
          gameObject.setVisible(false);
        }

        const height = obj.size ? obj.size.h : gameObject.height || 32;
        const depth = obj.depth !== undefined
          ? obj.depth
          : MapCoordinates.calculateFootDepth(pos.y, height, 20);
        gameObject.setDepth(depth);

        if (obj.id) {
          namedObjects.set(obj.id, gameObject);
        }
      }

      // Register interaction zone if configured
      if (obj.interactable) {
        interactables.push({
          id: obj.id,
          x: pos.x,
          y: pos.y,
          radius: obj.interactable.radius || 50,
          prompt: obj.interactable.prompt || '[E] Interact',
          actionType: obj.interactable.actionType || 'custom',
          dialogueId: obj.interactable.dialogueId || null,
          data: obj.interactable.data || {},
          rawObject: obj
        });
      }
    });
  }

  buildCollectibles(collectibles, tileSize, collectibleSprites) {
    collectibles.forEach(item => {
      const pos = item.gridPos
        ? MapCoordinates.gridToWorldCenter(item.gridPos.c, item.gridPos.r, tileSize)
        : { x: item.x || 0, y: item.y || 0 };

      let texKey = 'item_laddoo';
      let displayW = 20;
      let displayH = 20;
      const count = item.count || 1;

      if (item.type === 'laddoo_box') {
        texKey = 'item_laddoo_box';
        displayW = 26;
        displayH = 22;
      } else if (item.type === 'key') {
        texKey = 'item_key';
        displayW = 22;
        displayH = 22;
      }

      const safeKey = this.getSafeTexture(texKey);
      const sprite = this.scene.physics.add.image(pos.x, pos.y, safeKey);
      sprite.setDisplaySize(displayW, displayH);
      sprite.setDepth(15);
      sprite.collectibleType = item.type;
      sprite.collectibleCount = count;
      sprite.collectibleId = item.id || null;

      // Gentle floating animation
      this.scene.tweens.add({
        targets: sprite,
        y: pos.y - 4,
        duration: 600,
        yoyo: true,
        repeat: -1
      });

      collectibleSprites.push(sprite);
    });
  }
}
