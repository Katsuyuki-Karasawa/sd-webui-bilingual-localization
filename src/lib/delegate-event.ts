export function delegateEvent(parent, eventType, selector, handler) {
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
