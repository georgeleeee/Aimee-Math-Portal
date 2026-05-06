// Aimee Portal 1.0 - Core Engine
let curriculumData = null;

document.addEventListener('DOMContentLoaded', () => {
      initApp();
});

async function initApp() {
      await loadData();
      renderJourney(8); 
    initNav();
}

async function loadData() {
      try {
                const response = await fetch('curriculum.json');
                curriculumData = await response.json();
      } catch (error) {
                console.error('Data load failed:', error);
      }
}

function switchView(viewId) {
      document.querySelectorAll('.content-view').forEach(view => {
                view.classList.add('hidden');
      });
      document.getElementById(`view-${viewId}`).classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(item => {
              item.classList.remove('active');
    });
      const activeItem = Array.from(document.querySelectorAll('.nav-item')).find(item =>
                item.getAttribute('onclick').includes(viewId)
                                                                                     );
      if (activeItem) activeItem.classList.add('active');

    const titles = {
              'journey': 'Weekly Tasks',
              'translator': 'Math Translator',
              'lab': 'Trial Lab',
              'workshop': 'Workshop',
              'studio': 'Feynman Studio',
              'upload': 'Upload',
              'vault': 'Notes'
    };
      document.getElementById('view-title').innerText = titles[viewId];

    if (viewId === 'upload') initUpload();
}

function initUpload() {
      const fileInput = document.getElementById('file-input');
      const fileList = document.getElementById('file-list');

    fileInput.onchange = async (e) => {
              const files = Array.from(e.target.files);
              fileList.innerHTML = '';

              for (const file of files) {
                            const formData = new FormData();
                            formData.append('file', file);

              const item = document.createElement('div');
                            item.className = 'file-item';
                            item.innerHTML = `<span>[File]</span><span>${file.name}</span><span class="status">Syncing...</span>`;
                            fileList.appendChild(item);

                  try {
                                    const response = await fetch('/upload', {
                                                          method: 'POST',
                                                          body: formData
                                    });
                                    if (response.ok) {
                                                          item.querySelector('.status').innerText = 'Synced';
                                                          item.querySelector('.status').style.color = 'var(--accent-secondary)';
                                    }
                  } catch (error) {
                                                                            item.querySelector('.status').innerText = 'Failed';
                                    console.error("Upload failed:", error);
                  }
              }
    };
}

function renderJourney(weekNum) {
      if (!curriculumData) return;
      const week = curriculumData.weeks.find(w => w.week === weekNum) || curriculumData.weeks[0];

    document.getElementById('current-week-tag').innerText = `WEEK ${week.week}`;
      document.getElementById('current-week-topic').innerText = week.topic;
      document.getElementById('current-week-desc').innerText = week.weekend_task;

    const 
  function toggleGroup(groupId) {
          const group = document.getElementById(`group-${groupId}`);
          group.classList.toggle('collapsed');
                  }

function initNav() {
}

window.switchView = switchView;
  window.toggleChat = toggleChat;

function handleChatKey(e) {
      if (e.key === 'Enter') sendChatMessage();
}

                async function sendChatMessage() {
      const input = document.getElementById('user-input');
                      const message = input.value.trim();
                      if (!message) return;

      appendMessage('user', message);
                      input.value = '';

      try {
                const response = await fetch('https://collect-discounts-parade-fuji.trycloudflare.com/chat', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ message: message })
                });
                const data = await response.json();
                appendMessage('bot', data.reply);
      } catch (error) {
                appendMessage('bot', "Connection failed.");
      }
                }

function appendMessage(role, text) {
      const chatMessages = document.getElementById('chat-messages');
      const msgDiv = document.createElement('div');
      msgDiv.className = `message ${role}`;
      msgDiv.innerText = text;
      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
}

function toggleChat() {
      const wrapper = document.getElementById('chat-wrapper');
      const toggle = document.getElementById('chat-toggle');
      wrapper.classList.toggle('active');
      toggle.style.display = wrapper.classList.contains('active') ? 'none' : 'flex';
}
  
