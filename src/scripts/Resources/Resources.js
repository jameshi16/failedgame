/** @typedef {import('./Resource').default} Resource */

import Player from './Player';
import BlankTile from './BlankTile';
import IndoorTiles from './IndoorTiles';
import IndoorExtraTiles from './IndoorExtraTiles';
import TestLevelMap from './TestLevelMap';

/**
 * @typedef {Object} ResourceEntry
 * @property {Resource} class The class of the entry for initialization
 * @property {Array<string> | null} keynames Key names in Cache declared by this resource. [0] should be the same as the lookup table key string
 * @property {Array<string> | null} dependencies Resource strings of the dependencies. No circular dependencies pls :>
 */

/**
 * Lookup table between the string representation of a resource
 * and the actual resource class themselves.
 * @type {Object<string, ResourceEntry>}
 */
const LOOKUP_TABLE = {
  player: {
    class: new Player(),
    keynames: ['player'],
    dependencies: []
  },
  blankTile: {
    class: new BlankTile(),
    keynames: ['blankTile'],
    dependencies: []
  },
  indoorTiles: {
    class: new IndoorTiles(),
    keynames: ['indoorTiles'],
    dependencies: []
  },
  indoorExtraTiles: {
    class: new IndoorExtraTiles(),
    keynames: ['indoorExtraTiles'],
    dependencies: []
  },
  testLevelMap: {
    class: new TestLevelMap(),
    keynames: ['testLevelMap'],
    dependencies: ['blankTile', 'indoorTiles', 'indoorExtraTiles']
  }
};

// NOTE: doing it this way to get lint for LOOKUP_TABLE
export default LOOKUP_TABLE;
