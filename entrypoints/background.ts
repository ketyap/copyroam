import { CONTENT_SCRIPT_ID, CONTENT_SCRIPT_MATCHES } from '@/utils/constants';

const ICON_PATHS = {
  enabled: { 16: 'icon/on/16.png', 32: 'icon/on/32.png', 48: 'icon/on/48.png', 96: 'icon/on/96.png', 128: 'icon/on/128.png' },
  disabled: { 16: 'icon/off/16.png', 32: 'icon/off/32.png', 48: 'icon/off/48.png', 96: 'icon/off/96.png', 128: 'icon/off/128.png' },
};

async function getEnabled(): Promise<boolean> {
  const { enabled } = await browser.storage.local.get('enabled');
  return Boolean(enabled);
}

async function setEnabled(enabled: boolean) {
  await browser.storage.local.set({ enabled });
}

async function updateActionAppearance(enabled: boolean) {
  await browser.action.setIcon({ path: enabled ? ICON_PATHS.enabled : ICON_PATHS.disabled });
  await browser.action.setTitle({
    title: enabled ? 'Copyroam: ON (click to disable)' : 'Copyroam: OFF (click to enable)',
  });
}

async function registerContentScript() {
  const registered = await browser.scripting.getRegisteredContentScripts({ ids: [CONTENT_SCRIPT_ID] });
  if (registered.length > 0) return;

  await browser.scripting.registerContentScripts([
    {
      id: CONTENT_SCRIPT_ID,
      js: ['content-scripts/unblock.js'],
      matches: CONTENT_SCRIPT_MATCHES,
      allFrames: true,
      world: 'MAIN',
      runAt: 'document_start',
      persistAcrossSessions: true,
    },
  ]);
}

async function unregisterContentScript() {
  const registered = await browser.scripting.getRegisteredContentScripts({ ids: [CONTENT_SCRIPT_ID] });
  if (registered.length === 0) return;

  await browser.scripting.unregisterContentScripts({ ids: [CONTENT_SCRIPT_ID] });
}

async function applyState(enabled: boolean) {
  await (enabled ? registerContentScript() : unregisterContentScript());
  await updateActionAppearance(enabled);
}

async function toggle(tabId: number | undefined) {
  const enabled = !(await getEnabled());
  await setEnabled(enabled);
  await applyState(enabled);
  if (tabId != null) {
    await browser.tabs.reload(tabId);
  }
}

async function syncState() {
  await applyState(await getEnabled());
}

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(syncState);
  browser.runtime.onStartup.addListener(syncState);

  browser.action.onClicked.addListener((tab) => {
    toggle(tab.id).catch(console.error);
  });
});
