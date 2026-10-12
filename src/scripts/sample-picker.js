import { KnrComponent } from './component.js'
import { KnrCart } from './cart.js'

export class KnrSamplePicker extends KnrComponent {
  static selector = '[data-knr-cart-sample]'
  static instances = []

  constructor(card) {
    super()

    this.card = card

    const action = card.querySelector('[data-knr-cart-toggle-sample]')

    if (action) {
      action.addEventListener('click', () => this.toggle())
    }
  }

  get chosen() {
    return this.card.dataset.chosen === 'true'
  }

  set chosen(value) {
    this.card.dataset.chosen = String(value)
  }

  toggle() {
    if (!this.chosen && KnrSamplePicker.atAllowance()) return

    this.chosen = !this.chosen

    KnrSamplePicker.refreshCounters()
  }

  static cards() {
    if (!KnrCart.current) return []

    return Array.from(KnrCart.current.dialog.querySelectorAll(KnrSamplePicker.selector))
  }

  static isChosen(card) {
    return card.dataset.chosen === 'true'
  }

  static isInCart(card) {
    return card.dataset.key !== ''
  }

  static chosenCount() {
    return KnrSamplePicker.cards().filter(KnrSamplePicker.isChosen).length
  }

  static allowance() {
    const state = KnrCart.current && KnrCart.current.state

    return state ? state.samplesMax : 0
  }

  static atAllowance() {
    return KnrSamplePicker.chosenCount() >= KnrSamplePicker.allowance()
  }

  static refreshCounters() {
    if (!KnrCart.current) return

    const text = `${KnrSamplePicker.chosenCount()}/${KnrSamplePicker.allowance()}`

    for (const node of KnrCart.current.dialog.querySelectorAll('[data-knr-cart-counter]')) {
      node.textContent = text
    }
  }

  static discardChoice() {
    for (const card of KnrSamplePicker.cards()) {
      card.dataset.chosen = String(KnrSamplePicker.isInCart(card))
    }

    KnrSamplePicker.refreshCounters()
  }

  static sendChoice() {
    if (!KnrCart.current) return

    const toRemove = {}
    const toAdd = []

    for (const card of KnrSamplePicker.cards()) {
      if (KnrSamplePicker.isInCart(card) && !KnrSamplePicker.isChosen(card)) {
        toRemove[card.dataset.key] = 0
      }

      if (!KnrSamplePicker.isInCart(card) && KnrSamplePicker.isChosen(card)) {
        toAdd.push({
          id: Number(card.dataset.variant),
          quantity: 1,
          properties: { _knr_sample: '1' },
        })
      }
    }

    const removesThenAdds = Object.keys(toRemove).length > 0 && toAdd.length > 0

    if (Object.keys(toRemove).length > 0) {
      KnrCart.current.update(toRemove, { skipRender: removesThenAdds })
    }

    if (toAdd.length > 0) {
      KnrCart.current.add(toAdd)
    }
  }
}
