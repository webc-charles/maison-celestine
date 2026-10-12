import { KnrComponent } from './component.js'
import { KnrCart } from './cart.js'

export class KnrCartLine extends KnrComponent {
  static selector = '[data-knr-cart-line]'
  static instances = []

  static DELAY = 300

  constructor(line) {
    super()

    this.line = line
    this.key = line.dataset.key
    this.counter = line.querySelector('[data-knr-cart-line-count]')
    this.timer = null

    this.quantity = this.readQuantity()

    for (const button of line.querySelectorAll('[data-knr-cart-quantity]')) {
      button.addEventListener('click', () => this.step(Number(button.dataset.knrCartQuantity)))
    }

    const remove = line.querySelector('[data-knr-cart-remove]')

    if (remove) {
      remove.addEventListener('click', () => this.remove())
    }
  }

  readQuantity() {
    if (!this.counter) return 1

    return Number(this.counter.textContent.trim()) || 1
  }

  step(delta) {
    const wanted = this.quantity + delta

    if (wanted < 1) return

    this.quantity = wanted

    if (this.counter) {
      this.counter.textContent = wanted
    }

    this.previewProgress(delta)

    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.sendQuantity(), KnrCartLine.DELAY)
  }

  previewProgress(delta) {
    if (!KnrCart.current) return

    const unit = this.unitPrice()

    if (unit === 0) return

    KnrCart.current.previewProgress(unit * delta)
  }

  unitPrice() {
    const price = this.line.querySelector('[data-knr-cart-price]')

    if (!price) return 0

    return Number(price.dataset.unit) || 0
  }

  sendQuantity() {
    if (!KnrCart.current) return

    KnrCart.current.change(this.key, this.quantity)
  }

  remove() {
    if (!KnrCart.current) return

    clearTimeout(this.timer)

    KnrCart.current.change(this.key, 0)
  }
}
