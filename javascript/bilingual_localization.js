// src/config/opts.ts
var opts = {
  bilingual_localization_enabled: true,
  bilingual_localization_logger: false,
  bilingual_localization_file: "None",
  bilingual_localization_dirs: "{}",
  bilingual_localization_order: "Translation First"
};

// src/lib/create-logger.ts
function createLogger() {
  const loggerTimerMap = new Map;
  const loggerConf = { badge: true, label: "Logger", enable: false };
  return new Proxy(console, {
    get: (target, propKey) => {
      if (propKey === "init") {
        return (label) => {
          loggerConf.label = label;
          loggerConf.enable = true;
        };
      }
      if (!(propKey in target))
        return;
      return (...args) => {
        if (!loggerConf.enable)
          return;
        let color = ["#39cfe1", "#006cab"];
        let label;
        let start;
        switch (propKey) {
          case "error":
            color = ["#f70000", "#a70000"];
            break;
          case "warn":
            color = ["#f7b500", "#b58400"];
            break;
          case "time":
            label = args[0];
            if (loggerTimerMap.has(label)) {
              console.warn(`Timer '${label}' already exists`);
            } else {
              loggerTimerMap.set(label, performance.now());
            }
            return;
          case "timeEnd":
            label = args[0];
            start = loggerTimerMap.get(label);
            if (start === undefined) {
              console.warn(`Timer '${label}' does not exist`);
            } else {
              loggerTimerMap.delete(label);
              console.log(`${label}: ${performance.now() - start} ms`);
            }
            return;
          case "groupEnd":
            loggerConf.badge = true;
            break;
        }
        const badge = loggerConf.badge ? [
          `%c${loggerConf.label}`,
          `color: #fff; background: linear-gradient(180deg, ${color[0]}, ${color[1]}); text-shadow: 0px 0px 1px #0003; padding: 3px 5px; border-radius: 4px;`
        ] : [];
        target[propKey](...badge, ...args);
        if (propKey === "group" || propKey === "groupCollapsed") {
          loggerConf.badge = false;
        }
      };
    }
  });
}

// src/lib/get-regax.ts
function getRegex(regexString) {
  try {
    const trimmedRegexString = regexString.trim();
    if (!trimmedRegexString.startsWith("/") || trimmedRegexString.split("/").length < 3) {
      const escapedRegexString = trimmedRegexString.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(escapedRegexString);
    }
    const lastSlashIndex = trimmedRegexString.lastIndexOf("/");
    const regexPattern = trimmedRegexString.slice(1, lastSlashIndex);
    const regexFlags = trimmedRegexString.slice(lastSlashIndex + 1);
    return new RegExp(regexPattern, regexFlags);
  } catch (e) {
    return null;
  }
}

// src/lib/delegate-event.ts
function delegateEvent(parent, eventType, selector, handler) {
  parent.addEventListener(eventType, (event) => {
    let target = event.target;
    while (target !== parent) {
      if (target.matches(selector)) {
        handler.call(target, event);
      }
      target = target.parentNode;
    }
  });
}

// src/lib/gradio-app.ts
function gradioApp() {
  const elems = document.getElementsByTagName("gradio-app");
  const elem = elems.length === 0 ? document : elems[0];
  if (elem !== document) {
    elem.getElementById = (id) => document.getElementById(id);
  }
  return elem.shadowRoot ? elem.shadowRoot : elem;
}
function querySelectorAll(...args) {
  const nodeList = gradioApp()?.querySelectorAll(...args);
  return nodeList || new NodeList;
}

// src/lib/handle-dropdown.ts
function handleDropdown() {
  delegateEvent(gradioApp(), "mousedown", "ul.options .item", (event) => {
    const { target } = event;
    if (!target.classList.contains("item")) {
      target.closest(".item").dispatchEvent(new Event("mousedown", { bubbles: true }));
      return;
    }
    const source = target.dataset.value;
    const $labelEl = target?.closest(".wrap")?.querySelector(".wrap-inner .single-select");
    if (source && $labelEl) {
      $labelEl.title = titles?.[source] || "";
      $labelEl.textContent = "__biligual__will_be_replaced__";
      doTranslate($labelEl, source, "element");
    }
  });
}

// src/lib/read-files.ts
function readFile(filePath) {
  const request = new XMLHttpRequest;
  request.open("GET", `file=${filePath}`, false);
  request.send(null);
  return request.responseText;
}

// src/lib/translate-el.ts
function translateEl(el, { deep = false, rich = false } = {}) {
  if (!getI18n)
    return;
  if (el.matches?.(ignore_selector))
    return;
  if (el.title) {
    doTranslate(el, el.title, "title");
  }
  if (el.placeholder && getConfig()?.enableTransPlaceHolder === true) {
    doTranslate(el, el.placeholder, "placeholder");
  }
  if (el.tagName === "OPTION") {
    doTranslate(el, el.textContent, "option");
  }
  if (deep || rich) {
    Array.from(el.childNodes).forEach((node) => {
      if (node.nodeName === "#text") {
        if (rich) {
          doTranslate(node, node.textContent, "text");
          return;
        }
        if (deep) {
          doTranslate(node, node.textContent, "element");
        }
      } else if (node.childNodes.length > 0) {
        translateEl(node, { deep, rich });
      }
    });
  } else {
    doTranslate(el, el.textContent, "element");
  }
}
var ignore_selector = [
  ".bilingual__trans_wrapper",
  ".resultsFlexContainer",
  "#setting_sd_model_checkpoint select",
  "#setting_sd_vae select",
  "#txt2img_styles, #img2txt_styles",
  ".extra-network-cards .card .actions .name",
  "script, style, svg, g, path",
  "svg *, canvas, canvas *",
  "#txt2img_prompt_container, #img2img_prompt_container, .physton-prompt",
  "#txt2img_prompt_container *, #img2img_prompt_container *, .physton-prompt *",
  ".progressDiv, .progress, .progress-text",
  ".progressDiv *, .progress *, .progress-text *"
];

// src/lib/tranlate-page.ts
function translatePage() {
  if (!getI18n())
    return;
  const logger = createLogger();
  logger.time("Full Page");
  const majorSelectors = [
    "label span, fieldset span, button",
    "textarea[placeholder], select, option",
    ".transition > div > span:not([class])",
    ".label-wrap > span",
    ".gradio-image>div.float",
    ".gradio-file>div.float",
    ".gradio-code>div.float",
    "#modelmerger_interp_description .output-html",
    "#modelmerger_interp_description .gradio-html",
    "#lightboxModal span"
  ];
  const minorSelectors = [
    'div[data-testid="image"] > div > div',
    "#extras_image_batch > div",
    ".output-html:not(#footer), .gradio-html:not(#footer), .output-markdown, .gradio-markdown",
    "#dynamic-prompting"
  ];
  majorSelectors.forEach((selector) => {
    querySelectorAll(selector).forEach((el) => translateEl(el, { deep: true }));
  });
  minorSelectors.forEach((selector) => {
    querySelectorAll(selector).forEach((el) => translateEl(el, { rich: true }));
  });
  logger.timeEnd("Full Page");
}

// src/setup.ts
function setup3() {
  config = {
    enabled: opts.bilingual_localization_enabled,
    file: opts.bilingual_localization_file,
    dirs: opts.bilingual_localization_dirs,
    order: opts.bilingual_localization_order,
    enableLogger: opts.bilingual_localization_logger
  };
  const { enabled, file, dirs, enableLogger } = config;
  if (!enabled || file === "None" || dirs === "None")
    return;
  const dirsParsed = JSON.parse(dirs);
  const logger = createLogger();
  if (enableLogger) {
    logger.init("Bilingual");
  }
  logger.log("Bilingual Localization initialized.");
  const regex_scope = /^##(?<scope>.+)##(?<skey>.+)$/;
  i18n = JSON.parse(readFile(dirsParsed[file]), (key, value) => {
    if (key.startsWith("@@")) {
      const regex = getRegex(key.slice(2));
      if (regex instanceof RegExp) {
        i18nRegex.set(regex, value);
      }
    } else {
      const match = key.match(regex_scope);
      if (match?.groups) {
        let { scope, skey } = match.groups;
        if (scope.startsWith("@")) {
          scope = scope.slice(1);
        } else {
          scope = `#${scope}`;
        }
        if (!scope.length) {
          return value;
        }
        i18nScope[scope] ||= {};
        i18nScope[scope][skey] = value;
        scopedSource[skey] ||= [];
        scopedSource[skey].push(scope);
      } else {
        return value;
      }
    }
  });
  translatePage();
  handleDropdown();
}
function getI18n() {
  return i18n;
}
function getI18nRegex() {
  return i18nRegex;
}
function getI18nScope() {
  return i18nScope;
}
function getScopedSource() {
  return scopedSource;
}
function getConfig() {
  return config;
}
var i18n = null;
var i18nRegex = new Map;
var i18nScope = {};
var scopedSource = {};
var config = null;

// src/lib/check-regax.ts
function checkRegex(source) {
  const i18nRegex2 = getI18nRegex();
  for (const [regex, value] of i18nRegex2.entries()) {
    if (regex instanceof RegExp) {
      if (regex.test(source)) {
        const logger = createLogger();
        logger.log("regex", regex, source, value);
        return source.replace(regex, value);
      }
    } else {
      console.warn("Expected regex to be an instance of RegExp, but it was a string.");
    }
  }
  return source;
}

// src/lib/html-encode.ts
function htmlEncode(htmlStr) {
  return htmlStr.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// src/lib/parse-html-string-to-element.ts
function parseHtmlStringToElement(htmlStr) {
  const template = document.createElement("template");
  template.insertAdjacentHTML("afterbegin", htmlStr);
  return template.firstElementChild;
}

// src/lib/do-translate.ts
function doTranslate(el, source, type) {
  if (!getI18n)
    return;
  let trimmedSource = source.trim();
  if (!trimmedSource)
    return;
  if (re_num.test(trimmedSource))
    return;
  if (re_emoji.test(trimmedSource))
    return;
  let translation = getI18n[trimmedSource] || checkRegex(trimmedSource);
  const scopes = getScopedSource[trimmedSource];
  if (scopes) {
    console.log("scope", el, trimmedSource, scopes);
    for (const scope of scopes) {
      if (el.parentElement.closest(scope)) {
        translation = getI18nScope[scope][trimmedSource];
        break;
      }
    }
  }
  if (!translation || trimmedSource === translation) {
    if (el.textContent === "__biligual__will_be_replaced__")
      el.textContent = trimmedSource;
    if (el.nextSibling?.className === "bilingual__trans_wrapper")
      el.nextSibling.remove();
    return;
  }
  const config2 = getConfig();
  if (config2?.order === "Original First") {
    [trimmedSource, translation] = [translation, trimmedSource];
  }
  const isTranslationIncludeSource = translation.startsWith(source);
  switch (type) {
    case "text":
      el.textContent = translation;
      break;
    case "element": {
      if (isTranslationIncludeSource) {
        if (el.nodeType === 3) {
          el.nodeValue = translation;
        } else if (htmlEncode(el.textContent) === el.innerHTML) {
          el.innerHTML = htmlEncode(translation);
        }
        break;
      }
      const htmlEl = parseHtmlStringToElement(`<div class="bilingual__trans_wrapper">${htmlEncode(translation)}<em>${htmlEncode(source)}</em></div>`);
      if (el.hasChildNodes()) {
        const textNode = Array.from(el.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === trimmedSource || node.textContent?.trim() === "__bilingual__will_be_replaced__");
        if (textNode) {
          textNode.textContent = "";
          if (textNode.nextSibling?.nodeType === Node.ELEMENT_NODE && textNode.nextSibling.className === "bilingual__trans_wrapper") {
            textNode.nextSibling.remove();
          }
          if (textNode.parentNode && htmlEl) {
            textNode.parentNode.insertBefore(htmlEl, textNode.nextSibling);
          }
        }
      } else {
        el.textContent = "";
        if (el.nextSibling?.nodeType === Node.ELEMENT_NODE && el.nextSibling.className === "bilingual__trans_wrapper") {
          el.nextSibling.remove();
        }
        if (el.parentNode && htmlEl) {
          el.parentNode.insertBefore(htmlEl, el.nextSibling);
        }
      }
      break;
    }
    case "option":
      el.textContent = isTranslationIncludeSource ? translation : `${translation} (${trimmedSource})`;
      break;
    case "title":
      el.title = isTranslationIncludeSource ? translation : `${translation}\n${trimmedSource}`;
      break;
    case "placeholder":
      el.placeholder = isTranslationIncludeSource ? translation : `${translation}\n\n${trimmedSource}`;
      break;
    default:
      return translation;
  }
}
var re_num = /^[\.\d]+$/;
var re_emoji = /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/u;

// src/init.ts
function init() {
  const styleEl = document.createElement("style");
  if (styleEl.textContent) {
    styleEl.textContent = customCSS;
  } else {
    styleEl.appendChild(document.createTextNode(customCSS));
  }
  gradioApp().appendChild(styleEl);
  let loaded = false;
  let _count = 0;
  const observer = new MutationObserver((mutations) => {
    if (window.localization && Object.keys(window.localization).length)
      return;
    if (Object.keys(opts).length === 0)
      return;
    let _nodesCount = 0;
    const _now = performance.now();
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        if (mutation.target?.parentElement?.parentElement?.tagName === "LABEL") {
          translateEl(mutation.target);
        }
      } else if (mutation.type === "attributes") {
        _nodesCount++;
        translateEl(mutation.target);
      } else {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element && node.className === "bilingual__trans_wrapper")
            return;
          _nodesCount++;
          if (node.nodeType === 1 && node instanceof Element && /(output|gradio)-(html|markdown)/.test(node.className)) {
            translateEl(node, { rich: true });
          } else if (node.nodeType === 3) {
            doTranslate(node, node.textContent, "text");
          } else {
            translateEl(node, { deep: true });
          }
        });
      }
    }
    if (_nodesCount > 0) {
      const logger = createLogger();
      logger.info(`UI Update #${_count++}: ${performance.now() - _now} ms, ${_nodesCount} nodes`, mutations);
    }
    if (loaded)
      return;
    const i18n2 = getI18n();
    if (i18n2)
      return;
    loaded = true;
    setup3();
  });
  observer.observe(gradioApp(), {
    characterData: true,
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["title", "placeholder"]
  });
}
var customCSS = `
    .bilingual__trans_wrapper {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    font-size: var(--section-header-text-size);
    line-height: 1;
    }

    .bilingual__trans_wrapper em {
    font-style: normal;
    }

    #txtimg_hr_finalres .bilingual__trans_wrapper em,
    #tab_ti .output-html .bilingual__trans_wrapper em,
    #tab_ti .gradio-html .bilingual__trans_wrapper em,
    #sddp-dynamic-prompting .gradio-html .bilingual__trans_wrapper em,
    #available_extensions .extension-tag .bilingual__trans_wrapper em,
    #available_extensions .date_added .bilingual__trans_wrapper em,
    #available_extensions+p>.bilingual__trans_wrapper em,
    .gradio-image div[data-testid="image"] .bilingual__trans_wrapper em {
    display: none;
    }

    #settings .bilingual__trans_wrapper:not(#settings .tabitem .bilingual__trans_wrapper),
    label>span>.bilingual__trans_wrapper,
    fieldset>span>.bilingual__trans_wrapper,
    .label-wrap>span>.bilingual__trans_wrapper,
    .w-full>span>.bilingual__trans_wrapper,
    .context-menu-items .bilingual__trans_wrapper,
    .single-select .bilingual__trans_wrapper, ul.options .inner-item + .bilingual__trans_wrapper,
    .output-html .bilingual__trans_wrapper:not(th .bilingual__trans_wrapper),
    .gradio-html .bilingual__trans_wrapper:not(th .bilingual__trans_wrapper, .posex_cont .bilingual__trans_wrapper),
    .output-markdown .bilingual__trans_wrapper,
    .gradio-markdown .bilingual__trans_wrapper,
    .gradio-image>div.float .bilingual__trans_wrapper,
    .gradio-file>div.float .bilingual__trans_wrapper,
    .gradio-code>div.float .bilingual__trans_wrapper,
    .posex_setting_cont .bilingual__trans_wrapper:not(.posex_bg .bilingual__trans_wrapper), /* Posex extension */
    #dynamic-prompting .bilingual__trans_wrapper
    {
    align-items: flex-start;
    }

    #extensions label .bilingual__trans_wrapper,
    #available_extensions td .bilingual__trans_wrapper,
    .label-wrap>span>.bilingual__trans_wrapper {
    font-size: inherit;
    line-height: inherit;
    }

    .label-wrap>span:first-of-type {
    font-size: 13px;
    line-height: 1;
    }

    #txt2img_script_container > div {
    margin-top: var(--layout-gap, 12px);
    }

    textarea::placeholder {
    line-height: 1;
    padding: 4px 0;
    }

    label>span {
    line-height: 1;
    }

    div[data-testid="image"] .start-prompt {
    background-color: rgba(255, 255, 255, .6);
    color: #222;
    transition: opacity .2s ease-in-out;
    }
    div[data-testid="image"]:hover .start-prompt {
    opacity: 0;
    }

    .label-wrap > span.icon {
    width: 1em;
    height: 1em;
    transform-origin: center center;
    }

    .gradio-dropdown ul.options li.item {
    padding: 0.3em 0.4em !important;
    }

    /* Posex extension */
    .posex_bg {
    white-space: nowrap;
    }
    `;

// src/main.ts
document.addEventListener("DOMContentLoaded", init);
