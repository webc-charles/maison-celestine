import { KnrComponent } from './component.js'

// Bascule la section en clair ou en sombre selon la diapositive visible.
export class KnrSlideTheme extends KnrComponent {
  static selector = '[data-knr-slide-theme]'
  static instances = []

  constructor(row) {
    super()

    this.row = row
    this.scope = row.closest('[data-knr-scope]')

    if (!this.scope) return

    this.updateTheme = this.updateTheme.bind(this)

    this.row.addEventListener('scroll', this.updateTheme, { passive: true })

    this.updateTheme()
  }

  updateTheme() {
    const slides = [...this.row.children]
    const distances = slides.map((slide) => Math.abs(slide.offsetLeft - this.row.scrollLeft))

    // la diapositive la plus proche du bord gauche est celle qu'on regarde
    const visible = slides[distances.indexOf(Math.min(...distances))]

    if (!visible) return

    const theme = visible.dataset.knrTheme

    if (!theme) return

    this.scope.classList.toggle('knr-theme-light', theme === 'light')
    this.scope.classList.toggle('knr-theme-dark', theme === 'dark')
  }
}
