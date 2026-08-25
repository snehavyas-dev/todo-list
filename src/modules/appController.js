import { projectManager } from './projectManager.js';
import { storageManager } from './storage.js';
import { displayController } from './displayController.js';

export const appController = {
  /**
   * Initializes the entire application
   */
  init() {
    this.initData();
    displayController.initElements();
    this.bindEvents();
    this.renderAll();
  },

  /**
   * Rehydrates state from localStorage or seeds defaults
   */
  initData() {
    const savedState = storageManager.loadState();
    if (savedState) {
      projectManager.loadState(savedState);
    } else {
      projectManager.initDefaultState();
      this.persist();
    }
  },

  /**
   * Saves current state to localStorage
   */
  persist() {
    storageManager.saveState(projectManager.getState());
  },

  /**
   * Re-renders the entire UI based on current state
   */
  renderAll() {
    const projects = projectManager.getProjects();
    const activeProjectId = projectManager.getActiveProjectId();
    const activeProject = projectManager.getActiveProject();

    displayController.renderProjects(projects, activeProjectId);
    displayController.renderActiveProject(activeProject);
  },

  /**
   * Sets up all event listeners across the application
   */
  bindEvents() {
    // 1. New Task Buttons
    const btnOpenNewTask = document.getElementById('btn-open-new-task');
    const btnEmptyAddTask = document.getElementById('btn-empty-add-task');

    const handleOpenNewTask = () => {
      const activeProjectId = projectManager.getActiveProjectId();
      displayController.openTaskModal('create', null, activeProjectId);
    };

    if (btnOpenNewTask) btnOpenNewTask.addEventListener('click', handleOpenNewTask);
    if (btnEmptyAddTask) btnEmptyAddTask.addEventListener('click', handleOpenNewTask);

    // 2. New Project Button
    const btnOpenNewProject = document.getElementById('btn-open-new-project');
    if (btnOpenNewProject) {
      btnOpenNewProject.addEventListener('click', () => {
        displayController.openProjectModal();
      });
    }

    // 3. Project Selection (Event Delegation on #project-list)
    const projectList = document.getElementById('project-list');
    if (projectList) {
      projectList.addEventListener('click', (e) => {
        const item = e.target.closest('.project-item');
        if (!item) return;

        const { projectId } = item.dataset;
        if (projectId) {
          projectManager.setActiveProjectId(projectId);
          this.persist();
          this.renderAll();
          displayController.closeSidebar();
        }
      });
    }

    // 4. Task Interactions (Event Delegation on #task-list)
    const taskList = document.getElementById('task-list');
    if (taskList) {
      taskList.addEventListener('click', (e) => {
        const actionTarget = e.target.closest('[data-action]');
        if (!actionTarget) return;

        const { action, todoId, projectId } = actionTarget.dataset;

        // Toggle Complete
        if (action === 'toggle-complete') {
          projectManager.toggleTodoComplete(projectId, todoId);
          this.persist();
          this.renderAll();
          return;
        }

        // View Task Details
        if (action === 'view-detail') {
          const todo = projectManager.getTodo(projectId, todoId);
          const project = projectManager.getProjectById(projectId);
          if (todo && project) {
            displayController.openDetailModal(todo, project.name);
          }
          return;
        }

        // Edit Task
        if (action === 'edit-task') {
          const todo = projectManager.getTodo(projectId, todoId);
          if (todo) {
            displayController.openTaskModal('edit', todo, projectId);
          }
          return;
        }

        // Delete Task
        if (action === 'delete-task') {
          if (window.confirm('Are you sure you want to delete this task?')) {
            projectManager.deleteTodo(projectId, todoId);
            this.persist();
            this.renderAll();
          }
          return;
        }
      });
    }

    // 5. Project Actions (Event Delegation on #project-actions)
    const projectActions = document.getElementById('project-actions');
    if (projectActions) {
      projectActions.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="delete-project"]');
        if (!btn) return;

        const { projectId } = btn.dataset;
        const project = projectManager.getProjectById(projectId);

        if (project && window.confirm(`Delete project "${project.name}" and all of its tasks?`)) {
          projectManager.deleteProject(projectId);
          this.persist();
          this.renderAll();
        }
      });
    }

    // 6. Task Form Submission (Create & Edit)
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const idInput = document.getElementById('task-input-id');
        const projectInput = document.getElementById('task-input-project-id');
        const titleInput = document.getElementById('task-input-title');
        const descInput = document.getElementById('task-input-description');
        const dateInput = document.getElementById('task-input-due-date');
        const priorityInput = document.getElementById('task-input-priority');
        const notesInput = document.getElementById('task-input-notes');

        const title = titleInput.value.trim();
        if (!title) return;

        const taskId = idInput.value;
        const projectId = projectInput.value || projectManager.getActiveProjectId();

        const taskData = {
          title,
          description: descInput.value.trim(),
          dueDate: dateInput.value,
          priority: priorityInput.value,
          notes: notesInput.value.trim(),
        };

        if (taskId) {
          // Editing existing task
          projectManager.editTodo(projectId, taskId, taskData);
        } else {
          // Creating new task
          projectManager.addTodo(projectId, taskData);
        }

        this.persist();
        displayController.closeTaskModal();
        this.renderAll();
      });
    }

    // 7. Project Form Submission
    const projectForm = document.getElementById('project-form');
    if (projectForm) {
      projectForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('project-input-name');
        const name = nameInput.value.trim();
        if (!name) return;

        projectManager.addProject(name);
        this.persist();
        displayController.closeProjectModal();
        this.renderAll();
      });
    }

    // 8. Dialog Close & Cancel Handlers
    this.bindModalCloseHandlers();

    // 9. Mobile Sidebar Navigation
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');

    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', () => {
        displayController.openSidebar();
      });
    }

    if (sidebarBackdrop) {
      sidebarBackdrop.addEventListener('click', () => {
        displayController.closeSidebar();
      });
    }
  },

  /**
   * Helper to wire modal close and cancel buttons
   */
  bindModalCloseHandlers() {
    // Task Dialog
    const btnCloseTaskDialog = document.getElementById('btn-close-task-dialog');
    const btnCancelTask = document.getElementById('btn-cancel-task');
    if (btnCloseTaskDialog) btnCloseTaskDialog.addEventListener('click', () => displayController.closeTaskModal());
    if (btnCancelTask) btnCancelTask.addEventListener('click', () => displayController.closeTaskModal());

    // Project Dialog
    const btnCloseProjectDialog = document.getElementById('btn-close-project-dialog');
    const btnCancelProject = document.getElementById('btn-cancel-project');
    if (btnCloseProjectDialog) btnCloseProjectDialog.addEventListener('click', () => displayController.closeProjectModal());
    if (btnCancelProject) btnCancelProject.addEventListener('click', () => displayController.closeProjectModal());

    // Detail Dialog
    const btnCloseDetailDialog = document.getElementById('btn-close-detail-dialog');
    const btnDetailClose = document.getElementById('btn-detail-close');
    const btnDetailEdit = document.getElementById('btn-detail-edit');

    if (btnCloseDetailDialog) btnCloseDetailDialog.addEventListener('click', () => displayController.closeDetailModal());
    if (btnDetailClose) btnDetailClose.addEventListener('click', () => displayController.closeDetailModal());

    if (btnDetailEdit) {
      btnDetailEdit.addEventListener('click', () => {
        const { todoId, projectId } = btnDetailEdit.dataset;
        displayController.closeDetailModal();
        const todo = projectManager.getTodo(projectId, todoId);
        if (todo) {
          displayController.openTaskModal('edit', todo, projectId);
        }
      });
    }
  },
};
