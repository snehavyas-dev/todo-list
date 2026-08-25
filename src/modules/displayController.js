/**
 * Display Controller Module (TaskFlow Pro)
 * Pure DOM rendering, UI updates, and dialog management.
 */
export const displayController = {
  elements: {},

  initElements() {
    this.elements = {
      // Navigation & Views
      smartViewsList: document.getElementById('smart-views-list'),
      projectList: document.getElementById('project-list'),
      countInbox: document.getElementById('count-inbox'),
      countToday: document.getElementById('count-today'),
      countUpcoming: document.getElementById('count-upcoming'),
      countHighPriority: document.getElementById('count-high-priority'),

      // Header & Search
      globalSearch: document.getElementById('global-search'),

      // Workspace Header
      headerColorDot: document.getElementById('header-color-dot'),
      activeProjectTitle: document.getElementById('active-project-title'),
      progressBarFill: document.getElementById('progress-bar-fill'),
      progressPercent: document.getElementById('progress-percent'),
      projectStats: document.getElementById('project-stats'),
      sortSelect: document.getElementById('sort-select'),
      projectActions: document.getElementById('project-actions'),

      // Task List & Empty State
      taskList: document.getElementById('task-list'),
      emptyState: document.getElementById('empty-state'),
      emptyStateTitle: document.getElementById('empty-state-title'),
      emptyStateDesc: document.getElementById('empty-state-desc'),

      // Modals
      taskDialog: document.getElementById('task-dialog'),
      taskForm: document.getElementById('task-form'),
      taskDialogHeading: document.getElementById('task-dialog-heading'),
      taskProjectSelect: document.getElementById('task-input-project-select'),

      projectDialog: document.getElementById('project-dialog'),
      projectForm: document.getElementById('project-form'),

      detailDialog: document.getElementById('detail-dialog'),

      // Toast Container
      toastContainer: document.getElementById('toast-container'),

      // Mobile Navigation
      sidebar: document.getElementById('sidebar'),
      sidebarBackdrop: document.getElementById('sidebar-backdrop'),
    };
  },

  /**
   * Renders sidebar smart views counters and highlights the active view
   */
  renderSmartViews(counts, activeViewId) {
    if (!this.elements.smartViewsList) this.initElements();

    if (this.elements.countInbox) this.elements.countInbox.textContent = counts.inbox;
    if (this.elements.countToday) this.elements.countToday.textContent = counts.today;
    if (this.elements.countUpcoming) this.elements.countUpcoming.textContent = counts.upcoming;
    if (this.elements.countHighPriority) this.elements.countHighPriority.textContent = counts.highPriority;

    const smartItems = this.elements.smartViewsList.querySelectorAll('.nav-item');
    smartItems.forEach((item) => {
      const view = item.dataset.view;
      if (view === activeViewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  },

  /**
   * Renders custom projects list with colored dots and count badges
   */
  renderProjects(projects, activeViewId) {
    if (!this.elements.projectList) this.initElements();
    this.elements.projectList.innerHTML = '';

    // Only render non-default projects in the custom projects list (Inbox is in smart views)
    const customProjects = projects.filter((p) => !p.isDefault);

    customProjects.forEach((project) => {
      const li = document.createElement('li');
      li.className = `nav-item ${project.id === activeViewId ? 'active' : ''}`;
      li.dataset.projectId = project.id;
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');

      const pendingCount = project.todos.filter((t) => !t.completed).length;

      li.innerHTML = `
        <div class="nav-item-left">
          <span class="project-dot" style="background-color: ${project.color || '#6366f1'}; box-shadow: 0 0 8px ${project.color}66;"></span>
          <span class="nav-item-name">${this.escapeHtml(project.name)}</span>
        </div>
        <span class="nav-count">${pendingCount}</span>
      `;

      this.elements.projectList.appendChild(li);
    });
  },

  /**
   * Renders workspace header, progress bar, sorting state, and tasks
   */
  renderWorkspace(viewData, projects) {
    if (!this.elements.activeProjectTitle) this.initElements();

    // 1. Title & Color Indicator
    this.elements.activeProjectTitle.textContent = viewData.title;
    if (this.elements.headerColorDot) {
      this.elements.headerColorDot.style.backgroundColor = viewData.projectColor;
      this.elements.headerColorDot.style.boxShadow = `0 0 10px ${viewData.projectColor}66`;
    }

    // 2. Progress Bar & Stats
    if (this.elements.progressBarFill) {
      this.elements.progressBarFill.style.width = `${viewData.progressPercent}%`;
    }
    if (this.elements.progressPercent) {
      this.elements.progressPercent.textContent = `${viewData.progressPercent}% Completed`;
    }
    if (this.elements.projectStats) {
      this.elements.projectStats.textContent =
        viewData.total === 0
          ? '0 tasks'
          : `${viewData.completed} of ${viewData.total} done (${viewData.pending} remaining)`;
    }

    // 3. Delete Project Action (only if custom project)
    if (this.elements.projectActions) {
      this.elements.projectActions.innerHTML = '';
      if (!viewData.isSmartView && viewData.project && !viewData.project.isDefault) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-danger-outline';
        deleteBtn.dataset.action = 'delete-project';
        deleteBtn.dataset.projectId = viewData.project.id;
        deleteBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Delete
        `;
        this.elements.projectActions.appendChild(deleteBtn);
      }
    }

    // 4. Render Task Cards
    this.renderTasks(viewData.todos, projects);
  },

  /**
   * Renders the list of task cards
   */
  renderTasks(todos, projects) {
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
      card.dataset.projectId = todo.projectId;

      const formattedDate = todo.dueDate ? this.formatDisplayDate(todo.dueDate) : '';

      // Project tag label if in a multi-project smart view
      const projectObj = projects.find((p) => p.id === todo.projectId);
      const projectBadge = projectObj
        ? `<span style="font-size:0.75rem; color:${projectObj.color || '#6366f1'}; font-weight:700;">● ${this.escapeHtml(projectObj.name)}</span>`
        : '';

      card.innerHTML = `
        <div class="task-card-left">
          <div class="task-checkbox-container">
            <input 
              type="checkbox" 
              class="task-checkbox" 
              ${todo.completed ? 'checked' : ''} 
              data-action="toggle-complete" 
              data-todo-id="${todo.id}"
              data-project-id="${todo.projectId}"
              aria-label="Toggle complete"
            >
          </div>
          <div class="task-info" data-action="view-detail" data-todo-id="${todo.id}" data-project-id="${todo.projectId}">
            <span class="task-title">${this.escapeHtml(todo.title)}</span>
            ${projectBadge}
          </div>
        </div>

        <div class="task-card-right">
          ${
            formattedDate
              ? `<span class="task-due-date" title="Due Date">
                   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                   ${formattedDate}
                 </span>`
              : ''
          }
          <span class="badge priority-${todo.priority}">${todo.priority}</span>
          <div class="task-actions">
            <button class="btn-icon" data-action="edit-task" data-todo-id="${todo.id}" data-project-id="${todo.projectId}" title="Edit Task" aria-label="Edit task">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-icon btn-icon-danger" data-action="delete-task" data-todo-id="${todo.id}" data-project-id="${todo.projectId}" title="Delete Task" aria-label="Delete task">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;

      this.elements.taskList.appendChild(card);
    });
  },

  /**
   * Opens the Task Modal with pre-populated project dropdown options
   */
  openTaskModal(mode = 'create', taskData = null, defaultProjectId = '', projects = []) {
    if (!this.elements.taskDialog) this.initElements();
    this.elements.taskForm.reset();

    // Populate project select options
    if (this.elements.taskProjectSelect && projects.length > 0) {
      this.elements.taskProjectSelect.innerHTML = '';
      projects.forEach((p) => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.name;
        this.elements.taskProjectSelect.appendChild(option);
      });
    }

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
      projectInput.value = taskData.projectId;
      if (this.elements.taskProjectSelect) this.elements.taskProjectSelect.value = taskData.projectId;
      titleInput.value = taskData.title;
      descInput.value = taskData.description || '';
      dateInput.value = taskData.dueDate || '';
      priorityInput.value = taskData.priority || 'medium';
      notesInput.value = taskData.notes || '';
    } else {
      this.elements.taskDialogHeading.textContent = 'Create Task';
      idInput.value = '';
      const chosenProj = defaultProjectId && !defaultProjectId.startsWith('view-') ? defaultProjectId : (projects[0]?.id || 'inbox-default');
      projectInput.value = chosenProj;
      if (this.elements.taskProjectSelect) this.elements.taskProjectSelect.value = chosenProj;
      priorityInput.value = 'medium';
    }

    this.elements.taskDialog.showModal();
    titleInput.focus();
  },

  closeTaskModal() {
    if (this.elements.taskDialog) this.elements.taskDialog.close();
  },

  openProjectModal() {
    if (!this.elements.projectDialog) this.initElements();
    this.elements.projectForm.reset();
    this.elements.projectDialog.showModal();
    const nameInput = document.getElementById('project-input-name');
    if (nameInput) nameInput.focus();
  },

  closeProjectModal() {
    if (this.elements.projectDialog) this.elements.projectDialog.close();
  },

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

    priorityBadge.className = `badge priority-${todo.priority}`;
    priorityBadge.textContent = `${todo.priority} priority`;

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

    if (editBtn) {
      editBtn.dataset.todoId = todo.id;
      editBtn.dataset.projectId = todo.projectId;
    }

    this.elements.detailDialog.showModal();
  },

  closeDetailModal() {
    if (this.elements.detailDialog) this.elements.detailDialog.close();
  },

  /**
   * Displays a floating toast notification with optional action
   */
  showToast(message, actionText = '', actionCallback = null) {
    if (!this.elements.toastContainer) this.initElements();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${this.escapeHtml(message)}</span>`;

    if (actionText && actionCallback) {
      const btn = document.createElement('button');
      btn.className = 'toast-undo-btn';
      btn.textContent = actionText;
      btn.addEventListener('click', () => {
        actionCallback();
        toast.remove();
      });
      toast.appendChild(btn);
    }

    this.elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  openSidebar() {
    if (this.elements.sidebar) this.elements.sidebar.classList.add('open');
    if (this.elements.sidebarBackdrop) this.elements.sidebarBackdrop.classList.add('active');
  },

  closeSidebar() {
    if (this.elements.sidebar) this.elements.sidebar.classList.remove('open');
    if (this.elements.sidebarBackdrop) this.elements.sidebarBackdrop.classList.remove('active');
  },

  formatDisplayDate(dateString) {
    if (!dateString) return '';
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  },

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
