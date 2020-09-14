import BaseScene from './BaseScene';

// @ts-ignore
import IMGCity1 from '../assets/imgs/city01.png';
// @ts-ignore
import IMGCity2 from '../assets/imgs/city02.png';
// @ts-ignore
import IMGForest1 from '../assets/imgs/forest01.png';
// @ts-ignore
import MAPCity from '../assets/compiled_maps/City.json';
// @ts-ignore
import IMGObject from '../assets/imgs/blank_tile.png';

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

    this.load.image('city01', IMGCity1);
    this.load.image('city02', IMGCity2);
    this.load.image('forest01', IMGForest1);
    this.load.image('object', IMGObject);
    this.load.tilemapTiledJSON('city', MAPCity);
  }

  create () {
    const map = this.make.tilemap({ key: 'city', tileWidth: 16, tileHeight: 16 });
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

    /** @type {Phaser.Physics.Arcade.Sprite} */
    const player = this.instance.player;
    playerSpawnpoint
      .getTilesWithinWorldXY(0, 0, map.widthInPixels, map.heightInPixels, { isNotEmpty: true })
      .forEach(tile => {
        if (tile) {
          const playerSpawnpoint = map.tileToWorldXY(tile.x, tile.y);
          // offset player position, feet is where x and y really matters
          player.setPosition(playerSpawnpoint.x, playerSpawnpoint.y - 16);
          player.anims.play('player_left', true);
          player.anims.stop();
        }
      });

    const camera = this.cameras.main;
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels, true);
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
  }
}
