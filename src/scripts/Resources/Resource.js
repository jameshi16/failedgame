/** @typedef {import ('phaser').Scene} Scene */

/**
 * Interface for Resources
 * @interface
 */
export default class Resource {
  /**
   * Lists dependencies for the Resource. Can be used
   * directly by ResourceManager
   * @function
   * @returns {Array<typeof Resource> | null} An array of resources.
   */
  getDependencies () {
    console.error('getDependencies not implemented.');
    throw new Error('not implemented');
  }

  /**
   * Gets the key names associated to this individual resource.
   * @returns {Array<string>}
   */
  getKeyNames () {
    console.error('GetKeyNames not implemented.');
    throw new Error('not implemented');
  }

  /**
   * Called by ResourceManager whenever a resource should be loaded.
   * @param {Scene} scene
   */
  load (scene) {
    console.error('Load not implemented. Params: ', scene);
    throw new Error('not implemented');
  }

  /**
   * Called by ResourceManager whenever a resource should be unloaded.
   * Do not remove keys from Phaser.CacheManager, that will be done by ResourceManager
   * automatically.
   * @param {Scene} scene
   */
  unload (scene) {
    console.error('Unload not implemented. Params: ', scene);
    throw new Error('not implemented');
  }
}
