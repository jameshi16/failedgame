/** @typedef {import ('phaser').Scene} Scene */

/**
 * Interface for Resources
 * @interface
 */
export default class Resource {
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
