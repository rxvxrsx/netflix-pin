// Credit: REVERSE
const statusText = document.getElementById('statusText');
const statusItem = document.getElementById('statusItem');
const planText = document.getElementById('planText');
const planItem = document.getElementById('planItem');
const pinDisplay = document.getElementById('pinDisplay');
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
const loadPlanButton = document.getElementById('loadPlan');
const goBrowseButton = document.getElementById('goBrowse');

const DEFAULT_CONFIG = {
  startPin: 0,
  sortOrder: 'asc',
  keyDelay: 80,
  codeDelay: 120
};

let isRunning = false;

function appendLog(message) {
  const time = new Date().toLocaleTimeString();
  logArea.textContent += '[' + time + '] ' + message + '\n';
  logArea.scrollTop = logArea.scrollHeight;
}

function setStatus(status, type) {
  type = type || 'idle';
  statusText.textContent = status;
  statusItem.classList.remove('active', 'success', 'warn');
  if (type === 'running') statusItem.classList.add('active');
  else if (type === 'success') statusItem.classList.add('success');
  else if (type === 'error') statusItem.classList.add('warn');
}

function setCurrentPin(pin) {
  var pinStr = typeof pin === 'number' ? pin.toString().padStart(4, '0') : String(pin || '----');
  var spans = pinDisplay.querySelectorAll('.pin-digit');
  if (pinStr === '----') {
    spans.forEach(function(span) {
      span.textContent = '\u2013';
      span.classList.add('blank');
    });
    return;
  }
  var digits = pinStr.padStart(4, '0').split('');
  digits.forEach(function(digit, i) {
    spans[i].textContent = digit;
    spans[i].classList.remove('blank');
  });
}

function setPlanInfo(planName) {
  var planClass = getPlanClass(planName);
  planText.textContent = planName || '\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25';
  planItem.classList.remove('plan-premium', 'plan-standard', 'plan-standard-ads', 'plan-basic', 'plan-mobile', 'plan-unknown', 'active', 'success', 'warn');
  planItem.classList.add(planClass);
}

function getPlanClass(planName) {
  var n = String(planName || '').toLowerCase();
  if (!n || n === '\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25' || n.includes('error') || n.includes('loading')) return 'plan-unknown';
  if (n.includes('premium') || n.includes('\u0E1E\u0E23\u0E35\u0E40\u0E21\u0E35\u0E22\u0E21')) return 'plan-premium';
  if (n.includes('standard with ads') || n.includes('standard ads') || (n.includes('\u0E21\u0E32\u0E15\u0E23\u0E10\u0E32\u0E19') && n.includes('\u0E42\u0E06\u0E29\u0E13\u0E32'))) return 'plan-standard-ads';
  if (n.includes('standard') || n.includes('\u0E21\u0E32\u0E15\u0E23\u0E10\u0E32\u0E19')) return 'plan-standard';
  if (n.includes('basic') || n.includes('\u0E1E\u0E37\u0E49\u0E19\u0E10\u0E32\u0E19')) return 'plan-basic';
  if (n.includes('mobile') || n.includes('\u0E21\u0E37\u0E2D\u0E16\u0E37\u0E2D')) return 'plan-mobile';
  return 'plan-unknown';
}

function setRunningState(nextIsRunning) {
  isRunning = nextIsRunning;
  startButton.disabled = isRunning;
  stopButton.disabled = !isRunning;
  if (isRunning) startButton.classList.remove('pulse');
  else startButton.classList.add('pulse');
}

function setBusyState(isBusy) {
  startButton.disabled = isBusy || isRunning;
  stopButton.disabled = isBusy || !isRunning;
  saveConfigButton.disabled = isBusy;
  resetConfigButton.disabled = isBusy;
  loadPlanButton.disabled = isBusy;
  goBrowseButton.disabled = isBusy;
}

startButton.addEventListener('click', function() {
  var config = getConfigFromInputs();
  var formattedPin = formatPin(config.startPin);
  setBusyState(true);
  setStatus('\u0E01\u0E33\u0E25\u0E31\u0E07\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D...', 'running');
  chrome.runtime.sendMessage({action: 'start', config: config}, function(response) {
    setBusyState(false);
    if (chrome.runtime.lastError) {
      setStatus('\u0E2A\u0E48\u0E07\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07\u0E44\u0E21\u0E48\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08', 'error');
      appendLog('Error: ' + chrome.runtime.lastError.message);
      return;
    }
    if (!response || response.status === 'error' || response.status === 'no-target') {
      setRunningState(false);
      setStatus(response?.message || '\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E41\u0E17\u0E47\u0E1A Netflix', 'error');
      appendLog(response?.message || '\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E41\u0E17\u0E47\u0E1A Netflix \u0E17\u0E35\u0E48\u0E40\u0E1B\u0E34\u0E14\u0E2D\u0E22\u0E39\u0E48');
      return;
    }
    setRunningState(true);
    setStatus('\u0E01\u0E33\u0E25\u0E31\u0E07\u0E23\u0E31\u0E19', 'running');
    setCurrentPin(formattedPin);
    appendLog('\u25B6 \u0E17\u0E33\u0E07\u0E32\u0E19\u0E15\u0E48\u0E2D PIN ' + formattedPin + ' | ' + getSortOrderLabel(config.sortOrder) + ' | key=' + config.keyDelay + 'ms code=' + config.codeDelay + 'ms');
  });
});

stopButton.addEventListener('click', function() {
  setBusyState(true);
  setStatus('\u0E01\u0E33\u0E25\u0E31\u0E07\u0E2B\u0E22\u0E38\u0E14...', 'running');
  chrome.runtime.sendMessage({action: 'stop'}, function(response) {
    setBusyState(false);
    if (chrome.runtime.lastError) {
      setStatus('\u0E2B\u0E22\u0E38\u0E14\u0E44\u0E21\u0E48\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08', 'error');
      appendLog('Error: ' + chrome.runtime.lastError.message);
      return;
    }
    if (!response || response.status === 'error' || response.status === 'no-target') {
      setRunningState(false);
      setStatus(response?.message || '\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E41\u0E17\u0E47\u0E1A Netflix', 'error');
      appendLog(response?.message || '\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E41\u0E17\u0E47\u0E1A Netflix \u0E17\u0E35\u0E48\u0E40\u0E1B\u0E34\u0E14\u0E2D\u0E22\u0E39\u0E48');
      return;
    }
    setRunningState(false);
    setStatus('\u0E2B\u0E22\u0E38\u0E14\u0E41\u0E25\u0E49\u0E27', 'error');
    if (response && response.currentPin !== undefined) {
      var nextPin = Math.min(response.currentPin, 9999);
      startPinInput.value = nextPin;
      setCurrentPin(formatPin(nextPin));
      appendLog('\u23F9 \u0E2B\u0E22\u0E38\u0E14\u0E17\u0E35\u0E48 PIN: ' + formatPin(nextPin) + ' | \u0E40\u0E23\u0E34\u0E48\u0E21\u0E15\u0E48\u0E2D\u0E08\u0E32\u0E01\u0E15\u0E23\u0E07\u0E19\u0E35\u0E49');
    } else {
      appendLog('\u23F9 \u0E2B\u0E22\u0E38\u0E14\u0E17\u0E33\u0E07\u0E32\u0E19');
    }
  });
});

saveConfigButton.addEventListener('click', function() {
  var config = getConfigFromInputs();
  chrome.storage.local.set({netflixPinConfig: config}, function() {
    appendLog('\uD83D\uDCBE \u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01: PIN=' + formatPin(config.startPin) + ' | ' + getSortOrderLabel(config.sortOrder) + ' | key=' + config.keyDelay + 'ms code=' + config.codeDelay + 'ms');
    setStatus('\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E41\u0E25\u0E49\u0E27', 'success');
    setTimeout(function() { setStatus('\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19', 'success'); }, 1500);
  });
});

resetConfigButton.addEventListener('click', function() {
  setInputsFromConfig(DEFAULT_CONFIG);
  chrome.storage.local.remove('netflixPinConfig', function() {
    appendLog('\u21BA \u0E23\u0E35\u0E40\u0E0B\u0E47\u0E15\u0E40\u0E1B\u0E47\u0E19\u0E04\u0E48\u0E32\u0E40\u0E23\u0E34\u0E48\u0E21\u0E15\u0E49\u0E19');
    setStatus('\u0E23\u0E35\u0E40\u0E0B\u0E47\u0E15\u0E41\u0E25\u0E49\u0E27', 'success');
  });
});

toggleLogButton.addEventListener('click', function() {
  logArea.classList.toggle('collapsed');
  toggleLogButton.textContent = logArea.classList.contains('collapsed') ? '+' : '\u2212';
});

loadPlanButton.addEventListener('click', function() {
  setBusyState(true);
  setPlanInfo('\u0E01\u0E33\u0E25\u0E31\u0E07\u0E42\u0E2B\u0E25\u0E14...');
  appendLog('\uD83D\uDCCB \u0E01\u0E33\u0E25\u0E31\u0E07\u0E14\u0E36\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08...');
  chrome.runtime.sendMessage({action: 'getPlanInfo'}, function(response) {
    setBusyState(false);
    if (chrome.runtime.lastError) {
      setPlanInfo('\u0E40\u0E01\u0E34\u0E14\u0E02\u0E49\u0E2D\u0E1C\u0E34\u0E14\u0E1E\u0E25\u0E32\u0E14');
      appendLog('Error: ' + chrome.runtime.lastError.message);
      return;
    }
    if (!response || response.status === 'error' || response.status === 'no-target') {
      var msg = response?.message || '\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E41\u0E17\u0E47\u0E1A Netflix';
      setPlanInfo('\u0E40\u0E01\u0E34\u0E14\u0E02\u0E49\u0E2D\u0E1C\u0E34\u0E14\u0E1E\u0E25\u0E32\u0E14');
      appendLog(msg);
      return;
    }
    if (response.status !== 'ok') {
      var msg = response.message || '\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08';
      setPlanInfo('\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25');
      appendLog(msg);
      return;
    }
    setPlanInfo(response.planName);
    appendLog('\uD83D\uDCCB \u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08: ' + response.planName);
  });
});

goBrowseButton.addEventListener('click', function() {
  setBusyState(true);
  appendLog('\uD83C\uDF10 \u0E01\u0E33\u0E25\u0E31\u0E07\u0E44\u0E1B\u0E2B\u0E19\u0E49\u0E32 Browse...');
  chrome.runtime.sendMessage({action: 'goToBrowse'}, function(response) {
    setBusyState(false);
    if (chrome.runtime.lastError) {
      appendLog('Error: ' + chrome.runtime.lastError.message);
      setStatus('\u0E40\u0E1B\u0E34\u0E14\u0E44\u0E21\u0E48\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08', 'error');
      return;
    }
    if (!response || response.status !== 'ok') {
      var msg = response?.message || '\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E40\u0E1B\u0E34\u0E14 Browse \u0E44\u0E14\u0E49';
      appendLog(msg);
      setStatus(msg, 'error');
      return;
    }
    appendLog('\uD83C\uDF10 \u0E40\u0E1B\u0E34\u0E14\u0E2B\u0E19\u0E49\u0E32 Browse \u0E41\u0E25\u0E49\u0E27');
    setStatus('\u0E40\u0E1B\u0E34\u0E14 Browse \u0E41\u0E25\u0E49\u0E27', 'success');
    setTimeout(function() { setStatus('\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19', 'success'); }, 1500);
  });
});

chrome.runtime.onMessage.addListener(function(message) {
  if (message.action !== 'statusUpdate') return;
  if (message.pinString !== undefined) setCurrentPin(message.pinString);
  else if (message.currentPin !== undefined) setCurrentPin(formatPin(message.currentPin));
  if (message.status) {
    var t = getStatusType(message.status);
    setStatus(message.status, t);
    if (message.pinString && message.status.indexOf(message.pinString) === -1) {
      appendLog(message.status + ' PIN: ' + message.pinString);
    } else {
      appendLog(message.status);
    }
    if (t === 'success' || t === 'idle' || t === 'error') setRunningState(false);
    else setRunningState(true);
  } else if (message.pinString) {
    appendLog('\uD83D\uDD11 \u0E01\u0E33\u0E25\u0E31\u0E07\u0E25\u0E2D\u0E07 PIN: ' + message.pinString);
  }
});

function getStatusType(status) {
  if (status.includes('\u0E40\u0E08\u0E2D PIN \u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07')) return 'success';
  if (status.includes('\u0E44\u0E21\u0E48\u0E1E\u0E1A')) return 'error';
  if (status.includes('\u0E2B\u0E22\u0E38\u0E14') || status.includes('\u0E04\u0E23\u0E1A\u0E17\u0E38\u0E01 PIN')) return 'success';
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
  var n = parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function setInputsFromConfig(config) {
  startPinInput.value = config.startPin;
  sortOrderSelect.value = config.sortOrder === 'desc' ? 'desc' : 'asc';
  keyDelayInput.value = config.keyDelay;
  codeDelayInput.value = config.codeDelay;
}

function getSortOrderLabel(sortOrder) {
  return sortOrder === 'desc' ? '\u2193 \u0E21\u0E32\u0E01\u2192\u0E19\u0E49\u0E2D\u0E22' : '\u2191 \u0E19\u0E49\u0E2D\u0E22\u2192\u0E21\u0E32\u0E01';
}

function loadConfig() {
  chrome.storage.local.get(['netflixPinConfig'], function(result) {
    var config = result.netflixPinConfig || DEFAULT_CONFIG;
    setInputsFromConfig(config);
    setStatus('\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19', 'success');
    setRunningState(false);
    setCurrentPin('----');
    appendLog('\u2705 \u0E42\u0E2B\u0E25\u0E14 config \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19');
  });
}

function formatPin(num) {
  return num.toString().padStart(4, '0');
}

setRunningState(false);
loadConfig();