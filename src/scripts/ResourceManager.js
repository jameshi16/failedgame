/** @typedef {import ('./Resources/Resource')} Resource */
/** @typedef {import ('phaser').Scene} Scene */

import Resources from './Resources/Resources';

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
    /** @type {string[]} */
    this.loaded = [];

    /** @type {Scene?} */
    this.currentScene = undefined;
    /** @type {Scene?} */
    this.nextScene = undefined;
  }

  /**
   * Loads a scene, and unloads the previous one, destroying the resources accordingly
   * Should be called in the preload() function of a scene
   * @param {Scene} scene A scene that implementes the Resource interface
   * @param {Array<string> | null} dependencies Key names in Cache declared by this resources
   */
  preloadScene (scene, dependencies) {
    const newDependencies = this.buildDependencies(dependencies);
    const currentDependencies = this.loaded;

    const [noChange, toUnload, toLoad] = this.diffDependencies(
      currentDependencies,
      newDependencies
    );

    toLoad.forEach(dependency => {
      Resources[dependency].class.load(scene);
    });

    toUnload.forEach(dependency => {
      Resources[dependency].class.unload(scene);
    });

    this.loaded = [...noChange, ...toLoad];
  }

  /**
   * @private
   * @param {Array<string> | null} dependencies An array of initial dependencies
   * @returns {Array<string>} An array containing all unique keys required for the scene to render.
   */
  buildDependencies (dependencies) {
    return dependencies.reduce((accum, dependency) => {
      if (!(dependency in Resources) || dependency === null) {
        return [];
      }

      return [...new Set([
        ...accum,
        dependency,
        ...this.buildDependencies(Resources[dependency].dependencies)
      ])];
    }, []);
  }

  /**
   * @private
   * @param {Array<string>} dependenciesA An array representing the dependencies in A
   * @param {Array<string>} dependenciesB An array representing the dependencies in B
   * @returns {string[][]} Array of length 3. [0] will contain A⋂B,
   * [1] will contain (A⋂B)'⋂A, [2] will contain (A⋂B)'⋂B
   */
  diffDependencies (dependenciesA, dependenciesB) {
    /** @type {Array<string>} */
    const intersect = [];
    /** @type {Array<string>} */
    const excessA = [];
    /** @type {Array<string>} */
    const excessB = [];

    dependenciesA.forEach(dependencyA => {
      if (dependencyA in dependenciesB) {
        intersect.push(dependencyA);
      } else {
        excessA.push(dependencyA);
      }
    });

    dependenciesB.forEach(dependency => {
      if (!(dependency in intersect)) {
        excessB.push(dependency);
      }
    });

    return [intersect, excessA, excessB];
  }
}
