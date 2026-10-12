import { KnrComponent } from './component.js'

export class KnrReveal extends KnrComponent {
  static selector = '[data-knr-reveal]'
  static instances = []

  constructor(root) {
    super()

    this.root = root
    this.slider = root.querySelector('input[type="range"]')

    if (!this.slider) return

    this.slider.addEventListener('input', () => this.updateSplit())

    this.updateSplit()
  }

  updateSplit() {
    this.root.style.setProperty('--knr-reveal', `${this.slider.value}%`)
  }
}
