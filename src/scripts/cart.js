import { KnrComponent } from './component.js'

export class KnrCart extends KnrComponent {
  static selector = '[data-knr-cart-drawer]'
  static instances = []

  static current = null

  static SECTION = 'knr-cart-drawer'

  static beforeSwap = null

  constructor(root) {
    super()

    this.dialog = root

    this.stateOnly = root.hasAttribute('data-knr-cart-headless')

    this.queue = Promise.resolve()

    this.unconfirmedTotal = 0

    KnrCart.current = this
  }

  get state() {
    const island = this.dialog.querySelector('[data-knr-cart-data]')

    if (!island) return null

    try {
      return JSON.parse(island.textContent)
    } catch (error) {
      return null
    }
  }

  endpointUrl(name) {
    return `${window.Shopify.routes.root}cart/${name}.js`
  }

  add(items, options) {
    return this.enqueue('add', { items }, options)
  }

  update(updates, options) {
    return this.enqueue('update', { updates }, options)
  }

  change(key, quantity) {
    return this.enqueue('change', { id: key, quantity })
  }

  refreshSection() {
    this.queue = this.queue
      .then(() => this.renderFromServer())
      .catch((error) => {
        console.warn('[knr-cart]', error)
      })

    return this.queue
  }

  enqueue(endpoint, body, options) {
    this.queue = this.queue
      .then(() => this.postToCart(endpoint, body, options))
      .catch((error) => {
        console.warn('[knr-cart]', error)

        return this.renderFromServer().catch(() => {})
      })

    return this.queue
  }

  async renderFromServer() {
    const page = this.stateOnly ? window.location.pathname : window.Shopify.routes.root
    const response = await fetch(`${page}?sections=${KnrCart.SECTION}`)

    if (!response.ok) {
      throw new Error('Section indisponible')
    }

    this.render({ sections: await response.json() })
  }

  async postToCart(endpoint, body, { skipRender = false } = {}) {
    const response = await fetch(this.endpointUrl(endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(skipRender ? body : { ...body, sections: KnrCart.SECTION }),
    })

    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.description || payload.message || 'Panier indisponible')
    }

    if (!skipRender) {
      this.render(payload)
    }

    return payload
  }

  render(payload) {
    const html = payload.sections && payload.sections[KnrCart.SECTION]

    if (!html) return

    const current = this.dialog.querySelector('[data-knr-cart-content]')
    const incoming = new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector('[data-knr-cart-content]')

    if (!current || !incoming) return

    const island = incoming.querySelector('[data-knr-cart-data]')

    if (island && KnrCart.beforeSwap) {
      let incomingState = null

      try {
        incomingState = JSON.parse(island.textContent)
      } catch (error) {
        incomingState = null
      }

      if (incomingState && KnrCart.beforeSwap(incomingState)) return
    }

    const swap = () => {
      const openPanel = this.visiblePanel()

      this.dialog.setAttribute('data-knr-cart-swapping', '')

      current.replaceWith(incoming)

      this.unconfirmedTotal = 0

      this.showPanel(openPanel)

      requestAnimationFrame(() => this.dialog.removeAttribute('data-knr-cart-swapping'))

      document.dispatchEvent(new CustomEvent('knr:cart:render', { detail: { root: this.dialog } }))
    }

    if (this.canCrossFade()) {
      document.startViewTransition(swap)
      return
    }

    swap()
  }

  canCrossFade() {
    if (this.stateOnly) return false
    if (!document.startViewTransition) return false

    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  visiblePanel() {
    for (const panel of this.dialog.querySelectorAll('[data-knr-cart-panel]')) {
      if (!panel.hidden) return panel.dataset.knrCartPanel
    }

    return 'cart'
  }

  showPanel(name) {
    for (const panel of this.dialog.querySelectorAll('[data-knr-cart-panel]')) {
      panel.hidden = panel.dataset.knrCartPanel !== name
    }
  }

  previewProgress(delta) {
    const state = this.state

    if (!state) return

    this.unconfirmedTotal += delta

    const bar = this.dialog.querySelector('[data-knr-cart-progress]')
    const percent = KnrCart.progressFor(state.paidTotal + this.unconfirmedTotal, state.tiers)

    if (bar && percent !== null) {
      bar.style.setProperty('--knr-cart-progress', `${percent}%`)
    }
  }

  static progressFor(total, tiers) {
    if (tiers.length === 0) return null

    const segment = 100 / tiers.length

    let reachedCount = 0
    let lastReached = 0
    let nextTier = 0

    for (const tier of tiers) {
      if (total >= tier.amount) {
        reachedCount += 1
        lastReached = tier.amount
      } else if (nextTier === 0) {
        nextTier = tier.amount
      }
    }

    if (nextTier === 0) return reachedCount * segment

    const towardsNext = ((total - lastReached) * segment) / (nextTier - lastReached)

    return reachedCount * segment + towardsNext
  }
}
