document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const taskCount = document.getElementById('task-count');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // --- State ---
    let tasks = JSON.parse(localStorage.getItem('taskify-tasks')) || [];
    let currentFilter = 'all'; // 'all', 'active', 'completed'

    // --- Initialization ---
    renderTasks();

    // --- Event Listeners ---
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (text) {
            addTask(text);
            taskInput.value = '';
        }
    });

    clearCompletedBtn.addEventListener('click', () => {
        tasks = tasks.filter(task => !task.completed);
        saveAndRender();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    // --- Functions ---
    function addTask(text) {
        const newTask = {
            id: Date.now().toString(),
            text,
            completed: false
        };
        tasks.push(newTask);
        
        // If viewing 'completed', switch to 'all' so the new task is visible
        if (currentFilter === 'completed') {
            document.querySelector('[data-filter="all"]').click();
        } else {
            saveAndRender();
        }
    }

    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveAndRender();
        }
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveAndRender();
    }

    function updateTaskText(id, newText) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.text = newText;
            saveAndRender();
        }
    }

    function saveAndRender() {
        localStorage.setItem('taskify-tasks', JSON.stringify(tasks));
        renderTasks();
    }

    function getFilteredTasks() {
        switch (currentFilter) {
            case 'active':
                return tasks.filter(t => !t.completed);
            case 'completed':
                return tasks.filter(t => t.completed);
            default:
                return tasks;
        }
    }

    function renderTasks() {
        const filteredTasks = getFilteredTasks();
        taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            
            let message = 'No tasks yet. Add one above!';
            let icon = 'fa-clipboard-list';
            
            if (currentFilter === 'active') {
                message = 'No active tasks. You\'re all caught up!';
                icon = 'fa-check-circle';
            } else if (currentFilter === 'completed') {
                message = 'No completed tasks yet.';
                icon = 'fa-clock';
            }

            emptyState.innerHTML = `
                <i class="fa-solid ${icon}"></i>
                <p>${message}</p>
            `;
            taskList.appendChild(emptyState);
        } else {
            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                li.dataset.id = task.id;

                li.innerHTML = `
                    <div class="checkbox-wrapper">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    </div>
                    <span class="task-text">${escapeHTML(task.text)}</span>
                    <div class="actions">
                        <button class="action-btn edit-btn" title="Edit"><i class="fa-solid fa-pen"></i></button>
                        <button class="action-btn delete-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;

                // Checkbox Event
                const checkbox = li.querySelector('.task-checkbox');
                checkbox.addEventListener('change', () => toggleTask(task.id));

                // Delete Event
                const deleteBtn = li.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', () => deleteTask(task.id));

                // Edit Event
                const editBtn = li.querySelector('.edit-btn');
                const taskTextElement = li.querySelector('.task-text');
                
                editBtn.addEventListener('click', () => {
                    const currentText = task.text;
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'task-edit-input';
                    input.value = currentText;

                    taskTextElement.replaceWith(input);
                    input.focus();

                    // Handle save on blur or Enter
                    const saveEdit = () => {
                        const newText = input.value.trim();
                        if (newText && newText !== currentText) {
                            updateTaskText(task.id, newText);
                        } else {
                            renderTasks(); // Revert to text if empty or unchanged
                        }
                    };

                    input.addEventListener('blur', saveEdit);
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            saveEdit();
                        }
                    });
                });

                taskList.appendChild(li);
            });
        }

        // Update active tasks count
        const activeCount = tasks.filter(t => !t.completed).length;
        taskCount.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} left`;
    }

    // Utility to prevent XSS when setting innerHTML
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
