import './style.css'
import '../src/game/config'

const app = document.querySelector<HTMLDivElement>('#app')
if (app === null) {
  throw new Error('no tener app')
}
