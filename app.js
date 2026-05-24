// BUBBLE SAFETY - INTERACTIVE SIMULATOR LOGIC
// Rich client-side features, audio synthesis, dynamic map animation, and state sync.

// DOM ELEMENTS SELECTORS
const phoneDevice = document.getElementById('phoneDevice');
const dynamicIsland = document.getElementById('dynamicIsland');
const islandStatus = document.getElementById('islandStatus');
const phoneTime = document.getElementById('phoneTime');
const batteryIcon = document.getElementById('batteryIcon');

// Slider
const safetySlider = document.getElementById('safetySlider');
const safetyLevelPct = document.getElementById('safetyLevelPct');
const safetyLevelDesc = document.getElementById('safetyLevelDesc');
const comfortStatus = document.getElementById('comfortStatus');
const comfortIcon = document.getElementById('comfortIcon');

// Watchdog Timer
const timerDigits = document.getElementById('timerDigits');
const watchdogSubLabel = document.getElementById('watchdogSubLabel');
const watchdogStateLabel = document.getElementById('watchdogStateLabel');
const timerProgressCircle = document.getElementById('timerProgressCircle');
const startTimerBtn = document.getElementById('startTimerBtn');
const timerControls = document.getElementById('timerControls');
const timerActiveControls = document.getElementById('timerActiveControls');
const extendTimerBtn = document.getElementById('extendTimerBtn');
const disarmTimerBtn = document.getElementById('disarmTimerBtn');

// Adjusters and Presets
const adjustTimerMinus = document.getElementById('adjustTimerMinus');
const adjustTimerPlus = document.getElementById('adjustTimerPlus');
const presetPills = document.querySelectorAll('.btn-preset');

// Phone Tab elements
const btnTabBubble = document.getElementById('btnTabBubble');
const btnTabVerify = document.getElementById('btnTabVerify');
const btnTabAudio = document.getElementById('btnTabAudio');
const tabBubble = document.getElementById('tab-bubble');
const tabVerify = document.getElementById('tab-verify');
const tabAudio = document.getElementById('tab-audio');

// Passcode Overlay
const passcodeOverlay = document.getElementById('passcodeOverlay');
const passcodePromptText = document.getElementById('passcodePromptText');
const dots = [
  document.getElementById('dot1'),
  document.getElementById('dot2'),
  document.getElementById('dot3'),
  document.getElementById('dot4')
];

// Companion
const companionQueryInput = document.getElementById('companionQueryInput');
const companionSearchBtn = document.getElementById('companionSearchBtn');
const companionResultBox = document.getElementById('companionResultBox');
const compName = document.getElementById('compName');
const compBadge = document.getElementById('compBadge');
const compStars = document.getElementById('compStars');
const compRatingScore = document.getElementById('compRatingScore');
const compFeedback = document.getElementById('compFeedback');

// Audio visualizer
const audioStreamBadge = document.getElementById('audioStreamBadge');
const audioBars = document.getElementById('audioBars');
const audioVisualizerText = document.getElementById('audioVisualizerText');
const micToggleBtn = document.getElementById('micToggleBtn');
const micStatusText = document.getElementById('micStatusText');
const simVoiceTriggerBtn = document.getElementById('simVoiceTriggerBtn');

// Telemetry Labels
const telemetryWatchdog = document.getElementById('telemetryWatchdog');
const telemetryRisk = document.getElementById('telemetryRisk');
const telemetryGPS = document.getElementById('telemetryGPS');
const telemetryAudio = document.getElementById('telemetryAudio');
const syncBadge = document.getElementById('syncBadge');

// Logs Console
const logsConsole = document.getElementById('logsConsole');
const clearLogsBtn = document.getElementById('clearLogsBtn');

// Map Canvas
const mapCanvas = document.getElementById('mapCanvas');
const coordinatesText = document.getElementById('coordinatesText');

// Guardian Active Escort
const hireEscortBtn = document.getElementById('hireEscortBtn');
const escortProfileActive = document.getElementById('escortProfileActive');
const cancelEscortBtn = document.getElementById('cancelEscortBtn');

// Panic Deck Overlay
const panicOverlay = document.getElementById('panicOverlay');
const panicDetailsText = document.getElementById('panicDetailsText');
const overrideSirenBtn = document.getElementById('overrideSirenBtn');
const dispatchPoliceBtn = document.getElementById('dispatchPoliceBtn');
const falseAlarmBtn = document.getElementById('falseAlarmBtn');

// Simulation assist buttons
const simDeviateBtn = document.getElementById('simDeviateBtn');
const simLowBatteryBtn = document.getElementById('simLowBatteryBtn');
const simSirenBtn = document.getElementById('simSirenBtn');
const resetSimBtn = document.getElementById('resetSimBtn');

// STATE VARIABLES
let watchdogActive = false;
let durationSeconds = 15;
let timeRemaining = 0;
let watchdogInterval = null;
let watchdogGPSInterval = null;
let watchdogPin = '1234';
let enteredPin = '';
let currentSafetyVal = 100;
let isEscortHired = false;
let isMicListening = false;
let speechRecognizer = null;
let mapPathDeviated = false;
let batteryLevel = 82;
let telemetryGPSPingRate = 1.0;

// Audio Synthesizer Context (Web Audio API)
let audioCtx = null;
let sirenOsc1 = null;
let sirenOsc2 = null;
let sirenGain = null;
let sirenActive = false;

// Mock database for Companion Lookups
const companionMockDB = {
  'CAB-4452': {
    name: 'Driver: Marcus Vance (Cab #4452)',
    badge: 'VERIFIED SAFE',
    badgeClass: 'badge-verified',
    stars: 5,
    score: '4.9/5',
    feedback: 'Highly rated driver. Verified with City Taxi Commission. 1,200 incident-free rides.'
  },
  'JOHN DOE': {
    name: 'Stranger Profile: John Doe',
    badge: 'HIGH ALERT',
    badgeClass: 'badge-flagged',
    stars: 1,
    score: '1.2/5',
    feedback: 'WARNING: 3 previous reports of harassment and refusal to stay in public areas on meetups.'
  },
  '9954-TX': {
    name: 'Driver: Carl Ross (Plate #9954-TX)',
    badge: 'VERIFIED SAFE',
    badgeClass: 'badge-verified',
    stars: 4,
    score: '4.6/5',
    feedback: 'Professional, quiet ride. Tracked route is clean.'
  },
  'JANE SMITH': {
    name: 'Stranger Profile: Jane Smith',
    badge: 'VERIFIED SAFE',
    badgeClass: 'badge-verified',
    stars: 5,
    score: '5.0/5',
    feedback: 'Trusted dating escort profile. ID scanned and verified on local meetups.'
  }
};

// INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
  updateTimeDisplay();
  setInterval(updateTimeDisplay, 60000);
  
  // Set up Map
  initMap();
  
  // Attach Event Listeners
  setupEventListeners();
  
  // Set initial timer UI digits to represent default duration
  timeRemaining = durationSeconds;
  updateTimerUI();
  
  // Write Initial Welcome Logs
  writeLog('System initializing... Telemetry handshake OK.', 'info');
  writeLog('Bubble Sphere monitoring ready. Standby.', 'safe');
  
  // Synthesize standard visualizer movement
  startVisualizerStandby();
});

// TIME HELPER
function updateTimeDisplay() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  phoneTime.textContent = `${hours}:${minutes}`;
}

// LOG SYSTEM CONSOLE
function writeLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const logDiv = document.createElement('div');
  logDiv.className = `log-entry`;
  
  let typeClass = 'log-info';
  let prefix = '[INFO]';
  if (type === 'safe') { typeClass = 'log-safe'; prefix = '[SAFE]'; }
  if (type === 'warning') { typeClass = 'log-warning'; prefix = '[WARN]'; }
  if (type === 'danger') { typeClass = 'log-danger'; prefix = '[SOS]'; }
  
  logDiv.innerHTML = `<span class="log-timestamp">${timestamp}</span><span class="${typeClass}">${prefix} ${message}</span>`;
  logsConsole.appendChild(logDiv);
  logsConsole.scrollTop = logsConsole.scrollHeight;
}

// SOUND SYNTHESIS METHODS (Web Audio API)
function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playClickSound() {
  try {
    initAudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch (e) {
    console.log('Audio error:', e);
  }
}

function playSuccessSound() {
  try {
    initAudioContext();
    const now = audioCtx.currentTime;
    
    // Play dual notes for premium melody
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      
      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);
      
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.35);
    });
  } catch (e) {
    console.log('Audio error:', e);
  }
}

function playWarningBeep(isUrgent = false) {
  try {
    initAudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isUrgent ? 880 : 440, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (isUrgent ? 0.15 : 0.25));
    
    osc.start();
    osc.stop(audioCtx.currentTime + (isUrgent ? 0.15 : 0.25));
  } catch (e) {
    console.log('Audio error:', e);
  }
}

function startSiren() {
  if (sirenActive) return;
  try {
    initAudioContext();
    sirenActive = true;
    
    sirenGain = audioCtx.createGain();
    sirenGain.connect(audioCtx.destination);
    sirenGain.gain.setValueAtTime(0, audioCtx.currentTime);
    sirenGain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.2);

    // Oscillator 1 - low heavy sweep
    sirenOsc1 = audioCtx.createOscillator();
    sirenOsc1.type = 'sawtooth';
    sirenOsc1.connect(sirenGain);
    sirenOsc1.frequency.setValueAtTime(400, audioCtx.currentTime);
    
    // Oscillator 2 - high sharp sweep
    sirenOsc2 = audioCtx.createOscillator();
    sirenOsc2.type = 'square';
    sirenOsc2.connect(sirenGain);
    sirenOsc2.frequency.setValueAtTime(600, audioCtx.currentTime);
    
    const now = audioCtx.currentTime;
    
    // Siren alternating modulation
    sirenOsc1.frequency.linearRampToValueAtTime(600, now);
    sirenOsc2.frequency.linearRampToValueAtTime(800, now);
    
    // Create an alternating frequency sweeps
    let toggle = true;
    const sweepInterval = setInterval(() => {
      if (!sirenActive) {
        clearInterval(sweepInterval);
        return;
      }
      const t = audioCtx.currentTime;
      if (toggle) {
        sirenOsc1.frequency.exponentialRampToValueAtTime(800, t + 0.45);
        sirenOsc2.frequency.exponentialRampToValueAtTime(1100, t + 0.45);
      } else {
        sirenOsc1.frequency.exponentialRampToValueAtTime(450, t + 0.45);
        sirenOsc2.frequency.exponentialRampToValueAtTime(600, t + 0.45);
      }
      toggle = !toggle;
    }, 500);

    sirenOsc1.start();
    sirenOsc2.start();
  } catch (e) {
    console.log('Siren audio error:', e);
  }
}

function stopSiren() {
  sirenActive = false;
  try {
    if (sirenGain) {
      sirenGain.gain.setValueAtTime(sirenGain.gain.value, audioCtx.currentTime);
      sirenGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    }
    setTimeout(() => {
      if (sirenOsc1) { sirenOsc1.stop(); sirenOsc1 = null; }
      if (sirenOsc2) { sirenOsc2.stop(); sirenOsc2 = null; }
    }, 280);
  } catch(e) {
    console.log('Audio stop siren error:', e);
  }
}

// EVENT LISTENERS SETUP
function setupEventListeners() {
  // Safety Comfort Slider
  safetySlider.addEventListener('input', handleSafetySliderChange);
  
  // Watchdog Start
  startTimerBtn.addEventListener('click', () => {
    playClickSound();
    startWatchdogTimer();
  });
  
  // Watchdog active controls
  extendTimerBtn.addEventListener('click', () => {
    playClickSound();
    extendWatchdogTimer();
  });
  
  disarmTimerBtn.addEventListener('click', () => {
    playClickSound();
    openPasscodeOverlay('DISARM SAFETY BUBBLE');
  });

  // Watchdog Adjuster Buttons (- and +)
  adjustTimerMinus.addEventListener('click', () => {
    if (watchdogActive) return; // Ignore if timer is running
    playClickSound();
    if (durationSeconds > 15) {
      durationSeconds -= 60;
      if (durationSeconds < 15) durationSeconds = 15;
      timeRemaining = durationSeconds;
      
      updatePresetPillsActive();
      writeLog(`Watchdog timer duration decreased: ${durationSeconds}s`, 'info');
      updateTimerUI();
    } else {
      writeLog('Watchdog timer cannot be lower than 15 seconds.', 'warning');
    }
  });

  adjustTimerPlus.addEventListener('click', () => {
    if (watchdogActive) return; // Ignore if timer is running
    playClickSound();
    durationSeconds += 60;
    timeRemaining = durationSeconds;
    
    updatePresetPillsActive();
    writeLog(`Watchdog timer duration increased: ${durationSeconds}s`, 'info');
    updateTimerUI();
  });

  // Preset pills bindings
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      if (watchdogActive) return; // Ignore if active
      playClickSound();
      
      presetPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      
      durationSeconds = parseInt(pill.getAttribute('data-seconds'));
      timeRemaining = durationSeconds;
      
      writeLog(`Set watchdog timer duration preset: ${durationSeconds}s`, 'info');
      updateTimerUI();
    });
  });

  // Tab Navigation triggers
  btnTabBubble.addEventListener('click', () => switchTab('bubble'));
  btnTabVerify.addEventListener('click', () => switchTab('verify'));
  btnTabAudio.addEventListener('click', () => switchTab('audio'));

  // Companion search
  companionSearchBtn.addEventListener('click', handleCompanionSearch);
  companionQueryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleCompanionSearch();
  });
  
  // Microphone toggle
  micToggleBtn.addEventListener('click', toggleMicrophoneListener);
  simVoiceTriggerBtn.addEventListener('click', simulateDistressVoiceTrigger);
  
  // Logs clear
  clearLogsBtn.addEventListener('click', () => {
    logsConsole.innerHTML = '';
    writeLog('Logs console cleared.', 'info');
  });

  // Guardian escort hiring
  hireEscortBtn.addEventListener('click', hireVirtualEscort);
  cancelEscortBtn.addEventListener('click', dischargeVirtualEscort);

  // Panic Deck Overlay
  overrideSirenBtn.addEventListener('click', () => {
    stopSiren();
    writeLog('Siren silenced manually by Guardian.', 'warning');
    overrideSirenBtn.style.display = 'none';
  });

  dispatchPoliceBtn.addEventListener('click', () => {
    playClickSound();
    writeLog('AUTHORITIES DISPATCHED. Emergency command issued.', 'danger');
    alert('🚨 GUARDIAN NOTICE: Local Police & Ambulance dispatched to live coordinates! Dispatch ID #383-BUBBLE.');
  });

  falseAlarmBtn.addEventListener('click', () => {
    playSuccessSound();
    resetSystemToNormal();
    writeLog('Emergency cancelled. Safety restored by authorized check.', 'safe');
  });

  // Simulator assists
  simDeviateBtn.addEventListener('click', toggleMapDeviation);
  simLowBatteryBtn.addEventListener('click', triggerLowBatteryWarning);
  simSirenBtn.addEventListener('click', () => {
    initAudioContext();
    if (sirenActive) {
      stopSiren();
      writeLog('Test Siren disabled.', 'info');
    } else {
      startSiren();
      writeLog('Test Siren triggered.', 'warning');
    }
  });
  resetSimBtn.addEventListener('click', resetSystemToNormal);
}

// TAB NAVIGATION & UTILITIES
function switchTab(tabName) {
  playClickSound();
  
  // Deactivate all buttons
  btnTabBubble.classList.remove('active');
  btnTabVerify.classList.remove('active');
  btnTabAudio.classList.remove('active');
  
  // Hide all sections
  tabBubble.style.display = 'none';
  tabVerify.style.display = 'none';
  tabAudio.style.display = 'none';
  
  // Activate selected tab
  if (tabName === 'bubble') {
    btnTabBubble.classList.add('active');
    tabBubble.style.display = 'flex';
    writeLog('Navigated to Bubble Controls tab.', 'info');
  } else if (tabName === 'verify') {
    btnTabVerify.classList.add('active');
    tabVerify.style.display = 'flex';
    writeLog('Navigated to Companion Check tab.', 'info');
  } else if (tabName === 'audio') {
    btnTabAudio.classList.add('active');
    tabAudio.style.display = 'flex';
    writeLog('Navigated to Safety Ear & Hotline tab.', 'info');
  }
}

function updatePresetPillsActive() {
  presetPills.forEach(p => {
    const secs = parseInt(p.getAttribute('data-seconds'));
    if (secs === durationSeconds) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
}

// Search Companion database via quick click hints
window.searchHint = function(val) {
  companionQueryInput.value = val;
  handleCompanionSearch();
};

// COMFORT SLIDER FUNCTIONALITY
function handleSafetySliderChange() {
  currentSafetyVal = parseInt(safetySlider.value);
  safetyLevelPct.textContent = `${currentSafetyVal}%`;
  
  // Remove existing state classes
  phoneDevice.classList.remove('state-safe', 'state-warning', 'state-danger');
  
  if (currentSafetyVal >= 70) {
    // SAFE STATE
    phoneDevice.classList.add('state-safe');
    safetyLevelPct.style.color = 'var(--safe)';
    comfortStatus.textContent = 'Safe';
    comfortIcon.style.color = 'var(--safe)';
    comfortIcon.className = 'fa-solid fa-face-smile';
    safetyLevelDesc.textContent = 'You feel completely secure and relaxed.';
    telemetryRisk.textContent = 'Minimal Risk';
    telemetryRisk.style.color = 'var(--safe)';
    telemetryGPSPingRate = 1.0;
    
    syncGPSHeartbeatRate();
    updateAudioVisualizerSpeed();
  } else if (currentSafetyVal >= 30) {
    // WARNING STATE
    phoneDevice.classList.add('state-warning');
    safetyLevelPct.style.color = 'var(--warning)';
    comfortStatus.textContent = 'Uneasy';
    comfortIcon.style.color = 'var(--warning)';
    comfortIcon.className = 'fa-solid fa-face-meh-blank';
    safetyLevelDesc.textContent = 'Comfort levels decreasing. Monitoring buffered ambient logs.';
    telemetryRisk.textContent = 'Elevated Risk';
    telemetryRisk.style.color = 'var(--warning)';
    telemetryGPSPingRate = 0.5; // Ping twice as fast
    
    syncGPSHeartbeatRate();
    updateAudioVisualizerSpeed();
    
    // Add casual feedback beep
    if (currentSafetyVal % 10 === 0) playWarningBeep(false);
  } else {
    // DANGER STATE
    phoneDevice.classList.add('state-danger');
    safetyLevelPct.style.color = 'var(--danger)';
    comfortStatus.textContent = 'In Danger';
    comfortIcon.style.color = 'var(--danger)';
    comfortIcon.className = 'fa-solid fa-face-frown-open';
    safetyLevelDesc.textContent = 'Critical Alert primed! Watchdog is fully alert.';
    telemetryRisk.textContent = 'CRITICAL THREAT';
    telemetryRisk.style.color = 'var(--danger)';
    telemetryGPSPingRate = 0.2; // Max telemetry frequency
    
    syncGPSHeartbeatRate();
    updateAudioVisualizerSpeed();
    
    // Fast pulsing feedback clicks
    playWarningBeep(true);
  }
  
  writeLog(`Comfort Safety level updated: ${currentSafetyVal}% (${comfortStatus.textContent})`, currentSafetyVal < 30 ? 'danger' : (currentSafetyVal < 70 ? 'warning' : 'safe'));
}

// WATCHDOG TIMER LOGIC
function startWatchdogTimer() {
  if (watchdogActive) return;
  
  timeRemaining = durationSeconds;
  watchdogActive = true;
  
  // UI toggles
  timerControls.style.display = 'none';
  timerActiveControls.style.display = 'flex';
  watchdogStateLabel.textContent = 'Heartbeat ON';
  watchdogStateLabel.style.color = 'var(--primary)';
  watchdogSubLabel.textContent = 'PULSING SAFE';
  watchdogSubLabel.style.color = 'var(--safe)';
  
  telemetryWatchdog.textContent = 'ACTIVE';
  telemetryWatchdog.style.color = 'var(--primary)';
  telemetryGPS.style.color = 'var(--safe)';
  
  dynamicIsland.classList.add('active');
  islandStatus.textContent = 'Bubble Protective Shield Active';
  
  writeLog(`Safety Bubble Watchdog started for ${durationSeconds} seconds. Default disarm PIN: 1234.`, 'info');
  
  updateTimerUI();
  
  // Timer loops
  watchdogInterval = setInterval(() => {
    timeRemaining--;
    updateTimerUI();
    
    // Heartbeat beeping close to end
    if (timeRemaining <= 5 && timeRemaining > 0) {
      watchdogSubLabel.textContent = 'THREAT LOCK';
      watchdogSubLabel.style.color = 'var(--danger)';
      playWarningBeep(true);
      writeLog(`WATCHDOG WARNING: Heartbeat check-in required in ${timeRemaining}s!`, 'warning');
    }
    
    if (timeRemaining <= 0) {
      clearInterval(watchdogInterval);
      triggerEmergencyAlert();
    }
  }, 1000);
}

function updateTimerUI() {
  const m = Math.floor(timeRemaining / 60);
  const s = timeRemaining % 60;
  timerDigits.textContent = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  
  // Adjust stroke circle progress (Radius is 66, perimeter is 414.69)
  const offset = 414.69 * (1 - timeRemaining / durationSeconds);
  timerProgressCircle.style.strokeDashoffset = offset;
  
  // Transition timer color to danger when critical
  if (timeRemaining <= 5) {
    timerProgressCircle.style.stroke = 'var(--danger)';
    timerDigits.style.color = 'var(--danger)';
  } else if (timeRemaining <= durationSeconds * 0.4) {
    timerProgressCircle.style.stroke = 'var(--warning)';
    timerDigits.style.color = 'var(--warning)';
  } else {
    timerProgressCircle.style.stroke = 'var(--primary)';
    timerDigits.style.color = '#fff';
  }
}

function extendWatchdogTimer() {
  if (!watchdogActive) return;
  timeRemaining += 60;
  durationSeconds += 60;
  writeLog('Heartbeat Watchdog check extended by +60 seconds.', 'safe');
  updateTimerUI();
}

// PASSCODE DIALOG DISARMING
function openPasscodeOverlay(titleText) {
  enteredPin = '';
  passcodePromptText.textContent = titleText;
  passcodeOverlay.classList.add('active');
  updatePinDots();
}

function pressKey(num) {
  if (enteredPin.length < 4) {
    playClickSound();
    enteredPin += num;
    updatePinDots();
  }
  
  if (enteredPin.length === 4) {
    setTimeout(verifyPasscode, 300);
  }
}

function clearKeys() {
  playClickSound();
  enteredPin = '';
  updatePinDots();
}

function pressBackspace() {
  if (enteredPin.length > 0) {
    playClickSound();
    enteredPin = enteredPin.slice(0, -1);
    updatePinDots();
  }
}

function updatePinDots() {
  dots.forEach((dot, idx) => {
    if (idx < enteredPin.length) {
      dot.classList.add('filled');
    } else {
      dot.classList.remove('filled');
    }
  });
}

function verifyPasscode() {
  if (enteredPin === watchdogPin) {
    // Disarm successful
    playSuccessSound();
    disarmWatchdog();
    passcodeOverlay.classList.remove('active');
  } else {
    // Incorrect passcode
    playWarningBeep(true);
    enteredPin = '';
    updatePinDots();
    passcodePromptText.textContent = 'INCORRECT PIN - RETRY';
    passcodePromptText.style.color = 'var(--danger)';
    
    // Shake overlay effect
    passcodeOverlay.style.animation = 'shake-device 0.2s ease-in-out 2';
    setTimeout(() => {
      passcodeOverlay.style.animation = '';
    }, 400);
    
    writeLog('WARN: Watchdog check-in verification failed. Incorrect PIN!', 'warning');
  }
}

function disarmWatchdog() {
  clearInterval(watchdogInterval);
  watchdogActive = false;
  
  // UI updates
  timerControls.style.display = 'flex';
  timerActiveControls.style.display = 'none';
  watchdogStateLabel.textContent = 'Heartbeat Off';
  watchdogStateLabel.style.color = 'var(--text-muted)';
  watchdogSubLabel.textContent = 'Pulse Sleep';
  watchdogSubLabel.style.color = 'var(--text-muted)';
  
  // Reset back to duration display digits
  timeRemaining = durationSeconds;
  updateTimerUI();
  
  timerProgressCircle.style.strokeDashoffset = 0;
  timerProgressCircle.style.stroke = 'var(--border-light)';
  
  telemetryWatchdog.textContent = 'Asleep';
  telemetryWatchdog.style.color = 'var(--text-muted)';
  
  dynamicIsland.classList.remove('active');
  
  writeLog('Safety Bubble successfully disarmed. Sphere secured.', 'safe');
}

// COMPANION SEARCH
function handleCompanionSearch() {
  const query = companionQueryInput.value.trim().toUpperCase();
  if (!query) return;
  
  playClickSound();
  writeLog(`Query companion review database for: "${query}"`, 'info');
  
  // Check mock database
  const result = companionMockDB[query];
  
  if (result) {
    compName.textContent = result.name;
    compBadge.textContent = result.badge;
    compBadge.className = `companion-badge ${result.badgeClass}`;
    
    // stars html
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(result.stars)) {
        starsHTML += '<i class="fa-solid fa-star"></i> ';
      } else if (i - 0.5 <= result.stars) {
        starsHTML += '<i class="fa-solid fa-star-half-stroke"></i> ';
      } else {
        starsHTML += '<i class="fa-regular fa-star"></i> ';
      }
    }
    compStars.innerHTML = starsHTML;
    compRatingScore.textContent = result.score;
    compFeedback.textContent = `"${result.feedback}"`;
    
    // Show box
    companionResultBox.style.display = 'block';
    
    if (result.badge === 'HIGH ALERT') {
      writeLog(`COMPANION ALERT: Search returned negative flags for: "${query}". Proceed with caution.`, 'warning');
      safetySlider.value = 40; // Trigger unease automatically
      handleSafetySliderChange();
    } else {
      writeLog(`COMPANION CONFIRMED: Profile verified clean for: "${query}".`, 'safe');
    }
    
  } else {
    // Generate new unflagged stranger response
    compName.textContent = `Stranger ID: ${query}`;
    compBadge.textContent = 'UNVERIFIED PROFILE';
    compBadge.className = 'companion-badge badge-warning';
    compStars.innerHTML = '<i class="fa-regular fa-star"></i> '.repeat(5);
    compRatingScore.textContent = 'N/A';
    compFeedback.textContent = '"No reports logged. ID and safety footprint have not been reviewed. Advised to stay in highly visible public zones."';
    
    companionResultBox.style.display = 'block';
    writeLog(`COMPANION WARNING: ID "${query}" is not registered. Encrypting date log tracker.`, 'warning');
  }
}

// MICROPHONE AND THREAT AUDIO ANALYSIS MOCKS
function toggleMicrophoneListener() {
  initAudioContext();
  if (isMicListening) {
    // Stop mic
    isMicListening = false;
    micToggleBtn.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
    micToggleBtn.className = 'btn-bubble btn-outline btn-icon-only';
    micIcon.style.color = 'var(--text-muted)';
    micStatusText.textContent = 'Continuous ambient listening is asleep. Enable mic to detect voice distress triggers like "Help" or "Stop".';
    
    audioStreamBadge.textContent = 'Standby';
    audioStreamBadge.style.borderColor = 'var(--border-light)';
    audioStreamBadge.style.color = 'var(--text-muted)';
    audioStreamBadge.style.background = 'rgba(255, 255, 255, 0.05)';
    audioVisualizerText.textContent = 'BUFFERING SLEEP';
    telemetryAudio.textContent = 'Off (Standby)';
    telemetryAudio.style.color = 'var(--text-muted)';
    
    writeLog('Microphone ambient feed disconnected.', 'info');
  } else {
    // Start mic (request permission or simulate)
    isMicListening = true;
    micToggleBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    micToggleBtn.className = 'btn-bubble btn-icon-only';
    micIcon.style.color = 'var(--primary)';
    micStatusText.textContent = '🟢 Ambient threat ear ON. Listening in background. Say "Help!" or click Voice Trigger to test alarm activation.';
    
    audioStreamBadge.textContent = 'Streaming';
    audioStreamBadge.style.borderColor = 'var(--safe)';
    audioStreamBadge.style.color = 'var(--safe)';
    audioStreamBadge.style.background = 'rgba(16, 185, 129, 0.15)';
    audioVisualizerText.textContent = 'STREAMING LIVE TELEMETRY FEED';
    telemetryAudio.textContent = 'STREAMING';
    telemetryAudio.style.color = 'var(--safe)';
    
    writeLog('Microphone ambient stream connected. Noise threat filtering activated.', 'safe');
    
    // Attempt real audio processing if speech recognition is available
    startWebSpeechRecognition();
  }
}

function startWebSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    speechRecognizer = new SpeechRecognition();
    speechRecognizer.continuous = true;
    speechRecognizer.interimResults = true;
    speechRecognizer.lang = 'en-US';
    
    speechRecognizer.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const speechText = event.results[i][0].transcript.toLowerCase();
          writeLog(`Audio Ambient Transcript parsed: "${speechText}"`, 'info');
          
          if (speechText.includes('help') || speechText.includes('stop') || speechText.includes('police') || speechText.includes('get off')) {
            writeLog(`CRITICAL DISTRESS TRIGGER PARSED: "${speechText}"`, 'danger');
            triggerEmergencyAlert();
          }
        }
      }
    };
    
    speechRecognizer.onerror = (e) => {
      console.log('Speech recognition error:', e);
    };
    
    speechRecognizer.onend = () => {
      if (isMicListening) speechRecognizer.start(); // keep listening
    };
    
    speechRecognizer.start();
  }
}

function simulateDistressVoiceTrigger() {
  playClickSound();
  writeLog('SIMULATING DISTRESS VOICE SIGNAL: "Help! Get away from me!"', 'danger');
  
  if (isMicListening) {
    // Visualizer spike animation
    const bars = document.querySelectorAll('.audio-bar');
    bars.forEach(bar => {
      bar.style.height = '95%';
      bar.style.background = 'var(--danger)';
    });
  }
  
  setTimeout(() => {
    triggerEmergencyAlert();
  }, 600);
}

// GUARDIAN HIRED ESCORT SERVICE
function hireVirtualEscort() {
  playClickSound();
  isEscortHired = true;
  
  hireEscortBtn.style.display = 'none';
  escortProfileActive.style.display = 'flex';
  
  writeLog('Virtual Safety Escort Hired: Officer Vance dispatched to monitor live coordinates.', 'safe');
  writeLog('Escort heartbeat connection handshake established.', 'info');
}

function dischargeVirtualEscort() {
  playClickSound();
  isEscortHired = false;
  
  hireEscortBtn.style.display = 'block';
  escortProfileActive.style.display = 'none';
  
  writeLog('Virtual Escort discharged from current watch sphere.', 'info');
}

// ONE-TOUCH PANIC HOTLINES dial simulation
window.simulateEmergencyDial = function(lineName) {
  playClickSound();
  writeLog(`Immediate dialing triggered to: ${lineName}`, 'danger');
  alert(`☎️ DIALING ${lineName.toUpperCase()}...\nSimulating standard emergency call deck redirection.`);
  triggerEmergencyAlert();
};

// EMERGENCY ALERT PULSING STATE (The Burst Bubble)
function triggerEmergencyAlert() {
  writeLog('WATCHDOG EMERGENCY BREACH! Bubble Safety Burst!', 'danger');
  
  // Highlight Phone
  phoneDevice.classList.remove('state-safe', 'state-warning');
  phoneDevice.classList.add('state-danger');
  
  safetySlider.value = 0;
  safetyLevelPct.textContent = '0%';
  safetyLevelPct.style.color = 'var(--danger)';
  comfortStatus.textContent = 'SOS BREACH';
  comfortIcon.style.color = 'var(--danger)';
  comfortIcon.className = 'fa-solid fa-circle-exclamation';
  safetyLevelDesc.textContent = 'EMERGENCY BROADCAST ACTIVE!';
  
  telemetryRisk.textContent = 'ALERT TRIGGERED';
  telemetryRisk.style.color = 'var(--danger)';
  telemetryGPSPingRate = 0.1;
  syncGPSHeartbeatRate();
  
  // Guardian Panic Overlays
  panicOverlay.classList.add('active');
  overrideSirenBtn.style.display = 'block';
  
  if (isEscortHired) {
    panicDetailsText.textContent = `🚨 ESCORT TELEMETRY ALERT: User has missed check-in! Officer Vance has buffered the ambient microphones and has flagged the San Francisco dispatch center. Live location coordinates locked.`;
  } else {
    panicDetailsText.textContent = `🚨 BUBBLE TELEMETRY BREACH: User did not disarm watchdog! Guardian alert deck triggered. Last locked location: 37.7749° N, 122.4218° W. Siren sounding!`;
  }
  
  // Sound alarm
  startSiren();
}

function resetSystemToNormal() {
  stopSiren();
  disarmWatchdog();
  
  // Reset slider
  safetySlider.value = 100;
  handleSafetySliderChange();
  
  // Remove panic HUD
  panicOverlay.classList.remove('active');
  overrideSirenBtn.style.display = 'none';
  
  // Reset Map Deviation
  mapPathDeviated = false;
  
  // Reset battery
  batteryLevel = 82;
  batteryIcon.className = 'fa-solid fa-battery-three-quarters';
  batteryIcon.style.color = '';
  
  writeLog('Safety Sphere fully reset. All parameters restored to okay.', 'safe');
}

// GPS CANVAS MAP DRAWING AND ROUTE SIMULATOR
let mapCtx = null;
let userPos = { x: 80, y: 150 };
let targetPos = { x: 320, y: 220 };
let mapTimer = null;
let routeCoordinates = [
  { x: 80, y: 150 },
  { x: 130, y: 150 },
  { x: 130, y: 240 },
  { x: 230, y: 240 },
  { x: 230, y: 120 },
  { x: 300, y: 120 },
  { x: 300, y: 220 }
];
let currentRouteIdx = 0;
let routeProgress = 0.0;

function initMap() {
  mapCtx = mapCanvas.getContext('2d');
  resizeMapCanvas();
  
  // Set up animation loops for GPS tracking
  animateMap();
  
  // Handle window resizing cleanly
  window.addEventListener('resize', resizeMapCanvas);
}

function resizeMapCanvas() {
  // Obtain exact bounding specs of container
  const box = mapCanvas.parentElement.getBoundingClientRect();
  mapCanvas.width = box.width;
  mapCanvas.height = box.height;
}

function animateMap() {
  requestAnimationFrame(animateMap);
  drawMapGrid();
}

function drawMapGrid() {
  if (!mapCtx) return;
  const w = mapCanvas.width;
  const h = mapCanvas.height;
  
  // Clear map frame with deep navy
  mapCtx.fillStyle = '#0f111a';
  mapCtx.fillRect(0, 0, w, h);
  
  // Draw nice grid lines
  mapCtx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  mapCtx.lineWidth = 1;
  const gridSize = 30;
  for (let x = 0; x < w; x += gridSize) {
    mapCtx.beginPath();
    mapCtx.moveTo(x, 0);
    mapCtx.lineTo(x, h);
    mapCtx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    mapCtx.beginPath();
    mapCtx.moveTo(0, y);
    mapCtx.lineTo(w, y);
    mapCtx.stroke();
  }
  
  // Draw roads / corridors (Glowing vectors)
  mapCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  mapCtx.lineWidth = 16;
  mapCtx.lineCap = 'round';
  mapCtx.lineJoin = 'round';
  
  mapCtx.beginPath();
  routeCoordinates.forEach((pt, idx) => {
    const screenX = scaleX(pt.x, w);
    const screenY = scaleY(pt.y, h);
    if (idx === 0) {
      mapCtx.moveTo(screenX, screenY);
    } else {
      mapCtx.lineTo(screenX, screenY);
    }
  });
  mapCtx.stroke();
  
  // Draw neon road overlays
  mapCtx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
  mapCtx.lineWidth = 6;
  mapCtx.stroke();
  
  // Draw starting point (Home) and destination
  const homeX = scaleX(routeCoordinates[0].x, w);
  const homeY = scaleY(routeCoordinates[0].y, h);
  mapCtx.fillStyle = 'var(--primary)';
  mapCtx.beginPath();
  mapCtx.arc(homeX, homeY, 6, 0, Math.PI * 2);
  mapCtx.fill();
  
  // Destination flag (Office/Safety Center)
  const destX = scaleX(routeCoordinates[routeCoordinates.length - 1].x, w);
  const destY = scaleY(routeCoordinates[routeCoordinates.length - 1].y, h);
  mapCtx.fillStyle = 'var(--secondary)';
  mapCtx.beginPath();
  mapCtx.arc(destX, destY, 8, 0, Math.PI * 2);
  mapCtx.fill();
  
  // Move User Position on Map Route over time
  updateUserPosTrajectory();
  
  // Calculate scaled user coordinates
  const scaleUserX = scaleX(userPos.x, w);
  const scaleUserY = scaleY(userPos.y, h);
  
  // Pulse threat area if danger slider is lowered or user is deviated
  if (mapPathDeviated || currentSafetyVal < 40) {
    const pulseRadius = 15 + Math.sin(Date.now() / 150) * 8;
    mapCtx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    mapCtx.beginPath();
    mapCtx.arc(scaleUserX, scaleUserY, pulseRadius + 10, 0, Math.PI * 2);
    mapCtx.fill();
    
    mapCtx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    mapCtx.lineWidth = 2;
    mapCtx.beginPath();
    mapCtx.arc(scaleUserX, scaleUserY, pulseRadius, 0, Math.PI * 2);
    mapCtx.stroke();
  }
  
  // Draw Glowing User Safety Bubble Point
  const bubbleColor = currentSafetyVal >= 70 ? 'var(--safe)' : (currentSafetyVal >= 30 ? 'var(--warning)' : 'var(--danger)');
  mapCtx.shadowColor = bubbleColor;
  mapCtx.shadowBlur = 15;
  mapCtx.fillStyle = bubbleColor;
  mapCtx.beginPath();
  mapCtx.arc(scaleUserX, scaleUserY, 8, 0, Math.PI * 2);
  mapCtx.fill();
  mapCtx.shadowBlur = 0; // reset
  
  // Draw user details bubble pointer tag
  mapCtx.fillStyle = 'rgba(13, 14, 21, 0.85)';
  mapCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  mapCtx.lineWidth = 1;
  mapCtx.beginPath();
  mapCtx.roundRect(scaleUserX - 35, scaleUserY - 32, 70, 18, 4);
  mapCtx.fill();
  mapCtx.stroke();
  
  mapCtx.fillStyle = '#fff';
  mapCtx.font = 'bold 8px "Plus Jakarta Sans"';
  mapCtx.textAlign = 'center';
  mapCtx.fillText('BUBBLE USER', scaleUserX, scaleUserY - 20);
}

// Scale factors to fit path relative to varying viewport size
function scaleX(val, maxW) {
  return (val / 380) * (maxW - 40) + 20;
}
function scaleY(val, maxH) {
  return (val / 300) * (maxH - 40) + 20;
}

function updateUserPosTrajectory() {
  if (watchdogActive) {
    routeProgress += 0.001;
    if (routeProgress >= 1.0) {
      routeProgress = 0.0;
      currentRouteIdx = (currentRouteIdx + 1) % (routeCoordinates.length - 1);
    }
    
    const p1 = routeCoordinates[currentRouteIdx];
    const p2 = routeCoordinates[currentRouteIdx + 1];
    
    if (mapPathDeviated) {
      // Cause random vector drifting representing erratic course
      userPos.x += (Math.random() - 0.5) * 0.8;
      userPos.y += (Math.random() - 0.4) * 0.8;
    } else {
      userPos.x = p1.x + (p2.x - p1.x) * routeProgress;
      userPos.y = p1.y + (p2.y - p1.y) * routeProgress;
    }
    
    // update telemetry coords hud label
    const lat = (37.7749 + (userPos.y - 150) * 0.00001).toFixed(6);
    const lon = (-122.4194 + (userPos.x - 80) * 0.00001).toFixed(6);
    coordinatesText.textContent = `GPS: ${lat}° N, ${lon}° W | ACC: 4.8m | SPD: ${mapPathDeviated ? '7.5' : '3.6'} km/h`;
  }
}

// GPS Heartbeat log timing adjustments
function syncGPSHeartbeatRate() {
  clearInterval(watchdogGPSInterval);
  if (!watchdogActive) return;
  
  const pingDuration = telemetryGPSPingRate * 1000;
  
  watchdogGPSInterval = setInterval(() => {
    const lat = (37.7749 + (userPos.y - 150) * 0.00001).toFixed(5);
    const lon = (-122.4194 + (userPos.x - 80) * 0.00001).toFixed(5);
    
    const indicator = currentSafetyVal >= 70 ? 'safe' : (currentSafetyVal >= 30 ? 'warning' : 'danger');
    writeLog(`GPS Heartbeat: Ping locked at [${lat}, ${lon}]. Signal solid.`, indicator);
    
    // Sync telemetry speed on side widgets
    telemetryGPS.textContent = `${telemetryGPSPingRate}s / ${indicator.toUpperCase()}`;
    telemetryGPS.style.color = `var(--${indicator})`;
  }, pingDuration);
}

function toggleMapDeviation() {
  playClickSound();
  if (mapPathDeviated) {
    mapPathDeviated = false;
    writeLog('Telemetry course aligned. User restored to route guidelines.', 'safe');
    simDeviateBtn.innerHTML = '<i class="fa-solid fa-route"></i> Walk Off-Route';
  } else {
    mapPathDeviated = true;
    writeLog('WARN: Telemetry anomaly! Passenger has deviated from the safe designated pathway vectors!', 'danger');
    simDeviateBtn.innerHTML = '<i class="fa-solid fa-person-falling-burst"></i> Align Route';
    
    // Automatically reduce comfort index
    safetySlider.value = 25;
    handleSafetySliderChange();
  }
}

function triggerLowBatteryWarning() {
  playClickSound();
  batteryLevel = 3;
  batteryIcon.className = 'fa-solid fa-battery-empty';
  batteryIcon.style.color = 'var(--danger)';
  
  writeLog('TELEMETRY WARNING: Watchdog device battery critical (3%). Discharging secondary cell.', 'danger');
  writeLog('Automatic battery reserve mode activated. Priming backup safety grids.', 'warning');
}

// AUDIO WAVE STANDBY PULSE ANIMATION MOCK
let visualizerInterval = null;
function startVisualizerStandby() {
  visualizerInterval = setInterval(() => {
    const bars = document.querySelectorAll('.audio-bar');
    const multiplier = currentSafetyVal >= 70 ? 0.3 : (currentSafetyVal >= 30 ? 0.6 : 0.95);
    
    bars.forEach(bar => {
      if (isMicListening) {
        // High rapid dynamic jumps represent streaming live data
        const jump = Math.floor(Math.random() * 80 * multiplier) + 10;
        bar.style.height = `${jump}%`;
        bar.style.background = currentSafetyVal >= 70 ? 'linear-gradient(to top, var(--primary), var(--secondary))' : (currentSafetyVal >= 30 ? 'var(--warning)' : 'var(--danger)');
      } else {
        // standard soft idling waves
        const idle = Math.floor(Math.random() * 20) + 5;
        bar.style.height = `${idle}%`;
        bar.style.background = 'rgba(255, 255, 255, 0.15)';
      }
    });
  }, 120);
}

function updateAudioVisualizerSpeed() {
  // Visualizer speed changes based on slider states
  if (isMicListening) {
    audioVisualizerText.textContent = currentSafetyVal < 30 ? '🚨 HIGH THREAT RECORDING ACTIVATED' : 'STREAMING LIVE TELEMETRY FEED';
    audioVisualizerText.style.color = currentSafetyVal < 30 ? 'var(--danger)' : '';
  }
}
