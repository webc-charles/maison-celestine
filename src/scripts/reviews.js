import { KnrComponent } from './component.js'

// Charge les avis Judge.me page par page et les filtre par note.
export class KnrReviews extends KnrComponent {
  static selector = '[data-knr-reviews]'
  static instances = []
  static endpoint = 'https://judge.me/reviews/reviews_for_widget'
  static entering = 'knr-reviews__item--entering'

  constructor(root) {
    super()

    this.root = root
    this.list = root.querySelector('[data-knr-reviews-list]')
    this.template = root.querySelector('[data-knr-review-template]')
    this.more = root.querySelector('[data-knr-reviews-more]')
    this.empty = root.querySelector('[data-knr-reviews-empty]')
    this.ratings = [...root.querySelectorAll('[data-knr-reviews-rating]')]
    this.label = root.querySelector('[data-knr-reviews-filter-label]')

    this.button = null

    if (this.more) {
      this.button = this.more.querySelector('button')
    }

    this.caption = ''

    if (this.label) {
      this.caption = this.label.textContent
    }

    this.pages = Number(root.dataset.knrReviewsPages) || 1
    this.step = Number(root.dataset.knrReviewsStep) || 3
    this.shown = this.step
    this.page = 1
    this.rating = ''

    // passe a vrai si Judge.me repond mal : on arrete de demander
    this.failed = false

    for (const choice of this.ratings) {
      choice.addEventListener('click', () => this.choose(choice))
    }

    if (!this.button) return

    if (!this.template) return

    this.button.addEventListener('click', () => this.advance())
  }

  async choose(choice) {
    const rating = choice.dataset.knrReviewsRating

    for (const other of this.ratings) {
      other.setAttribute('aria-pressed', String(other === choice))
    }

    this.rename(rating)

    // on referme le menu de filtre et on rend le focus a son bouton
    const trigger = this.root.querySelector('[data-knr-disclosure]')

    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false')
      trigger.focus()
    }

    await this.filter(rating)
  }

  // "Filtrer" devient "Filtrer · 4 ★" quand une note est choisie
  rename(rating) {
    if (!this.label) return

    if (rating === '') {
      this.label.textContent = this.caption
      return
    }

    this.label.textContent = `${this.caption} · ${rating}`

    const star = this.root.querySelector('.knr-rating__star:not(.knr-rating__star--empty)')

    if (star) this.label.append(star.cloneNode(true))
  }

  get rows() {
    return [...this.list.querySelectorAll('[data-knr-review]')]
  }

  get matching() {
    if (!this.rating) return this.rows

    return this.rows.filter((row) => row.dataset.rating === this.rating)
  }

  advance() {
    this.shown += this.step

    // tant qu'on a des avis en reserve, inutile d'aller en chercher
    if (this.shown <= this.rows.length) return this.reveal()

    return this.load()
  }

  reveal() {
    const matching = this.matching
    const visible = new Set(matching.slice(0, this.shown))

    let order = 0

    for (const row of this.rows) {
      if (visible.has(row) && row.hidden) this.enter(row, order++)

      row.hidden = !visible.has(row)
    }

    if (this.empty) {
      this.empty.hidden = matching.length > 0
    }

    if (this.more) {
      this.more.hidden = this.rating !== '' || (this.shown >= this.rows.length && this.page >= this.pages)
    }
  }

  // pour filtrer sur une note il faut d'abord tout avoir recupere
  async all() {
    while (this.page < this.pages && !this.failed) {
      await this.load({ reveal: false })
    }
  }

  async filter(rating) {
    if (rating !== '' && this.page < this.pages && this.button) {
      this.busy(true)

      await this.all()

      this.busy(false)
    }

    this.rating = rating
    this.shown = Math.max(this.step, this.matching.length)

    this.reveal()
  }

  // chaque avis entre avec un leger decalage sur le precedent
  enter(row, order) {
    row.style.setProperty('--knr-enter', String(order))
    row.classList.add(KnrReviews.entering)

    row.addEventListener(
      'animationend',
      () => {
        row.classList.remove(KnrReviews.entering)
        row.style.removeProperty('--knr-enter')
      },
      { once: true },
    )
  }

  get next() {
    const shop = this.root.dataset.knrReviewsShop
    const product = this.root.dataset.knrReviewsProduct

    const query = new URLSearchParams({
      url: shop,
      shop_domain: shop,
      platform: 'shopify',
      product_id: product,
      page: String(this.page + 1),
    })

    return `${KnrReviews.endpoint}?${query}`
  }

  async load({ reveal = true } = {}) {
    if (reveal) this.busy(true)

    try {
      const response = await fetch(this.next)

      if (!response.ok) throw new Error(`Judge.me ${response.status}`)

      const { reviews } = await response.json()

      for (const review of reviews) {
        this.list.append(this.card(review))
      }

      this.page += 1

      if (reveal) this.reveal()
    } catch (erreur) {
      this.failed = true

      if (this.more) this.more.hidden = true
    } finally {
      if (reveal) this.busy(false)
    }
  }

  busy(value) {
    const focused = document.activeElement === this.button

    this.button.classList.toggle('knr-button--loading', value)
    this.button.setAttribute('aria-busy', String(value))
    this.button.disabled = value

    // on rend le focus au bouton apres le chargement, s'il l'avait avant
    if (value) {
      this.focused = focused
      return
    }

    if (this.focused && !this.more.hidden) {
      this.button.focus({ preventScroll: true })
    }
  }

  card(review) {
    const item = this.template.content.firstElementChild.cloneNode(true)

    item.dataset.rating = review.rating

    const fill = (name, value) => {
      const node = item.querySelector(`[data-knr-review-${name}]`)

      if (!node) return

      node.textContent = value || ''
      node.hidden = !value
    }

    const date = new Date(review.created_at).toLocaleDateString(document.documentElement.lang || 'fr', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })

    fill('author', review.reviewer_name)
    fill('usage', review.title)
    fill('body', KnrReviews.text(review.body || review.body_html))
    fill('date', date)

    const stars = item.querySelectorAll('.knr-rating__star')

    stars.forEach((star, index) => {
      star.classList.toggle('knr-rating__star--empty', index >= Math.round(review.rating))
    })

    const group = item.querySelector('.knr-rating__stars')

    if (group) {
      group.setAttribute('aria-label', `${review.rating}/5`)
    }

    return item
  }

  // Judge.me renvoie du HTML : on ne garde que le texte
  static text(value) {
    return new DOMParser().parseFromString(value || '', 'text/html').body.textContent.trim()
  }
}
