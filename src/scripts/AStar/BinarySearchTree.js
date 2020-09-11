/**
 * Node. It's a node (mind-blown)
 */
class Node {
  /**
   * @param {string} key
   * @param {any} val
  */
  constructor (key = null, val = null) {
    /** @private */
    this._parent = null;
    /** @private */
    this._left = null;
    /** @private */
    this._right = null;
    /** @private */
    this._key = key;
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
   * Sets the key of the node
   * @param {string} key
   */
  setKey (key) {
    this._key = key;
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
    this._key = null;
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
   * Gets the key to this node.
   * @returns {string}
   */
  get key () {
    return this._key;
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
    const tempKey = lhs.key;
    const tempVal = lhs.value;

    lhs.setKey(rhs.key);
    lhs.setValue(rhs.value);

    rhs.setKey(tempKey);
    rhs.setValue(tempVal);
  }

  /**
   * Finds out of a key exists
   * @param {any} key
   */
  exists (key) {
    return this.search(key) !== null;
  }

  /**
   * Searches for a key within the tree
   * @param {any} key
   * @returns {Node | null}
   */
  search (key) {
    let node = this.rootNode;
    while (node !== null) {
      if (node.key === key) {
        return node;
      } else if (key < node.key && node.left !== null) {
        node = node.left;
      } else if (key > node.key && node.right !== null) {
        node = node.right;
      } else {
        return null;
      }
    }
    return null;
  }

  /**
   * Adds a value into the binary search tree.
   * The comparable key is the one that will be used for binary searches. Value is any arbitary data store.
   * @param {string} key Key to use for binary searches.
   * @param {any} val Value to add to the binary tree. Should be convertable to string
   */
  add (key, val) {
    if (this.rootNode === null) {
      this.rootNode = new Node(key, val);
    } else {
      let node = this.rootNode;
      while (node !== null) {
        const leftNode = node.left;
        const rightNode = node.right;

        if (leftNode === null && key < node.key) {
          node.setLeft(new Node(key, val));
          break;
        } else if (rightNode === null && key >= node.key) {
          node.setRight(new Node(key, val));
          break;
        }

        if (leftNode && key < node.key) {
          node = leftNode;
        } else if (rightNode && key >= node.key) {
          node = rightNode;
        }
      }
    }
  }

  /**
   * Removes a value from the binary search tree.
   * @param {string} key Key to remove from the binary tree
   */
  remove (key) {
    if (this.rootNode === null) {
      return;
    }

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
     * @param {any} key
     * @returns {Node}
     */
    const helper = (node, key) => {
      if (node === null) {
        return node;
      }

      if (key < node.key) {
        node.setLeft(helper(node.left, key));
      } else if (key > node.key) {
        node.setRight(helper(node.right, key));
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
            node.setKey(node.right.key);
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
            node.setKey(node.left.key);
            node.setValue(node.left.value);
            node.left.destroy();
            return node;
          }

          const tmp = node.left;
          node.destroy();
          return tmp;
        }

        const temp = lowestNode(node.right);
        node.setKey(temp.key);
        node.setValue(temp.value);
        node.setRight(helper(node.right, temp.key));
      }
      return node;
    };

    this.rootNode = helper(this.rootNode, key);
  }
};
