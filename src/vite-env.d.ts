/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMOB_APP_ID?: string;
  readonly VITE_ADMOB_BANNER_AD_UNIT_ID?: string;
  readonly VITE_AGORA_APP_ID?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
