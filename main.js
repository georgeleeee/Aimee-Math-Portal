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

    const taskList = document.getElementById('task-list');
          taskList.innerHTML = `
                  <div class="task-card current">
                              <div class="task-icon">#</div>
                                          <div class="task-info">
                                                          <h3>Weekly Task</h3>
                                                                          <p>${week.weekend_task}</p>
                                                                                      <
