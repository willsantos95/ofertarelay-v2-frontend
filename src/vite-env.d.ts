/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_PLAN_NAME: string;
  readonly VITE_PLAN_AMOUNT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
