/** @typedef {import('./Resource').default} Resource */
/** @typedef {import('phaser').Scene} Scene */

// @ts-ignore
import IMGIndoorExtraTiles from '../../assets/imgs/16x16extratiles_0.png';

/**
 * Key names loaded by this resource: 'indoorExtraTiles'
 * @implements Resource
 */
export default class IndoorExtraTiles {
  /** @param {Scene} scene */
  load (scene) {
    scene.load.image('indoorExtraTiles', IMGIndoorExtraTiles);
  }

  /** @param {Scene} scene */
  unload (scene) {
    // TODO: Unload from cache
  }
}
