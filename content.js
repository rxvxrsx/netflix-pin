console.log('Netflix PIN Auto-Fill content.js loaded');

function formatPin(num) {
  return num.toString().padStart(4, '0');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sendStatus(message, pinString = null) {
  try {
    chrome.runtime.sendMessage({action: 'statusUpdate', status: message, pinString});
  } catch (error) {
    console.warn('ไม่สามารถส่งสถานะไป popup ได้', error);
  }
}

function startAutoFillRoutine(config = {}) {
  if (window.isRunning) {
    sendStatus('โปรแกรมกำลังทำงานอยู่แล้ว', formatPin(window.currentPin || 0));
    return;
  }

  const startPin = Number.isFinite(Number(config.startPin)) ? parseInt(config.startPin, 10) : 0;
  window.currentPin = Math.min(Math.max(isNaN(startPin) ? 0 : startPin, 0), 9999);
  const sortOrder = config.sortOrder === 'desc' ? 'desc' : 'asc';
  const pinStep = sortOrder === 'desc' ? -1 : 1;
  window.isRunning = true;
  sendStatus(`เริ่มทำงานจาก PIN: ${formatPin(window.currentPin)} (${getSortOrderLabel(sortOrder)})`, formatPin(window.currentPin));

  let keyDelay = Number.isFinite(Number(config.keyDelay)) ? parseInt(config.keyDelay, 10) : 80;
  let codeDelay = Number.isFinite(Number(config.codeDelay)) ? parseInt(config.codeDelay, 10) : 120;
  keyDelay = Math.max(10, isNaN(keyDelay) ? 80 : keyDelay);
  codeDelay = Math.max(10, isNaN(codeDelay) ? 120 : codeDelay);

  async function simulateHumanType(element, text) {
    if (!element) return;

    console.log(`พิมพ์: ${text} ลงใน element`);

    element.value = '';
    element.dispatchEvent(new Event('focus', { bubbles: true }));

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      element.value += char;

      const keyEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: char,
        code: `Digit${char}`,
        keyCode: char.charCodeAt(0),
        which: char.charCodeAt(0)
      });
      element.dispatchEvent(keyEvent);
      element.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, key: char }));
      element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: char }));
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(keyDelay);
    }

    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  async function startAutoFill() {
    const INPUT_SELECTORS = [
      'input[data-uia="login-pin-input"]',
      '.pin-input',
      '.pin-number-input',
      'input[type="password"]',
      'input[type="number"]',
      'input[maxlength="4"]',
      'input[aria-label*="PIN"]',
      'input[aria-label*="pin"]'
    ];

    while (isPinInRange(window.currentPin) && window.isRunning) {
      const pinString = formatPin(window.currentPin);
      console.log(`รอบที่ ${window.currentPin}: กำลังทดลองรหัส ${pinString}`);
      sendStatus(`กำลังทดลองรหัส PIN: ${pinString}`, pinString);

      let pinInputs = [];
      for (let selector of INPUT_SELECTORS) {
        pinInputs = document.querySelectorAll(selector);
        if (pinInputs.length > 0) {
          console.log(`พบ ${pinInputs.length} input fields ด้วย selector: ${selector}`);
          break;
        }
      }

      if (pinInputs.length === 0) {
        console.log('ไม่พบช่องกรอก PIN - หน้าเว็บอาจเปลี่ยนไปแล้ว');
        sendStatus('ไม่พบช่องกรอก PIN บนหน้า Netflix', pinString);
        window.isRunning = false;
        break;
      }

      if (pinInputs.length === 1) {
        await simulateHumanType(pinInputs[0], pinString);
      } else if (pinInputs.length >= 4) {
        for (let i = 0; i < 4; i++) {
          await simulateHumanType(pinInputs[i], pinString[i]);
          await sleep(keyDelay);
        }
      }

      console.log('พิมพ์ PIN เสร็จแล้ว แต่ยังไม่กด submit ตามคำขอ');
      await sleep(codeDelay);

      const errorDialog = document.querySelector('.error-message, [data-uia*="error"], .pin-error-message');
      const nextPinInputs = document.querySelectorAll(INPUT_SELECTORS.join(','));

      if (nextPinInputs.length === 0 && !errorDialog) {
        console.log(`เจอ PIN ถูกต้อง: ${pinString}`);
        sendStatus(`เจอ PIN ถูกต้อง: ${pinString}`, pinString);
        window.isRunning = false;
        break;
      }

      if (errorDialog) {
        console.log(`PIN ผิด: ${pinString} - ลองตัวถัดไป`);
      } else {
        console.log('หน้าเปลี่ยนไม่ทันหรือยังไม่แจ้งผล; ยังคงลองต่อ');
      }

      window.currentPin += pinStep;
    }

    if (!isPinInRange(window.currentPin)) {
      console.log('ลองครบทุก PIN ตามลำดับที่เลือกแล้ว');
      sendStatus('ลองครบทุก PIN แล้ว');
      window.isRunning = false;
    }
  }

  startAutoFill();
}

function isPinInRange(pin) {
  return pin >= 0 && pin <= 9999;
}

function getSortOrderLabel(sortOrder) {
  return sortOrder === 'desc' ? 'มากไปน้อย' : 'น้อยไปมาก';
}

function stopAutoFillRoutine() {
  window.isRunning = false;
  console.log('หยุดโปรแกรม');
  sendStatus('หยุดการทำงานแล้ว');
}

function getVisibleText(element) {
  if (!element) return '';

  const clone = element.cloneNode(true);
  clone.querySelectorAll('script, style, noscript').forEach(node => node.remove());
  return (clone.innerText || clone.textContent || '').replace(/\s+/g, ' ').trim();
}

function collectPlanTexts() {
  const selectors = [
    '[data-uia*="plan" i]',
    '[class*="plan" i]',
    '[id*="plan" i]',
    '[aria-label*="plan" i]',
    '[aria-label*="แพ็กเกจ" i]'
  ];

  return Array.from(document.querySelectorAll(selectors.join(',')))
    .map(getVisibleText)
    .filter(text => text.length >= 3 && text.length <= 300);
}

function collectVisibleTexts() {
  const candidates = new Set();
  const selectors = [
    'h1',
    'h2',
    'h3',
    'p',
    'span',
    'div',
    'button',
    'a',
    'li',
    'td',
    'th'
  ];

  for (const element of document.querySelectorAll(selectors.join(','))) {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) {
      continue;
    }

    const text = getVisibleText(element);
    if (text.length >= 3 && text.length <= 300) {
      candidates.add(text);
    }
  }

  return Array.from(candidates);
}

function pickPlanName(texts) {
  const patterns = [
    {pattern: /\bStandard with ads\b/i, label: 'Standard with ads'},
    {pattern: /\bBasic with ads\b/i, label: 'Basic with ads'},
    {pattern: /\bPremium\b/i, label: 'Premium'},
    {pattern: /\bStandard\b/i, label: 'Standard'},
    {pattern: /\bBasic\b/i, label: 'Basic'},
    {pattern: /\bMobile\b/i, label: 'Mobile'},
    {pattern: /พรีเมียม/, label: 'Premium'},
    {pattern: /มาตรฐาน.*โฆษณา|โฆษณา.*มาตรฐาน/, label: 'Standard with ads'},
    {pattern: /พื้นฐาน.*โฆษณา|โฆษณา.*พื้นฐาน/, label: 'Basic with ads'},
    {pattern: /มาตรฐาน/, label: 'Standard'},
    {pattern: /พื้นฐาน/, label: 'Basic'},
    {pattern: /มือถือ/, label: 'Mobile'}
  ];

  const sortedTexts = [...texts].sort((a, b) => a.length - b.length);

  for (const {pattern, label} of patterns) {
    for (const text of sortedTexts) {
      if (pattern.test(text)) return label;
    }
  }

  return null;
}

function getPlanInfoFromPage() {
  const accountText = getVisibleText(document.body);
  const planTexts = collectPlanTexts();
  const visibleTexts = collectVisibleTexts();
  const searchTexts = [...planTexts, ...visibleTexts, accountText];
  const planName = pickPlanName(searchTexts);
  const isAccountPage = /\/account/i.test(location.pathname);

  if (!planName) {
    return {
      status: 'not-found',
      message: isAccountPage
        ? 'ไม่พบข้อมูลแพ็กเกจบนหน้า Account นี้'
        : 'กรุณาเปิดหน้า netflix.com/account ก่อน แล้วลองอีกครั้ง'
    };
  }

  return {
    status: 'ok',
    planName,
    pageUrl: location.href
  };
}

function waitForPlanInfo(timeoutMs = 10000) {
  const startedAt = Date.now();

  return new Promise((resolve) => {
    const check = () => {
      const result = getPlanInfoFromPage();

      if (result.status === 'ok' || Date.now() - startedAt >= timeoutMs) {
        resolve(result);
        return;
      }

      setTimeout(check, 500);
    };

    check();
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === 'startAutoFill') {
    startAutoFillRoutine(message.config);
    sendResponse({status: 'started'});
  } else if (message.command === 'stopAutoFill') {
    stopAutoFillRoutine();
    sendResponse({status: 'stopped'});
  } else if (message.command === 'getPlanInfo') {
    waitForPlanInfo().then(sendResponse);
    return true;
  }
});
