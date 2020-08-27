import Phaser from 'phaser';

import TestLevel from './scripts/TestLevel';

export default class Game {
  constructor () {
    // const self = this;
    this.gameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: 'arcade'
      },
      scene: [new TestLevel(this)]
    };
    this.game = new Phaser.Game(this.gameConfig);
  }
};
