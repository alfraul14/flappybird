import { GameObjects } from 'phaser'
import { MY_SCENES, SharedConfig } from '../config'
import { BaseScene } from './BaseScene'

export interface MenuProps {
  scene: string | null
  text: string
}
const alternativeTexts = {
  continue: 'continue',
  exit: 'exit'
} as const
export type AlternativeTexts = keyof typeof alternativeTexts
export class PauseScene extends BaseScene {
  public menu: MenuProps[] = [
    { scene: MY_SCENES.MainScene.name, text: alternativeTexts.continue },
    { scene: MY_SCENES.MenuScene.name, text: alternativeTexts.exit }
  ]

  constructor (config: SharedConfig) {
    super(MY_SCENES.PauseScene.name, config)
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
        if (menuItem.text === alternativeTexts.continue) {
          this.scene.stop()
          this.scene.resume(menuItem.scene)
        }
        if (menuItem.text === alternativeTexts.exit) {
          this.scene.stop(MY_SCENES.MainScene.name)
          this.scene.start(menuItem.scene)
        }
      }
    })
  }
}
