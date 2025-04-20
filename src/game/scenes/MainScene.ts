import { MY_SCENES, SharedConfig } from '../config'
import { BaseScene } from './BaseScene'
import { RESOURCES } from './PreloadScene'

interface DifficultyLevel {
  pipeHorizontalDistanceRange: [number, number]
  pipeVerticalDistanceRange: [number, number]
}

interface DifficultiesMap {
  easy: DifficultyLevel
  normal: DifficultyLevel
  hard: DifficultyLevel
}

export const DifficultyLevels = {
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard'
} as const
export type Difficulty = typeof DifficultyLevels[keyof typeof DifficultyLevels]

export class MainScene extends BaseScene {
  private bird!: Phaser.Physics.Arcade.Sprite
  private pipes!: Phaser.Physics.Arcade.Group
  private rightMostX: number = 0

  private readonly pipesToRender: number = 4
  private readonly flapVelocity: number = 300
  private readonly gravity: number = 600

  private countDownText!: Phaser.GameObjects.Text
  private timedEvent!: Phaser.Time.TimerEvent
  private initialTime = 3
  private pausedEvent?: Phaser.Events.EventEmitter
  private isPaused: boolean = false

  private currentDifficulty!: Difficulty

  private score: number = 0
  private scoreText!: Phaser.GameObjects.Text

  private readonly difficulties: DifficultiesMap = {
    easy: {
      pipeHorizontalDistanceRange: [300, 350],
      pipeVerticalDistanceRange: [150, 200]
    },
    normal: {
      pipeHorizontalDistanceRange: [280, 330],
      pipeVerticalDistanceRange: [140, 190]
    },
    hard: {
      pipeHorizontalDistanceRange: [250, 310],
      pipeVerticalDistanceRange: [90, 130]
    }
  }

  constructor (config: SharedConfig) {
    super(MY_SCENES.MainScene.name, config)
  }

  create (): void {
    this.currentDifficulty = DifficultyLevels.EASY
    super.create()
    this.createBird()
    this.createPipes()
    this.createColliders()
    this.createScore()
    this.createPauseButton()
    this.addEventListener()
    this.listenResumenEvent()
    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers(RESOURCES.bird.id, {
        start: 8,
        end: 15
      }),
      frameRate: 8,
      repeat: -1
    })
    this.bird.play('fly')
  }

  update (): void {
    this.verifyOutOfBounds()
    this.recyclePipes()
  }

  increaseDifficulty (): void {
    if (this.score === 1) {
      this.currentDifficulty = 'normal'
    }

    if (this.score === 3) {
      this.currentDifficulty = 'hard'
    }
  }

  listenResumenEvent (): void {
    if (this.pausedEvent != null) { return }
    this.pausedEvent = this.events.on('resume', () => {
      this.initialTime = 3
      this.countDownText = this.add.text(...this.screenCenter, `Fly in: ${this.initialTime}`, this.fontOptions).setOrigin(0.5)
      this.timedEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDown,
        callbackScope: this,
        loop: true
      })
    })
  }

  countDown (): (void) {
    this.initialTime--
    this.countDownText.setText(`Fly in: ${this.initialTime}`)
    if (this.initialTime <= 0) {
      this.isPaused = false
      this.countDownText.setText('')
      this.physics.resume()
      this.timedEvent?.remove()
    }
  }

  createScore (): void {
    this.score = 0
    const bestScore = this.getScore()
    this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, { fontSize: '32px', fill: '#000' })
    this.add.text(16, 52, `Best score: ${bestScore}`, { fontSize: '32px', fill: '#000' })
  }

  createPauseButton (): void {
    this.isPaused = false
    const pauseButton = this.add.image(this.config.width - 10, this.config.height - 10, RESOURCES.pause.id)
      .setScale(3)
      .setInteractive()
      .setOrigin(1)
    pauseButton.on('pointerdown', () => {
      this.isPaused = true
      this.physics.pause()
      this.scene.pause()
      this.scene.launch(MY_SCENES.PauseScene.name)
    })
  }

  createBackground (): void {
    this.add.image(0, 0, 'sky').setOrigin(0, 0)
  }

  createBird (): void {
    this.bird = this.physics.add.sprite(this.config.startPosition.x, this.config.startPosition.y, RESOURCES.bird.id)
      .setScale(3)
      .setFlipX(true)
      .setOrigin(0)
    this.bird.setBodySize(this.bird.width * 0.8, this.bird.height * 0.5)
    this.bird.body.gravity.y = this.gravity
    this.bird.setCollideWorldBounds(true)
  }

  createColliders (): void {
    this.physics.add.collider(this.bird, this.pipes, this.gameOver, undefined, this)
  }

  addEventListener (): void {
    this.input.on('pointerdown', () => this.flap())
    this.input.keyboard.on('keydown_SPACE', () => this.flap())
  }

  verifyOutOfBounds (): void {
    if (this.bird.getBounds().bottom >= this.config.height || this.bird.y <= 0) {
      this.gameOver()
    }
  }

  createPipes (): void {
    this.pipes = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite
    })

    this.rightMostX = 0

    for (let i = 0; i < this.pipesToRender; i++) {
      const upperPipe = this.pipes.create(0, 0, RESOURCES.pipe.id).setImmovable(true).setOrigin(0, 1)
      const lowerPipe = this.pipes.create(0, 0, RESOURCES.pipe.id).setImmovable(true).setOrigin(0, 0)

      this.placePipes(upperPipe, lowerPipe, this.rightMostX)

      this.rightMostX = upperPipe.x
    }

    this.pipes.setVelocityX(-200)
  }

  placePipes (
    upperPipe: Phaser.Physics.Arcade.Sprite,
    lowerPipe: Phaser.Physics.Arcade.Sprite,
    rightMostX: number
  ): void {
    const difficulty = this.difficulties[this.currentDifficulty]
    const pipeVerticalDistance = Phaser.Math.Between(...difficulty.pipeVerticalDistanceRange)
    const pipeVerticalPosition = Phaser.Math.Between(20, this.config.height - 20 - pipeVerticalDistance)
    const pipeHorizontalDistance = Phaser.Math.Between(...difficulty.pipeHorizontalDistanceRange)

    upperPipe.x = rightMostX + pipeHorizontalDistance
    upperPipe.y = pipeVerticalPosition

    lowerPipe.x = upperPipe.x
    lowerPipe.y = upperPipe.y + pipeVerticalDistance
  }

  recyclePipes (): void {
    const tempPipes: Phaser.Physics.Arcade.Sprite[] = []
    const rightMostX = this.getRightMostPipe()
    const pipes = this.pipes.getChildren() as Phaser.Physics.Arcade.Sprite[]

    pipes.forEach(pipe => {
      const pipeSprite = pipe
      if (pipeSprite.getBounds().right <= 0) {
        tempPipes.push(pipeSprite)
        if (tempPipes.length === 2) {
          this.placePipes(tempPipes[0], tempPipes[1], rightMostX)
          this.increaseScore()
          this.saveBestScore()
          this.increaseDifficulty()
        }
      }
    })
  }

  saveBestScore (): void {
    const bestScoreText = localStorage.getItem(this.localStorageBestScore)
    const bestScore = parseInt(bestScoreText ?? '0', 10)
    if (isNaN(bestScore) || this.score > bestScore) {
      localStorage.setItem(this.localStorageBestScore, this.score.toString())
    }
  }

  gameOver (): void {
    this.physics.pause()
    this.bird.setTint(0xEE4824)
    this.saveBestScore()
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.restart()
      },
      loop: false
    })
  }

  getRightMostPipe (): number {
    let rightMostX = 0

    this.pipes.getChildren().forEach(function (pipe) {
      const pipeSprite = pipe as Phaser.Physics.Arcade.Sprite
      rightMostX = Math.max(pipeSprite.x, rightMostX)
    })
    return rightMostX
  }

  restartBirdPosition (): void {
    this.bird.x = this.config.startPosition.x
    this.bird.y = this.config.startPosition.y
    this.bird.body.velocity.y = 0
    this.bird.body.velocity.x = 0
  }

  flap (): void {
    if (this.isPaused) { return }
    this.bird.body.velocity.y = -this.flapVelocity
  }

  increaseScore (): void {
    this.score++
    this.scoreText.setText(`Score: ${this.score}`)
  }
}
