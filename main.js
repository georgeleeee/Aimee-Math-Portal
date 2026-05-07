// Aimee Portal 1.0 - Core Engine

let curriculumData = null;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    await loadData();
    renderJourney(8); // 当前为第 8 周
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
    // 1. 更新 UI 状态
    document.querySelectorAll('.content-view').forEach(view => {
        view.classList.add('hidden');
    });
    document.getElementById(`view-${viewId}`).classList.remove('hidden');

    // 2. 更新侧边栏激活状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = Array.from(document.querySelectorAll('.nav-item')).find(item => 
        item.getAttribute('onclick').includes(viewId)
    );
    if (activeItem) activeItem.classList.add('active');

    // 3. 更新标题
    const titles = {
        'journey': '每周任务',
        'translator': '数学翻译机',
        'lab': '试错实验室',
        'workshop': '重新发明工坊',
        'studio': '费曼录音棚',
        'upload': '习题册上传',
        'vault': '学习笔记'
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
            item.innerHTML = `<span>📄</span><span>${file.name}</span><span class="status">上传中...</span>`;
            fileList.appendChild(item);

            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    item.querySelector('.status').innerText = '✅ 已同步';
                    item.querySelector('.status').style.color = 'var(--accent-secondary)';
                }
            } catch (error) {
                item.querySelector('.status').innerText = '❌ 失败';
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
    document.getElementById('current-week-desc').innerText = week.category;

    const taskList = document.getElementById('task-list');
    taskList.innerHTML = `
        <div class="task-card current">
            <div class="task-icon">📍</div>
            <div class="task-info">
                <h3>本周探索任务</h3>
                <p>${week.weekend_task}</p>
                <div class="mini-progress"><div class="bar" style="width: 40%"></div></div>
            </div>
        </div>
        <div class="task-card" onclick="switchView('studio')">
            <div class="task-icon">🎙️</div>
            <div class="task-info">
                <h3>费曼复盘目标</h3>
                <p>${week.feynman_goal}</p>
                <span class="tap-hint">点击进入录音棚 →</span>
            </div>
        </div>
        <div class="task-card">
            <div class="task-icon">💡</div>
            <div class="task-info">
                <h3>思维方法论</h3>
                <p>${week.methodology}</p>
            </div>
        </div>
    `;

    // 动态更新 3D 工坊占位符
    const workshopTopic = document.querySelector('.placeholder-3d p');
    if (workshopTopic) workshopTopic.innerText = `本周课题：${week.topic}`;
}


function toggleGroup(groupId) {
    const group = document.getElementById(`group-${groupId}`);
    group.classList.toggle('collapsed');
}

function initNav() {
    // 已经在 HTML 中通过 onclick 实现
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

    const botMsgDiv = appendMessage('bot', "..."); // Placeholder for typing

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        const data = await response.json();
        botMsgDiv.innerText = data.reply;
    } catch (error) {
        botMsgDiv.innerText = "哎呀，连接助教失败了。";
    }
}

function appendMessage(role, text) {
    const chatMessages = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgDiv;
}

async function runTranslation() {
    const step1 = document.getElementById('trans-step-1').value;
    const step2 = document.getElementById('trans-step-2').value;
    const resultArea = document.getElementById('translation-result');

    if (!step1 || !step2) {
        alert("艾米，请先完成白描和建模两个步骤哦！");
        return;
    }

    resultArea.classList.remove('hidden');
    resultArea.innerText = "🔍 正在分析你的翻译逻辑...";

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: `[数学翻译机任务] 题目条件：${step1}。列出的等式：${step2}。请点评我的翻译逻辑，引导我检查是否正确，不要直接给答案。`
            })
        });
        const data = await response.json();
        resultArea.innerText = data.reply;
    } catch (error) {
        resultArea.innerText = "分析失败，请检查网络。";
    }
}

async function runExperiment() {
    const scratch = document.getElementById('lab-scratch').innerText;
    const resultArea = document.getElementById('lab-result');

    resultArea.classList.remove('hidden');
    resultArea.innerText = "🧪 正在验证你的试错路径...";

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: `[试错实验室任务] 我的试错记录：${scratch}。请根据我的尝试，引导我发现矛盾点或验证规律。`
            })
        });
        const data = await response.json();
        resultArea.innerText = data.reply;
    } catch (error) {
        resultArea.innerText = "实验室连接中断。";
    }
}

function insertLabSnippet(type) {
    const scratch = document.getElementById('lab-scratch');
    const snippets = {
        '0 或 1': "\n[代入尝试] 如果未知数是 0 或 1，会发生：",
        '极大值': "\n[极限尝试] 如果未知数变成 1,000,000，会发生：",
        '反证法': "\n[反证假设] 假设结论不成立，那么："
    };
    scratch.innerText += snippets[type];
    scratch.focus();
}

let isRecording = false;
function toggleRecording() {
    const btn = document.querySelector('.record-btn');
    const studio = document.querySelector('.studio-ui');
    isRecording = !isRecording;
    
    if (isRecording) {
        btn.innerText = "■ 停止录制";
        studio.classList.add('recording');
        // 这里将来可以调用 MediaRecorder API
    } else {
        btn.innerText = "● 开始录制";
        studio.classList.remove('recording');
        appendMessage('bot', "艾米，你的讲解我已经收到了！讲得非常有逻辑。");
    }
}

function toggleChat() {
    const wrapper = document.getElementById('chat-wrapper');
    const toggle = document.getElementById('chat-toggle');
    wrapper.classList.toggle('active');
    toggle.style.display = wrapper.classList.contains('active') ? 'none' : 'flex';
}

// 绑定到 window
window.toggleChat = toggleChat;
window.runTranslation = runTranslation;
window.runExperiment = runExperiment;
window.insertLabSnippet = insertLabSnippet;
window.toggleRecording = toggleRecording;
