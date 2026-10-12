import { KnrCarousel } from './carousel.js'
import { KnrCart } from './cart.js'
import { KnrCartButton } from './cart-button.js'
import { KnrCartCount } from './cart-count.js'
import { KnrCartDrawer } from './cart-drawer.js'
import { KnrCartLine } from './cart-line.js'
import { KnrCartRewards } from './cart-rewards.js'
import { KnrDisclosure } from './disclosure.js'
import { KnrDragRow } from './drag-row.js'
import { KnrDrawer } from './drawer.js'
import { KnrHeader } from './header.js'
import { KnrLocalization } from './localization.js'
import { KnrReveal } from './reveal.js'
import { KnrReviews } from './reviews.js'
import { KnrRotator } from './rotator.js'
import { KnrSamplePicker } from './sample-picker.js'
import { KnrScrollRow } from './scroll-row.js'
import { KnrSlideTheme } from './slide-theme.js'
import { KnrVariants } from './variants.js'
import { KnrZoom } from './zoom.js'

function mountAll(root = document) {
  KnrCarousel.mount(root)
  KnrCart.mount(root)
  KnrCartButton.mount(root)
  KnrCartCount.mount(root)
  KnrCartDrawer.mount(root)
  KnrCartLine.mount(root)
  KnrCartRewards.mount(root)
  KnrDisclosure.mount(root)
  KnrDragRow.mount(root)
  KnrDrawer.mount(root)
  KnrHeader.mount(root)
  KnrLocalization.mount(root)
  KnrReveal.mount(root)
  KnrReviews.mount(root)
  KnrRotator.mount(root)
  KnrSamplePicker.mount(root)
  KnrScrollRow.mount(root)
  KnrSlideTheme.mount(root)
  KnrVariants.mount(root)
  KnrZoom.mount(root)
}

mountAll()

document.addEventListener('knr:cart:render', (event) => mountAll(event.detail.root))
