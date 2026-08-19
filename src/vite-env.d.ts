/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_OWNER?: string
  readonly VITE_GITHUB_REPO?: string
  readonly VITE_GITHUB_BRANCH?: string
}
