import BaseScene from './BaseScene';

// @ts-ignore
import IMGIndoorTiles from '../assets/imgs/tilesetformattedupdate1.png';
// @ts-ignore
import IMGIndoorExtraTiles from '../assets/imgs/16x16extratiles_0.png';
// @ts-ignore
import MAPTest from '../assets/compiled_maps/Test.json';

import AStar from './AStar/AStar';

/** @typedef {import('../Game').default} Game */

export default class TestLevel extends BaseScene {
  /** @param {Game} game */
  constructor (game) {
    super(game, 'TestLevel');
    this.instance = {
      ...this.instance,
      enemy: null,
      map: null,
      collisionLayer: null,
      drawPathFireOnce: false,
      navDone: false
    };
  }

  preload () {
    super.preload();

    this.load.image('tile1', IMGIndoorTiles);
    this.load.image('tile2', IMGIndoorExtraTiles);
    this.load.tilemapTiledJSON('test', MAPTest);
  }

  create () {
    const map = this.make.tilemap({ key: 'test', tileWidth: 16, tileHeight: 16 });
    const tileset1 = map.addTilesetImage('Indoor Floor', 'tile2', 16, 16);
    const tileset2 = map.addTilesetImage('Indoor Tiles', 'tile1', 16, 16);

    map.createStaticLayer(0, [tileset1, tileset2], 0, 0);
    map.createStaticLayer(1, [tileset1, tileset2], 0, 0);
    map.createStaticLayer(2, [tileset1, tileset2], 0, 0);
    const collisionLayer = map.createStaticLayer(3, null);
    /**
     * @param {number} x
     * @param {number} y
     */
    this.instance.collisionFunction = (x, y) => {
      return collisionLayer.hasTileAtWorldXY(x, y);
    };

    super.preCreate();
    /** @type {Phaser.Physics.Arcade.Sprite} */
    const player = this.instance.player;
    player.setPosition(16 * 13, 16 * 3);

    const enemy = this.physics.add.sprite(0, 0, 'player');
    this.instance.enemy = enemy;

    enemy.setCollideWorldBounds(true);
    enemy.setScale(0.5);
    enemy.setOrigin(0.25, 0.125);
    enemy.setPosition(23 * 16, 13 * 16); // set position in tile x and y
    enemy.setSize(16, 16);
    enemy.setTint(0xff0000); // red tint because red === bad guy

    this.anims.create({
      key: 'enemy_up',
      frames: this.anims.generateFrameNumbers('player', { start: 104, end: 112 }),
      frameRate: 13,
      repeat: -1
    });

    this.anims.create({
      key: 'enemy_left',
      frames: this.anims.generateFrameNumbers('player', { start: 117, end: 125 }),
      frameRate: 13,
      repeat: -1
    });

    this.anims.create({
      key: 'enemy_down',
      frames: this.anims.generateFrameNumbers('player', { start: 130, end: 138 }),
      frameRate: 13,
      repeat: -1
    });

    this.anims.create({
      key: 'enemy_right',
      frames: this.anims.generateFrameNumbers('player', { start: 143, end: 151 }),
      frameRate: 13,
      repeat: -1
    });

    const camera = this.cameras.main;
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels, true);
    camera.setZoom(2.0);
    camera.startFollow(this.instance.player);

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

    if (!this.instance.gridLock.get('enemy') && !this.instance.navDone) {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const enemy = this.instance.enemy;
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const player = this.instance.player;
      /** @type {Phaser.Tilemaps.Tilemap} */
      const map = this.instance.map;
      /** @type {Phaser.Tilemaps.StaticTilemapLayer} */
      const collisionLayer = this.instance.collisionLayer;

      // get all tiles within the world
      const collide = collisionLayer.getTilesWithinWorldXY(0, 0, map.width * 16, map.height * 16)
        .filter(tile => tile.index === 113).map(tile => ({ x: tile.x, y: tile.y }));
      const tileEnemyPos = map.worldToTileXY(enemy.x, enemy.y + 16);
      const tilePlayerPos = map.worldToTileXY(player.x, player.y + 16);
      const boundryPos = map.worldToTileXY(map.width * 16, map.height * 16);
      const astar = AStar(collide, tileEnemyPos, tilePlayerPos, { x: boundryPos.x, y: boundryPos.y });
      if (!this.instance.drawPathFireOnce) {
        this.instance.drawPathFireOnce = true;
        this.add.circle(tilePlayerPos.x * 16 + 8, tilePlayerPos.y * 16 + 8, 16, 0x0000ff);
        this.add.circle(tileEnemyPos.x * 16 + 8, tileEnemyPos.y * 16 + 8, 16, 0x00ff00);
        astar.forEach(pos => {
          this.add.circle(pos.x * 16 + 8, pos.y * 16 + 8, 8, 0xff00000);
        });
      }

      const nextPos = astar.length > 0 ? astar[0] : null;
      if (nextPos) {
        const xDiffGreater = Math.abs(tileEnemyPos.x - nextPos.x) > Math.abs(tileEnemyPos.y - nextPos.y);
        if (tileEnemyPos.x > nextPos.x && xDiffGreater) {
          this.gridLockMovement(delta, enemy, 'left', 'enemy');
        } else if (tileEnemyPos.x < nextPos.x && xDiffGreater) {
          this.gridLockMovement(delta, enemy, 'right', 'enemy');
        } else if (tileEnemyPos.y > nextPos.y && !xDiffGreater) {
          this.gridLockMovement(delta, enemy, 'up', 'enemy');
        } else if (tileEnemyPos.y < nextPos.y && !xDiffGreater) {
          this.gridLockMovement(delta, enemy, 'down', 'enemy');
        }
      } else {
        this.gridLockMovement(delta, enemy, null, 'enemy');
        this.instance.navDone = true;
      }
    }
  }
}
