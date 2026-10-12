import { KnrComponent } from './component.js'

export class KnrHeader extends KnrComponent {
  static selector = '.knr-page-header'
  static instances = []

  constructor(header) {
    super()

    this.header = header
    this.container = header.closest('header')

    if (!this.container) return

    if (getComputedStyle(this.container).position !== 'sticky') return

    this.sentinel = this.container.previousElementSibling

    if (this.sentinel) {
      this.observer = new IntersectionObserver(([entry]) => this.pin(!entry.isIntersecting))

      this.observer.observe(this.sentinel)

      return
    }

    this.onScroll = () => this.pin(window.scrollY > 0)

    window.addEventListener('scroll', this.onScroll, { passive: true })

    this.onScroll()
  }

  pin(value) {
    this.header.classList.toggle('knr-page-header--pinned', value)
  }
}
