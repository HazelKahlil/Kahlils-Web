#!/bin/bash
# Kahlil Portfolio - CSS/JS Build Script
# Generates minified versions for production

set -e

echo "🏗️  Building minified assets..."

# Use temp npm cache to avoid permission issues
export NPM_CONFIG_CACHE="${TMPDIR:-/tmp}/.npm-cache-build"

if command -v npx &> /dev/null; then
    echo "📦 Minifying CSS..."
    npx -y clean-css-cli -o style.min.css style.css 2>/dev/null
    ORIGINAL_CSS=$(wc -c < style.css | tr -d ' ')
    MINIFIED_CSS=$(wc -c < style.min.css | tr -d ' ')
    SAVED_CSS=$(( (ORIGINAL_CSS - MINIFIED_CSS) * 100 / ORIGINAL_CSS ))
    echo "   style.css: ${ORIGINAL_CSS}B → style.min.css: ${MINIFIED_CSS}B (${SAVED_CSS}% saved)"

    echo "📦 Minifying JS..."
    npx -y terser script.js -o script.min.js --compress --mangle 2>/dev/null
    ORIGINAL_JS=$(wc -c < script.js | tr -d ' ')
    MINIFIED_JS=$(wc -c < script.min.js | tr -d ' ')
    SAVED_JS=$(( (ORIGINAL_JS - MINIFIED_JS) * 100 / ORIGINAL_JS ))
    echo "   script.js: ${ORIGINAL_JS}B → script.min.js: ${MINIFIED_JS}B (${SAVED_JS}% saved)"

    echo ""
    echo "✅ Build complete!"
    echo "   To use in production, update HTML files:"
    echo "   style.css  → style.min.css"
    echo "   script.js  → script.min.js"
else
    echo "❌ npx not found. Install Node.js first."
    exit 1
fi
