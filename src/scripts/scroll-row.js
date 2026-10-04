import { KnrComponent } from './component.js'

// Tient a jour la barre de progression d'une rangee defilante.
export class KnrScrollRow extends KnrComponent {
  static selector = '[data-knr-progress], [data-knr-steps]'
  static instances = []

  // Retrouve la rangee que pilote un controle, sans avoir a les relier dans le Liquid.
  static near(element) {
    // on ne sort jamais de la section : sinon un controle capterait la rangee d'a cote
    const scope = element.closest('[data-knr-scope]') || element.closest('section')

    if (!scope) return null

    // on remonte d'un cran a la fois, pour trouver la plus proche d'abord
    for (let level = element.parentElement; level; level = level.parentElement) {
      for (const candidate of level.querySelectorAll('ul, ol, div')) {
        // un conteneur qui contient le controle est un emballage, pas la rangee
        if (candidate.contains(element)) continue

        const overflow = getComputedStyle(candidate).overflowX

        if (overflow === 'auto' || overflow === 'scroll') return candidate
      }

      if (level === scope) break
    }

    return null
  }

  constructor(indicator) {
    super()

    this.indicator = indicator
    this.fill = indicator.querySelector('.knr-progress__fill')
    this.steps = [...indicator.querySelectorAll('.knr-steps__step')]
    this.row = KnrScrollRow.near(indicator)

    if (!this.row) return

    this.updateProgress = this.updateProgress.bind(this)

    this.row.addEventListener('scroll', this.updateProgress, { passive: true })

    this.observer = new ResizeObserver(this.updateProgress)
    this.observer.observe(this.row)

    this.updateProgress()
  }

  // ou on en est dans le defilement, de 0 a 1
  get ratio() {
    const travel = this.row.scrollWidth - this.row.clientWidth

    if (travel <= 0) return 0

    return this.row.scrollLeft / travel
  }

  updateProgress() {
    // la part visible donne la longueur de la barre
    const visible = Math.min(this.row.clientWidth / this.row.scrollWidth, 1)

    this.indicator.style.setProperty('--knr-progress', `${visible * 100}%`)
    this.indicator.style.setProperty('--knr-progress-offset', `${this.ratio * (1 - visible) * 100}%`)

    if (this.steps.length === 0) return

    const active = Math.round(this.ratio * (this.steps.length - 1))

    this.steps.forEach((step, index) => {
      step.classList.toggle('knr-steps__step--on', index === active)
    })
  }
}
