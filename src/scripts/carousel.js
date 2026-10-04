import { KnrComponent } from './component.js'
import { KnrScrollRow } from './scroll-row.js'

// Pilote une rangee defilante avec deux chevrons.
export class KnrCarousel extends KnrComponent {
  static selector = '[data-knr-carousel]'
  static instances = []

  constructor(controls) {
    super()

    this.row = KnrScrollRow.near(controls)
    this.previous = controls.querySelector('[data-knr-carousel-previous]')
    this.next = controls.querySelector('[data-knr-carousel-next]')

    if (!this.row) return

    if (this.previous) {
      this.previous.addEventListener('click', () => this.step(-1))
    }

    if (this.next) {
      this.next.addEventListener('click', () => this.step(1))
    }

    this.updateArrows = this.updateArrows.bind(this)

    this.row.addEventListener('scroll', this.updateArrows, { passive: true })

    this.observer = new ResizeObserver(this.updateArrows)
    this.observer.observe(this.row)

    this.updateArrows()
  }

  // a quelle position amener la rangee pour que cet element soit a sa place
  scrollTargetFor(item) {
    const centred = getComputedStyle(item).scrollSnapAlign.includes('center')

    if (!centred) return item.offsetLeft

    // un element centre recule de la moitie de l'espace qui reste
    return item.offsetLeft - (this.row.clientWidth - item.offsetWidth) / 2
  }

  step(direction) {
    const items = [...this.row.children]
    const distances = items.map((item) => Math.abs(this.scrollTargetFor(item) - this.row.scrollLeft))

    // le plus proche de la position actuelle est celui qu'on regarde
    const current = distances.indexOf(Math.min(...distances))
    const target = items[Math.min(Math.max(current + direction, 0), items.length - 1)]

    if (!target) return

    this.row.scrollTo({ left: this.scrollTargetFor(target), behavior: 'smooth' })
  }

  updateArrows() {
    const travel = this.row.scrollWidth - this.row.clientWidth

    // le pixel de marge absorbe les arrondis du navigateur
    if (this.previous) this.previous.disabled = this.row.scrollLeft <= 1

    if (this.next) this.next.disabled = this.row.scrollLeft >= travel - 1
  }
}
