const TTD_STORAGE_KEY = 'ttd_static_v8';
const TTD_SYNC_ENDPOINT = 'https://jciqwdzuptvmwdmmqdaj.supabase.co/functions/v1/ticktickduck-sync';

(function initTickTickDuckCloudSync() {
  let syncTimer = null;
  let lastSyncedValue = null;
  const originalSetItem = localStorage.setItem.bind(localStorage);

  function loadApp() {
    const script = document.createElement('script');
    script.src = 'app.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function isUsablePayload(payload) {
    return payload && typeof payload === 'object' && !Array.isArray(payload) && Object.keys(payload).length > 0;
  }

  async function fetchWithTimeout(url, options = {}, timeoutMs = 1500) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  }

  async function loadCloudState() {
    try {
      const res = await fetchWithTimeout(TTD_SYNC_ENDPOINT, { method: 'GET', cache: 'no-store' });
      if (!res.ok) throw new Error('Cloud load failed: ' + res.status);
      const data = await res.json();
      if (isUsablePayload(data.payload)) {
        const cloudValue = JSON.stringify(data.payload);
        originalSetItem(TTD_STORAGE_KEY, cloudValue);
        lastSyncedValue = cloudValue;
      }
    } catch (error) {
      console.warn('[Tick Tick Duck] Cloud load skipped, using local data.', error);
    }
  }

  async function pushCloudState(value) {
    if (!value || value === lastSyncedValue) return;

    let payload;
    try {
      payload = JSON.parse(value);
    } catch (error) {
      console.warn('[Tick Tick Duck] Cloud sync skipped invalid JSON.', error);
      return;
    }

    try {
      const res = await fetch(TTD_SYNC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });
      if (!res.ok) throw new Error('Cloud save failed: ' + res.status);
      lastSyncedValue = value;
    } catch (error) {
      console.warn('[Tick Tick Duck] Cloud save failed; local data remains saved.', error);
    }
  }

  function scheduleCloudSync(value) {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => pushCloudState(value), 700);
  }

  function installAutoSync() {
    localStorage.setItem = function setItemWithCloudSync(key, value) {
      originalSetItem(key, value);
      if (key === TTD_STORAGE_KEY) scheduleCloudSync(value);
    };

    window.ttdSyncNow = function ttdSyncNow() {
      return pushCloudState(localStorage.getItem(TTD_STORAGE_KEY));
    };
  }

  loadCloudState().finally(() => {
    installAutoSync();
    loadApp();
  });
})();
