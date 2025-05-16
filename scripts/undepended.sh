#!/bin/bash

# Usage: ./undepended.sh <code_folder>

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <code_folder>"
    exit 1
fi

CODE_DIR="$(realpath "$1")"
cd "$CODE_DIR"

# Find all .js, .jsx, .ts, .tsx files (excluding node_modules, .git, dist, build)
ALL_FILES=$(find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) \
    ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/build/*")

# Map: file path (relative) -> 1 (exists)
declare -A FILES_MAP
for f in $ALL_FILES; do
    FILES_MAP["$f"]=1
done

# Map: file path (relative) -> 1 (is imported somewhere)
declare -A IMPORTED_MAP

# Helper: normalize import path to relative file path
normalize_import() {
    local import="$1"
    local from_file="$2"
    # Remove quotes, trailing slashes, and extensions
    import="${import//\"/}"
    import="${import//\'/}"
    import="${import%%/}"
    import="${import%%.js}"
    import="${import%%.jsx}"
    import="${import%%.ts}"
    import="${import%%.tsx}"

    # Handle alias (@/) as root
    if [[ "$import" == @/* ]]; then
        import=".$(echo "$import" | cut -c 2-)"
    fi

    # Handle relative imports
    if [[ "$import" == ./* || "$import" == ../* ]]; then
        local dir
        dir=$(dirname "$from_file")
        import="$dir/$import"
    fi

    # Remove redundant ./ and resolve ..
    local norm
    norm=$(realpath -m --relative-to="." "$import" 2>/dev/null || echo "")
    # Try with extensions
    for ext in .js .jsx .ts .tsx; do
        if [[ -n "${FILES_MAP["$norm$ext"]}" ]]; then
            echo "$norm$ext"
            return
        fi
    done
    # Try as directory index
    for ext in .js .jsx .ts .tsx; do
        if [[ -n "${FILES_MAP["$norm/index$ext"]}" ]]; then
            echo "$norm/index$ext"
            return
        fi
    done
    # If exact match
    if [[ -n "${FILES_MAP["$norm"]}" ]]; then
        echo "$norm"
        return
    fi
}

# Scan all files for import statements
while read -r file; do
    # Extract import paths (import ... from '...', require('...'), dynamic import('...'))
    grep -Eo "(import[[:space:]]+[^;]*from[[:space:]]+['\"][^'\"]+['\"]|require\(['\"][^'\"]+['\"]\)|import\(['\"][^'\"]+['\"]\))" "$file" | \
    grep -Eo "['\"][^'\"]+['\"]" | \
    while read -r imp; do
        imp="${imp//\"/}"
        imp="${imp//\'/}"
        # Ignore node_modules and absolute imports (except @/)
        if [[ "$imp" == .* || "$imp" == @/* ]]; then
            norm=$(normalize_import "$imp" "$file")
            if [[ -n "$norm" ]]; then
                IMPORTED_MAP["$norm"]=1
            fi
        fi
    done
done <<< "$ALL_FILES"

# Print files not imported anywhere (not in IMPORTED_MAP)
for f in $ALL_FILES; do
    # Exclude entry points (index.js/ts/tsx in root)
    if [[ -z "${IMPORTED_MAP["$f"]}" && ! "$f" =~ ^\./index\.(js|ts|tsx|jsx)$ ]]; then
        echo "${f#./}"
    fi
done