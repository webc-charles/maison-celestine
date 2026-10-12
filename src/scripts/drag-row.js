import { KnrComponent } from './component.js'

export class KnrDragRow extends KnrComponent {
  static selector = '[data-knr-drag]'
  static instances = []

  static threshold = 4

  constructor(row) {
    super()

    this.row = row
    this.origin = null
    this.travelled = 0

    row.addEventListener('pointerdown', (event) => this.start(event))
    row.addEventListener('pointermove', (event) => this.move(event))
    row.addEventListener('pointerup', () => this.end())
    row.addEventListener('pointercancel', () => this.end())

    window.addEventListener('pointerup', () => this.end())

    row.addEventListener('click', (event) => this.guard(event), true)

    row.addEventListener('dragstart', (event) => event.preventDefault())

    this.measure = this.measure.bind(this)

    this.observer = new ResizeObserver(this.measure)
    this.observer.observe(row)

    this.measure()
  }

  measure() {
    this.row.classList.toggle('knr-draggable', this.row.scrollWidth > this.row.clientWidth)
  }

  start(event) {
    if (event.pointerType !== 'mouse') return

    if (event.button !== 0) return

    this.origin = { x: event.clientX, left: this.row.scrollLeft }
    this.travelled = 0
  }

  move(event) {
    if (!this.origin) return

    const distance = event.clientX - this.origin.x

    this.travelled = Math.max(this.travelled, Math.abs(distance))

    if (this.travelled < KnrDragRow.threshold) return

    this.row.classList.add('knr-dragging')

    this.row.scrollLeft = this.origin.left - distance
  }

  end() {
    if (!this.origin) return

    this.row.classList.remove('knr-dragging')

    this.origin = null
  }

  guard(event) {
    if (this.travelled <= KnrDragRow.threshold) return

    event.preventDefault()
    event.stopPropagation()
  }
}
