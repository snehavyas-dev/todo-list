import { createTodo } from './todo.js';
import { createProject } from './project.js';

// In-memory application state (Single Source of Truth)
let projects = [];
let activeProjectId = null;

export const projectManager = {
  /**
   * Initializes the state with default projects and sample tasks
   * (Used when no data exists in localStorage)
   */
  initDefaultState() {
    projects = [];

    // Default Inbox project (cannot be deleted)
    const inbox = createProject({
      id: 'inbox-default',
      name: 'Inbox',
      isDefault: true,
    });

    // Sample welcome tasks
    const task1 = createTodo({
      title: 'Welcome to TaskFlow! 👋',
      description: 'Click this task to view its details or edit its contents.',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'high',
      notes: 'You can organize tasks with due dates, notes, and priorities.',
      projectId: inbox.id,
    });

    const task2 = createTodo({
      title: 'Create a new project 📁',
      description: 'Use the "+ New Project" button on the sidebar to organize work, personal, or study goals.',
      dueDate: '',
      priority: 'medium',
      notes: 'Each project has its own dedicated task list.',
      projectId: inbox.id,
    });

    inbox.todos.push(task1, task2);
    projects.push(inbox);

    // Additional sample project
    const workProject = createProject({
      name: 'Work',
      isDefault: false,
    });

    const workTask = createTodo({
      title: 'Review Odin Project guidelines',
      description: 'Check criteria for Todo List requirements.',
      dueDate: '',
      priority: 'low',
      projectId: workProject.id,
    });

    workProject.todos.push(workTask);
    projects.push(workProject);

    activeProjectId = inbox.id;
  },

  /**
   * Returns all current projects
   * @returns {Array} List of project objects
   */
  getProjects() {
    return projects;
  },

  /**
   * Returns the ID of the currently active project
   * @returns {string|null}
   */
  getActiveProjectId() {
    return activeProjectId;
  },

  /**
   * Changes the active project ID
   * @param {string} id
   */
  setActiveProjectId(id) {
    const exists = projects.some((project) => project.id === id);
    if (exists) {
      activeProjectId = id;
    }
  },

  /**
   * Returns the currently active project object
   * @returns {Object}
   */
  getActiveProject() {
    let project = projects.find((p) => p.id === activeProjectId);
    if (!project && projects.length > 0) {
      project = projects[0];
      activeProjectId = project.id;
    }
    return project;
  },

  /**
   * Finds a project by its ID
   * @param {string} projectId
   * @returns {Object|undefined}
   */
  getProjectById(projectId) {
    return projects.find((project) => project.id === projectId);
  },

  /**
   * Creates and adds a new project
   * @param {string} name - Name of the new project
   * @returns {Object} The created project
   */
  addProject(name) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Project name cannot be empty.');
    }

    const newProject = createProject({ name: trimmedName });
    projects.push(newProject);
    activeProjectId = newProject.id;
    return newProject;
  },

  /**
   * Deletes a project by ID
   * @param {string} projectId
   * @returns {boolean} True if deleted, false otherwise
   */
  deleteProject(projectId) {
    const projectToDelete = this.getProjectById(projectId);
    if (!projectToDelete) return false;

    // Prevent deleting default project (Inbox)
    if (projectToDelete.isDefault) {
      throw new Error('Cannot delete the default Inbox project.');
    }

    projects = projects.filter((project) => project.id !== projectId);

    // If active project was deleted, fallback to the default Inbox project
    if (activeProjectId === projectId) {
      const defaultProject = projects.find((p) => p.isDefault) || projects[0];
      activeProjectId = defaultProject ? defaultProject.id : null;
    }

    return true;
  },

  /**
   * Adds a new Todo to a specified project
   * @param {string} projectId
   * @param {Object} todoData
   * @returns {Object} The created Todo item
   */
  addTodo(projectId, todoData) {
    const project = this.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with ID "${projectId}" does not exist.`);
    }

    const newTodo = createTodo({
      ...todoData,
      projectId,
    });

    project.todos.push(newTodo);
    return newTodo;
  },

  /**
   * Retrieves a specific Todo from a project
   * @param {string} projectId
   * @param {string} todoId
   * @returns {Object|undefined}
   */
  getTodo(projectId, todoId) {
    const project = this.getProjectById(projectId);
    if (!project) return undefined;
    return project.todos.find((todo) => todo.id === todoId);
  },

  /**
   * Deletes a Todo from a project
   * @param {string} projectId
   * @param {string} todoId
   * @returns {boolean}
   */
  deleteTodo(projectId, todoId) {
    const project = this.getProjectById(projectId);
    if (!project) return false;

    const initialCount = project.todos.length;
    project.todos = project.todos.filter((todo) => todo.id !== todoId);
    return project.todos.length < initialCount;
  },

  /**
   * Toggles the completed status of a Todo
   * @param {string} projectId
   * @param {string} todoId
   * @returns {boolean} The new completion status
   */
  toggleTodoComplete(projectId, todoId) {
    const todo = this.getTodo(projectId, todoId);
    if (!todo) {
      throw new Error(`Todo with ID "${todoId}" not found in project "${projectId}".`);
    }

    todo.completed = !todo.completed;
    return todo.completed;
  },

  /**
   * Updates fields of an existing Todo
   * @param {string} projectId
   * @param {string} todoId
   * @param {Object} updatedFields
   * @returns {Object} The updated Todo
   */
  editTodo(projectId, todoId, updatedFields) {
    const todo = this.getTodo(projectId, todoId);
    if (!todo) {
      throw new Error(`Todo with ID "${todoId}" not found.`);
    }

    if (updatedFields.title !== undefined) {
      if (!updatedFields.title.trim()) {
        throw new Error('Todo title cannot be empty.');
      }
      todo.title = updatedFields.title.trim();
    }

    if (updatedFields.description !== undefined) {
      todo.description = updatedFields.description.trim();
    }

    if (updatedFields.dueDate !== undefined) {
      todo.dueDate = updatedFields.dueDate;
    }

    if (updatedFields.priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high'];
      if (validPriorities.includes(updatedFields.priority.toLowerCase())) {
        todo.priority = updatedFields.priority.toLowerCase();
      }
    }

    if (updatedFields.notes !== undefined) {
      todo.notes = updatedFields.notes.trim();
    }

    if (updatedFields.completed !== undefined) {
      todo.completed = Boolean(updatedFields.completed);
    }

    return todo;
  },

  /**
   * Returns the full state for serialization to localStorage
   * @returns {Object}
   */
  getState() {
    return {
      projects,
      activeProjectId,
    };
  },

  /**
   * Restores state from parsed localStorage data
   * Rehydrates objects through factories for integrity
   * @param {Object} savedState
   */
  loadState(savedState) {
    if (!savedState || !Array.isArray(savedState.projects) || savedState.projects.length === 0) {
      this.initDefaultState();
      return;
    }

    // Rehydrate projects and their nested todos using factories
    projects = savedState.projects.map((projectData) => {
      const rehydratedTodos = (projectData.todos || []).map((todoData) =>
        createTodo({
          ...todoData,
          projectId: projectData.id,
        })
      );

      return createProject({
        id: projectData.id,
        name: projectData.name,
        isDefault: Boolean(projectData.isDefault),
        todos: rehydratedTodos,
      });
    });

    // Restore active project or fallback to first
    const activeProjectExists = projects.some((p) => p.id === savedState.activeProjectId);
    activeProjectId = activeProjectExists ? savedState.activeProjectId : projects[0].id;
  },
};
