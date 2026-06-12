const statusText = document.getElementById('statusText');
const currentPinText = document.getElementById('currentPinText');
const logArea = document.getElementById('log');
const startPinInput = document.getElementById('startPin');
const sortOrderSelect = document.getElementById('sortOrder');
const keyDelayInput = document.getElementById('keyDelay');
const codeDelayInput = document.getElementById('codeDelay');
const saveConfigButton = document.getElementById('saveConfig');
const resetConfigButton = document.getElementById('resetConfig');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const toggleLogButton = document.getElementById('toggleLog');

const DEFAULT_CONFIG = {
  startPin: 0,
  sortOrder: 'asc',
  keyDelay: 80,
  codeDelay: 120
};

let isRunning = false;

function appendLog(message) {
  const time = new Date().toLocaleTimeString();
  logArea.textContent += `[${time}] ${message}\n`;
  logArea.scrollTop = logArea.scrollHeight;
}

function setStatus(status, type = 'stopped') {
  statusText.textContent = status;
  statusText.classList.remove('running', 'success', 'error', 'stopped');
  statusText.classList.add(type);
}

function setCurrentPin(pin) {
  currentPinText.textContent = pin;
}

function setRunningState(nextIsRunning) {
  isRunning = nextIsRunning;
  startButton.disabled = isRunning;
  stopButton.disabled = !isRunning;
}

function setBusyState(isBusy) {
  startButton.disabled = isBusy || isRunning;
  stopButton.disabled = isBusy || !isRunning;
  saveConfigButton.disabled = isBusy;
  resetConfigButton.disabled = isBusy;
}

startButton.addEventListener('click', () => {
  const config = getConfigFromInputs();
  const formattedPin = formatPin(config.startPin);

  setBusyState(true);
  setStatus(`กำลังส่งคำสั่งไปยัง Netflix`, 'running');

  chrome.runtime.sendMessage({action: 'start', config}, (response) => {
    setBusyState(false);

    if (chrome.runtime.lastError) {
      setStatus('ส่งคำสั่งไม่สำเร็จ', 'error');
      appendLog(`Error: ${chrome.runtime.lastError.message}`);
      return;
    }

    if (!response || response.status === 'error' || response.status === 'no-target') {
      setRunningState(false);
      setStatus(response?.message || 'ไม่พบแท็บ Netflix', 'error');
      appendLog(response?.message || 'ไม่พบแท็บ Netflix ที่เปิดอยู่');
      return;
    }

    setRunningState(true);
    setStatus(`กำลังเริ่มจาก ${formattedPin}`, 'running');
    setCurrentPin(formattedPin);
    appendLog(`ส่งคำสั่งเริ่มไปยัง Netflix (start=${formattedPin}, order=${getSortOrderLabel(config.sortOrder)}, keyDelay=${config.keyDelay}, codeDelay=${config.codeDelay})`);
  });
});

stopButton.addEventListener('click', () => {
  setBusyState(true);
  setStatus('กำลังหยุดการทำงาน', 'running');

  chrome.runtime.sendMessage({action: 'stop'}, (response) => {
    setBusyState(false);

    if (chrome.runtime.lastError) {
      setStatus('หยุดไม่สำเร็จ', 'error');
      appendLog(`Error: ${chrome.runtime.lastError.message}`);
      return;
    }

    if (!response || response.status === 'error' || response.status === 'no-target') {
      setRunningState(false);
      setStatus(response?.message || 'ไม่พบแท็บ Netflix', 'error');
      appendLog(response?.message || 'ไม่พบแท็บ Netflix ที่เปิดอยู่');
      return;
    }

    setRunningState(false);
    setStatus('หยุดแล้ว', 'stopped');
    appendLog('ส่งคำสั่งหยุดไปยัง Netflix');
  });
});

saveConfigButton.addEventListener('click', () => {
  const config = getConfigFromInputs();
  chrome.storage.local.set({netflixPinConfig: config}, () => {
    appendLog(`บันทึก config เรียบร้อย (start=${formatPin(config.startPin)}, order=${getSortOrderLabel(config.sortOrder)}, keyDelay=${config.keyDelay}, codeDelay=${config.codeDelay})`);
    setStatus('บันทึกค่าแล้ว', 'success');
  });
});

resetConfigButton.addEventListener('click', () => {
  setInputsFromConfig(DEFAULT_CONFIG);
  chrome.storage.local.remove('netflixPinConfig', () => {
    appendLog('รีเซ็ต config เป็นค่าเริ่มต้นแล้ว');
    setStatus('รีเซ็ตค่าเริ่มต้นแล้ว', 'stopped');
  });
});

toggleLogButton.addEventListener('click', () => {
  logArea.classList.toggle('hidden');
  toggleLogButton.setAttribute('aria-expanded', String(!logArea.classList.contains('hidden')));
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== 'statusUpdate') return;

  if (message.pinString !== undefined) {
    setCurrentPin(message.pinString);
  } else if (message.currentPin !== undefined) {
    setCurrentPin(formatPin(message.currentPin));
  }

  if (message.status) {
    const statusType = getStatusType(message.status);
    setStatus(message.status, statusType);
    appendLog(message.status);

    if (statusType === 'success' || statusType === 'stopped' || statusType === 'error') {
      setRunningState(false);
    } else {
      setRunningState(true);
    }
  } else if (message.pinString) {
    appendLog(`กำลังทดลอง PIN: ${message.pinString}`);
  }
});

function getStatusType(status) {
  if (status.includes('เจอ PIN ถูกต้อง')) return 'success';
  if (status.includes('ไม่พบ')) return 'error';
  if (status.includes('หยุด') || status.includes('ครบทุก PIN')) return 'stopped';
  return 'running';
}

function getConfigFromInputs() {
  return {
    startPin: clampNumber(startPinInput.value, 0, 9999, 0),
    sortOrder: sortOrderSelect.value === 'desc' ? 'desc' : 'asc',
    keyDelay: clampNumber(keyDelayInput.value, 10, 999999, 80),
    codeDelay: clampNumber(codeDelayInput.value, 10, 999999, 120)
  };
}

function clampNumber(value, min, max, fallback) {
  const number = parseInt(value, 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, min), max);
}

function setInputsFromConfig(config) {
  startPinInput.value = config.startPin;
  sortOrderSelect.value = config.sortOrder === 'desc' ? 'desc' : 'asc';
  keyDelayInput.value = config.keyDelay;
  codeDelayInput.value = config.codeDelay;
}

function getSortOrderLabel(sortOrder) {
  return sortOrder === 'desc' ? 'มากไปน้อย' : 'น้อยไปมาก';
}

function loadConfig() {
  chrome.storage.local.get(['netflixPinConfig'], (result) => {
    const config = result.netflixPinConfig || DEFAULT_CONFIG;
    setInputsFromConfig(config);
    setStatus('พร้อมใช้งาน', 'stopped');
    setRunningState(false);
    appendLog('โหลด config แล้ว');
  });
}

function formatPin(num) {
  return num.toString().padStart(4, '0');
}

setRunningState(false);
loadConfig();
