import Phaser from 'phaser';

import City from './scripts/City';

export default class Game {
  constructor () {
    // const self = this;
    this.gameConfig = {
      type: Phaser.AUTO,
      width: 400,
      height: 300,
      physics: {
        default: 'arcade'
      },
      zoom: 2,
      scene: [new City(this)]
    };
    this.game = new Phaser.Game(this.gameConfig);
  }
};
