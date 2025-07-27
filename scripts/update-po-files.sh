#!/bin/bash

# Update .po files from .pot template using msgmerge
# This script preserves existing translations while adding new strings

POT_FILE="locales/messages.pot"
LOCALES_DIR="locales"

# Check if .pot file exists
if [ ! -f "$POT_FILE" ]; then
    echo "Error: $POT_FILE not found. Run extract-i18n.js first."
    exit 1
fi

# Get list of supported languages from the languages data file
LANGUAGES=($(node -e "
const langs = require('./src/_data/languages.js');
console.log(langs.map(l => l.code).join(' '));
"))

echo "Updating .po files for languages: ${LANGUAGES[@]}"

for lang in "${LANGUAGES[@]}"; do
    PO_FILE="$LOCALES_DIR/$lang.po"
    
    if [ -f "$PO_FILE" ]; then
        echo "Updating existing $PO_FILE..."
        msgmerge --update --backup=off "$PO_FILE" "$POT_FILE"
        echo "✓ Updated $PO_FILE"
    else
        echo "Creating new $PO_FILE..."
        msginit --no-translator --locale="$lang" --input="$POT_FILE" --output="$PO_FILE"
        echo "✓ Created $PO_FILE"
    fi
done

echo "All .po files updated successfully!"
echo ""
echo "Next steps:"
echo "1. Translate strings in locales/*.po files"
echo "2. Convert .po files back to JSON: npm run po-to-json"
echo "3. Build site: npm run build"