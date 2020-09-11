export default class PriorityQueue {
  constructor () {
    /** @private */
    this._storage = [];
  }

  /**
   * Gets the length of the queue
   */
  get length () {
    return this._storage.length;
  }

  /**
   * Gets the left index of a node
   * @private
   * @param {number} index
   */
  leftOf (index) {
    return (index << 1) + 1;
  }

  /**
   * Gets the right index of a node
   * @private
   * @param {number} index
   */
  rightOf (index) {
    return (index + 1) << 1;
  }

  /**
   * Gets the parent of a node
   * @private
   * @param {number} index
   */
  parentOf (index) {
    return Math.floor((index - 1) >> 1);
  }

  /**
   * Swaps the two nodes based on index
   * @private
   * @param {number} lhs Index
   * @param {number} rhs Index
   */
  swap (lhs, rhs) {
    const temp = this._storage[lhs];
    this._storage[lhs] = this._storage[rhs];
    this._storage[rhs] = temp;
  }

  /**
   * Adds an item into the queue
   * @param {number} priority A priority. The lower the number, the higher the priority.
   * @param {any} obj The object to associate to the priority
   */
  queue (priority, obj) {
    this._storage.push({ priority, obj });

    let lastNode = this._storage.length - 1;
    let node = this.parentOf(this._storage.length - 1);
    while (node >= 0) {
      const currentPair = this._storage[node];
      const lastPair = this._storage[lastNode];

      if (lastPair.priority < currentPair.priority) {
        this.swap(lastNode, node);
      }

      lastNode = node;
      node = this.parentOf(node);
    }
  }

  /**
   * Removes the top item in the queue
   */
  dequeue () {
    this.swap(0, this._storage.length - 1);
    const returnValue = this._storage.pop();

    let node = 0;
    while (node < this._storage.length) {
      const leftNode = this.leftOf(node);
      const rightNode = this.rightOf(node);

      const currentPair = this._storage[node];
      const leftPair = leftNode < this._storage.length ? this._storage[leftNode] : null;
      const rightPair = rightNode < this._storage.length ? this._storage[rightNode] : null;

      if ((leftPair !== null && leftPair.priority < currentPair.priority) ||
        (rightPair !== null && rightPair.priority < currentPair.priority)) {
        const swapIndex = (
          (leftPair !== null && leftPair.priority < currentPair.priority) &&
          (rightPair === null || leftPair.priority < rightPair.priority)) ? leftNode : rightNode;
        this.swap(node, swapIndex);
        node = swapIndex;
      } else {
        break;
      }
    }
    return returnValue;
  }
};
