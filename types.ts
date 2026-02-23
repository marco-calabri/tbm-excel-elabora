
export enum FileSuffix {
  PRT = 'PRT_COMPILATO',
  STR = 'STR_COMPILATO'
}

export interface ProcessingOptions {
  baseFileName: string;
  suffix: FileSuffix;
  deleteFirstRow: boolean;
}

export interface ProcessingResult {
  success: boolean;
  message: string;
  error?: string;
}
