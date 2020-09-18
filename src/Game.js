import Phaser from 'phaser';

import City from './scripts/City';

export default class Game {
  constructor () {
    this.gameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          debug: true
        }
      },
      zoom: 1,
      scene: [new City(this)]
    };
    this.game = new Phaser.Game(this.gameConfig);
  }
};
