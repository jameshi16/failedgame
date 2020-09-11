import BinarySearchTree from './BinarySearchTree';
import BinarySearchPriorityQueue from './BinarySearchPriorityQueue';

/**
 * @typedef {Object} Coordinates
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} Node
 * @property {Coordinates} coords
 * @property {Node | null} parent
 * @property {number} f
 * @property {number} h
 * @property {number} g
 */

/**
 * Gets the heuristic between the two coordinates
 * @param {Coordinates} lhs
 * @param {Coordinates} rhs
 * @returns {number}
 */
function heuristic (lhs, rhs) {
  return Math.abs(lhs.x - rhs.x) + Math.abs(rhs.y - rhs.y);
}

/**
 * Makes a key from a coordinate.
 * @param {Coordinates} coord
 * @returns {string}
 */
function makeKey (coord) {
  return `${coord.x},${coord.y}`;
}

/**
 * Gets the successors of the coordinates.
 * @param {BinarySearchTree} blocked
 * @param {Coordinates} coord
 * @param {Coordinates} bounding
 * @return {Array<Coordinates>}
 */
function successors (blocked, coord, bounding) {
  // hard-coded for speed. I mean, if it's gonna be the same shape
  // everytime, we don't need for loops and whatnot
  const templateSuccessors = [
    { x: coord.x - 1, y: coord.y },
    { x: coord.x + 1, y: coord.y },
    { x: coord.x, y: coord.y + 1 },
    { x: coord.x, y: coord.y - 1 }
  ];

  // filter out the following criteria:
  // 1) negative coordinates
  // 2) inside the blocked list
  return templateSuccessors.filter(successor => {
    return (successor.x > 0 && successor.y > 0) &&
      (successor.x <= bounding.x && successor.y <= bounding.y) &&
      !blocked.exists(makeKey(successor));
  });
}

/**
 * Returns a path of co-ordinates from the source to the destination.
 * Manhatten distance heuristics used, assuming a 2D world with 4 directions of movement.
 * @param {Array<Coordinates>} blocked
 * @param {Coordinates} source
 * @param {Coordinates} destination
 * @param {Coordinates} bounding The maximum coordinate possible.
 */
function AStar (blocked, source, destination, bounding) {
  const open = new BinarySearchPriorityQueue();
  const closed = new BinarySearchPriorityQueue();
  const blockedBST = new BinarySearchTree();

  open.queue(0, makeKey(source), {
    coords: source,
    parent: null,
    f: 0,
    h: 0,
    g: 0
  });

  blocked.forEach(bCoords => blockedBST.add(makeKey(bCoords), null));

  let foundNode = null;
  while (open.length() > 0 && foundNode === null) {
    /** @type {Node} */
    const node = open.dequeue();
    const nSuccessors = successors(blockedBST, node.coords, bounding);

    nSuccessors.forEach(successor => {
      if (foundNode) {
        return;
      }
      if (successor.x === destination.x && successor.y === destination.y) {
        foundNode = {
          coords: successor,
          parent: node,
          f: 0,
          h: 0,
          g: 0
        };
        return;
      }

      const g = node.g + 1;
      const h = heuristic(successor, destination);
      const f = g + h;
      const key = makeKey(successor);

      /** @type {Node} */
      const sameOpen = open.search(key);
      /** @type {Node} */
      const sameClose = closed.search(key);

      if (sameClose && sameClose.f < f) {
        return;
      }

      if (sameOpen) {
        if (sameOpen.f > f) {
          sameOpen.parent = node;
          sameOpen.f = f;
          sameOpen.g = g;
          sameOpen.h = h;
        }
        return;
      }

      open.queue(f, key, {
        coords: successor,
        parent: node,
        f,
        h,
        g
      });
    });

    closed.queue(node.f, makeKey(node.coords), node);
  }

  const path = [];
  /** @type {Node} */
  let node = foundNode;
  while (node.parent) {
    path.push(node.coords);
    node = node.parent;
  }

  return path.reverse();
}

export default AStar;
