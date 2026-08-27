import { projectManager } from './projectManager.js';
import { storageManager } from './storage.js';
import { displayController } from './displayController.js';

export const appController = {
  /**
   * Initializes the application
   */
  init() {
    this.initData();
    displayController.initElements();
    this.bindEvents();
    this.renderAll();
  },

  /**
   * Loads state from localStorage or seeds initial defaults
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

  persist() {
    storageManager.saveState(projectManager.getState());
  },

  renderAll() {
    const projects = projectManager.getProjects();
    const activeViewId = projectManager.getActiveViewId();
    const smartCounts = projectManager.getSmartViewCounts();
    const currentViewData = projectManager.getCurrentViewData();

    // 1. Render Sidebar
    displayController.renderSmartViews(smartCounts, activeViewId);
    displayController.renderProjects(projects, activeViewId);

    // 2. Render Workspace
    displayController.renderWorkspace(currentViewData, projects);

    // 3. Update Sort Selector UI
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = projectManager.getSortBy();
  },

  bindEvents() {
    const projects = () => projectManager.getProjects();

    // 1. New Task Buttons
    const btnOpenNewTask = document.getElementById('btn-open-new-task');
    const btnEmptyAddTask = document.getElementById('btn-empty-add-task');

    const handleOpenNewTask = () => {
      const activeViewId = projectManager.getActiveViewId();
      displayController.openTaskModal('create', null, activeViewId, projects());
    };

    if (btnOpenNewTask)
      btnOpenNewTask.addEventListener('click', handleOpenNewTask);
    if (btnEmptyAddTask)
      btnEmptyAddTask.addEventListener('click', handleOpenNewTask);

    // 2. New Project Button
    const btnOpenNewProject = document.getElementById('btn-open-new-project');
    if (btnOpenNewProject) {
      btnOpenNewProject.addEventListener('click', () =>
        displayController.openProjectModal(),
      );
    }

    // 3. Smart Views Selection (Event Delegation on #smart-views-list)
    const smartViewsList = document.getElementById('smart-views-list');
    if (smartViewsList) {
      smartViewsList.addEventListener('click', (e) => {
        const item = e.target.closest('.nav-item');
        if (!item) return;

        const { view } = item.dataset;
        if (view) {
          projectManager.setActiveViewId(view);
          this.persist();
          this.renderAll();
          displayController.closeSidebar();
        }
      });
    }

    // 4. Custom Projects Selection (Event Delegation on #project-list)
    const projectList = document.getElementById('project-list');
    if (projectList) {
      projectList.addEventListener('click', (e) => {
        const item = e.target.closest('.nav-item');
        if (!item) return;

        const { projectId } = item.dataset;
        if (projectId) {
          projectManager.setActiveViewId(projectId);
          this.persist();
          this.renderAll();
          displayController.closeSidebar();
        }
      });
    }

    // 5. Global Search Input
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        projectManager.setSearchQuery(e.target.value);
        this.renderAll();
      });
    }

    // 6. Sort Select Dropdown
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        projectManager.setSortBy(e.target.value);
        this.persist();
        this.renderAll();
      });
    }

    // 7. Task Card Interactions (Event Delegation on #task-list)
    const taskList = document.getElementById('task-list');
    if (taskList) {
      taskList.addEventListener('click', (e) => {
        const actionTarget = e.target.closest('[data-action]');
        if (!actionTarget) return;

        const { action, todoId, projectId } = actionTarget.dataset;

        // Toggle Complete
        if (action === 'toggle-complete') {
          const isCompleted = projectManager.toggleTodoComplete(
            projectId,
            todoId,
          );
          this.persist();
          this.renderAll();
          displayController.showToast(
            isCompleted
              ? 'Task marked complete! 🎉'
              : 'Task marked in progress.',
          );
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
            displayController.openTaskModal(
              'edit',
              todo,
              projectId,
              projects(),
            );
          }
          return;
        }

        // Delete Task
        if (action === 'delete-task') {
          const deleted = projectManager.deleteTodo(projectId, todoId);
          if (deleted) {
            this.persist();
            this.renderAll();
            displayController.showToast('Task deleted', 'Undo', () => {
              projectManager.undoDelete();
              this.persist();
              this.renderAll();
              displayController.showToast('Task restored! ↩️');
            });
          }
          return;
        }
      });
    }

    // 8. Delete Project Action
    const projectActions = document.getElementById('project-actions');
    if (projectActions) {
      projectActions.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="delete-project"]');
        if (!btn) return;

        const { projectId } = btn.dataset;
        const project = projectManager.getProjectById(projectId);

        if (
          project &&
          window.confirm(
            `Delete project "${project.name}" and all associated tasks?`,
          )
        ) {
          projectManager.deleteProject(projectId);
          this.persist();
          this.renderAll();
          displayController.showToast(`Project "${project.name}" deleted.`);
        }
      });
    }

    // 9. Task Form Submit (Create & Edit)
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const idInput = document.getElementById('task-input-id');
        const projectSelect = document.getElementById(
          'task-input-project-select',
        );
        const titleInput = document.getElementById('task-input-title');
        const descInput = document.getElementById('task-input-description');
        const dateInput = document.getElementById('task-input-due-date');
        const priorityInput = document.getElementById('task-input-priority');
        const notesInput = document.getElementById('task-input-notes');

        const title = titleInput.value.trim();
        if (!title) return;

        const taskId = idInput.value;
        const targetProjectId =
          projectSelect.value || projectManager.getProjects()[0].id;

        const taskData = {
          title,
          description: descInput.value.trim(),
          dueDate: dateInput.value,
          priority: priorityInput.value,
          notes: notesInput.value.trim(),
        };

        if (taskId) {
          projectManager.editTodo(targetProjectId, taskId, taskData);
          displayController.showToast('Task updated successfully! ✨');
        } else {
          projectManager.addTodo(targetProjectId, taskData);
          displayController.showToast('New task added! 🚀');
        }

        this.persist();
        displayController.closeTaskModal();
        this.renderAll();
      });
    }

    // 10. Project Form Submit (With Color Choice)
    const projectForm = document.getElementById('project-form');
    if (projectForm) {
      projectForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('project-input-name');
        const colorRadio = projectForm.querySelector(
          'input[name="projectColor"]:checked',
        );
        const name = nameInput.value.trim();
        const color = colorRadio ? colorRadio.value : '#6366f1';

        if (!name) return;

        projectManager.addProject(name, color);
        this.persist();
        displayController.closeProjectModal();
        this.renderAll();
        displayController.showToast(`Project "${name}" created! 📁`);
      });
    }

    // 11. Modal Close Handlers
    this.bindModalCloseHandlers();

    // 12. Mobile Sidebar & Drawer Controls
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    if (mobileMenuToggle)
      mobileMenuToggle.addEventListener('click', () =>
        displayController.openSidebar(),
      );
    if (sidebarBackdrop)
      sidebarBackdrop.addEventListener('click', () =>
        displayController.closeSidebar(),
      );

    // 13. Keyboard Shortcuts (N / Q for New Task, / for Search)
    document.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement
        ? document.activeElement.tagName.toLowerCase()
        : '';
      if (['input', 'textarea', 'select'].includes(activeTag)) return;

      if (e.key === '/' || e.key === '?') {
        e.preventDefault();
        const search = document.getElementById('global-search');
        if (search) search.focus();
      } else if (
        e.key === 'n' ||
        e.key === 'N' ||
        e.key === 'q' ||
        e.key === 'Q'
      ) {
        e.preventDefault();
        handleOpenNewTask();
      }
    });
  },

  bindModalCloseHandlers() {
    const btnCloseTaskDialog = document.getElementById('btn-close-task-dialog');
    const btnCancelTask = document.getElementById('btn-cancel-task');
    if (btnCloseTaskDialog)
      btnCloseTaskDialog.addEventListener('click', () =>
        displayController.closeTaskModal(),
      );
    if (btnCancelTask)
      btnCancelTask.addEventListener('click', () =>
        displayController.closeTaskModal(),
      );

    const btnCloseProjectDialog = document.getElementById(
      'btn-close-project-dialog',
    );
    const btnCancelProject = document.getElementById('btn-cancel-project');
    if (btnCloseProjectDialog)
      btnCloseProjectDialog.addEventListener('click', () =>
        displayController.closeProjectModal(),
      );
    if (btnCancelProject)
      btnCancelProject.addEventListener('click', () =>
        displayController.closeProjectModal(),
      );

    const btnCloseDetailDialog = document.getElementById(
      'btn-close-detail-dialog',
    );
    const btnDetailClose = document.getElementById('btn-detail-close');
    const btnDetailEdit = document.getElementById('btn-detail-edit');

    if (btnCloseDetailDialog)
      btnCloseDetailDialog.addEventListener('click', () =>
        displayController.closeDetailModal(),
      );
    if (btnDetailClose)
      btnDetailClose.addEventListener('click', () =>
        displayController.closeDetailModal(),
      );

    if (btnDetailEdit) {
      btnDetailEdit.addEventListener('click', () => {
        const { todoId, projectId } = btnDetailEdit.dataset;
        displayController.closeDetailModal();
        const todo = projectManager.getTodo(projectId, todoId);
        if (todo) {
          displayController.openTaskModal(
            'edit',
            todo,
            projectId,
            projectManager.getProjects(),
          );
        }
      });
    }
  },
};
