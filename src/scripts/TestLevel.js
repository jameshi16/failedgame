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
      map: null,
      collisionLayer: null,
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

    if (!this.instance.gridLock && !this.instance.navDone) {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const player = this.instance.player;
      /** @type {Phaser.Tilemaps.Tilemap} */
      const map = this.instance.map;
      /** @type {Phaser.Tilemaps.StaticTilemapLayer} */
      const collisionLayer = this.instance.collisionLayer;

      // get all tiles within the world
      const collide = collisionLayer.getTilesWithinWorldXY(0, 0, map.width * 16, map.height * 16)
        .filter(tile => tile.index === 113).map(tile => ({ x: tile.x, y: tile.y }));
      const tilePlayerPos = map.worldToTileXY(player.x, player.y);
      const boundryPos = map.worldToTileXY(map.width * 16, map.height * 16);
      const astar = AStar(collide, tilePlayerPos, { x: 23, y: 13 }, { x: boundryPos.x, y: boundryPos.y });

      const nextPos = astar.length > 1 ? astar[1] : (astar.length === 0 ? astar[0] : null);
      if (nextPos) {
        if (tilePlayerPos.x > nextPos.x) {
          this.gridLockMovement(delta, player, 'left', 'player');
        } else if (tilePlayerPos.x < nextPos.x) {
          this.gridLockMovement(delta, player, 'right', 'player');
        } else if (tilePlayerPos.y > nextPos.y) {
          this.gridLockMovement(delta, player, 'up', 'player');
        } else if (tilePlayerPos.y < nextPos.y) {
          this.gridLockMovement(delta, player, 'down', 'player');
        } else {
          this.gridLockMovement(delta, player, null, 'player');
          this.instance.navDone = true;
        }
      }
    }
  }
}
