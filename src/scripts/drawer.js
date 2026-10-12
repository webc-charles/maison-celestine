import { KnrComponent } from './component.js'

export class KnrDrawer extends KnrComponent {
  static selector = '[data-knr-drawer]'
  static instances = []

  constructor(dialog) {
    super()

    this.dialog = dialog
    this.opener = document.querySelector(`[data-knr-drawer-open][aria-controls="${dialog.id}"]`)

    if (!this.opener) return

    this.opener.addEventListener('click', () => this.open())

    const closer = dialog.querySelector('[data-knr-drawer-close]')

    if (closer) {
      closer.addEventListener('click', () => this.dialog.close())
    }

    dialog.addEventListener('click', (event) => this.dismiss(event))

    dialog.addEventListener('close', () => this.opener.focus())
  }

  open() {
    const bar = window.innerWidth - document.documentElement.clientWidth

    document.documentElement.style.setProperty('--knr-scrollbar', `${bar}px`)

    this.dialog.showModal()
  }

  dismiss(event) {
    if (event.target === this.dialog) this.dialog.close()
  }
}
