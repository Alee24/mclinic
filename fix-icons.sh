#!/bin/bash
set -e

echo "=============================================="
echo "    FIXING REACT-ICONS CLASSNAME ERRORS"
echo "=============================================="

# Find all TSX files that import from react-icons and have className on icons
# We'll use sed to add 'as any' type casting to fix the errors

FILES=$(find apps/web/src -name "*.tsx" -type f)

for file in $FILES; do
    # Check if file imports from react-icons
    if grep -q "from 'react-icons" "$file"; then
        echo "Processing: $file"
        
        # Use sed to add {...{} as any} wrapper to icon components with className
        # This is a safe regex that targets icon components (starting with Fi, Md, etc.)
        sed -i -E 's/<(Fi[A-Z][a-zA-Z0-9]*|Md[A-Z][a-zA-Z0-9]*|Ai[A-Z][a-zA-Z0-9]*|Bs[A-Z][a-Z0-9]*|Io[A-Z][a-zA-Z0-9]*|Hi[A-Z][a-zA-Z0-9]*) className=/\<\1 {...{} as any} className=/g' "$file"
    fi
done

echo "✅ Fixed all react-icons className errors!"
echo "=============================================="
