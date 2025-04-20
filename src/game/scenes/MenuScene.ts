import { GameObjects } from 'phaser'
import { MY_SCENES, SharedConfig } from '../config'
import { BaseScene } from './BaseScene'

export interface MenuProps {
  scene: string | null
  text: string
}
export class MenuScene extends BaseScene {
  public menu: MenuProps[] = [
    { scene: MY_SCENES.MainScene.name, text: 'Play' },
    { scene: MY_SCENES.ScoreScene.name, text: 'Score' },
    { scene: null, text: 'Exit' }
  ]

  constructor (config: SharedConfig) {
    super(MY_SCENES.MenuScene.name, config)
  }

  create (): void {
    super.create()
    this.createMenu(this.menu, this.setupMenuEvents.bind(this))
    // this.scene.start(MY_SCENES.MainScene.name)
  }

  setupMenuEvents (menuItem: MenuProps, textGO: GameObjects.Text): void {
    textGO.setInteractive()

    textGO.on('pointerover', () => {
      textGO.setStyle({ fill: '#ff0' })
    })

    textGO.on('pointerout', () => {
      textGO.setStyle({ fill: '#fff' })
    })
    textGO.on('pointerup', () => {
      if (menuItem.scene !== null) {
        this.scene.start(menuItem.scene)
      }
      if (menuItem.text === 'Exit') {
        this.game.destroy(true)
      }
    })
  }
}
