/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_DESCRIPTION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}