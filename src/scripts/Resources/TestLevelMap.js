/** @typedef {import('./Resource').default} Resource */
/** @typedef {import('phaser').Scene} Scene */

// @ts-ignore
import MAPTest from '../../assets/compiled_maps/Test.json';

/**
 * Key names loaded by this resource: 'testLevelMap'
 * @implements Resource
 */
export default class TestLevelMap {
  /** @param {Scene} scene */
  load (scene) {
    scene.load.tilemapTiledJSON('testLevelMap', MAPTest);
  }

  /** @param {Scene} scene */
  unload (scene) {
    // TODO: Unload from cache
  }
}
