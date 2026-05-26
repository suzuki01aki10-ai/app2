// 習慣化トラッカーのJavaScript（機能・動き）

const STORAGE_KEY = 'habitTrackerData';
const habitInput = document.getElementById('habit-input');
const categorySelect = document.getElementById('category-select');
const addHabitButton = document.getElementById('add-habit-button');
const selectModeButton = document.getElementById('select-mode-button');
const actionPanel = document.getElementById('action-panel');
const selectedCountLabel = document.getElementById('selected-count');
const editSelectedButton = document.getElementById('edit-selected-button');
const deleteSelectedButton = document.getElementById('delete-selected-button');
const habitList = document.getElementById('habit-list');
const emptyMessage = document.getElementById('empty-message');
const messageBox = document.getElementById('message-box');
const celebrationContainer = document.getElementById('celebration-container');
let diaryDateLabel = document.getElementById('diary-date');
let diaryText = document.getElementById('diary-text');
let saveDiaryButton = document.getElementById('save-diary-button');
let diaryStatus = document.getElementById('diary-status');
let diaryBackButton = null;
let selectedHabits = new Set();
let selectionMode = false;

const categories = {
    exercise: { label: '運動', color: '#e74c3c' },
    study: { label: '勉強', color: '#3498db' },
    daily: { label: '生活習慣', color: '#2ecc71' },
};

const motivationalMessages = [
    'ナイス継続！💪',
    '素晴らしい！✨',
    '今日も一歩前進！🔥',
    'よくやった！👏',
    '継続力が育っています！🌱',
];

const milestoneMessages = {
    3: '3日連続おめでとう！🎉',
    7: '7日連続の大記録！🎊',
};

// --- 関数定義（ここを上に移動して、ブラウザが先に覚えるようにしました） ---

function loadHabits() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        return [];
    }

    try {
        const parsed = JSON.parse(saved);
        return parsed.map(h => ({
            id: h.id,
            name: h.name,
            category: h.category || 'daily',
            streak: typeof h.streak === 'number' ? h.streak : 0,
            lastCompletedDate: h.lastCompletedDate || null,
            completedToday: !!h.completedToday,
            completedDates: Array.isArray(h.completedDates) ? h.completedDates : (h.lastCompletedDate ? [h.lastCompletedDate] : []),
        }));
    } catch (error) {
        console.error('LocalStorageのデータ読み込みに失敗しました。', error);
        return [];
    }
}

const DIARY_STORAGE_KEY = 'habitTrackerDiaryData';

function loadDiaryEntries() {
    const saved = localStorage.getItem(DIARY_STORAGE_KEY);
    if (!saved) {
        return [];
    }

    try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('日記データの読み込みに失敗しました。', error);
        return [];
    }
}

let habits = loadHabits();
let diaryEntries = loadDiaryEntries();

function saveDiaryEntries() {
    localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(diaryEntries));
}

function getDiaryEntry(date) {
    return diaryEntries.find(entry => entry.date === date) || null;
}

function queryDiaryElements() {
    diaryDateLabel = document.getElementById('diary-date');
    diaryText = document.getElementById('diary-text');
    saveDiaryButton = document.getElementById('save-diary-button');
    diaryStatus = document.getElementById('diary-status');
    diaryBackButton = document.getElementById('diary-back');
}

function queryMoodElements() {
    const moodButtons = document.querySelectorAll('.mood-button');
    return Array.from(moodButtons);
}

function setSelectedMood(mood) {
    const buttons = queryMoodElements();
    buttons.forEach(b => b.classList.toggle('selected', b.dataset.mood === mood));
}

function getSelectedMood() {
    const buttons = queryMoodElements();
    const found = buttons.find(b => b.classList.contains('selected'));
    return found ? found.dataset.mood : null;
}

function renderDiaryEntry(date) {
    if (!diaryDateLabel || !diaryText) return;

    currentDiaryDate = date;
    diaryDateLabel.textContent = `${date} の日記`;
    const todayEntry = getDiaryEntry(date);
    diaryText.value = todayEntry ? todayEntry.content : '';
    // 感情スタンプの読み込み
    const mood = todayEntry && todayEntry.mood ? todayEntry.mood : null;
    setSelectedMood(mood);
}

function saveHabits() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function getToday() {
    return formatDate(new Date());
}

function getYesterday(dateString) {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1);
    return formatDate(date);
}

function getRandomMessage() {
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
}

function showFloatingMessage(text) {
    const message = document.createElement('div');
    message.className = 'floating-message';
    message.textContent = text;
    messageBox.appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 1500);
}

function showConfetti() {
    const colors = ['#4a90e2', '#7dc67d', '#f39c51', '#f16565', '#9b59b6'];

    for (let i = 0; i < 16; i++) {
        const piece = document.createElement('span');
        piece.className = 'confetti-piece';
        const color = colors[Math.floor(Math.random() * colors.length)];
        piece.style.backgroundColor = color;
        const left = Math.random() * 80 + 10;
        const xOffset = (Math.random() - 0.5) * 140;
        piece.style.left = `${left}%`;
        piece.style.setProperty('--x', `${xOffset}px`);
        piece.style.animationDuration = `${1 + Math.random() * 0.5}s`;
        piece.style.animationDelay = `${Math.random() * 0.2}s`;
        celebrationContainer.appendChild(piece);

        setTimeout(() => {
            piece.remove();
        }, 1800);
    }
}

function renderHabits() {
    habitList.innerHTML = '';

    if (habits.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    habits.forEach(habit => {
        const listItem = document.createElement('li');
        listItem.className = 'habit-item';

        const label = document.createElement('label');
        label.className = 'habit-label';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'select-checkbox';
        checkbox.checked = selectedHabits.has(habit.id);
        checkbox.disabled = !selectionMode;
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                selectedHabits.add(habit.id);
            } else {
                selectedHabits.delete(habit.id);
            }
            updateSelectionPanel();
        });

        const textContainer = document.createElement('div');
        textContainer.className = 'habit-meta';

        const name = document.createElement('div');
        name.className = 'habit-name';
        name.textContent = habit.name;

        const categoryData = categories[habit.category] || { label: 'その他', color: '#999' };
        const categoryChip = document.createElement('span');
        categoryChip.className = 'category-chip';
        categoryChip.textContent = categoryData.label;
        categoryChip.style.backgroundColor = categoryData.color;

        const info = document.createElement('div');
        info.className = 'habit-info';
        info.textContent = habit.streak > 0 ? `${habit.streak}日連続！` : 'まだ挑戦していません。';

        const topLine = document.createElement('div');
        topLine.style.display = 'flex';
        topLine.style.alignItems = 'center';
        topLine.style.gap = '10px';
        topLine.appendChild(name);
        topLine.appendChild(categoryChip);

        textContainer.appendChild(topLine);
        textContainer.appendChild(info);

        label.appendChild(checkbox);
        label.appendChild(textContainer);

        const actionGroup = document.createElement('div');
        actionGroup.className = 'actions';

        const completeButton = document.createElement('button');
        completeButton.className = 'complete-button';
        completeButton.type = 'button';
        completeButton.textContent = '完了';
        completeButton.addEventListener('click', () => completeHabit(habit.id));

        actionGroup.appendChild(completeButton);

        listItem.appendChild(label);
        listItem.appendChild(actionGroup);
        habitList.appendChild(listItem);
    });
}

function addHabit(name, category) {
    const trimmedName = name.trim();
    if (trimmedName === '') {
        alert('習慣の名前を入力してください。');
        return;
    }

    const newHabit = {
        id: Date.now().toString(),
        name: trimmedName,
        category,
        streak: 0,
        lastCompletedDate: null,
        completedToday: false,
        completedDates: [],
    };

    habits.push(newHabit);
    saveHabits();
    refreshUI();
    habitInput.value = '';
}

function completeHabit(id) {
    const today = getToday();
    let shouldShowMotivation = false;
    let milestoneText = null;

    habits = habits.map(habit => {
        if (habit.id !== id) {
            return habit;
        }

        const updatedHabit = { ...habit };

        if (habit.lastCompletedDate === today) {
            return updatedHabit;
        }

        shouldShowMotivation = true;
        if (habit.lastCompletedDate === getYesterday(today)) {
            updatedHabit.streak = habit.streak + 1;
        } else {
            updatedHabit.streak = 1;
        }
        updatedHabit.lastCompletedDate = today;
        if (!Array.isArray(updatedHabit.completedDates)) updatedHabit.completedDates = [];
        if (!updatedHabit.completedDates.includes(today)) {
            updatedHabit.completedDates.push(today);
        }
        milestoneText = milestoneMessages[updatedHabit.streak] || null;
        return updatedHabit;
    });

    saveHabits();
    renderHabits();

    if (shouldShowMotivation) {
        showFloatingMessage(getRandomMessage());
        if (milestoneText) {
            showFloatingMessage(milestoneText);
            showConfetti();
        }
    }
}

function refreshUI() {
    renderHabits();
    renderMiniCalendar();
}

function renderMiniCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthLabel = document.getElementById('calendar-month');
    const legend = document.getElementById('calendar-legend');
    if (!grid || !monthLabel || !legend) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthLabel.textContent = `${year}年 ${month + 1}月`;

    legend.innerHTML = '';
    Object.keys(categories).forEach(key => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        const color = document.createElement('span');
        color.className = 'legend-color';
        color.style.backgroundColor = categories[key].color;
        const txt = document.createElement('span');
        txt.textContent = categories[key].label;
        item.appendChild(color);
        item.appendChild(txt);
        legend.appendChild(item);
    });

    grid.innerHTML = '';
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day';
        grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        cell.dataset.date = dateStr;
        const num = document.createElement('div');
        num.className = 'day-number';
        num.textContent = d;

        // 今日を強調
        if (dateStr === getToday()) {
            num.classList.add('today-number');
        }

        cell.appendChild(num);

        const dots = document.createElement('div');
        dots.className = 'calendar-dots';

        habits.forEach(habit => {
            if (Array.isArray(habit.completedDates) && habit.completedDates.includes(dateStr)) {
                const dot = document.createElement('span');
                dot.className = 'calendar-dot';
                const color = (categories[habit.category] && categories[habit.category].color) || '#999';
                dot.style.backgroundColor = color;
                dots.appendChild(dot);
            }
        });

        cell.appendChild(dots);

        // 日記がある日にはアイコンを表示
        const diaryEntry = getDiaryEntry(dateStr);
        if (diaryEntry) {
            const icon = document.createElement('span');
            icon.className = 'diary-icon';
            icon.textContent = '📖';
            cell.appendChild(icon);
        }

        // 日付クリックで日記タブへ遷移してその日付を表示
        cell.addEventListener('click', () => {
            activateTab('tab-diary');
            renderDiaryEntry(dateStr);
        });

        grid.appendChild(cell);
    }
}

function showSavePopup(message) {
    const popup = document.getElementById('save-popup');
    if (!popup) return;
    popup.textContent = message;
    popup.classList.add('show');
    popup.setAttribute('aria-hidden', 'false');
    clearTimeout(showSavePopup.timer);
    showSavePopup.timer = setTimeout(() => {
        popup.classList.remove('show');
        popup.setAttribute('aria-hidden', 'true');
    }, 1400);
}

// 外部からタブを切り替えられるようにする（他の関数から呼び出す）
function activateTab(tabId) {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPages = document.querySelectorAll('.tab-page');

    tabPages.forEach(p => {
        p.classList.toggle('active', p.id === tabId);
    });

    tabButtons.forEach(b => {
        const isActive = b.dataset.tab === tabId;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    if (tabId === 'tab-calendar') {
        renderMiniCalendar();
    }
}

// 現在表示している日記の日付（renderDiaryEntry で更新される）
let currentDiaryDate = null;

function saveDiary() {
    const date = currentDiaryDate || getToday();
    const content = diaryText ? diaryText.value.trim() : '';
    const existing = getDiaryEntry(date);
    const mood = getSelectedMood();

    if (existing) {
        existing.content = content;
        existing.mood = mood;
    } else {
        diaryEntries.push({ date, content, mood });
    }

    saveDiaryEntries();
    renderDiaryEntry(date);
    showFloatingMessage('日記を保存しました。');
    // カレンダーの表示を更新してアイコンを反映
    renderMiniCalendar();
    // 保存後はポップアップではなくカレンダータブへ遷移
    activateTab('tab-calendar');
}

function editHabit(id) {
    const target = habits.find(habit => habit.id === id);
    if (!target) {
        return;
    }

    const newName = prompt('習慣名を編集してください。', target.name);
    if (newName === null) {
        return;
    }

    const trimmedName = newName.trim();
    if (trimmedName === '') {
        alert('習慣名は空にできません。');
        return;
    }

    const newCategory = prompt('カテゴリを変更する場合は「運動」「勉強」「生活習慣」を入力してください。', categories[target.category].label);
    let categoryKey = target.category;
    if (newCategory !== null) {
        const foundKey = Object.keys(categories).find(key => categories[key].label === newCategory.trim());
        if (foundKey) {
            categoryKey = foundKey;
        }
    }

    habits = habits.map(habit => {
        if (habit.id !== id) {
            return habit;
        }
        return { ...habit, name: trimmedName, category: categoryKey };
    });

    saveHabits();
    renderHabits();
}

function deleteSelectedHabits() {
    if (selectedHabits.size === 0) {
        alert('まずは削除したい項目をチェックしてください。');
        return;
    }

    habits = habits.filter(habit => !selectedHabits.has(habit.id));
    selectedHabits.clear();
    updateSelectionPanel();
    saveHabits();
    refreshUI();
}

function editSelectedHabit() {
    if (selectedHabits.size !== 1) {
        alert('編集は1つだけ選択した状態で行ってください。');
        return;
    }

    const id = Array.from(selectedHabits)[0];
    editHabit(id);
    refreshUI();
}

function updateSelectionPanel() {
    selectedCountLabel.textContent = `${selectedHabits.size} 件選択中`;
    if (selectionMode && selectedHabits.size > 0) {
        actionPanel.classList.remove('hidden');
    } else {
        actionPanel.classList.add('hidden');
    }
}

function toggleSelectionMode() {
    selectionMode = !selectionMode;
    selectModeButton.textContent = selectionMode ? '選択を取消' : '選択';
    if (!selectionMode) {
        selectedHabits.clear();
    }
    updateSelectionPanel();
    renderHabits();
}

// --- タブ切替（画面下部ナビ） ---
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPages = document.querySelectorAll('.tab-page');

    function switchTab(tabId) {
        tabPages.forEach(p => {
            if (p.id === tabId) {
                p.classList.add('active');
            } else {
                p.classList.remove('active');
            }
        });

        tabButtons.forEach(b => {
            const isActive = b.dataset.tab === tabId;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        if (tabId === 'tab-calendar') {
            renderMiniCalendar();
        }

        if (tabId === 'tab-diary') {
            renderDiaryEntry(getToday());
        }
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchTab(tabId);
        });
    });

    const initial = document.querySelector('.tab-button.active')?.dataset.tab || document.querySelector('.tab-button')?.dataset.tab;
    if (initial) switchTab(initial);
}

// --- イベントリスナー登録 ---
addHabitButton.addEventListener('click', () => {
    addHabit(habitInput.value, categorySelect.value);
});

selectModeButton.addEventListener('click', toggleSelectionMode);
editSelectedButton.addEventListener('click', editSelectedHabit);
deleteSelectedButton.addEventListener('click', deleteSelectedHabits);

habitInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        event.preventDefault();
        addHabit(habitInput.value, categorySelect.value);
    }
});

document.addEventListener('keydown', event => {
    if (event.key === 'Enter' && document.activeElement === categorySelect) {
        event.preventDefault();
        addHabit(habitInput.value, categorySelect.value);
    }
});

function initialize() {
    const today = getToday();

    habits = habits.map(habit => {
        if (habit.lastCompletedDate === today) {
            return { ...habit, completedToday: true };
        }
        return { ...habit, completedToday: false };
    });

    saveHabits();
    renderHabits();
    renderMiniCalendar();
    queryDiaryElements();
    setupTabs(); // タブの初期設定をここに引っ越しました

    if (saveDiaryButton) {
        saveDiaryButton.addEventListener('click', saveDiary);
    } else {
        console.warn('saveDiaryButton が見つかりません。');
    }

    // 感情スタンプのイベント登録
    const moodButtons = queryMoodElements();
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setSelectedMood(btn.dataset.mood);
        });
    });

    // 戻るボタン
    if (diaryBackButton) {
        diaryBackButton.addEventListener('click', () => {
            activateTab('tab-calendar');
        });
    }

    renderDiaryEntry(today);
}

initialize();