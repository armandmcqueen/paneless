// Chrome Side Panel API (Chrome 114+, not in WebExtension polyfill)
declare namespace chrome {
  namespace sidePanel {
    function setPanelBehavior(options: {
      openPanelOnActionClick: boolean;
    }): Promise<void>;
  }
}

// Custom environment variables
interface ImportMetaEnv {
  readonly WXT_DEV_ANTHROPIC_API_KEY?: string;
}
