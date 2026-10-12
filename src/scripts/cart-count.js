import { KnrComponent } from './component.js'

export class KnrCartCount extends KnrComponent {
  static selector = '[data-knr-cart-count]'
  static instances = []

  constructor(count) {
    super()

    this.count = count

    this.label = count.parentElement.querySelector('.knr-visually-hidden')
    this.name = ''

    if (this.label) {
      this.name = this.label.textContent.split('(')[0].trim()
    }

    document.addEventListener('shopify:cart:lines-update', (event) => this.refresh(event))
  }

  refresh(event) {
    if (event.promise) {
      event.promise.finally(() => this.read())
    } else {
      this.read()
    }
  }

  async read() {
    try {
      const response = await fetch('/cart.js')

      if (!response.ok) return

      const cart = await response.json()

      this.write(cart.item_count)
    } catch (erreur) {
      return
    }
  }

  write(total) {
    this.count.textContent = total

    if (this.label) {
      this.label.textContent = `${this.name} (${total})`
    }
  }
}
