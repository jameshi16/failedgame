/** @typedef {import('./Resource').default} Resource */
/** @typedef {import('phaser').Scene} Scene */

// @ts-ignore
import IMGPlayerSprite from '../../assets/imgs/player.png';

/**
 * Key names loaded by this resource: 'player'
 * @implements Resource
 */
export default class Player {
  /** @param {Scene} scene */
  load (scene) {
    scene.load.spritesheet('player', IMGPlayerSprite, { frameWidth: 64, frameHeight: 64 });
  }

  /** @param {Scene} scene */
  unload (scene) {
    // NOTE: Player should, in theory, never be unloaded.
  }
};
