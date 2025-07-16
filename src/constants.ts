export const CONSTANTS = {
  DEFAULT_API_URL: 'http://sermo.home/speech',
  REQUEST_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  MAX_PREVIEW_LENGTH: 50,
  COMMANDS: {
    SPEAK_SELECTION: 'speak-selection',
    SPEAK_CURRENT_LINE: 'speak-current-line'
  },
  MESSAGES: {
    NO_TEXT_SELECTED: 'No text selected',
    CURRENT_LINE_EMPTY: 'Current line is empty',
    SPEAKING_PREFIX: 'Speaking: ',
    RETRYING: 'Retrying...',
    FAILED_AFTER_RETRIES: 'Failed after multiple attempts'
  }
};