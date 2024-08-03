export function gradioApp(): Document | ShadowRoot {
  const elems = document.getElementsByTagName("gradio-app");
  // @ts-ignore
  const elem: Document | HTMLElement = elems.length === 0 ? document : elems[0];

  if (elem !== document) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    (elem as any).getElementById = (id: string): HTMLElement | null =>
      document.getElementById(id);
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return (elem as any).shadowRoot ? (elem as any).shadowRoot : elem;
}

export function querySelector(
  ...args: Parameters<Document["querySelector"]>
): ReturnType<Document["querySelector"]> | null {
  return gradioApp()?.querySelector(...args) ?? null;
}

export function querySelectorAll(
  ...args: Parameters<Document["querySelectorAll"]>
): NodeListOf<Element> {
  const nodeList = gradioApp()?.querySelectorAll(...args);
  return nodeList || new NodeList();
}
