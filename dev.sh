#!/usr/bin/env bash

# Arrête le script à la première erreur, refuse les variables non définies et
# propage l'échec d'un maillon de pipe plutôt que celui du dernier.
set -euo pipefail

# Se place à la racine du thème, quel que soit le dossier d'où on appelle.
# $0 est le chemin du script, dirname en retire le nom de fichier.
cd "$(dirname "$0")"

# .env vit hors du dépôt public : il porte le jeton Admin et le mot de passe de
# la vitrine. `set -a` exporte automatiquement tout ce qui est défini ensuite,
# `set +a` referme. La CLI Shopify lit SHOPIFY_FLAG_STORE_PASSWORD comme si on
# avait passé --store-password, ce qui supprime son invite.
if [ -f ../.env ]; then
  set -a; . ../.env; set +a
fi

# Shopify n'offre aucun point d'accroche pour une étape de compilation : sass
# et esbuild doivent tourner en parallèle. `&` les met en arrière-plan, `$!`
# retient leur PID.
pnpm watch:css &
sass_pid=$!

# esbuild assemble src/scripts en un seul assets/knr.js. Pas de --minify ici :
# pendant le développement on veut lire le code servi, la minification n'arrive
# qu'au build de production, que `pnpm push` déclenche.
pnpm watch:js &
esbuild_pid=$!

# Sans ça sass survivrait au Ctrl+C : un processus lancé en arrière-plan par un
# shell sans contrôle de tâches ignore SIGINT. EXIT se déclenche quelle que soit
# la raison de la sortie.
trap 'kill "$sass_pid" "$esbuild_pid" 2>/dev/null' EXIT

# Au premier plan, donc rattaché au vrai terminal — c'est ce qui permet à la CLI
# de poser ses questions. La boutique vient de shopify.theme.toml.
shopify theme dev
