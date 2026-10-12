import { KnrComponent } from './component.js'
import { KnrCart } from './cart.js'

export class KnrCartRewards extends KnrComponent {
  static selector = '[data-knr-cart-drawer]'
  static instances = []

  constructor(root) {
    super()

    this.correcting = false

    this.stateOnly = root.hasAttribute('data-knr-cart-headless')

    if (this.stateOnly) {
      document.addEventListener('shopify:cart:lines-update', (event) => this.onCartChanged(event))
    }

    document.addEventListener('knr:cart:render', () => this.reconcile())

    KnrCart.beforeSwap = (state) => this.correct(state)

    this.reconcile()
  }

  onCartChanged(event) {
    const mutationSettled = event && event.promise ? event.promise : Promise.resolve()

    mutationSettled.finally(() => {
      if (KnrCart.current) KnrCart.current.refreshSection()
    })
  }

  reconcile() {
    if (!KnrCart.current) return

    const state = KnrCart.current.state

    if (state) this.correct(state)
  }

  correct(state) {
    if (this.correcting) return false

    const correction = this.nextCorrection(state)

    if (!correction) return false

    this.correcting = true

    correction
      .then((confirmed) => {
        if (this.stateOnly && confirmed) {
          window.location.reload()
        }
      })
      .finally(() => {
        this.correcting = false
      })

    return true
  }

  nextCorrection(state) {
    const toRemove = {}

    const samplesOverAllowance = state.sampleCount - state.samplesMax

    if (samplesOverAllowance > 0) {
      for (const key of state.sampleKeys.slice(-samplesOverAllowance).filter(Boolean)) {
        toRemove[key] = 0
      }
    }

    if (!state.giftUnlocked && state.giftInCart && state.giftKey) {
      toRemove[state.giftKey] = 0
    }

    if (Object.keys(toRemove).length > 0) {
      return KnrCart.current.update(toRemove)
    }

    const giftIsMissing = state.giftUnlocked && !state.giftInCart && state.giftVariant

    if (giftIsMissing) {
      return KnrCart.current.add([
        {
          id: state.giftVariant,
          quantity: 1,
          properties: { _knr_gift: '1' },
        },
      ])
    }

    return null
  }

}
