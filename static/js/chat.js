/**
 * Apple Support Chat — Main Controller
 * Premium interaction layer for AI-powered Apple support
 */

const API = {
  chat: '/chat',
  reset: '/reset'
};

/* ── State ── */
let chatActive = false;
let isTyping = false;

/* ── DOM References ── */
const welcomeScreen   = document.getElementById('welcome-screen');
const chatInterface   = document.getElementById('chat-interface');
const messagesEl      = document.getElementById('messages-container');
const typingIndicator = document.getElementById('typing-indicator');
const messageInput    = document.getElementById('message-input');
const sendBtn         = document.getElementById('send-btn');
const scrollBtn       = document.getElementById('scroll-btn');
const chips           = document.querySelectorAll('.chip');
const welcomeInput    = document.getElementById('welcome-input');
const welcomeSendBtn  = document.getElementById('welcome-send-btn');
const homeBtn         = document.getElementById('home-btn');

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Staggered chip animation
  chips.forEach((chip, i) => {
    setTimeout(() => chip.classList.add('visible'), 350 + i * 90);
  });

  // ── Welcome input bar ──
  welcomeInput.addEventListener('input', () => {
    welcomeInput.style.height = 'auto';
    welcomeInput.style.height = Math.min(welcomeInput.scrollHeight, 100) + 'px';
    welcomeSendBtn.disabled = welcomeInput.value.trim().length === 0;
  });

  welcomeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!welcomeSendBtn.disabled) sendFromWelcome();
    }
  });

  welcomeSendBtn.addEventListener('click', () => {
    if (!welcomeSendBtn.disabled) sendFromWelcome();
  });

  // ── Home button (Apple logo) ──
  homeBtn.addEventListener('click', () => {
    if (chatActive) {
      resetConversation();
    }
  });

  // ── Chat input bar ──
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    updateSendBtn();
  });

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) sendMessage();
    }
  });

  // Chip clicks
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.textContent.trim();
      activateChat(text);
    });
  });

  // Send button
  sendBtn.addEventListener('click', () => {
    if (!sendBtn.disabled) sendMessage();
  });

  // Scroll button
  scrollBtn.addEventListener('click', () => scrollToBottom(true));

  // New conversation
  document.getElementById('new-convo-btn').addEventListener('click', resetConversation);

  // Scroll detection for scroll-to-bottom button
  messagesEl.addEventListener('scroll', handleScroll);

  // Initial send button state
  updateSendBtn();
});

/* ══════════════════════════════════════════════
   SEND FROM WELCOME INPUT
══════════════════════════════════════════════ */
function sendFromWelcome() {
  const text = welcomeInput.value.trim();
  if (!text) return;
  welcomeInput.value = '';
  welcomeInput.style.height = 'auto';
  welcomeSendBtn.disabled = true;
  activateChat(text);
}

/* ══════════════════════════════════════════════
   WELCOME → CHAT TRANSITION
══════════════════════════════════════════════ */
function activateChat(initialMessage = null) {
  if (chatActive) return;
  chatActive = true;

  // Slide out welcome screen
  welcomeScreen.classList.add('slide-out');

  // Slide in chat interface after a brief moment
  setTimeout(() => {
    chatInterface.classList.add('visible');
    welcomeScreen.style.display = 'none';

    if (initialMessage) {
      messageInput.value = initialMessage;
      updateSendBtn();
      setTimeout(() => sendMessage(), 100);
    } else {
      messageInput.focus();
    }
  }, 380);
}

/* ══════════════════════════════════════════════
   SEND MESSAGE
══════════════════════════════════════════════ */
async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || isTyping) return;

  if (!chatActive) {
    activateChat(null);
    await sleep(550);
  }

  // Clear input
  messageInput.value = '';
  messageInput.style.height = 'auto';
  updateSendBtn();

  // Render user bubble
  appendMessage('user', text);
  scrollToBottom();

  // Show typing
  showTyping();

  // Fetch response
  try {
    const res = await fetch(API.chat, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    hideTyping();
    appendMessage('agent', data.response);
    scrollToBottom();
  } catch (err) {
    hideTyping();
    appendMessage('agent', "I'm having trouble connecting right now. Please try again in a moment.");
    scrollToBottom();
    console.error('Chat error:', err);
  }

  messageInput.focus();
}

/* ══════════════════════════════════════════════
   RENDER MESSAGES
══════════════════════════════════════════════ */
function appendMessage(role, text) {
  const group = document.createElement('div');
  group.className = `message-group ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  const timestamp = document.createElement('div');
  timestamp.className = 'message-timestamp';
  timestamp.textContent = formatTime(new Date());

  group.appendChild(bubble);
  group.appendChild(timestamp);

  // Insert before typing indicator
  messagesEl.insertBefore(group, typingIndicator);

  // Trigger reflow for animation
  group.getBoundingClientRect();
}

/* ══════════════════════════════════════════════
   TYPING INDICATOR
══════════════════════════════════════════════ */
function showTyping() {
  isTyping = true;
  updateSendBtn();
  typingIndicator.style.display = 'flex';
  // Small delay to allow display change before opacity transition
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      typingIndicator.classList.add('visible');
    });
  });
  scrollToBottom();
}

function hideTyping() {
  isTyping = false;
  updateSendBtn();
  typingIndicator.classList.remove('visible');
  setTimeout(() => {
    typingIndicator.style.display = 'none';
  }, 300);
}

/* ══════════════════════════════════════════════
   RESET CONVERSATION
══════════════════════════════════════════════ */
async function resetConversation() {
  // Fade out messages
  messagesEl.classList.add('fading');
  await sleep(300);

  // Clear messages (keep typing indicator)
  const msgs = messagesEl.querySelectorAll('.message-group, .date-divider');
  msgs.forEach(el => el.remove());

  messagesEl.classList.remove('fading');

  // Slide out chat, bring back welcome
  chatInterface.classList.remove('visible');

  await sleep(200);

  welcomeScreen.style.display = 'flex';
  chatActive = false;

  // Re-trigger chip animation
  chips.forEach(chip => chip.classList.remove('visible'));

  // Small delay then slide welcome in
  requestAnimationFrame(() => {
    welcomeScreen.classList.remove('slide-out');
    chips.forEach((chip, i) => {
      setTimeout(() => chip.classList.add('visible'), 350 + i * 90);
    });
  });

  // Call reset API
  try {
    await fetch(API.reset, { method: 'POST' });
  } catch (e) {
    console.warn('Reset API error (may be fine):', e);
  }

  hideTyping();
}

/* ══════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════ */
function scrollToBottom(smooth = false) {
  requestAnimationFrame(() => {
    messagesEl.scrollTo({
      top: messagesEl.scrollHeight,
      behavior: smooth ? 'smooth' : 'instant'
    });
  });
}

function handleScroll() {
  const distFromBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight;
  if (distFromBottom > 120) {
    scrollBtn.classList.add('visible');
  } else {
    scrollBtn.classList.remove('visible');
  }
}

function updateSendBtn() {
  const hasText = messageInput.value.trim().length > 0;
  sendBtn.disabled = !hasText || isTyping;
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

