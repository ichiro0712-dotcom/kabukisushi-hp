
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  // Migrate old single-store localStorage keys to multi-store format
  (function migrateToMultiStore() {
    const MIGRATION_KEY = 'multi_store_migrated';
    if (localStorage.getItem(MIGRATION_KEY)) return;

    const oldKeys = [
      ['site_background_settings', 'ichiban_background_settings'],
      ['site_layout_settings', 'ichiban_layout_settings'],
      ['site_text_settings', 'ichiban_text_settings'],
    ];

    for (const [oldKey, newKey] of oldKeys) {
      const data = localStorage.getItem(oldKey);
      if (data) {
        localStorage.setItem(newKey, data);
      }
    }

    localStorage.setItem(MIGRATION_KEY, 'true');
  })();

  createRoot(document.getElementById("root")!).render(<App />);
  