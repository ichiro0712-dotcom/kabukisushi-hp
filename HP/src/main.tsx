
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  // 昔の作りでブラウザに残した設定のコピーを消す。
  // 今はDBだけを見るので使っていないが、残っていると古いメニュー（別の店の内容のこともある）が
  // 端末に溜まったままになる。2026-07-13 の「端末によって店が入れ替わって見える」の元になったデータ。
  (function removeOldSettingsCache() {
    try {
      for (const store of ['site', 'honten', 'ichiban']) {
        for (const kind of ['background', 'layout', 'text']) {
          localStorage.removeItem(`${store}_${kind}_settings`);
        }
      }
      localStorage.removeItem('multi_store_migrated');
    } catch {
      // プライベートモードなどで使えない時は何もしない
    }
  })();

  createRoot(document.getElementById("root")!).render(<App />);
