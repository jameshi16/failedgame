/** @typedef {import ('./Resources/Resource')} Resource */
/** @typedef {import ('phaser').Scene} Scene */

/**
 * Checks if the object is a resource type
 * @param {object} obj
 * @returns {boolean}
 */
function isResource (obj) {
  return (typeof (obj.getDependencies) === 'function');
}

export default class ResourceManager {
  constructor () {
    /** @type {Resource[]} */
    this.loaded = [];

    /** @type {Scene?} */
    this.currentScene = undefined;
    /** @type {Scene?} */
    this.nextScene = undefined;
  }

  /**
   * Loads a scene, and unloads the previous one, destroying the resources accordingly
   * @param {Scene} scene A Phaser scene
   */
  loadScene (scene) {

  }
}
