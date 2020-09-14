import BaseScene from './BaseScene';
import Phaser from 'phaser';

// @ts-ignore
import IMGCity1 from '../assets/imgs/city01.png';
// @ts-ignore
import IMGCity2 from '../assets/imgs/city02.png';
// @ts-ignore
import IMGForest1 from '../assets/imgs/forest01.png';
// @ts-ignore
import IMGSkeleton from '../assets/imgs/skeleton.png';
// @ts-ignore
import IMGProjectiles from '../assets/imgs/projectiles.png';
// @ts-ignore
import MAPCity from '../assets/compiled_maps/City.json';

import AStar from './AStar/AStar';

/** @typedef {import('../Game').default} Game */

export default class TestLevel extends BaseScene {
  /** @param {Game} game */
  constructor (game) {
    super(game, 'TestLevel');
    this.instance = {
      ...this.instance,
      enemies: [],
      projectiles: null,
      map: null,
      collisionLayer: null
    };
  }

  preload () {
    super.preload();

    this.load.spritesheet('skeleton', IMGSkeleton, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('projectiles', IMGProjectiles, { frameWidth: 64, frameHeight: 64 });

    this.load.image('city01', IMGCity1);
    this.load.image('city02', IMGCity2);
    this.load.image('forest01', IMGForest1);
    this.load.tilemapTiledJSON('city', MAPCity);
  }

  create () {
    const map = this.make.tilemap({ key: 'city', tileWidth: 16, tileHeight: 16 });
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    const tileset1 = map.addTilesetImage('City 01', 'city01', 16, 16);
    const tileset2 = map.addTilesetImage('City 02', 'city02', 16, 16);
    const tileset3 = map.addTilesetImage('Forest 01', 'forest01', 16, 16);

    map.createStaticLayer(0, [tileset1, tileset2, tileset3]);
    map.createStaticLayer(1, [tileset1, tileset2, tileset3]);
    map.createStaticLayer(2, [tileset1, tileset2, tileset3]);
    map.createStaticLayer(3, [tileset1, tileset2, tileset3]);

    const enemySpawnpoints = map.createStaticLayer(5, null);
    const playerSpawnpoint = map.createStaticLayer(6, null);
    const collisionLayer = map.createStaticLayer(4, null);
    /**
     * @param {number} x
     * @param {number} y
     */
    this.instance.collisionFunction = (x, y) => {
      return collisionLayer.hasTileAtWorldXY(x, y);
    };

    super.preCreate();
    const player = this.instance.player;

    // register animations & spawn enemies
    this.anims.create({
      key: 'skeleton_up',
      frames: this.anims.generateFrameNumbers('skeleton', { start: 104, end: 112 }),
      frameRate: 13,
      repeat: -1
    });

    this.anims.create({
      key: 'skeleton_left',
      frames: this.anims.generateFrameNumbers('skeleton', { start: 117, end: 125 }),
      frameRate: 13,
      repeat: -1
    });

    this.anims.create({
      key: 'skeleton_down',
      frames: this.anims.generateFrameNumbers('skeleton', { start: 130, end: 138 }),
      frameRate: 13,
      repeat: -1
    });

    this.anims.create({
      key: 'skeleton_right',
      frames: this.anims.generateFrameNumbers('skeleton', { start: 143, end: 151 }),
      frameRate: 13,
      repeat: -1
    });

    this.anims.create({ // arrow """animation""" kusa
      key: 'arrow_right',
      frames: this.anims.generateFrameNumbers('projectiles', { start: 4, end: 4 }),
      frameRate: 1,
      repeat: -1
    });

    this.anims.create({
      key: 'arrow_up',
      frames: this.anims.generateFrameNumbers('projectiles', { start: 2, end: 2 }),
      frameRate: 1,
      repeat: -1
    });

    this.anims.create({
      key: 'arrow_down',
      frames: this.anims.generateFrameNumbers('projectiles', { start: 6, end: 6 }),
      frameRate: 1,
      repeat: -1
    });

    this.anims.create({
      key: 'arrow_left',
      frames: this.anims.generateFrameNumbers('projectiles', { start: 0, end: 0 }),
      frameRate: 1,
      repeat: -1
    });

    enemySpawnpoints
      .getTilesWithinWorldXY(0, 0, map.widthInPixels, map.heightInPixels, { isNotEmpty: true })
      .forEach(tile => {
        const enemySpawnpoint = map.tileToWorldXY(tile.x, tile.y);
        // offset enemy y-position, feet is where x and y really matters
        const skeleton = this.physics.add.sprite(0, 0, 'skeleton');
        skeleton.setCollideWorldBounds(true);
        skeleton.setPosition(enemySpawnpoint.x, enemySpawnpoint.y - 16);
        skeleton.setScale(0.5);
        skeleton.setOrigin(0.25, 0.125);

        this.instance.enemies.push(skeleton);
      });

    // spawn the player
    /** @type {Phaser.Physics.Arcade.Sprite} */
    playerSpawnpoint
      .getTilesWithinWorldXY(0, 0, map.widthInPixels, map.heightInPixels, { isNotEmpty: true })
      .forEach(tile => {
        if (tile) {
          const playerSpawnpoint = map.tileToWorldXY(tile.x, tile.y);
          // offset player y-position, feet is where x and y really matters
          player.setPosition(playerSpawnpoint.x, playerSpawnpoint.y - 16);
          player.anims.play('player_left', true);
          player.anims.stop();
        }
      });

    const camera = this.cameras.main;
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels, true);
    camera.startFollow(this.instance.player);

    // projectiles preparation
    this.instance.projectiles = this.physics.add.group();

    super.postCreate();

    this.instance.map = map;
    this.instance.collisionLayer = collisionLayer;

    this.physics.world.on(Phaser.Physics.Arcade.Events.WORLD_BOUNDS, () => {
      console.log('test');
    });
  }

  /**
   * @param {number} time
   * @param {number} delta
   */
  update (time, delta) {
    super.update(time, delta);

    /** @type {Phaser.Physics.Arcade.Group} */
    const projectiles = this.instance.projectiles;
    /** @type {Phaser.Physics.Arcade.Sprite} */
    const player = this.instance.player;
    /** @type {Phaser.Tilemaps.Tilemap} */
    const map = this.instance.map;
    /** @type {Phaser.Tilemaps.StaticTilemapLayer} */
    const collisionLayer = this.instance.collisionLayer;
    // get all tiles within the world
    const collide = collisionLayer.getTilesWithinWorldXY(0, 0, map.widthInPixels, map.heightInPixels, { isNotEmpty: true })
      .map(tile => ({ x: tile.x, y: tile.y }));
    const tilePlayerPos = map.worldToTileXY(player.x, player.y + 16);
    const boundryPos = map.worldToTileXY(map.widthInPixels, map.heightInPixels);

    this.physics.overlap(player, projectiles, (_, projectile) => {
      projectiles.remove(projectile, true, true);
    });

    projectiles.children.each(projectile => {
      if (projectile instanceof Phaser.Physics.Arcade.Sprite) {
        if (projectile.body instanceof Phaser.Physics.Arcade.Body) {
          if (projectile.body.checkWorldBounds()) {
            projectiles.remove(projectile, true, true);
          }
        }
      }
    });

    this.instance.enemies.forEach((e, index) => {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      if (!this.instance.gridLock.get(`enemy_${index}`)) {
        /** @type {Phaser.Physics.Arcade.Sprite} */
        const enemy = e;
        const tileEnemyPos = map.worldToTileXY(enemy.x, enemy.y + 16);
        const astar = AStar(collide, tileEnemyPos, tilePlayerPos, { x: boundryPos.x, y: boundryPos.y });

        const nextPos = astar.length > 0 ? astar[0] : null;
        const los = this.lineOfSight(enemy, player);
        if (nextPos && los === false) {
          const xDiffGreater = Math.abs(tileEnemyPos.x - nextPos.x) > Math.abs(tileEnemyPos.y - nextPos.y);
          if (tileEnemyPos.x > nextPos.x && xDiffGreater) {
            this.gridLockMovement(delta, enemy, 'left', `enemy_${index}`, 'skeleton', 64);
          } else if (tileEnemyPos.x < nextPos.x && xDiffGreater) {
            this.gridLockMovement(delta, enemy, 'right', `enemy_${index}`, 'skeleton', 64);
          } else if (tileEnemyPos.y > nextPos.y && !xDiffGreater) {
            this.gridLockMovement(delta, enemy, 'up', `enemy_${index}`, 'skeleton', 64);
          } else if (tileEnemyPos.y < nextPos.y && !xDiffGreater) {
            this.gridLockMovement(delta, enemy, 'down', `enemy_${index}`, 'skeleton', 64);
          }
        } else if (los) {
          enemy.anims.play(`skeleton_${los}`, true);
          enemy.anims.stop();

          if (enemy.getData('arrow_fired_timestamp') === undefined ||
            time - enemy.getData('arrow_fired_timestamp') > 3000) {
            const arrow = this.physics.add.sprite(enemy.x, enemy.y + 12, 'projectiles');
            arrow.setScale(0.5);
            arrow.anims.play(`arrow_${los}`, true);
            arrow.setCollideWorldBounds(true);
            projectiles.add(arrow);

            if (los === 'right') {
              arrow.setVelocity(256, 0);
            } else if (los === 'left') {
              arrow.setVelocity(-256, 0);
            } else if (los === 'up') {
              arrow.setVelocity(0, -256);
            } else if (los === 'down') {
              arrow.setVelocity(0, 256);
            }

            enemy.setData('arrow_fired_timestamp', time);
          }
        } else {
          this.gridLockMovement(delta, enemy, null, `enemy_${index}`, 'skeleton', 64);
        }
      }
    });
  }

  /**
   * Figures out if LHS has a Manhatten line of sight with RHS.
   * Takes into account of obstacles inside the collision function
   * @param {Phaser.Physics.Arcade.Sprite} lhs A sprite
   * @param {Phaser.Physics.Arcade.Sprite} rhs Another sprite
   * @returns {'up' | 'down' | 'left' | 'right' | false} Direction of LOS from LHS
   */
  lineOfSight (lhs, rhs) {
    if (Math.abs(lhs.x - rhs.x) > 1 && Math.abs(lhs.y - rhs.y) > 1) {
      return false;
    }

    if (Math.abs(lhs.x - rhs.x) < 1) {
      const start = lhs.y > rhs.y ? Math.floor(rhs.y) : Math.floor(lhs.y);
      const end = lhs.y > rhs.y ? Math.floor(lhs.y) : Math.floor(rhs.y);
      const closestX = Math.floor(lhs.x);

      for (let i = start; i < end; i++) {
        if (this.instance.collisionFunction(closestX, i + 16)) {
          return false;
        }
      }
      return lhs.y > rhs.y ? 'up' : 'down';
    }

    if (Math.abs(lhs.y - rhs.y) < 1) {
      const start = lhs.x > rhs.x ? Math.floor(rhs.x) : Math.floor(lhs.x);
      const end = lhs.x > rhs.x ? Math.floor(lhs.x) : Math.floor(rhs.x);
      const closestY = Math.floor(lhs.y);

      for (let i = start; i < end; i++) {
        if (this.instance.collisionFunction(i, closestY + 16)) {
          return false;
        }
        return lhs.x > rhs.x ? 'left' : 'right';
      }
    }

    return false;
  }
}
