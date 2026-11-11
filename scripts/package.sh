#!/usr/bin/env bash
# Build distributable artifacts without publishing anything.
set -euo pipefail

cd "$(dirname "$0")/.."
version=$(node -p "require('./package.json').version")
mkdir -p dist

rm -f dist/*.tgz dist/*.zip dist/*.bundle dist/SHA256SUMS

npm pack --cache "$PWD/.npm-cache" --logs-dir "$PWD/.npm-cache/logs" --pack-destination dist >/dev/null
tarball=$(ls dist/*.tgz | head -1)

zip -qr "dist/DAYS-${version}-source.zip" . \
  -x ".git/*" "dist/*" "node_modules/*" ".npm-cache/*" ".DS_Store" "*.log"

git bundle create "dist/DAYS-${version}-history.bundle" --all >/dev/null

(
  cd dist
  shasum -a 256 ./* | sed 's| \./| |' > SHA256SUMS
)

echo "version: ${version}"
echo "tarball: ${tarball}"
echo "source : dist/DAYS-${version}-source.zip"
echo "history: dist/DAYS-${version}-history.bundle"
echo "digests: dist/SHA256SUMS"
