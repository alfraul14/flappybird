import Phaser, { Game } from 'phaser'
import { MainScene } from './scenes/MainScene'
import { MenuScene } from './scenes/MenuScene'
import { PreloadScene } from './scenes/PreloadScene'
import { ScoreScene } from './scenes/ScoreScene'
import { PauseScene } from './scenes/PauseScene'

const WIDTH: number = 400
const HEIGHT: number = 600
const INITIAL_BIRD_POSITION: BirdPosition = { x: WIDTH * 0.1, y: HEIGHT / 2 }
interface BirdPosition {
  x: number
  y: number
}
export interface SharedConfig {
  width: number
  height: number
  startPosition: BirdPosition
  canGoBack?: boolean
}

const SHARED_CONFIG: SharedConfig = {
  width: WIDTH,
  height: HEIGHT,
  startPosition: INITIAL_BIRD_POSITION
}
export const MY_SCENES = {
  PreloadScene: { id: 1, name: 'PreloadScene', Class: PreloadScene },
  MenuScene: { id: 2, name: 'MenuScene', Class: MenuScene },
  ScoreScene: { id: 3, name: 'ScoreScene', Class: ScoreScene },
  MainScene: { id: 4, name: 'MainScene', Class: MainScene },
  PauseScene: { id: 5, name: 'PauseScene', Class: PauseScene }
}
const initScenes = (): Phaser.Scene[] => {
  return Object.values(MY_SCENES)
    // .sort((a, b) => a.id - b.id)
    .map(scene => new scene.Class(SHARED_CONFIG))
}

const config: Phaser.Types.Core.GameConfig & { pixelArt: boolean } = {
  type: Phaser.AUTO,
  ...SHARED_CONFIG,
  parent: 'game-container',
  backgroundColor: '#028af8',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      // gravity: { y: 0 },
      debug: false
    }
  },
  scene: initScenes()
}
export default new Game(config)
