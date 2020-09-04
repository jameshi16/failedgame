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
      gridLock: false,
      collisionFunction: null,
      movementFunction: null,
      cursors: null,
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

    this.updateKeyboard(time, delta, cursors, player);
    if (this.instance.movementFunction) {
      this.instance.movementFunction();
    }
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
    player.setPosition(64, 64);
    player.setSize(16, 16);

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
  }

  /**
   * Call postCreate() to attach hooks, like keyboards and whatnot
   */
  postCreate () {
    // Setup keyboard movement
    this.instance.cursors = this.input.keyboard.addKeys('W,S,A,D');
  }

  /**
   * Updates keyboard
   * @private
   * @param {number} time
   * @param {number} delta
   * @param {Object<string, Phaser.Input.Keyboard.Key>} cursors
   * @param {Phaser.Physics.Arcade.Sprite} player
   */
  updateKeyboard (time, delta, cursors, player) {
    if (this.instance.gridLock) {
      return;
    }

    // NOTE: I know player.setVelocity exists, but I want
    // fine control over the x and y positions (they must be multiples of 16)
    // without the glitching that comes from teleporting the sprite to the right place
    if (cursors.W.isDown) {
      player.anims.play('player_up', true);
      this.instance.gridLock = true;
      this.instance.movementFunction = () =>
        this.updatePosition(player, player.x, player.y - ((delta / 1000) * TILEMOVEMENT));
    } else if (cursors.S.isDown) {
      player.anims.play('player_down', true);
      this.instance.gridLock = true;
      this.instance.movementFunction = () =>
        this.updatePosition(player, player.x, player.y + ((delta / 1000) * TILEMOVEMENT));
    } else if (cursors.A.isDown) {
      player.anims.play('player_left', true);
      this.instance.gridLock = true;
      this.instance.movementFunction = () =>
        this.updatePosition(player, player.x - ((delta / 1000) * TILEMOVEMENT), player.y);
    } else if (cursors.D.isDown) {
      player.anims.play('player_right', true);
      this.instance.gridLock = true;
      this.instance.movementFunction = () =>
        this.updatePosition(player, player.x + ((delta / 1000) * TILEMOVEMENT), player.y);
    } else {
      // NOTE: causes the animation to stop in the first frame
      if (player.anims.isPlaying) {
        player.anims.restart();
      }
      player.anims.stop();
      this.instance.movementFunction = null;
    }
  }

  /**
   * Updates the position of the player based on time and delta. Implements gridlock
   * @private
   * @param {Phaser.Physics.Arcade.Sprite} player
   * @param {number} progressNaturalX What X naturally would be without gridlock
   * @param {number} progressNaturalY What Y naturally would be without gridlock
   */
  updatePosition (player, progressNaturalX, progressNaturalY) {
    // if player movement results in collision, then we don't move
    if (this.instance.collisionFunction) {
      if (
        (progressNaturalX > player.x && this.instance.collisionFunction(player.x + TILESIZE, player.y + TILESIZE)) ||
        (progressNaturalX < player.x && this.instance.collisionFunction(player.x + 15 - TILESIZE, player.y + TILESIZE)) ||
        (progressNaturalY > player.y && this.instance.collisionFunction(player.x, player.y + 16 + TILESIZE)) ||
        (progressNaturalY < player.y && this.instance.collisionFunction(player.x, player.y + 15))) {
        this.instance.gridLock = false;
        return;
      }
    }

    if (!this.instance.gridLock) {
      return;
    }

    // if player movement results in negative coordinates, then we don't move
    if (progressNaturalX < 0) {
      return;
    }

    if (progressNaturalY < 0) {
      return;
    }

    // ensure crossing tiles are done discretely
    // crossing tiles will also unlock gridLock for a moment
    const tileFloorDifferenceX = Math.floor(progressNaturalX / TILESIZE) - Math.floor(player.x / TILESIZE);
    const tileCeilDifferenceX = Math.ceil(progressNaturalX / TILESIZE) - Math.ceil(player.x / TILESIZE);
    if (tileFloorDifferenceX >= 1) {
      player.x = Math.floor(progressNaturalX / TILESIZE) * TILESIZE;
      this.instance.gridLock = false;
    }

    if (tileCeilDifferenceX <= -1) {
      player.x = Math.ceil(progressNaturalX / TILESIZE) * TILESIZE;
      this.instance.gridLock = false;
    }

    const tileFloorDifferenceY = Math.floor(progressNaturalY / TILESIZE) - Math.floor(player.y / TILESIZE);
    const tileCeilDifferenceY = Math.ceil(progressNaturalY / TILESIZE) - Math.ceil(player.y / TILESIZE);
    if (tileFloorDifferenceY >= 1) {
      player.y = Math.floor(progressNaturalY / TILESIZE) * TILESIZE;
      this.instance.gridLock = false;
    }

    if (tileCeilDifferenceY <= -1) {
      player.y = Math.ceil(progressNaturalY / TILESIZE) * TILESIZE;
      this.instance.gridLock = false;
    }

    if (this.instance.gridLock) {
      player.x = progressNaturalX;
      player.y = progressNaturalY;
    }
  }
}
