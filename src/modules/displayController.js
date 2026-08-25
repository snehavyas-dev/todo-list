/**
 * Display Controller Module
 * Responsible strictly for DOM creation, rendering, and modal visibility.
 * Does NOT directly mutate application state.
 */
export const displayController = {
  // DOM element caches
  elements: {
    projectList: document.getElementById('project-list'),
    activeProjectTitle: document.getElementById('active-project-title'),
    projectStats: document.getElementById('project-stats'),
    projectActions: document.getElementById('project-actions'),
    taskList: document.getElementById('task-list'),
    emptyState: document.getElementById('empty-state'),
    
    // Modals
    taskDialog: document.getElementById('task-dialog'),
    taskForm: document.getElementById('task-form'),
    taskDialogHeading: document.getElementById('task-dialog-heading'),
    
    projectDialog: document.getElementById('project-dialog'),
    projectForm: document.getElementById('project-form'),
    
    detailDialog: document.getElementById('detail-dialog'),
    
    // Mobile Navigation
    sidebar: document.getElementById('sidebar'),
    sidebarBackdrop: document.getElementById('sidebar-backdrop'),
  },

  /**
   * Initializes and caches references (if needed after initial DOM mount)
   */
  initElements() {
    this.elements.projectList = document.getElementById('project-list');
    this.elements.activeProjectTitle = document.getElementById('active-project-title');
    this.elements.projectStats = document.getElementById('project-stats');
    this.elements.projectActions = document.getElementById('project-actions');
    this.elements.taskList = document.getElementById('task-list');
    this.elements.emptyState = document.getElementById('empty-state');
    this.elements.taskDialog = document.getElementById('task-dialog');
    this.elements.taskForm = document.getElementById('task-form');
    this.elements.taskDialogHeading = document.getElementById('task-dialog-heading');
    this.elements.projectDialog = document.getElementById('project-dialog');
    this.elements.projectForm = document.getElementById('project-form');
    this.elements.detailDialog = document.getElementById('detail-dialog');
    this.elements.sidebar = document.getElementById('sidebar');
    this.elements.sidebarBackdrop = document.getElementById('sidebar-backdrop');
  },

  /**
   * Renders the list of projects in the sidebar
   * @param {Array} projects - All project objects
   * @param {string} activeProjectId - Current active project ID
   */
  renderProjects(projects, activeProjectId) {
    if (!this.elements.projectList) this.initElements();
    this.elements.projectList.innerHTML = '';

    projects.forEach((project) => {
      const li = document.createElement('li');
      li.className = `project-item ${project.id === activeProjectId ? 'active' : ''}`;
      li.dataset.projectId = project.id;
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');

      // Uncompleted tasks count
      const pendingCount = project.todos.filter((t) => !t.completed).length;

      // Icon (Inbox icon for default, folder icon for custom projects)
      const iconSvg = project.isDefault
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;

      li.innerHTML = `
        <div class="project-item-left">
          <span class="project-item-icon">${iconSvg}</span>
          <span class="project-name">${this.escapeHtml(project.name)}</span>
        </div>
        <span class="project-count">${pendingCount}</span>
      `;

      this.elements.projectList.appendChild(li);
    });
  },

  /**
   * Renders the active project header, stats, actions, and its tasks
   * @param {Object} activeProject
   */
  renderActiveProject(activeProject) {
    if (!activeProject) return;
    if (!this.elements.activeProjectTitle) this.initElements();

    // 1. Update Title
    this.elements.activeProjectTitle.textContent = activeProject.name;

    // 2. Update Stats
    const total = activeProject.todos.length;
    const completed = activeProject.todos.filter((t) => t.completed).length;
    const pending = total - completed;

    this.elements.projectStats.textContent =
      total === 0
        ? '0 tasks'
        : `${pending} remaining · ${completed} completed`;

    // 3. Render Actions (Delete Project button for non-default projects)
    this.elements.projectActions.innerHTML = '';
    if (!activeProject.isDefault) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-danger-outline';
      deleteBtn.dataset.action = 'delete-project';
      deleteBtn.dataset.projectId = activeProject.id;
      deleteBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        Delete Project
      `;
      this.elements.projectActions.appendChild(deleteBtn);
    }

    // 4. Render Tasks
    this.renderTasks(activeProject.todos, activeProject.id);
  },

  /**
   * Renders the list of tasks for the current project
   * @param {Array} todos
   * @param {string} projectId
   */
  renderTasks(todos, projectId) {
    this.elements.taskList.innerHTML = '';

    if (!todos || todos.length === 0) {
      this.elements.taskList.classList.add('hidden');
      this.elements.emptyState.classList.remove('hidden');
      return;
    }

    this.elements.taskList.classList.remove('hidden');
    this.elements.emptyState.classList.add('hidden');

    todos.forEach((todo) => {
      const card = document.createElement('li');
      card.className = `task-card priority-${todo.priority} ${todo.completed ? 'completed' : ''}`;
      card.dataset.todoId = todo.id;
      card.dataset.projectId = projectId;

      const formattedDate = todo.dueDate ? this.formatDisplayDate(todo.dueDate) : '';

      card.innerHTML = `
        <div class="task-card-left">
          <div class="task-checkbox-container">
            <input 
              type="checkbox" 
              class="task-checkbox" 
              ${todo.completed ? 'checked' : ''} 
              data-action="toggle-complete" 
              data-todo-id="${todo.id}"
              data-project-id="${projectId}"
              aria-label="Mark task as complete"
            >
          </div>
          <div class="task-info" data-action="view-detail" data-todo-id="${todo.id}" data-project-id="${projectId}">
            <span class="task-title">${this.escapeHtml(todo.title)}</span>
          </div>
        </div>

        <div class="task-card-right">
          ${
            formattedDate
              ? `<span class="task-due-date" title="Due Date">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                   ${formattedDate}
                 </span>`
              : ''
          }
          <span class="badge priority-${todo.priority}">${todo.priority}</span>
          <div class="task-actions">
            <button class="btn-icon" data-action="edit-task" data-todo-id="${todo.id}" data-project-id="${projectId}" title="Edit Task" aria-label="Edit task">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-icon btn-icon-danger" data-action="delete-task" data-todo-id="${todo.id}" data-project-id="${projectId}" title="Delete Task" aria-label="Delete task">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;

      this.elements.taskList.appendChild(card);
    });
  },

  /**
   * Opens the Task Modal in either 'create' or 'edit' mode
   * @param {('create'|'edit')} mode
   * @param {Object} [taskData=null]
   * @param {string} [projectId='']
   */
  openTaskModal(mode = 'create', taskData = null, projectId = '') {
    if (!this.elements.taskDialog) this.initElements();
    this.elements.taskForm.reset();

    const idInput = document.getElementById('task-input-id');
    const projectInput = document.getElementById('task-input-project-id');
    const titleInput = document.getElementById('task-input-title');
    const descInput = document.getElementById('task-input-description');
    const dateInput = document.getElementById('task-input-due-date');
    const priorityInput = document.getElementById('task-input-priority');
    const notesInput = document.getElementById('task-input-notes');

    if (mode === 'edit' && taskData) {
      this.elements.taskDialogHeading.textContent = 'Edit Task';
      idInput.value = taskData.id;
      projectInput.value = projectId || taskData.projectId;
      titleInput.value = taskData.title;
      descInput.value = taskData.description || '';
      dateInput.value = taskData.dueDate || '';
      priorityInput.value = taskData.priority || 'medium';
      notesInput.value = taskData.notes || '';
    } else {
      this.elements.taskDialogHeading.textContent = 'Create Task';
      idInput.value = '';
      projectInput.value = projectId;
      priorityInput.value = 'medium';
    }

    this.elements.taskDialog.showModal();
    titleInput.focus();
  },

  closeTaskModal() {
    if (this.elements.taskDialog) {
      this.elements.taskDialog.close();
    }
  },

  openProjectModal() {
    if (!this.elements.projectDialog) this.initElements();
    this.elements.projectForm.reset();
    this.elements.projectDialog.showModal();
    const nameInput = document.getElementById('project-input-name');
    if (nameInput) nameInput.focus();
  },

  closeProjectModal() {
    if (this.elements.projectDialog) {
      this.elements.projectDialog.close();
    }
  },

  /**
   * Opens the Task Detail Modal
   * @param {Object} todo
   * @param {string} projectName
   */
  openDetailModal(todo, projectName = '') {
    if (!this.elements.detailDialog) this.initElements();

    const titleEl = document.getElementById('detail-title');
    const descEl = document.getElementById('detail-description');
    const notesEl = document.getElementById('detail-notes');
    const dateEl = document.getElementById('detail-due-date');
    const projectEl = document.getElementById('detail-project-name');
    const priorityBadge = document.getElementById('detail-priority-badge');
    const statusBadge = document.getElementById('detail-status-badge');
    const editBtn = document.getElementById('btn-detail-edit');

    titleEl.textContent = todo.title;
    descEl.textContent = todo.description || 'No description provided.';
    notesEl.textContent = todo.notes || 'No notes provided.';
    dateEl.textContent = todo.dueDate ? this.formatDisplayDate(todo.dueDate) : 'No due date';
    projectEl.textContent = projectName;

    // Priority Badge
    priorityBadge.className = `badge priority-${todo.priority}`;
    priorityBadge.textContent = `${todo.priority} priority`;

    // Status Badge
    if (todo.completed) {
      statusBadge.className = 'badge';
      statusBadge.style.backgroundColor = '#dcfce7';
      statusBadge.style.color = '#15803d';
      statusBadge.textContent = 'Completed';
    } else {
      statusBadge.className = 'badge';
      statusBadge.style.backgroundColor = '#f1f5f9';
      statusBadge.style.color = '#475569';
      statusBadge.textContent = 'In Progress';
    }

    // Attach IDs to the Edit button inside detail modal
    if (editBtn) {
      editBtn.dataset.todoId = todo.id;
      editBtn.dataset.projectId = todo.projectId;
    }

    this.elements.detailDialog.showModal();
  },

  closeDetailModal() {
    if (this.elements.detailDialog) {
      this.elements.detailDialog.close();
    }
  },

  // Mobile sidebar controls
  openSidebar() {
    if (this.elements.sidebar) this.elements.sidebar.classList.add('open');
    if (this.elements.sidebarBackdrop) this.elements.sidebarBackdrop.classList.add('active');
  },

  closeSidebar() {
    if (this.elements.sidebar) this.elements.sidebar.classList.remove('open');
    if (this.elements.sidebarBackdrop) this.elements.sidebarBackdrop.classList.remove('active');
  },

  /**
   * Formats ISO date 'YYYY-MM-DD' into human-friendly 'MMM D, YYYY'
   * @param {string} dateString
   * @returns {string}
   */
  formatDisplayDate(dateString) {
    if (!dateString) return '';
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  },

  /**
   * Helper to sanitize text preventing XSS
   */
  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
};

