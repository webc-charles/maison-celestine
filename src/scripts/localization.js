import { KnrComponent } from './component.js'

export class KnrLocalization extends KnrComponent {
  static selector = '[data-knr-localization]'
  static instances = []

  constructor(select) {
    super()

    this.select = select
    this.form = select.closest('form')

    if (!this.form) return

    select.addEventListener('change', () => this.form.submit())
  }
}
