import { KnrComponent } from './component.js'

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

// Ouvre et ferme un panneau, avec des groupes ou un seul reste ouvert.
export class KnrDisclosure extends KnrComponent {
  static selector = '[data-knr-disclosure]'
  static instances = []

  constructor(trigger) {
    super()

    this.trigger = trigger
    this.panel = document.getElementById(trigger.getAttribute('aria-controls'))
    this.group = trigger.dataset.knrDisclosureGroup || null

    // un panneau flottant retient le clavier, un accordeon le laisse passer
    this.popup = trigger.hasAttribute('data-knr-disclosure-popup')

    trigger.addEventListener('click', () => this.toggle())

    trigger.addEventListener('keydown', (event) => this.onKeydown(event))

    if (this.panel) {
      this.panel.addEventListener('keydown', (event) => this.onKeydown(event))
    }

    if (this.popup) {
      document.addEventListener('pointerdown', (event) => this.onPointerDown(event))
    }
  }

  get open() {
    return this.trigger.getAttribute('aria-expanded') === 'true'
  }

  set open(value) {
    this.trigger.setAttribute('aria-expanded', String(value))
  }

  get items() {
    if (!this.panel) return []

    return Array.from(this.panel.querySelectorAll(FOCUSABLE))
  }

  onKeydown(event) {
    if (event.key === 'Escape') {
      if (!this.open) return

      this.open = false
      this.trigger.focus()
      return
    }

    if (event.key === 'Tab' && this.popup && this.open) {
      this.cycle(event)
    }
  }

  // le clavier tourne en boucle dans le panneau tant qu'il est ouvert
  cycle(event) {
    const items = this.items

    if (items.length === 0) return

    const first = items[0]
    const last = items[items.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  // un clic a cote referme, sans deplacer le focus
  onPointerDown(event) {
    if (!this.open) return

    if (this.trigger.contains(event.target)) return

    if (this.panel && this.panel.contains(event.target)) return

    this.open = false
  }

  toggle() {
    const next = !this.open

    // dans un groupe, ouvrir l'un referme les autres
    if (next && this.group) {
      for (const other of KnrDisclosure.instances) {
        if (other !== this && other.group === this.group) other.open = false
      }
    }

    this.open = next

    // a l'ouverture le clavier entre directement dans le panneau
    if (next && this.popup) {
      const items = this.items
      if (items.length > 0) items[0].focus()
    }
  }
}
