import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';
import { SermoTTSSettings } from './src/types';
import { CONSTANTS } from './src/constants';
import { SermoTTSService } from './src/tts-service';
import { SermoTTSSettingTab } from './src/settings-tab';

const DEFAULT_SETTINGS: SermoTTSSettings = {
  apiUrl: CONSTANTS.DEFAULT_API_URL,
  timeout: CONSTANTS.REQUEST_TIMEOUT,
  maxRetries: CONSTANTS.MAX_RETRIES
};

export default class SermoTTSPlugin extends Plugin {
  settings: SermoTTSSettings;
  private ttsService: SermoTTSService;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.ttsService = new SermoTTSService(this.settings);

    this.addCommand({
      id: CONSTANTS.COMMANDS.SPEAK_SELECTION,
      name: 'Speak selected text',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        const selectedText = editor.getSelection();
        if (selectedText.trim()) {
          this.handleSpeakText(selectedText);
        } else {
          new Notice(CONSTANTS.MESSAGES.NO_TEXT_SELECTED);
        }
      }
    });

    this.addCommand({
      id: CONSTANTS.COMMANDS.SPEAK_CURRENT_LINE,
      name: 'Speak current line',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        const cursor = editor.getCursor();
        const lineText = editor.getLine(cursor.line);
        if (lineText.trim()) {
          this.handleSpeakText(lineText);
        } else {
          new Notice(CONSTANTS.MESSAGES.CURRENT_LINE_EMPTY);
        }
      }
    });

    this.addSettingTab(new SermoTTSSettingTab(this.app, this));
  }

  onunload(): void {
    this.ttsService?.destroy();
  }

  private async handleSpeakText(text: string): Promise<void> {
    const preview = text.length > CONSTANTS.MAX_PREVIEW_LENGTH 
      ? text.substring(0, CONSTANTS.MAX_PREVIEW_LENGTH) + '...' 
      : text;
    
    new Notice(CONSTANTS.MESSAGES.SPEAKING_PREFIX + preview);
    
    const result = await this.ttsService.speak(text);
    
    if (!result.success) {
      new Notice(result.error || 'TTS request failed');
    }
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.ttsService?.updateSettings(this.settings);
  }
}