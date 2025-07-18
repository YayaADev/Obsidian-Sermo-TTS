import { Notice } from 'obsidian';
import { franc } from 'franc';
import { SermoTTSSettings, TTSResponse, SynthesisRequest, SynthesisResponse, ErrorResponse } from './types';
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

  private detectLanguage(text: string): string {
    const detectedLang = franc(text);
    
    // Handle Arabic - always use Egyptian dialect
    if (detectedLang === 'ara') {
      return 'ar-EG';
    }
    
    // Map other common language codes to proper locale codes
    const langMap: Record<string, string> = {
      'eng': 'en-US',
      'fra': 'fr-FR',
      'deu': 'de-DE',
      'spa': 'es-ES',
      'ita': 'it-IT',
      'por': 'pt-BR',
      'rus': 'ru-RU',
      'jpn': 'ja-JP',
      'kor': 'ko-KR',
      'cmn': 'zh-CN',
      'hin': 'hi-IN'
    };
    
    return langMap[detectedLang] || 'en-US'; // Default to English US
  }

  private async makeRequest(text: string): Promise<TTSResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.settings.timeout);

    try {
      const language = this.detectLanguage(text);
      const requestBody: SynthesisRequest = { 
        text,
        language
      };
      
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
        // Try to parse error response
        try {
          const errorResponse: ErrorResponse = await response.json();
          throw new Error(errorResponse.error?.message || this.getHttpErrorMessage(response.status));
        } catch {
          const errorMessage = this.getHttpErrorMessage(response.status);
          throw new Error(`${errorMessage} (${response.status})`);
        }
      }

      const synthesisResponse: SynthesisResponse = await response.json();
      
      // Convert base64 audio to blob
      const audioData = atob(synthesisResponse.audio);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { 
        type: `audio/${synthesisResponse.audioFormat}` 
      });
      
      return {
        success: true,
        audioBlob,
        response: synthesisResponse
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