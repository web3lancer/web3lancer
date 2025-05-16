#!/bin/bash

# Usage: ./absolute.sh <path-to-code-folder>
# This script converts relative imports in JS/TS files to tag imports (e.g., @/components/...)

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <path-to-code-folder>"
    exit 1
fi

CODE_DIR="$1"
TAG="@"
SRC_DIR_NAME="src" # You can adjust this if your root is not 'src'

# Resolve absolute path
CODE_DIR_ABS="$(cd "$CODE_DIR" && pwd)"

# Build a map of file paths to tag import paths
declare -A FILE_TO_TAG

# Find all .js, .jsx, .ts, .tsx files
while IFS= read -r -d '' file; do
    # Get relative path from code dir
    rel_path="${file#$CODE_DIR_ABS/}"
    # Remove leading src/ if present
    tag_path="$rel_path"
    if [[ "$tag_path" == "$SRC_DIR_NAME/"* ]]; then
        tag_path="${tag_path#$SRC_DIR_NAME/}"
    fi
    FILE_TO_TAG["$file"]="$TAG/$tag_path"
done < <(find "$CODE_DIR_ABS" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) -print0)

# Function to resolve relative import to absolute file path
resolve_import() {
    local base_dir="$1"
    local import_path="$2"
    # Remove quotes and extension
    import_path="${import_path//\"/}"
    import_path="${import_path//\'/}"
    import_path="${import_path%.js}"
    import_path="${import_path%.jsx}"
    import_path="${import_path%.ts}"
    import_path="${import_path%.tsx}"

    # Try with .ts, .tsx, .js, .jsx, /index.ts, etc.
    for ext in tsx ts js jsx; do
        if [ -f "$base_dir/$import_path.$ext" ]; then
            echo "$base_dir/$import_path.$ext"
            return
        fi
        if [ -f "$base_dir/$import_path/index.$ext" ]; then
            echo "$base_dir/$import_path/index.$ext"
            return
        fi
    done
    # Not found
    echo ""
}

# Traverse and process each file
for file in "${!FILE_TO_TAG[@]}"; do
    tmpfile="$(mktemp)"
    changed=0
    lineno=0
    while IFS= read -r line; do
        ((lineno++))
        # Match import ... from './...' or '../...'
        if [[ "$line" =~ import[[:space:]].*from[[:space:]]+[\"\'](\.\/|\.\.\/)[^\"\']+[\"\'] ]]; then
            # Extract import path
            import_path=$(echo "$line" | sed -nE "s/.*from[[:space:]]+['\"]([^'\"]+)['\"].*/\1/p")
            # Resolve to absolute file path
            base_dir="$(dirname "$file")"
            abs_import_file="$(resolve_import "$base_dir" "$import_path")"
            if [ -n "$abs_import_file" ] && [ -n "${FILE_TO_TAG["$abs_import_file"]}" ]; then
                tag_import_path="${FILE_TO_TAG["$abs_import_file"]}"
                # Replace import path in line
                new_line=$(echo "$line" | sed "s|['\"]$import_path['\"]|\"$tag_import_path\"|")
                echo "$new_line" >> "$tmpfile"
                echo "[$file:$lineno] $line"
                echo "[$file:$lineno] $new_line"
                changed=1
                continue
            fi
        fi
        echo "$line" >> "$tmpfile"
    done < "$file"
    if [ "$changed" -eq 1 ]; then
        mv "$tmpfile" "$file"
    else
        rm "$tmpfile"
    fi
done

echo "Done. All applicable imports have been converted."