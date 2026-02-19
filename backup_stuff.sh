#!/bin/bash

# Configuration
OUTPUT="project_codebase.txt"
TREE_OUTPUT="project_tree.txt"

# Clean up previous dumps
rm -f "$OUTPUT" "$TREE_OUTPUT"
touch "$OUTPUT"

echo "⚡ Starting Spark Market Codebase Dump..."

# 1. Generate Tree Structure
# Added 'spark_test' to the ignore list so the tree doesn't show thousands of test files
echo "Generating tree..."
tree -a \
    -I ".git|node_modules|.next|__pycache__|venv|.venv|wallet_data|postgres_data|spark_work_dir|.DS_Store|spark_test" \
    --prune \
    > "$TREE_OUTPUT"

# 2. Find and Dump File Contents
echo "Dumping file contents..."

find . -type f \
    \( -name "*.tsx" \
    -o -name "*.ts" \
    -o -name "*.py" \
    -o -name "*.sql" \
    -o -name "*.yml" \
    -o -name "*.yaml" \
    -o -name "Dockerfile" \
    -o -name "requirements.txt" \
    -o -name "package.json" \
    -o -name "next.config.ts" \
    -o -name "tsconfig.json" \
    -o -name "*.css" \
    -o -name "*.sh" \
    -o -name ".env" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/dist_release/*" \
    -not -path "*/venv/*" \
    -not -path "*/.next/*" \
    -not -path "*/__pycache__/*" \
    -not -path "*/.git/*" \
    -not -path "*/wallet_data/*" \
    -not -path "*/postgres_data/*" \
    -not -path "*/spark_work_dir/*" \
    -not -path "*/spark-keeper/*" \
    -not -path "*/spark_test/mainnet/*" \
    -not -path "*/spark_test/liquid_work_dir/*" \
    -not -path "*/spark_test/spark_work_dir/*" \
    -not -name "$OUTPUT" \
    -not -name "$TREE_OUTPUT" \
    -not -name "package-lock.json" \
    | while read -r file; do

    # Get clean relative path (remove ./ at start)
    clean_path="${file#./}"

    echo "Processing: $clean_path"

    # Header format compatible with the AI prompts used previously
    echo "--- START OF FILE ${clean_path} ---" >> "$OUTPUT"
    echo "" >> "$OUTPUT"

    # Content
    cat "$file" >> "$OUTPUT"

    echo "" >> "$OUTPUT"
    echo "--- END OF FILE ${clean_path} ---" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
    echo "================================================================================" >> "$OUTPUT"
    echo "" >> "$OUTPUT"

done

echo "✅ Done!"
echo "📂 Tree structure saved to: $TREE_OUTPUT"
echo "📄 Code content saved to:   $OUTPUT"
