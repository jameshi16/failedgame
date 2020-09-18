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

const OPPOSITE_DIRECTION = {
  left: 'right',
  up: 'down',
  right: 'left',
  down: 'up'
};

// copied from https://stackoverflow.com/a/2117523
// good enough for my usage
function uuidv4 () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    /* eslint-disable one-var */
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default class TestLevel extends BaseScene {
  /** @param {Game} game */
  constructor (game) {
    super(game, 'TestLevel');
    this.instance = {
      ...this.instance,
      enemies: null,
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
      const tileEquivalent = map.worldToTileXY(x, y);
      return collisionLayer.hasTileAtWorldXY(x, y) ||
        this.instance.dynamicCollidables.has(`${tileEquivalent.x},${tileEquivalent.y}`);
    };

    super.preCreate();
    /** @type {Phaser.Physics.Arcade.Sprite} */
    const player = this.instance.player;
    player.setData('health', 20);
    player.setData('stamina', 200);

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

    this.instance.enemies = this.physics.add.group();
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

        this.instance.enemies.add(skeleton);
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
    camera.setZoom(2);

    // projectiles preparation
    this.instance.projectiles = this.physics.add.group();

    super.postCreate();

    this.instance.map = map;
    this.instance.collisionLayer = collisionLayer;
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

    // regenerate stamina
    const playerStamina = player.getData('stamina');
    player.setData('stamina', Math.min(200, playerStamina + 0.1));

    this.physics.overlap(player, projectiles, (_, projectile) => {
      const projectileDirection = projectile.getData('direction');
      const playerDirection = player.getData('direction');

      if (OPPOSITE_DIRECTION[playerDirection] === projectileDirection) {
        // TODO: parry!
      } else {
        const playerHP = player.getData('health');
        if (playerHP > 1) {
          player.setData('health', playerHP - 1);
        } else {
          // TODO: should be dead
        }
      }
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

    // accept projectile invincibility frames
    const playerProjectileInvincibilityDuration = player.getData('projectile_invincibility_duration');
    if (playerProjectileInvincibilityDuration >= 0) {
      const newDuration = Math.max(playerProjectileInvincibilityDuration - delta, 0);
      player.setData('projectile_invincibility_duration', newDuration);
      if (newDuration === 0) {
        player.setData('direction', null);
      }
    }

    this.instance.dynamicCollidables.clear();
    /** @type {Phaser.Physics.Arcade.Group} */
    const enemies = this.instance.enemies;
    enemies.children.each(e => {
      if (e.getData('uuid') === undefined) {
        e.setData('uuid', uuidv4());
      }

      const index = e.getData('uuid');
      /** @type {Phaser.Physics.Arcade.Sprite} */
      if (!this.instance.gridLock.get(`enemy_${index}`)) {
        /** @type {Phaser.GameObjects.GameObject} */
        const enemy = e;
        if (!(enemy instanceof Phaser.Physics.Arcade.Sprite)) {
          return;
        }

        // Navigate + line of sight
        const tileEnemyPos = map.worldToTileXY(enemy.x, enemy.y + 16);
        const astar = AStar(collide, tileEnemyPos, tilePlayerPos, { x: boundryPos.x, y: boundryPos.y });
        const nextPos = astar.length > 0 ? astar[0] : null;
        const los = this.lineOfSight(enemy, player);
        this.instance.dynamicCollidables.set(`${tileEnemyPos.x},${tileEnemyPos.y}`, true);
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
            arrow.setData('direction', los);
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

    // collision with the player
    const attackingDuration = player.getData('attacking_duration');
    player.setData('attacking_duration', attackingDuration - delta);
    this.physics.overlap(enemies, player, (_, enemy) => {
      if (!(enemy instanceof Phaser.Physics.Arcade.Sprite)) {
        return;
      }

      // we're getting it directly cuz we also set it to 0
      if (player.getData('attacking_duration') > 0) {
        const playerDirection = player.getData('direction');

        if (playerDirection === 'up') {
          if (enemy.x !== player.x || player.y < enemy.y) {
            return;
          }
        } else if (playerDirection === 'down') {
          if (enemy.x !== player.x || player.y > enemy.y) {
            return;
          }
        } else if (playerDirection === 'left') {
          if (player.y !== enemy.y || player.x < enemy.x) {
            return;
          }
        } else if (playerDirection === 'right') {
          if (player.y !== enemy.y || player.x > enemy.x) {
            return;
          }
        }

        enemies.remove(enemy, true, true); // TODO: actually do damage
        player.setData('attacking_duration', 0);
      }
    });
  }

  /**
   * @param {'left' | 'right' | 'up' | 'down'} direction
   */
  leftClick (direction) {
    /** @type {Phaser.Physics.Arcade.Sprite} */
    const player = this.instance.player;
    const stamina = player.getData('stamina');

    if (stamina >= 10) {
      super.leftClick(direction);
      player.setData('projectile_invincibility_duration', 500);
      player.setData('direction', direction);
      player.setData('attacking_duration', 500);
      player.setData('stamina', stamina - 10);
    }
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
