import { KnrComponent } from './component.js'

export class KnrScrollRow extends KnrComponent {
  static selector = '[data-knr-progress], [data-knr-steps]'
  static instances = []

  static near(element) {
    const scope = element.closest('[data-knr-scope]') || element.closest('section')

    if (!scope) return null

    for (let level = element.parentElement; level; level = level.parentElement) {
      for (const candidate of level.querySelectorAll('ul, ol, div')) {
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

  get ratio() {
    const travel = this.row.scrollWidth - this.row.clientWidth

    if (travel <= 0) return 0

    return this.row.scrollLeft / travel
  }

  updateProgress() {
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
