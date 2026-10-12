import { KnrComponent } from './component.js'
import { KnrCart } from './cart.js'
import { KnrSamplePicker } from './sample-picker.js'

export class KnrCartDrawer extends KnrComponent {
  static selector = '[data-knr-cart-drawer]:not([data-knr-cart-headless])'
  static instances = []

  constructor(dialog) {
    super()

    this.dialog = dialog
    this.opener = null

    document.addEventListener('click', (event) => this.route(event))

    document.addEventListener('shopify:cart:lines-update', (event) => this.onCartUpdate(event))

    dialog.addEventListener('click', (event) => this.dismiss(event))
    dialog.addEventListener('close', () => this.restoreFocus())

    this.listenToEditor()
  }

  listenToEditor() {
    if (!window.Shopify || !window.Shopify.designMode) return

    document.addEventListener('shopify:section:select', (event) => this.onEditorSelect(event))
    document.addEventListener('shopify:block:select', (event) => this.onEditorSelect(event))

    document.addEventListener('shopify:section:deselect', () => this.dialog.close())
    document.addEventListener('shopify:block:deselect', () => this.dialog.close())
  }

  onEditorSelect(event) {
    if (!this.dialog.contains(event.target) && !event.target.contains(this.dialog)) return

    this.open()
  }

  route(event) {
    const opener = event.target.closest('[data-knr-cart-open]')

    if (opener) {
      event.preventDefault()
      this.opener = opener
      this.open()
      return
    }

    if (!this.dialog.open) return

    if (event.target.closest('[data-knr-cart-close]')) {
      this.dialog.close()
      return
    }

    if (event.target.closest('[data-knr-cart-open-samples]')) {
      this.showPanel('samples')
      return
    }

    if (event.target.closest('[data-knr-cart-back]')) {
      KnrSamplePicker.discardChoice()
      this.showPanel('cart')
      return
    }

    if (event.target.closest('[data-knr-cart-validate]')) {
      KnrSamplePicker.sendChoice()
      this.showPanel('cart')
    }
  }

  open() {
    const bar = window.innerWidth - document.documentElement.clientWidth

    document.documentElement.style.setProperty('--knr-scrollbar', `${bar}px`)

    KnrSamplePicker.discardChoice()

    this.showPanel('cart')

    if (!this.dialog.open) {
      this.dialog.showModal()
    }
  }

  showPanel(name) {
    if (!KnrCart.current) return

    KnrCart.current.showPanel(name)

    const panel = this.dialog.querySelector(`[data-knr-cart-panel="${name}"]`)

    if (panel) {
      panel.focus({ preventScroll: true })
    }
  }

  onCartUpdate(event) {
    if (event.action !== 'add') return

    if (event.promise) {
      event.promise.finally(() => this.refreshAndOpen())
      return
    }

    this.refreshAndOpen()
  }

  async refreshAndOpen() {
    if (!KnrCart.current) return

    await KnrCart.current.refreshSection()

    this.open()
  }

  dismiss(event) {
    if (event.target === this.dialog) {
      this.dialog.close()
    }
  }

  restoreFocus() {
    if (this.opener) {
      this.opener.focus()
    }
  }
}
