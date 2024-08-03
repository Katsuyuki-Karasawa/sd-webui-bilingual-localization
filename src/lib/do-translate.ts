import { getConfig, getI18n, getI18nScope, getScopedSource } from "../setup";
import { checkRegex } from "./check-regax";
import { htmlEncode } from "./html-encode";
import { parseHtmlStringToElement } from "./parse-html-string-to-element";

const re_num = /^[\.\d]+$/;
const re_emoji =
  // biome-ignore lint/suspicious/noMisleadingCharacterClass: <explanation>
  /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/u;

export function doTranslate(el, source, type) {
  if (!getI18n) return; // translation not ready.
  let trimmedSource = source.trim();
  if (!trimmedSource) return;
  if (re_num.test(trimmedSource)) return;
  if (re_emoji.test(trimmedSource)) return;

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
      el.textContent = trimmedSource; // restore original text if translation not exist
    if (el.nextSibling?.className === "bilingual__trans_wrapper")
      el.nextSibling.remove(); // remove exist translation if translation not exist
    return;
  }

  const config = getConfig();

  if (config?.order === "Original First") {
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

      const htmlEl = parseHtmlStringToElement(
        `<div class="bilingual__trans_wrapper">${htmlEncode(translation)}<em>${htmlEncode(source)}</em></div>`,
      );

      if (el.hasChildNodes()) {
        const textNode = Array.from(el.childNodes).find(
          (node) =>
            ((node as Text).nodeType === Node.TEXT_NODE && // Ensure it's a text node
              (node as Text).textContent?.trim() === trimmedSource) ||
            (node as Text).textContent?.trim() ===
              "__bilingual__will_be_replaced__",
        ) as Text | undefined;

        if (textNode) {
          textNode.textContent = "";
          if (
            textNode.nextSibling?.nodeType === Node.ELEMENT_NODE &&
            (textNode.nextSibling as HTMLElement).className ===
              "bilingual__trans_wrapper"
          ) {
            textNode.nextSibling.remove();
          }
          if (textNode.parentNode && htmlEl) {
            // Ensure htmlEl is not null
            textNode.parentNode.insertBefore(htmlEl, textNode.nextSibling);
          }
        }
      } else {
        el.textContent = "";
        if (
          el.nextSibling?.nodeType === Node.ELEMENT_NODE &&
          (el.nextSibling as HTMLElement).className ===
            "bilingual__trans_wrapper"
        ) {
          el.nextSibling.remove();
        }
        if (el.parentNode && htmlEl) {
          // Ensure htmlEl is not null
          el.parentNode.insertBefore(htmlEl, el.nextSibling);
        }
      }
      break;
    }

    case "option":
      el.textContent = isTranslationIncludeSource
        ? translation
        : `${translation} (${trimmedSource})`;
      break;

    case "title":
      el.title = isTranslationIncludeSource
        ? translation
        : `${translation}\n${trimmedSource}`;
      break;

    case "placeholder":
      el.placeholder = isTranslationIncludeSource
        ? translation
        : `${translation}\n\n${trimmedSource}`;
      break;

    default:
      return translation;
  }
}
