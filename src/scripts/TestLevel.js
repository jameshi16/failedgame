import BaseLevelScene from './BaseLevelScene';
import Resources from './Resources/Resources';

/** @typedef {import('phaser')} Phaser */
/** @typedef {import('../Game')} Game */
/** @typedef {import('./Resources/Resource')} Resource */

export default class TestLevel extends BaseLevelScene {
  /**
   * @param {Game} game
   */
  constructor (game) {
    super(game, 'TestLevel', [Resources.testLevelMap.keynames[0]]);
  }

  preload () {
    super.preload();
  }

  create () {
    const map = this.make.tilemap({ key: Resources.testLevelMap.keynames[0], tileWidth: 16, tileHeight: 16 });
    const tileset1 = map.addTilesetImage('Indoor Floor', Resources.indoorExtraTiles.keynames[0], 16, 16);
    const tileset2 = map.addTilesetImage('Indoor Tiles', Resources.indoorTiles.keynames[0], 16, 16);

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
