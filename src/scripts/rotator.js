import { KnrComponent } from './component.js'

// Fait defiler les messages sous le bouton d'ajout, avec des pastilles.
export class KnrRotator extends KnrComponent {
  static selector = '[data-knr-rotator]'
  static instances = []
  static delay = 5000

  constructor(root) {
    super()

    this.root = root
    this.messages = [...root.querySelectorAll('[data-knr-rotator-message]')]
    this.steps = [...root.querySelectorAll('[data-knr-rotator-step]')]
    this.motion = matchMedia('(prefers-reduced-motion: reduce)')
    this.index = 0

    // passe a vrai des qu'on clique une pastille : la rotation ne reprend plus
    this.held = false

    if (this.messages.length < 2) return

    this.steps.forEach((step, index) => {
      step.addEventListener('click', () => this.choose(index))
    })

    root.addEventListener('pointerenter', () => this.stop())
    root.addEventListener('pointerleave', () => this.start())
    root.addEventListener('focusin', () => this.stop())
    root.addEventListener('focusout', () => this.start())

    this.motion.addEventListener('change', () => this.start())

    this.start()
  }

  choose(index) {
    this.held = true

    this.stop()

    // le sens de l'animation depend de la pastille choisie
    let direction = -1

    if (index > this.index) direction = 1

    this.show(index, direction)
  }

  show(index, direction = 1) {
    const leaving = this.index

    this.index = index

    this.root.style.setProperty('--knr-slide', String(direction))

    this.messages.forEach((message, position) => {
      message.classList.toggle('knr-product-panel__notice--leaving', position === leaving && position !== index)
      message.inert = position !== index
    })

    this.steps.forEach((step, position) => {
      step.classList.toggle('knr-steps__step--on', position === index)
      step.setAttribute('aria-current', String(position === index))
    })
  }

  start() {
    this.stop()

    if (this.held) return

    if (this.motion.matches) return

    this.timer = setInterval(() => this.show((this.index + 1) % this.messages.length), KnrRotator.delay)
  }

  stop() {
    clearInterval(this.timer)

    this.timer = null
  }
}
