import BaseLevelScene from './BaseLevelScene';

// @ts-ignore
import IMGBlankTiles from '../assets/imgs/blank_tile.png';
// @ts-ignore
import IMGIndoorTiles from '../assets/imgs/tilesetformattedupdate1.png';
// @ts-ignore
import IMGIndoorExtraTiles from '../assets/imgs/16x16extratiles_0.png';
// @ts-ignore
import MAPTest from '../assets/compiled_maps/Test.json';

/** @typedef {import('phaser')} Phaser */
/** @typedef {import('../Game')} Game */

export default class TestLevel extends BaseLevelScene {
  /**
   * @param {Game} game
   */
  constructor (game) {
    super(game, 'TestLevel');
  }

  preload () {
    super.preload();

    this.load.image('blankTile', IMGBlankTiles);
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

    super.preCreate();

    const camera = this.cameras.main;
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels, true);
    camera.setZoom(2.0);
    camera.startFollow(this.instance.player);

    super.postCreate();
  }
}
