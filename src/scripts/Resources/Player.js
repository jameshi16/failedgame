/** @typedef {import('./Resource').default} Resource */
/** @typedef {import('phaser').Scene} Scene */

// @ts-ignore
import IMGPlayerSprite from '../assets/imgs/player.png';

/**
 * Key names loaded by this resource: 'player'
 * @implements Resource
 */
export default class Player {
  getDependencies () {
    return null;
  }

  getKeyNames () {
    return ['player'];
  }

  /** @param {Scene} scene */
  load (scene) {
    scene.load.spritesheet('player', IMGPlayerSprite, { frameWidth: 64, frameHeight: 64 });
  }

  /** @param {Scene} scene */
  unload (scene) {
  }
};
