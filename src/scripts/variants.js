import { KnrComponent } from './component.js'

// Met a jour le prix, le lien et le bouton quand on change de variante.
export class KnrVariants extends KnrComponent {
  static selector = '[data-knr-variants]'
  static instances = []

  constructor(root) {
    super()

    this.root = root
    this.variants = KnrVariants.parse(root)
    this.inputs = [...root.querySelectorAll('.knr-variant-picker__input')]

    this.current = root.querySelector('[data-knr-price-current]')
    this.compare = root.querySelector('[data-knr-price-compare]')
    this.unit = root.querySelector('[data-knr-price-unit]')
    this.field = root.querySelector('[name="id"]')
    this.submit = root.querySelector('button[type="submit"]')

    if (this.variants.length === 0) return

    if (this.inputs.length === 0) return

    for (const input of this.inputs) {
      input.addEventListener('change', () => this.select(input.value))
    }
  }

  // les variantes sont deposees dans la page par le Liquid, en JSON
  static parse(root) {
    const island = root.querySelector('[data-knr-variants-data]')

    if (!island) return []

    try {
      return JSON.parse(island.textContent)
    } catch (erreur) {
      return []
    }
  }

  select(option) {
    const variant = this.variants.find((item) => item.option === option)

    if (!variant) return

    if (this.current) {
      this.current.textContent = variant.price
    }

    if (this.compare) {
      this.compare.textContent = variant.compare || ''
      this.compare.hidden = variant.compare === null
    }

    if (this.unit) {
      this.unit.textContent = variant.unit || ''
      this.unit.hidden = variant.unit === null
    }

    if (this.field) {
      this.field.value = String(variant.id)
    }

    if (this.submit) {
      this.submit.disabled = !variant.available
    }

    // l'adresse suit la variante, sans recharger la page
    history.replaceState({}, '', variant.url)
  }
}
