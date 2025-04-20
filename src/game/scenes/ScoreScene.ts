import { MY_SCENES, SharedConfig } from '../config'
import { BaseScene } from './BaseScene'

export class ScoreScene extends BaseScene {
  constructor (config: SharedConfig) {
    super(MY_SCENES.ScoreScene.name, { ...config, canGoBack: true })
  }

  create (): void {
    super.create()

    this.add.text(...this.screenCenter, `Best Score: ${this.getScore()}`, this.fontOptions).setOrigin(0.5)
  }
}
