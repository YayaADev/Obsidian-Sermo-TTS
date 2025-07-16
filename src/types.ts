export interface SermoTTSSettings {
  apiUrl: string;
  timeout: number;
  maxRetries: number;
}

export interface TTSResponse {
  success: boolean;
  audioBlob?: Blob;
  error?: string;
}

export interface TTSRequest {
  text: string;
}