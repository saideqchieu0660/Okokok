with open('src/features.config.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if '"vibe-heatmap"' not in content:
    content = content.replace('"vibe-smart-filters": true,', '"vibe-smart-filters": true,\n  "vibe-heatmap": true,\n  "vibe-fanout-deck": true,')

with open('src/features.config.ts', 'w', encoding='utf-8') as f:
    f.write(content)
