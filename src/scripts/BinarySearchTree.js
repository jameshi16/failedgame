/**
 * Node. It's a node (mind-blown)
 */
class Node {
  /** @param {any} val */
  constructor (val = null) {
    /** @private */
    this._parent = null;
    /** @private */
    this._left = null;
    /** @private */
    this._right = null;
    /** @private */
    this._value = val;
  }

  /**
   * Sets the left node for this node.
   * @param {Node | null} node
   */
  setLeft (node) {
    if (node === null) {
      this._left = null;
      return;
    }

    this._left = node;
    node._parent = this;
  }

  /**
   * Sets the right node for this node.
   * @param {Node | null} node
   */
  setRight (node) {
    if (node === null) {
      this._right = null;
      return;
    }

    this._right = node;
    node._parent = this;
  }

  /**
   * Sets the parent node for this node.
   * @param {Node | null} node
   */
  setParent (node) {
    this._parent = node;
  }

  /**
   * Sets the value of the node
   * @param {any} value
   */
  setValue (value) {
    this._value = value;
  }

  /**
   * Removes all associations (and value) of the node
   */
  destroy () {
    this._value = null;
    this._right = null;
    this._left = null;

    if (this._parent && this._parent.left === this) {
      this._parent.setLeft(null);
    }

    if (this._parent && this._parent.right === this) {
      this._parent.setRight(null);
    }

    this._parent = null;
  }

  /**
   * Gets the left node to this node.
   * @returns {Node | null}
   */
  get left () {
    return this._left;
  }

  /**
   * Gets the right node to this node.
   * @returns {Node | null}
   */
  get right () {
    return this._right;
  }

  /**
   * Gets the parent node to this node.
   * @returns {Node | null}
   */
  get parent () {
    return this._parent;
  }

  /**
   * Gets the value of this node.
   * @returns {any}
   */
  get value () {
    return this._value;
  }
};

/**
 * BinarySearchTree. Left is less, right is more.
 */
export default class BinarySearchTree {
  constructor () {
    this.rootNode = null;
  }

  /**
   * Swaps the value of two nodes
   * @param {Node} lhs
   * @param {Node} rhs
   */
  swap (lhs, rhs) {
    const tempVal = lhs.value;
    lhs.setValue(rhs.value);
    rhs.setValue(tempVal);
  }

  /**
   * Finds out of a value exists
   * @param {any} val
   */
  exists (val) {
    return this.search(val) !== null;
  }

  /**
   * Searches for a value within the tree
   * @private
   * @param {any} val
   * @returns {Node | null}
   */
  search (val) {
    const key = String(val);

    let node = this.rootNode;
    while (node !== null) {
      if (node.value === key) {
        return node;
      } else if (key < node.value && node.left !== null) {
        node = node.left;
      } else if (key > node.value && node.right !== null) {
        node = node.right;
      } else {
        return null;
      }
    }
    return null;
  }

  /**
   * Adds a value into the binary search tree.
   * The comparable key is automatically assumed to be the string form of value
   * @param {any} val Value to add to the binary tree. Should be convertable to string
   */
  add (val) {
    const key = String(val);

    if (this.rootNode === null) {
      this.rootNode = new Node(key);
    } else {
      let node = this.rootNode;
      while (node !== null) {
        const leftNode = node.left;
        const rightNode = node.right;

        if (leftNode === null && key < node.value) {
          node.setLeft(new Node(key));
          break;
        } else if (rightNode === null && key >= node.value) {
          node.setRight(new Node(key));
          break;
        }

        if (leftNode && key < node.value) {
          node = leftNode;
        } else if (rightNode && key >= node.value) {
          node = rightNode;
        }
      }
    }
  }

  /**
   * Removes a value from the binary search tree.
   * Comparable key is a stringified version of the value
   * @param {any} val Value to remove from the binary tree. Should be convertable to string
   */
  remove (val) {
    if (this.rootNode === null) {
      return;
    }

    const key = String(val);

    /**
     * @param {Node} node
     * @returns {Node}
     */
    const lowestNode = (node) => {
      if (node && node.left) {
        return lowestNode(node.left);
      }

      return node;
    };

    /**
     * @param {Node} node
     * @param {any} value
     * @returns {Node}
     */
    const helper = (node, value) => {
      if (node === null) {
        return node;
      }

      if (value < node.value) {
        node.setLeft(helper(node.left, value));
      } else if (value > node.value) {
        node.setRight(helper(node.right, value));
      } else {
        if (node.left === null) {
          if (node.right === null) {
            node.destroy();
            return null;
          }

          if (node.parent) {
            if (node.parent.left === node) {
              node.parent.setLeft(node.right);
            } else {
              node.parent.setRight(node.right);
            }
          } else {
            node.setValue(node.right.value);
            node.right.destroy();
            return node;
          }

          const tmp = node.right;
          node.destroy();
          return tmp;
        } else if (node.right === null) {
          if (node.parent) {
            if (node.parent.left === node) {
              node.parent.setLeft(node.left);
            } else {
              node.parent.setRight(node.left);
            }
          } else {
            node.setValue(node.left.value);
            node.left.destroy();
            return node;
          }

          const tmp = node.left;
          node.destroy();
          return tmp;
        }

        const temp = lowestNode(node.right);
        node.setValue(temp.value);
        node.setRight(helper(node.right, temp.value));
      }
      return node;
    };

    this.rootNode = helper(this.rootNode, key);
  }
};
