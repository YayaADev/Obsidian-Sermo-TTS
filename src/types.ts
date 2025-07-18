import { SynthesisRequest, SynthesisResponse, ErrorResponse } from '@yayaadev/sermo-models';

export interface SermoTTSSettings {
  apiUrl: string;
  timeout: number;
  maxRetries: number;
}

export interface TTSResponse {
  success: boolean;
  audioBlob?: Blob;
  error?: string;
  response?: SynthesisResponse;
}

export type { SynthesisRequest, SynthesisResponse, ErrorResponse };