/** @typedef {import('./Resource').default} Resource */
/** @typedef {import('phaser').Scene} Scene */

// @ts-ignore
import IMGIndoorTiles from '../../assets/imgs/tilesetformattedupdate1.png';

/**
 * Key names loaded by this resource: 'indoorTiles'
 * @implements Resource
 */
export default class IndoorTiles {
  /** @param {Scene} scene */
  load (scene) {
    scene.load.image('indoorTiles', IMGIndoorTiles);
  }

  /** @param {Scene} scene */
  unload (scene) {
    // TODO: Unload from cache
  }
}
