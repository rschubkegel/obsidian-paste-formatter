# Paste Formatter for Obsidian

Transform pasted content automatically using custom regex rules.

## Features

- Create custom formatting rules
- Match and replace text when pasting
- Enable/disable individual rules
- Simple configuration interface

## Installation

### From Obsidian Community Plugins

1. Open Obsidian
2. Go to Settings → Community plugins
3. Install "Paste Formatter"

### Manual Installation

1. Download the latest release
2. Extract to `<vault>/.obsidian/plugins/paste-formatter/`
3. Reload Obsidian

## Usage

### Creating a Rule

1. Go to Settings → Paste Formatter
2. Click "Add Formatting Rule"
3. Configure:
   - Rule Name
   - Regex Pattern
   - Replacement Pattern

### Example Rules

#### Shorten Jira Ticket Links
- Regex: `(?<url>https?://[a-zA-Z0-9-]+\.atlassian\.net/browse/(?<key>[A-Z]+-\d+))`
- Replacement: `[${key}](${url})`

#### Shorten GitHub PR Links
- Regex: `(?<url>https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9-]+\/[a-zA-Z0-9-]+)\/pull\/(?<pr>\d+)(?:\S*)?)`
- Replacement: `[PR ${pr}](${url})`

## Commands

- Paste Without Formatting: pastes content without applying any formatting rules

## License

MIT License