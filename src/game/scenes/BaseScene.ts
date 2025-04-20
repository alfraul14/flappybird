import { GameObjects } from 'phaser'
import { MY_SCENES, SharedConfig } from '../config'
import { MenuProps } from './MenuScene'
import { RESOURCES } from './PreloadScene'

export class BaseScene extends Phaser.Scene {
  public readonly config: SharedConfig
  protected readonly screenCenter: [number, number]
  protected readonly fontSize: number
  protected readonly lineHeight: number
  protected readonly fontOptions: Object
  public readonly localStorageBestScore: string = 'localStorageBestScore'

  constructor (key: string, config: SharedConfig) {
    super(key)
    this.config = config
    this.screenCenter = [config.width / 2, config.height / 2]
    this.fontSize = 34
    this.lineHeight = 42
    this.fontOptions = { fontSize: `${this.fontSize}px`, fill: '#CD00FF' }
  }

  create (): void {
    this.add.image(0, 0, RESOURCES.sky.id).setOrigin(0, 0)
    if (this.config.canGoBack === true) {
      const backButton = this.add.image(this.config.width - 10, this.config.height - 10, RESOURCES.back.id)
        .setOrigin(1)
        .setScale(2)
        .setInteractive()
      backButton.on('pointerup', () => {
        this.scene.start(MY_SCENES.MenuScene.name)
      })
    }
  }

  createMenu (menu: MenuProps[], setupMenuEvents: (menuItem: MenuProps, textGo: GameObjects.Text) => void): void {
    let lastMenuPositionY = 0

    menu.forEach(menuItem => {
      const menuPosition: [number, number] = [this.screenCenter[0], this.screenCenter[1] + lastMenuPositionY]
      const textGO = this.add.text(...menuPosition, menuItem.text, this.fontOptions).setOrigin(0.5, 1)
      lastMenuPositionY += this.lineHeight
      setupMenuEvents(menuItem, textGO)
    })
  }

  getScore (): string {
    return localStorage.getItem(this.localStorageBestScore) ?? '0'
  }
}
