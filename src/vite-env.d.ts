/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_ENDPOINT?: string
  // more env variables can be added here in the future
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}