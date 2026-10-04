import { KnrComponent } from './component.js'

// Tient a jour le chiffre du panier dans l'entete.
export class KnrCartCount extends KnrComponent {
  static selector = '[data-knr-cart-count]'
  static instances = []

  constructor(count) {
    super()

    this.count = count

    // le texte lu par les lecteurs d'ecran, juste a cote : "Panier (0)"
    this.label = count.parentElement.querySelector('.knr-visually-hidden')
    this.name = ''

    // on garde le mot seul, pour pouvoir reecrire le nombre entre parentheses
    if (this.label) {
      this.name = this.label.textContent.split('(')[0].trim()
    }

    document.addEventListener('shopify:cart:lines-update', (event) => this.refresh(event))
  }

  refresh(event) {
    // on attend la fin de l'ajout, sinon on relit un panier pas encore a jour
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
      // reseau indisponible : le tiroir du theme reste la source de verite
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
