import { KnrComponent } from './component.js'

// Agrandit une tuile de la galerie, en suivant la souris.
export class KnrZoom extends KnrComponent {
  static selector = '[data-knr-zoom]'
  static instances = []
  static state = 'knr-product-gallery__item--zoomed'
  static sizes = '(min-width: 1024px) 66vw, 100vw'

  constructor(item) {
    super()

    this.item = item
    this.image = item.querySelector('img')
    this.toggle = item.querySelector('[data-knr-zoom-toggle]')

    if (!this.image) return

    item.addEventListener('click', (event) => this.flip(event))

    item.addEventListener('pointermove', (event) => this.track(event))

    // sur mobile, le doigt qui se leve declencherait une sortie immediate
    if (window.matchMedia('(hover: hover)').matches) {
      item.addEventListener('pointerleave', () => this.exit())
    }
  }

  get zoomed() {
    return this.item.classList.contains(KnrZoom.state)
  }

  flip(event) {
    if (this.zoomed) {
      this.exit()
      return
    }

    // on ne demande la grande image qu'au premier zoom
    this.image.sizes = KnrZoom.sizes

    this.item.classList.add(KnrZoom.state)

    if (this.toggle) {
      this.toggle.setAttribute('aria-pressed', 'true')
    }

    // un clic sur le bouton centre, un clic sur l'image vise l'endroit cliquee
    if (event.target.closest('[data-knr-zoom-toggle]')) {
      this.centre()
    } else {
      this.track(event)
    }
  }

  exit() {
    if (!this.zoomed) return

    this.item.classList.remove(KnrZoom.state)

    if (this.toggle) {
      this.toggle.setAttribute('aria-pressed', 'false')
    }

    this.centre()
  }

  track(event) {
    if (!this.zoomed) return

    const box = this.item.getBoundingClientRect()

    // position de la souris dans la tuile, en pourcentage
    const x = ((event.clientX - box.left) / box.width) * 100
    const y = ((event.clientY - box.top) / box.height) * 100

    this.item.style.setProperty('--knr-zoom-x', `${x}%`)
    this.item.style.setProperty('--knr-zoom-y', `${y}%`)
  }

  centre() {
    this.item.style.removeProperty('--knr-zoom-x')
    this.item.style.removeProperty('--knr-zoom-y')
  }
}
