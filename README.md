# Maison Célestine

Page produit Shopify reproduite à partir d'une maquette Figma, sur le thème
Horizon.

**Vitrine** : <https://maison-celestine-u8ylty24.myshopify.com/products/serum-precieux-regenerant>
— mot de passe `KNRDEV`.

## Pile

Liquid, SCSS et JavaScript natif, sans framework ni dépendance au navigateur.
Shopify CLI pour le développement et la mise en ligne, `sass` et `esbuild` pour
la compilation.

## Développement

```bash
pnpm install
pnpm dev     # sass --watch, esbuild --watch et shopify theme dev
pnpm push    # compile puis pousse sur le thème en ligne
```

## Organisation

| chemin | rôle |
|---|---|
| `layout/knr.liquid` | gabarit de la page produit |
| `templates/product.knr-product.liquid` | enchaînement des sections |
| `sections/knr-*.liquid` | une section par bloc de la maquette |
| `snippets/knr-*.liquid` | fragments partagés |
| `src/styles/` | une feuille SCSS par section, compilée vers `assets/*.css` |
| `src/scripts/` | une classe par comportement, assemblée en `assets/knr.js` |

`src/` est la source, versionnée ici. `.shopifyignore` l'écarte seulement de
ce que la CLI envoie à Shopify : la boutique ne reçoit que les fichiers
compilés dans `assets/`.
