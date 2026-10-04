import { KnrComponent } from './component.js'

// Affiche un etat de chargement sur un bouton d'ajout au panier,
// le temps que Shopify confirme que la ligne est bien ajoutee.
export class KnrCartButton extends KnrComponent {
  static selector = '[data-knr-cart-button]'
  static instances = []

  constructor(button) {
    super()

    this.button = button

    // vrai entre le clic et la reponse du serveur
    this.pending = false

    button.addEventListener('click', () => this.start())

    // Shopify previent de tout changement du panier sur le document
    document.addEventListener('shopify:cart:lines-update', (event) => this.stop(event))
  }

  start() {
    if (this.button.disabled) return

    this.pending = true

    this.button.classList.add('knr-button--loading')
  }

  stop(event) {
    if (!this.pending) return

    // l'evenement part du formulaire : on ignore ceux des autres boutons
    if (!event.target.contains(this.button)) return

    // l'evenement porte une promesse, resolue quand l'ajout est vraiment fini
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
