'use strict';

chrome.action.onClicked.addListener(async () => {
  const gameUrl = chrome.runtime.getURL('index.html');
  try {
    const existingTabs = await chrome.tabs.query({ url: gameUrl });
    if (existingTabs.length > 0) {
      const targetTab = existingTabs[0];
      await chrome.tabs.update(targetTab.id, { active: true });
      if (typeof targetTab.windowId === 'number') {
        await chrome.windows.update(targetTab.windowId, { focused: true });
      }
      return;
    }
    await chrome.tabs.create({ url: gameUrl });
  } catch (err) {
    console.warn('Focusing existing game tab failed; opening new tab:', err);
    try {
      await chrome.tabs.create({ url: gameUrl });
    } catch (createErr) {
      console.error('Failed to open Pelican on a Bike tab:', createErr);
    }
  }
});
