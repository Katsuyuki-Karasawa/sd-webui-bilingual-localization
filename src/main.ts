import { init } from "./init";
interface I18n {
  [key: string]: string;
}

interface I18nScope {
  [scope: string]: I18n;
}

interface ScopedSource {
  [source: string]: string[];
}

interface Config {
  enabled: boolean;
  file: string;
  dirs: string[];
  order: string;
  enableLogger: boolean;
}

const i18n: I18n | null = null;
const i18nRegex: Map<RegExp, string> = new Map();
const i18nScope: I18nScope = {};
const scopedSource: ScopedSource = {};
const config: Config | null = null;

// DOMContentLoaded イベント発生後に初期化処理を実行
document.addEventListener("DOMContentLoaded", () => {
  init();
});
