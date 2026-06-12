chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'start') {
    sendToNetflixTab('startAutoFill', {config: message.config}, sendResponse);
    return true;
  }

  if (message.action === 'stop') {
    sendToNetflixTab('stopAutoFill', {}, sendResponse);
    return true;
  }
});

function isNetflixUrl(url = '') {
  try {
    const hostname = new URL(url).hostname;
    return hostname === 'netflix.com' || hostname.endsWith('.netflix.com');
  } catch (error) {
    return false;
  }
}

function sendToNetflixTab(command, payload, sendResponse) {
  chrome.tabs.query({active: true, currentWindow: true}, (activeTabs) => {
    const activeNetflixTab = activeTabs.find((tab) => isNetflixUrl(tab.url));

    if (activeNetflixTab) {
      sendCommand(activeNetflixTab.id, command, payload, sendResponse);
      return;
    }

    chrome.tabs.query({url: ['https://*.netflix.com/*', 'https://netflix.com/*']}, (netflixTabs) => {
      const targetTab = netflixTabs[0];

      if (!targetTab) {
        sendResponse({
          status: 'no-target',
          message: 'ไม่พบแท็บ Netflix ที่เปิดอยู่'
        });
        return;
      }

      sendCommand(targetTab.id, command, payload, sendResponse);
    });
  });
}

function sendCommand(tabId, command, payload, sendResponse) {
  chrome.tabs.sendMessage(tabId, {command, ...payload}, () => {
    if (chrome.runtime.lastError) {
      sendResponse({
        status: 'error',
        message: chrome.runtime.lastError.message
      });
      return;
    }

    sendResponse({
      status: command === 'startAutoFill' ? 'started' : 'stopped',
      tabId
    });
  });
}
