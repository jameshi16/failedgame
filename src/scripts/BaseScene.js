import Phaser from 'phaser';

// @ts-ignore
import IMGPlayerSprite from '../assets/imgs/player.png';

/** @typedef {import('../Game').default} Game */

// NOTE: TILEMOVEMENT is x * 16 where x must be a multiple of 16,
// whereas TILETIMESTAMP = 1000 / x
const TILEMOVEMENT = 128;
const TILETIMESTEP = 125;

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
      movementLastTimestamp: -1,
      lastKey: '',
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

    this.updateKeyboard(time, cursors, player);
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
    player.setPosition(32, 32);

    this.anims.create({
      key: 'player_up',
      frames: this.anims.generateFrameNumbers('player', { start: 104, end: 112 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'player_left',
      frames: this.anims.generateFrameNumbers('player', { start: 117, end: 125 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'player_down',
      frames: this.anims.generateFrameNumbers('player', { start: 130, end: 138 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'player_right',
      frames: this.anims.generateFrameNumbers('player', { start: 143, end: 151 }),
      frameRate: 10,
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
   * Swaps out the last key press and tile-locks the player
   * @private
   * @param {string} key The key ('w', 'a', 's', 'd')
   * @param {Phaser.Physics.Arcade.Sprite} player The Arcade sprite that represents the player
   */
  changeLastKey (key, player) {
    if (key === this.instance.lastKey) {
      return;
    }

    // NOTE: tiled based RPG, so we'll teleport the player to integer coordinates
    this.instance.lastKey = key;
    player.setPosition(Math.round(player.x / 16.0) * 16.0, Math.round(player.y / 16.0) * 16.0);
  }

  /**
   * Updates keyboard
   * @private
   * @param {number} time
   * @param {Object<string, Phaser.Input.Keyboard.Key>} cursors
   * @param {Phaser.Physics.Arcade.Sprite} player
   */
  updateKeyboard (time, cursors, player) {
    const allowMovement = (time - this.instance.movementLastTimestamp >= TILETIMESTEP);

    if (allowMovement) {
      if (cursors.W.isDown && allowMovement) {
        player.setVelocity(0, -TILEMOVEMENT);
        player.anims.play('player_up', true);
        this.instance.movementLastTimestamp = time;
        this.changeLastKey('w', player);
      } else if (cursors.S.isDown && allowMovement) {
        player.setVelocity(0, TILEMOVEMENT);
        player.anims.play('player_down', true);
        this.instance.movementLastTimestamp = time;
        this.changeLastKey('s', player);
      } else if (cursors.A.isDown && allowMovement) {
        player.setVelocity(-TILEMOVEMENT, 0);
        player.anims.play('player_left', true);
        this.instance.movementLastTimestamp = time;
        this.changeLastKey('a', player);
      } else if (cursors.D.isDown && allowMovement) {
        player.setVelocity(TILEMOVEMENT, 0);
        player.anims.play('player_right', true);
        this.instance.movementLastTimestamp = time;
        this.changeLastKey('d', player);
      } else if (allowMovement) {
        // NOTE: causes the animation to stop in the first frame
        if (player.anims.isPlaying) {
          player.anims.restart();
        }
        player.anims.stop();
        player.setVelocity(0, 0);
        this.changeLastKey('', player);
      }
    }
  }
}
