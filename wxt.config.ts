import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Copyroam',
    description: 'Toggle to allow copy, cut, paste, right-click, and text selection on pages that block them.',
    permissions: ['scripting', 'storage'],
    icons: { 16: 'icon/off/16.png', 32: 'icon/off/32.png', 48: 'icon/off/48.png', 96: 'icon/off/96.png', 128: 'icon/off/128.png' },
    action: {},
  },
});
