import { KnrComponent } from './component.js'

export class KnrCartButton extends KnrComponent {
  static selector = '[data-knr-cart-button]'
  static instances = []

  constructor(button) {
    super()

    this.button = button

    this.pending = false

    button.addEventListener('click', () => this.start())

    document.addEventListener('shopify:cart:lines-update', (event) => this.stop(event))
  }

  start() {
    if (this.button.disabled) return

    this.pending = true

    this.button.classList.add('knr-button--loading')
  }

  stop(event) {
    if (!this.pending) return

    if (!event.target.contains(this.button)) return

    if (event.promise) {
      event.promise.finally(() => this.done())
    } else {
      this.done()
    }
  }

  done() {
    this.pending = false

    this.button.classList.remove('knr-button--loading')
  }
}
