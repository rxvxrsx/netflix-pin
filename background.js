// Credit: REVERSE
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

  if (message.action === 'getPlanInfo') {
    getPlanInfoFromAccount(sendResponse);
    return true;
  }

  if (message.action === 'goToBrowse') {
    openNetflixBrowse(sendResponse);
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

function getPlanInfoFromAccount(sendResponse) {
  chrome.tabs.query({url: ['https://*.netflix.com/account*', 'https://netflix.com/account*']}, (accountTabs) => {
    const accountTab = accountTabs[0];

    if (accountTab) {
      waitForTabAndGetPlanInfo(accountTab.id, sendResponse);
      return;
    }

    chrome.tabs.query({url: ['https://*.netflix.com/*', 'https://netflix.com/*']}, (netflixTabs) => {
      const netflixTab = netflixTabs[0];

      if (netflixTab) {
        chrome.tabs.update(netflixTab.id, {url: 'https://www.netflix.com/account'}, (updatedTab) => {
          if (chrome.runtime.lastError || !updatedTab) {
            sendResponse({
              status: 'error',
              message: chrome.runtime.lastError?.message || 'ไม่สามารถเปิดหน้า Netflix Account ได้'
            });
            return;
          }

          waitForTabAndGetPlanInfo(updatedTab.id, sendResponse);
        });
        return;
      }

      chrome.tabs.create({url: 'https://www.netflix.com/account', active: false}, (createdTab) => {
        if (chrome.runtime.lastError || !createdTab) {
          sendResponse({
            status: 'error',
            message: chrome.runtime.lastError?.message || 'ไม่สามารถเปิดหน้า Netflix Account ได้'
          });
          return;
        }

        waitForTabAndGetPlanInfo(createdTab.id, sendResponse);
      });
    });
  });
}

function waitForTabAndGetPlanInfo(tabId, sendResponse) {
  const sendPlanRequest = () => sendCommand(tabId, 'getPlanInfo', {}, sendResponse);

  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError || !tab) {
      sendResponse({
        status: 'error',
        message: chrome.runtime.lastError?.message || 'ไม่พบแท็บ Netflix Account'
      });
      return;
    }

    if (tab.status === 'complete') {
      sendPlanRequest();
      return;
    }

    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId !== tabId || changeInfo.status !== 'complete') return;

      chrome.tabs.onUpdated.removeListener(listener);
      sendPlanRequest();
    };

    chrome.tabs.onUpdated.addListener(listener);
  });
}

function openNetflixBrowse(sendResponse) {
  chrome.tabs.query({active: true, currentWindow: true}, (activeTabs) => {
    const activeNetflixTab = activeTabs.find((tab) => isNetflixUrl(tab.url));

    if (activeNetflixTab) {
      chrome.tabs.update(activeNetflixTab.id, {url: 'https://www.netflix.com/browse'}, (updatedTab) => {
        if (chrome.runtime.lastError || !updatedTab) {
          sendResponse({
            status: 'error',
            message: chrome.runtime.lastError?.message || 'ไม่สามารถเปิดหน้า Netflix Browse ได้'
          });
          return;
        }

        sendResponse({
          status: 'ok',
          tabId: updatedTab.id
        });
      });
      return;
    }

    chrome.tabs.query({url: ['https://*.netflix.com/*', 'https://netflix.com/*']}, (netflixTabs) => {
      const targetTab = netflixTabs[0];

      if (targetTab) {
        chrome.tabs.update(targetTab.id, {url: 'https://www.netflix.com/browse'}, (updatedTab) => {
          if (chrome.runtime.lastError || !updatedTab) {
            sendResponse({
              status: 'error',
              message: chrome.runtime.lastError?.message || 'ไม่สามารถเปิดหน้า Netflix Browse ได้'
            });
            return;
          }

          sendResponse({
            status: 'ok',
            tabId: updatedTab.id
          });
        });
        return;
      }

      chrome.tabs.create({url: 'https://www.netflix.com/browse', active: true}, (createdTab) => {
        if (chrome.runtime.lastError || !createdTab) {
          sendResponse({
            status: 'error',
            message: chrome.runtime.lastError?.message || 'ไม่สามารถเปิดหน้า Netflix Browse ได้'
          });
          return;
        }

        sendResponse({
          status: 'ok',
          tabId: createdTab.id
        });
      });
    });
  });
}

function sendCommand(tabId, command, payload, sendResponse) {
  chrome.tabs.sendMessage(tabId, {command, ...payload}, (contentResponse) => {
    if (chrome.runtime.lastError) {
      sendResponse({
        status: 'error',
        message: chrome.runtime.lastError.message
      });
      return;
    }

    if (command === 'getPlanInfo') {
      sendResponse(contentResponse || {
        status: 'error',
        message: 'ไม่ได้รับข้อมูลแพ็กเกจจากแท็บ Netflix'
      });
      return;
    }

    sendResponse({
      status: contentResponse?.status || 'error',
      tabId,
      currentPin: contentResponse?.currentPin,
      message: !contentResponse?.status ? 'ไม่ได้รับการตอบกลับจากแท็บ Netflix' : undefined
    });
  });
}
