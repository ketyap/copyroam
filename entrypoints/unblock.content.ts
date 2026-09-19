import { CONTENT_SCRIPT_MATCHES } from '@/utils/constants';

const BLOCKED_EVENTS = new Set(['copy', 'cut', 'paste', 'contextmenu', 'selectstart', 'mousedown']);
const BLOCKED_SHORTCUT_KEYS = new Set(['c', 'x', 'v', 'a']);
const NEUTRALIZED_HANDLER_PROPS = ['oncopy', 'oncut', 'onpaste', 'oncontextmenu', 'onselectstart', 'onmousedown'];

function neutralizePreventDefault() {
  const nativePreventDefault = Event.prototype.preventDefault;
  Event.prototype.preventDefault = function (this: Event) {
    if (BLOCKED_EVENTS.has(this.type)) return;
    return nativePreventDefault.call(this);
  };
}

function isBlockedShortcut(event: KeyboardEvent) {
  return (event.ctrlKey || event.metaKey) && BLOCKED_SHORTCUT_KEYS.has(event.key.toLowerCase());
}

function neutralizeBlockedShortcuts() {
  const nativeAddEventListener = EventTarget.prototype.addEventListener;
  for (const type of ['keydown', 'keyup']) {
    nativeAddEventListener.call(
      window,
      type,
      (event: Event) => {
        if (isBlockedShortcut(event as KeyboardEvent)) event.stopImmediatePropagation();
      },
      true,
    );
  }
}

function neutralizeInlineHandlers() {
  for (const target of [window, Window.prototype, Document.prototype, HTMLElement.prototype]) {
    for (const prop of NEUTRALIZED_HANDLER_PROPS) {
      try {
        Object.defineProperty(target, prop, {
          configurable: true,
          get: () => null,
          set: () => {},
        });
      } catch {}
    }
  }
}

function injectSelectableStyle() {
  const style = document.createElement('style');
  style.textContent = `
    *, *::before, *::after {
      -webkit-user-select: text !important;
      user-select: text !important;
      cursor: auto !important;
    }
  `;
  document.documentElement.append(style);
}

function forceSelectableStyles() {
  if (document.documentElement) {
    injectSelectableStyle();
    return;
  }

  const observer = new MutationObserver(() => {
    if (!document.documentElement) return;
    observer.disconnect();
    injectSelectableStyle();
  });
  observer.observe(document, { childList: true });
}

function main() {
  neutralizePreventDefault();
  neutralizeBlockedShortcuts();
  neutralizeInlineHandlers();
  forceSelectableStyles();
}

export default defineContentScript({
  matches: CONTENT_SCRIPT_MATCHES,
  allFrames: true,
  world: 'MAIN',
  runAt: 'document_start',
  registration: 'runtime',
  main,
});
