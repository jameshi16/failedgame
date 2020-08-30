/** @typedef {import('./Resource').default} Resource */
/** @typedef {import('phaser').Scene} Scene */

// @ts-ignore
import IMGBlankTiles from '../../assets/imgs/blank_tile.png';

/**
 * Key names loaded by this resource: 'blankTile'
 * @implements Resource
 */
export default class BlankTile {
  /** @param {Scene} scene */
  load (scene) {
    scene.load.image('blankTile', IMGBlankTiles);
  }

  /** @param {Scene} scene */
  unload (scene) {
    // TODO: Unload from cache
  }
}
