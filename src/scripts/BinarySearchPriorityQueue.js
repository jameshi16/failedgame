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
   * Queues the value with a certain priority.
   * @param {number} priority
   * @param {any} val
   */
  queue (priority, val) {
    this.pq.queue(priority, val);
    this.bst.add(val);
  }

  /**
   * Dequeues the top of the priority queue.
   */
  dequeue () {
    const val = this.pq.dequeue();
    this.bst.remove(val);
  }

  /**
   * Checks for the existence of a value within the queue.
   * @param {any} val
   * @returns {boolean}
   */
  exists (val) {
    return this.bst.exists(val);
  }
};
