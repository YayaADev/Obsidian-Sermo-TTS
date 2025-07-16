import { Notice } from 'obsidian';
import { SermoTTSSettings, TTSResponse, TTSRequest } from './types';
import { CONSTANTS } from './constants';

export class SermoTTSService {
  private settings: SermoTTSSettings;
  private currentAudio: HTMLAudioElement | null = null;

  constructor(settings: SermoTTSSettings) {
    this.settings = settings;
  }

  updateSettings(settings: SermoTTSSettings): void {
    this.settings = settings;
  }

  async speak(text: string): Promise<TTSResponse> {
    this.stopCurrentAudio();
    
    for (let attempt = 1; attempt <= this.settings.maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(text);
        if (response.success && response.audioBlob) {
          await this.playAudio(response.audioBlob);
          return response;
        }
      } catch (error) {
        if (attempt === this.settings.maxRetries) {
          return {
            success: false,
            error: `${CONSTANTS.MESSAGES.FAILED_AFTER_RETRIES}: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        }
        
        if (attempt < this.settings.maxRetries) {
          new Notice(`${CONSTANTS.MESSAGES.RETRYING} (${attempt}/${this.settings.maxRetries})`);
          await this.delay(CONSTANTS.RETRY_DELAY * attempt);
        }
      }
    }
    
    return {
      success: false,
      error: CONSTANTS.MESSAGES.FAILED_AFTER_RETRIES
    };
  }

  private async makeRequest(text: string): Promise<TTSResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.settings.timeout);

    try {
      const requestBody: TTSRequest = { text };
      const response = await fetch(this.settings.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorMessage = this.getHttpErrorMessage(response.status);
        throw new Error(`${errorMessage} (${response.status})`);
      }

      const audioBlob = await response.blob();
      return {
        success: true,
        audioBlob
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out');
        }
        throw error;
      }
      
      throw new Error('Unknown error occurred');
    }
  }

  private async playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      this.currentAudio = new Audio(audioUrl);
      
      this.currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        resolve();
      };
      
      this.currentAudio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        reject(new Error('Audio playback failed'));
      };
      
      this.currentAudio.play().catch(error => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        reject(error);
      });
    });
  }

  private stopCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  private getHttpErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Bad request - check your text input';
      case 401:
        return 'Unauthorized - check your API credentials';
      case 403:
        return 'Forbidden - access denied';
      case 404:
        return 'API endpoint not found';
      case 429:
        return 'Too many requests - please wait';
      case 500:
        return 'Server error - please try again later';
      case 502:
        return 'Bad gateway - server temporarily unavailable';
      case 503:
        return 'Service unavailable - server is down';
      default:
        return 'Request failed';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  destroy(): void {
    this.stopCurrentAudio();
  }
}