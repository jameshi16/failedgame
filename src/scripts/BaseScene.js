import Phaser from 'phaser';

// @ts-ignore
import IMGPlayerSprite from '../assets/imgs/player.png';

export default class BaseScene extends Phaser.Scene {
  constructor (game, key) {
    super({ key });
    this.instance = { // NOTE: don't want to affect phaser
      game: game,
      cursors: null,
      player: null
    };
  }

  preload () {
    this.load.spritesheet('player', IMGPlayerSprite, { frameWidth: 64, frameHeight: 64 });
  }

  /**
     Call preCreate() to draw base objects on the screen (like players)
   */
  preCreate () {
    // Setup player sprite
    const player = this.physics.add.sprite(0, 0, 'player');
    this.instance.player = player;

    player.setCollideWorldBounds(true);
    player.setScale(0.5);

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
     Call postCreate() to attach hooks, like keyboards and whatnot
  */
  postCreate () {
    // Setup keyboard movement
    this.instance.cursors = this.input.keyboard.addKeys('W,S,A,D');
  }

  create () {
    this.preCreate();
    this.postCreate();
  }

  update (time, delta) {
    /** @type {Object.<string, Phaser.Input.Keyboard.Key>} */
    const cursors = this.instance.cursors;
    /** @type Phaser.Physics.Arcade.Sprite */
    const player = this.instance.player;

    if (cursors.W.isDown) {
      player.setVelocityX(0);
      player.setVelocityY(-100);
      player.anims.play('player_up', true);
    } else if (cursors.S.isDown) {
      player.setVelocityX(0);
      player.setVelocityY(100);
      player.anims.play('player_down', true);
    } else if (cursors.A.isDown) {
      player.setVelocityX(-120);
      player.setVelocityY(0);
      player.anims.play('player_left', true);
    } else if (cursors.D.isDown) {
      player.setVelocityX(120);
      player.setVelocityY(0);
      player.anims.play('player_right', true);
    } else {
      // NOTE: causes the animation to stop in the first frame
      if (player.anims.isPlaying) {
        player.anims.restart();
      }
      player.anims.stop();

      player.setVelocityX(0);
      player.setVelocityY(0);
    }
  }
}