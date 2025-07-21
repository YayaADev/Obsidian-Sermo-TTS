# Sermo TTS Plugin for Obsidian

A powerful text-to-speech plugin for Obsidian that converts selected text to natural-sounding speech using the Sermo API with advanced server-side language detection.

## Features

- 🗣️ **Convert any selected text to speech** with natural voices
- 🌍 **Automatic language detection** - supports multiple languages including Arabic, English, Spanish, French, and more
- 🎯 **Smart language mapping** - automatically uses appropriate regional variants (e.g., Egyptian Arabic)
- ⚡ **Fast and reliable** - built-in retry logic and error handling
- 🎛️ **Configurable** - adjust API settings, timeouts, and retry attempts
- 📱 **Mobile-friendly** - works on both desktop and mobile Obsidian

## Installation

### From Community Plugins (Coming Soon)
1. Open Obsidian Settings
2. Go to Community Plugins → Browse
3. Search for "Sermo TTS"
4. Install and enable

### Manual Installation
1. Download the latest release from [GitHub Releases](https://github.com/yourusername/obsidian-sermo-tts/releases)
2. Extract the files to your vault's plugins folder: `<vault>/.obsidian/plugins/sermo-tts/`
3. Reload Obsidian and enable the plugin in Settings → Community Plugins

## Setup

1. **Configure API URL**: Go to Settings → Sermo TTS Settings
2. **Set your Sermo API endpoint** (default: `http://localhost:8080/speech/synthesize`)
3. **Adjust timeout and retry settings** as needed

## Usage

### Basic Usage
1. **Select any text** in your note
2. **Use Command Palette** (`Ctrl+Shift+P`) → "Speak selected text"
3. **Or use the hotkey** (if configured)

### Available Commands
- **Speak selected text** - Converts highlighted text to speech
- **Speak current line** - Speaks the line where your cursor is located

### Supported Languages
The plugin automatically detects and supports:
- 🇺🇸 English (US)
- 🇪🇬 Arabic (Egyptian)
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German
- 🇮🇹 Italian
- 🇵🇹 Portuguese
- 🇷🇺 Russian
- 🇨🇳 Chinese
- 🇯🇵 Japanese
- 🇰🇷 Korean
- 🇮🇳 Hindi
- And more...

## Development & Testing

### Prerequisites
- Node.js 16+ and npm
- Obsidian (desktop version recommended for testing)
- Access to a Sermo API server

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/obsidian-sermo-tts.git
   cd obsidian-sermo-tts
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up development symlink**:
   ```bash
   # Navigate to your Obsidian vault's plugins directory
   cd "/path/to/your/vault/.obsidian/plugins"
   
   # Create symlink (replace paths with your actual paths)
   ln -s /path/to/your/obsidian-sermo-tts ./sermo-tts
   ```

4. **Build and watch for changes**:
   ```bash
   cd /path/to/your/obsidian-sermo-tts
   npm run dev  # Builds and watches for changes
   ```

### Testing Your Setup

#### Step 1: Verify Symlink
```bash
# Check that symlink is working
ls -la "/path/to/your/vault/.obsidian/plugins/"
# Should show: sermo-tts -> /path/to/your/obsidian-sermo-tts
```

#### Step 2: Enable Plugin in Obsidian
1. Open Obsidian
2. Go to **Settings** → **Community Plugins**
3. Make sure **Safe mode is OFF**
4. Find **"Sermo TTS"** in the list
5. **Enable** the plugin
6. If it was already enabled, **disable and re-enable it**

#### Step 3: Configure API Settings
1. In Obsidian Settings, find **"Sermo TTS Settings"**
2. Set your **API URL** (e.g., `http://localhost:8080/speech/synthesize`)
3. Adjust **timeout** (default: 10000ms) and **max retries** (default: 3) if needed

#### Step 4: Test Basic Functionality
1. **Create a test note** with some text:
   ```
   Hello world, this is a test.
   مرحبا بالعالم، هذا اختبار.
   Hola mundo, esto es una prueba.
   ```

2. **Select the English text**
3. **Open Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`)
4. **Type "speak"** and select "Speak selected text"
5. **You should hear**: The text spoken in English

#### Step 5: Test Language Detection
1. **Select the Arabic text** from your test note
2. **Run "Speak selected text"** command
3. **You should hear**: The text spoken in Arabic (Egyptian dialect)
4. **Check the notice**: Should show detected language

#### Step 6: Test Error Handling
1. **Stop your Sermo API server** (if running locally)
2. **Try to speak some text**
3. **You should see**: Error notices with retry attempts
4. **Restart your API server** and try again

### Development Workflow

#### Daily Development Loop
```bash
# 1. Pull latest changes
cd /path/to/your/obsidian-sermo-tts
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Start development build (watches for changes)
npm run dev

# 4. Make your changes to the code
# 5. Test in Obsidian (plugin rebuilds automatically)
# 6. Reload Obsidian if needed (Ctrl+R or Cmd+R)
```

#### Quick Update Script
Create this script for easy updates:

```bash
#!/bin/bash
echo "🔄 Updating Sermo TTS plugin..."
cd /path/to/your/obsidian-sermo-tts
git pull origin main
npm install
npm run build
echo "✅ Plugin updated! Reload Obsidian (Ctrl+R)"
```

### Debugging

#### Enable Developer Tools
1. In Obsidian, press `Ctrl+Shift+I` (or `Cmd+Shift+I`) to open Developer Tools
2. Check the **Console** tab for any errors
3. Look for messages starting with "Sermo TTS"

### Building for Distribution

```bash
# Create production build
npm run build

# Files will be in:
# - main.js (plugin code)
# - manifest.json (plugin metadata)
# - styles.css (if any)
```
