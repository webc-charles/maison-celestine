import { KnrComponent } from './component.js'

// Marque l'entete des qu'on quitte le haut de la page.
export class KnrHeader extends KnrComponent {
  static selector = '.knr-page-header'
  static instances = []

  constructor(header) {
    super()

    this.header = header
    this.container = header.closest('header')

    if (!this.container) return

    if (getComputedStyle(this.container).position !== 'sticky') return

    // l'element juste avant l'entete sert de temoin : tant qu'il est visible, on est en haut
    this.sentinel = this.container.previousElementSibling

    if (this.sentinel) {
      this.observer = new IntersectionObserver(([entry]) => this.pin(!entry.isIntersecting))

      this.observer.observe(this.sentinel)

      return
    }

    // sans temoin, on se rabat sur la position de defilement
    this.onScroll = () => this.pin(window.scrollY > 0)

    window.addEventListener('scroll', this.onScroll, { passive: true })

    this.onScroll()
  }

  pin(value) {
    this.header.classList.toggle('knr-page-header--pinned', value)
  }
}
