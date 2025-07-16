import { App, PluginSettingTab, Setting } from 'obsidian';
import { SermoTTSSettings } from './types';
import { CONSTANTS } from './constants';
import SermoTTSPlugin from '../main';

export class SermoTTSSettingTab extends PluginSettingTab {
  plugin: SermoTTSPlugin;

  constructor(app: App, plugin: SermoTTSPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Sermo TTS Settings' });

    new Setting(containerEl)
      .setName('API URL')
      .setDesc('URL of your Sermo TTS API endpoint')
      .addText(text => text
        .setPlaceholder(CONSTANTS.DEFAULT_API_URL)
        .setValue(this.plugin.settings.apiUrl)
        .onChange(async (value: string) => {
          this.plugin.settings.apiUrl = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Request Timeout')
      .setDesc('Timeout for API requests in milliseconds')
      .addText(text => text
        .setPlaceholder(CONSTANTS.REQUEST_TIMEOUT.toString())
        .setValue(this.plugin.settings.timeout.toString())
        .onChange(async (value: string) => {
          const timeout = parseInt(value, 10);
          if (!isNaN(timeout) && timeout > 0) {
            this.plugin.settings.timeout = timeout;
            await this.plugin.saveSettings();
          }
        }));

    new Setting(containerEl)
      .setName('Max Retries')
      .setDesc('Maximum number of retry attempts for failed requests')
      .addText(text => text
        .setPlaceholder(CONSTANTS.MAX_RETRIES.toString())
        .setValue(this.plugin.settings.maxRetries.toString())
        .onChange(async (value: string) => {
          const retries = parseInt(value, 10);
          if (!isNaN(retries) && retries >= 0) {
            this.plugin.settings.maxRetries = retries;
            await this.plugin.saveSettings();
          }
        }));
  }
}