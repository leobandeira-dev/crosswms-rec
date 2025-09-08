declare module 'quagga' {
  export interface QuaggaConfig {
    inputStream: {
      name: string;
      type: string;
      target?: HTMLElement | null;
      constraints?: {
        width: number;
        height: number;
        facingMode?: string;
      };
    };
    decoder: {
      readers: string[];
      debug?: {
        showCanvas?: boolean;
        showPatches?: boolean;
        showFoundPatches?: boolean;
        boxFromPatches?: {
          showTransformed?: boolean;
          showTransformedBox?: boolean;
          showBB?: boolean;
        };
      };
    };
    locate?: boolean;
  }

  export interface QuaggaResult {
    codeResult: {
      code: string;
      format: string;
    };
    line?: any;
    angle?: number;
    pattern?: any;
    box?: number[][];
  }

  export function init(config: QuaggaConfig, callback: (err?: any) => void): void;
  export function start(): void;
  export function stop(): void;
  export function onDetected(callback: (result: QuaggaResult) => void): void;
  export function offDetected(callback: (result: QuaggaResult) => void): void;
  export function decodeSingle(config: QuaggaConfig, callback: (result: QuaggaResult) => void): void;
}