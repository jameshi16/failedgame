import Phaser from 'phaser';

// @ts-ignore
import IMGPlayerSprite from '../assets/imgs/player.png';

/** @typedef {import('../Game').default} Game */

// NOTE: TILEMOVEMENT is x * 16 where x must be a multiple of 16
const TILEMOVEMENT = 128;
const TILESIZE = 16;

/**
 * BaseScene represents the basic level scene for this RPG game
 */
export default class BaseScene extends Phaser.Scene {
  /**
   * @param {Game} game The global game object
   * @param {string} key The scene name (unique)
   */
  constructor (game, key) {
    super({ key });
    this.instance = { // NOTE: don't want to affect phaser
      game: game,
      gridLock: new Map([]),
      collisionFunction: null,
      dynamicCollidables: new Map([]),
      movementFunction: new Map([]),
      movementDisabled: 0,
      cursors: null,
      mouse: null,
      player: null
    };
  }

  /* Phaser.Scene overrides */
  preload () {
    this.load.spritesheet('player', IMGPlayerSprite, { frameWidth: 64, frameHeight: 64 });
  }

  create () {
    this.preCreate();
    this.postCreate();
  }

  /**
   * @param {number} time
   * @param {number} delta
   */
  update (time, delta) {
    /** @type {Object<string, Phaser.Input.Keyboard.Key>} */
    const cursors = this.instance.cursors;
    /** @type {Phaser.Physics.Arcade.Sprite} */
    const player = this.instance.player;

    this.updateKeyboard(delta, cursors, player);
    this.instance.movementFunction.forEach(value => value());
  }

  /* Own functions */
  /**
   * Call preCreate() to draw base objects on the screen (like players)
   */
  preCreate () {
    // Setup player sprite
    const player = this.physics.add.sprite(0, 0, 'player');
    this.instance.player = player;

    player.setCollideWorldBounds(true);
    player.setScale(0.5);
    player.setOrigin(0.25, 0.125);
    player.setSize(32, player.height);

    this.anims.create({
      key: 'player_up',
      frames: this.anims.generateFrameNumbers('player', { start: 104, end: 112 }),
      frameRate: 13,
      repeat: -1
    });

    this.anims.create({
      key: 'player_left',
      frames: this.anims.generateFrameNumbers('player', { start: 117, end: 125 }),
      frameRate: 13,
      repeat: -1
    });

    this.anims.create({
      key: 'player_down',
      frames: this.anims.generateFrameNumbers('player', { start: 130, end: 138 }),
      frameRate: 13,
      repeat: -1
    });

    this.anims.create({
      key: 'player_right',
      frames: this.anims.generateFrameNumbers('player', { start: 143, end: 151 }),
      frameRate: 13,
      repeat: -1
    });

    this.anims.create({
      key: 'player_up_slash',
      frames: this.anims.generateFrameNumbers('player', { start: 156, end: 161 }),
      frameRate: 26,
      repeat: 0
    });

    this.anims.create({
      key: 'player_left_slash',
      frames: this.anims.generateFrameNumbers('player', { start: 169, end: 174 }),
      frameRate: 26,
      repeat: 0
    });

    this.anims.create({
      key: 'player_down_slash',
      frames: this.anims.generateFrameNumbers('player', { start: 182, end: 187 }),
      frameRate: 26,
      repeat: 0
    });

    this.anims.create({
      key: 'player_right_slash',
      frames: this.anims.generateFrameNumbers('player', { start: 195, end: 200 }),
      frameRate: 26,
      repeat: 0
    });
  }

  /**
   * Call postCreate() to attach hooks, like keyboards and whatnot
   */
  postCreate () {
    // Setup keyboard movement
    this.instance.cursors = this.input.keyboard.addKeys('W,S,A,D');

    // Setup mouse
    this.instance.mouse = this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const player = this.instance.player;
      const direction = this.getDirectionFromAnimationKey(player.anims.getCurrentKey());
      if (this.input.activePointer.leftButtonDown()) {
        this.leftClick(direction);
      } else if (this.input.activePointer.rightButtonDown()) {
        // TODO: do bow things
      }
    });
  }

  /**
   * Called when left clicked. Attacking animation already done by BaseScene
   * @param {'left' | 'right' | 'up' | 'down'} direction
   */
  leftClick (direction) {
    /** @type {Phaser.Physics.Arcade.Sprite} */
    const player = this.instance.player;
    this.instance.movementDisabled = 200;
    player.anims.play(`player_${direction}_slash`);
  }

  /**
   * @private
   * @param {string} key
   * @returns {'left' | 'up' | 'down' | 'right' | null}
   */
  getDirectionFromAnimationKey (key) {
    if (key.search(/left/g) !== -1) {
      return 'left';
    } else if (key.search(/up/g) !== -1) {
      return 'up';
    } else if (key.search(/down/g) !== -1) {
      return 'down';
    } else if (key.search(/right/g) !== -1) {
      return 'right';
    }

    return null;
  }

  /**
   * Updates keyboard
   * @private
   * @param {number} delta
   * @param {Object<string, Phaser.Input.Keyboard.Key>} cursors
   * @param {Phaser.Physics.Arcade.Sprite} player
   */
  updateKeyboard (delta, cursors, player) {
    if (this.instance.movementDisabled > 0) {
      this.instance.movementDisabled = Math.max(0, this.instance.movementDisabled - delta);
      return;
    }

    if (this.instance.gridLock.get('player')) {
      return;
    }

    // NOTE: I know player.setVelocity exists, but I want
    // fine control over the x and y positions (they must be multiples of 16)
    // without the glitching that comes from teleporting the sprite to the right place
    if (cursors.W.isDown) {
      this.gridLockMovement(delta, player, 'up', 'player');
    } else if (cursors.S.isDown) {
      this.gridLockMovement(delta, player, 'down', 'player');
    } else if (cursors.A.isDown) {
      this.gridLockMovement(delta, player, 'left', 'player');
    } else if (cursors.D.isDown) {
      this.gridLockMovement(delta, player, 'right', 'player');
    } else {
      this.gridLockMovement(delta, player, null, 'player');
    }
  }

  /**
   * Moves the sprite using GridLock.
   * @param {number} delta
   * @param {Phaser.Physics.Arcade.Sprite} sprite
   * @param {'up' | 'left' | 'down' | 'right' | null} direction
   * @param {string} key
   * @param {string} [animationKey] Default: null.
   * @param {number} [tileMovement] Default: TILEMOVEMENT, which is normally 128
   */
  gridLockMovement (delta, sprite, direction, key, animationKey = null, tileMovement = TILEMOVEMENT) {
    if (animationKey === null) {
      animationKey = key;
    }

    if (this.instance.gridLock.get(key)) {
      return;
    }

    if (direction === 'up') {
      sprite.anims.play(`${animationKey}_up`, true);
      sprite.setData('direction', 'up');
      this.instance.gridLock.set(key, true);
      this.instance.movementFunction.set(key, () =>
        this.updatePosition(sprite, key, sprite.x, sprite.y - ((delta / 1000) * tileMovement)));
    } else if (direction === 'down') {
      sprite.anims.play(`${animationKey}_down`, true);
      sprite.setData('direction', 'down');
      this.instance.gridLock.set(key, true);
      this.instance.movementFunction.set(key, () =>
        this.updatePosition(sprite, key, sprite.x, sprite.y + ((delta / 1000) * tileMovement)));
    } else if (direction === 'left') {
      sprite.anims.play(`${animationKey}_left`, true);
      sprite.setData('direction', 'left');
      this.instance.gridLock.set(key, true);
      this.instance.movementFunction.set(key, () =>
        this.updatePosition(sprite, key, sprite.x - ((delta / 1000) * tileMovement), sprite.y));
    } else if (direction === 'right') {
      sprite.anims.play(`${animationKey}_right`, true);
      sprite.setData('direction', 'right');
      this.instance.gridLock.set(key, true);
      this.instance.movementFunction.set(key, () =>
        this.updatePosition(sprite, key, sprite.x + ((delta / 1000) * tileMovement), sprite.y));
    } else {
      // NOTE: causes the animation to stop in the first frame
      if (sprite.anims.isPlaying) {
        sprite.anims.restart();
      }
      sprite.anims.stop();
      this.instance.movementFunction.delete(key);
    }
  }

  /**
   * Updates the position of the sprite based on time and delta. Implements gridlock
   * @private
   * @param {Phaser.Physics.Arcade.Sprite} sprite
   * @param {string} key
   * @param {number} progressNaturalX What X naturally would be without gridlock
   * @param {number} progressNaturalY What Y naturally would be without gridlock
   * @param {number} [tileSize] Size of each tile
   */
  updatePosition (sprite, key, progressNaturalX, progressNaturalY, tileSize = TILESIZE) {
    // if sprite movement results in collision, then we don't move
    if (this.instance.collisionFunction) {
      if (
        (progressNaturalX > sprite.x && this.instance.collisionFunction(sprite.x + tileSize, sprite.y + tileSize)) ||
        (progressNaturalX < sprite.x && this.instance.collisionFunction(sprite.x - 1, sprite.y + tileSize)) ||
        (progressNaturalY > sprite.y && this.instance.collisionFunction(sprite.x, sprite.y + 2 * tileSize)) ||
        (progressNaturalY < sprite.y && this.instance.collisionFunction(sprite.x, sprite.y + tileSize - 1))) {
        this.instance.gridLock.delete(key);
        return;
      }
    }

    if (!this.instance.gridLock.get(key)) {
      return;
    }

    // if sprite movement results in negative coordinates, then we don't move
    if (progressNaturalX < 0) {
      return;
    }

    if (progressNaturalY < 0) {
      return;
    }

    // ensure crossing tiles are done discretely
    // crossing tiles will also unlock gridLock for a moment
    const tileFloorDifferenceX = Math.floor(progressNaturalX / tileSize) - Math.floor(sprite.x / tileSize);
    const tileCeilDifferenceX = Math.ceil(progressNaturalX / tileSize) - Math.ceil(sprite.x / tileSize);
    if (tileFloorDifferenceX >= 1) {
      sprite.x = Math.floor(progressNaturalX / tileSize) * tileSize;
      this.instance.gridLock.delete(key);
    }

    if (tileCeilDifferenceX <= -1) {
      sprite.x = Math.ceil(progressNaturalX / tileSize) * tileSize;
      this.instance.gridLock.delete(key);
    }

    const tileFloorDifferenceY = Math.floor(progressNaturalY / tileSize) - Math.floor(sprite.y / tileSize);
    const tileCeilDifferenceY = Math.ceil(progressNaturalY / tileSize) - Math.ceil(sprite.y / tileSize);
    if (tileFloorDifferenceY >= 1) {
      sprite.y = Math.floor(progressNaturalY / tileSize) * tileSize;
      this.instance.gridLock.delete(key);
    }

    if (tileCeilDifferenceY <= -1) {
      sprite.y = Math.ceil(progressNaturalY / tileSize) * tileSize;
      this.instance.gridLock.delete(key);
    }

    if (this.instance.gridLock.get(key)) {
      sprite.x = progressNaturalX;
      sprite.y = progressNaturalY;
    }
  }
}
