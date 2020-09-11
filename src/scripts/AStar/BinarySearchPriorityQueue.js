import BinarySearchTree from './BinarySearchTree';
import PriorityQueue from './PriorityQueue';

/**
 * Combined implementation of BinarySearchTree and PriorityQueue.
 * Takes twice the space, but searches in log(n), inserts in log(n) and pops in h or n at worst
 */
export default class BinarySearchPriorityQueue {
  constructor () {
    this.bst = new BinarySearchTree();
    this.pq = new PriorityQueue();
  }

  /**
   * Gets the length of the queue with hopefully no disparity.
   */
  length () {
    return this.pq.length;
  }

  /**
   * Queues the value with a certain priority.
   * @param {number} priority
   * @param {string} key
   * @param {any} val
   */
  queue (priority, key, val) {
    this.pq.queue(priority, val);
    this.bst.add(key, val);
  }

  /**
   * Dequeues the top of the priority queue.
   */
  dequeue () {
    const val = this.pq.dequeue();
    this.bst.remove(val);
    return val;
  }

  /**
   * Checks for the existence of a key within the queue.
   * @param {string} key
   * @returns {boolean}
   */
  exists (key) {
    return this.bst.exists(key);
  }

  /**
   * Searches for the key within the queue, and returns the value.
   * @param {string} key
   * @returns {any | null}
   */
  search (key) {
    return this.bst.search(key)?.value;
  }
};
