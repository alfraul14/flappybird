import { MY_SCENES } from '../config'
export const RESOURCES = {
  sky: { id: 'sky', origin: 'assets/sky.png' },
  bird: { id: 'bird', origin: 'assets/birdSprite.png', type: 'sprite', frameHeight: 16, frameWidth: 16 },
  pipe: { id: 'pipe', origin: 'assets/pipe.png' },
  pause: { id: 'pause', origin: 'assets/pause.png' },
  back: { id: 'back', origin: 'assets/back.png' }
}

export class PreloadScene extends Phaser.Scene {
  constructor () {
    super(MY_SCENES.PreloadScene.name)
  }

  preload (): void {
    this.getResources()
  }

  create (): void {
    this.scene.start(MY_SCENES.MenuScene.name)
  }

  getResources (): void {
    Object.values(RESOURCES).forEach(resource => {
      if ('type' in resource && resource.type === 'sprite') {
        this.load.spritesheet(resource.id, resource.origin, {
          frameWidth: resource.frameWidth,
          frameHeight: resource.frameHeight
        })
        return
      }
      this.load.image(resource.id, resource.origin)
    })

    this.load.on('filecomplete', (key: string) => {
      console.log(`✅ ${key} cargado`)
    })
  }

  createBackground (): void {
    this.add.image(0, 0, 'sky').setOrigin(0, 0)
  }
}
