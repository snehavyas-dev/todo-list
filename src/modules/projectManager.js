import { createTodo } from './todo.js';
import { createProject } from './project.js';

// In-memory application state
let projects = [];
let activeViewId = 'view-inbox'; // Can be 'view-inbox', 'view-today', 'view-upcoming', 'view-high-priority', or a projectId
let lastDeletedTask = null; // For Undo feature
let sortBy = 'default'; // 'default', 'date', 'priority', 'name'
let searchQuery = '';

export const projectManager = {
  /**
   * Initializes state with sample projects and tasks
   */
  initDefaultState() {
    projects = [];

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 4);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    // Default Inbox
    const inbox = createProject({
      id: 'inbox-default',
      name: 'Inbox',
      color: '#6366f1',
      isDefault: true,
    });

    const task1 = createTodo({
      title: 'Welcome to TaskFlow Pro! 👋',
      description: 'Click this card to view details, edit fields, or mark complete.',
      dueDate: todayStr,
      priority: 'high',
      notes: 'Try out keyboard shortcuts: press / to search or N to create a new task.',
      projectId: inbox.id,
    });

    const task2 = createTodo({
      title: 'Explore Smart Views (Today & Upcoming)',
      description: 'Tasks with due dates automatically appear in Today and Upcoming smart views.',
      dueDate: tomorrowStr,
      priority: 'medium',
      notes: 'Check the sidebar navigation for instant smart filters.',
      projectId: inbox.id,
    });

    inbox.todos.push(task1, task2);
    projects.push(inbox);

    // College Project
    const college = createProject({
      name: 'College',
      color: '#8b5cf6',
      isDefault: false,
    });

    const collegeTask1 = createTodo({
      title: 'CS450: Research Paper Draft',
      description: 'Draft literature review on distributed systems architecture.',
      dueDate: nextWeekStr,
      priority: 'high',
      notes: 'Reference IEEE papers and system benchmarks.',
      projectId: college.id,
    });

    const collegeTask2 = createTodo({
      title: 'Physics Lab: Wave Mechanics Report',
      description: 'Compile lab dataset and graph frequency resonance.',
      dueDate: '',
      priority: 'medium',
      notes: 'Lab partner: Alex',
      projectId: college.id,
    });

    const collegeTask3 = createTodo({
      title: 'Math Seminar: Presentation Prep',
      description: 'Prepare slides on eigenvalue decompositions.',
      dueDate: '',
      priority: 'low',
      completed: true,
      projectId: college.id,
    });

    college.todos.push(collegeTask1, collegeTask2, collegeTask3);
    projects.push(college);

    // Work Project
    const work = createProject({
      name: 'Work',
      color: '#059669',
      isDefault: false,
    });

    const workTask1 = createTodo({
      title: 'Sprint Retrospective and Planning',
      description: 'Review velocity and backlog grooming for next milestone.',
      dueDate: todayStr,
      priority: 'high',
      projectId: work.id,
    });

    work.todos.push(workTask1);
    projects.push(work);

    activeViewId = 'view-inbox';
  },

  getProjects() {
    return projects;
  },

  getActiveViewId() {
    return activeViewId;
  },

  setActiveViewId(id) {
    activeViewId = id;
  },

  setSortBy(sortType) {
    sortBy = sortType;
  },

  getSortBy() {
    return sortBy;
  },

  setSearchQuery(query) {
    searchQuery = (query || '').trim().toLowerCase();
  },

  getSearchQuery() {
    return searchQuery;
  },

  getProjectById(projectId) {
    return projects.find((p) => p.id === projectId);
  },

  addProject(name, color = '#6366f1') {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Project name cannot be empty.');

    const newProject = createProject({ name: trimmed, color });
    projects.push(newProject);
    activeViewId = newProject.id;
    return newProject;
  },

  deleteProject(projectId) {
    const proj = this.getProjectById(projectId);
    if (!proj || proj.isDefault) return false;

    projects = projects.filter((p) => p.id !== projectId);
    if (activeViewId === projectId) {
      activeViewId = 'view-inbox';
    }
    return true;
  },

  addTodo(projectId, todoData) {
    let targetProjectId = projectId;
    if (!targetProjectId || targetProjectId.startsWith('view-')) {
      targetProjectId = projects.find((p) => p.isDefault)?.id || projects[0].id;
    }

    const project = this.getProjectById(targetProjectId);
    if (!project) throw new Error(`Project ${targetProjectId} not found.`);

    const newTodo = createTodo({ ...todoData, projectId: targetProjectId });
    project.todos.push(newTodo);
    return newTodo;
  },

  getTodo(projectId, todoId) {
    if (projectId) {
      const project = this.getProjectById(projectId);
      if (project) return project.todos.find((t) => t.id === todoId);
    }
    // Search across all projects if not specified
    for (const project of projects) {
      const found = project.todos.find((t) => t.id === todoId);
      if (found) return found;
    }
    return undefined;
  },

  deleteTodo(projectId, todoId) {
    for (const project of projects) {
      const index = project.todos.findIndex((t) => t.id === todoId);
      if (index !== -1) {
        lastDeletedTask = {
          todo: project.todos[index],
          projectId: project.id,
        };
        project.todos.splice(index, 1);
        return true;
      }
    }
    return false;
  },

  undoDelete() {
    if (!lastDeletedTask) return null;
    const project = this.getProjectById(lastDeletedTask.projectId);
    if (project) {
      project.todos.push(lastDeletedTask.todo);
      const restored = lastDeletedTask;
      lastDeletedTask = null;
      return restored;
    }
    return null;
  },

  toggleTodoComplete(projectId, todoId) {
    const todo = this.getTodo(projectId, todoId);
    if (!todo) return false;
    todo.completed = !todo.completed;
    return todo.completed;
  },

  editTodo(projectId, todoId, updatedFields) {
    const todo = this.getTodo(projectId, todoId);
    if (!todo) throw new Error('Todo not found.');

    if (updatedFields.title !== undefined) todo.title = updatedFields.title.trim();
    if (updatedFields.description !== undefined) todo.description = updatedFields.description.trim();
    if (updatedFields.dueDate !== undefined) todo.dueDate = updatedFields.dueDate;
    if (updatedFields.priority !== undefined) todo.priority = updatedFields.priority.toLowerCase();
    if (updatedFields.notes !== undefined) todo.notes = updatedFields.notes.trim();
    if (updatedFields.completed !== undefined) todo.completed = Boolean(updatedFields.completed);

    return todo;
  },

  /**
   * Calculates pending task counts for smart views
   */
  getSmartViewCounts() {
    const todayStr = new Date().toISOString().split('T')[0];
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    const next7DaysStr = next7Days.toISOString().split('T')[0];

    const allTodos = projects.flatMap((p) => p.todos);
    const inboxTodos = (projects.find((p) => p.isDefault)?.todos || []);

    return {
      inbox: inboxTodos.filter((t) => !t.completed).length,
      today: allTodos.filter((t) => !t.completed && t.dueDate === todayStr).length,
      upcoming: allTodos.filter((t) => !t.completed && t.dueDate > todayStr && t.dueDate <= next7DaysStr).length,
      highPriority: allTodos.filter((t) => !t.completed && t.priority === 'high').length,
    };
  },

  /**
   * Returns data bundle for the currently active view (smart view or custom project)
   */
  getCurrentViewData() {
    const todayStr = new Date().toISOString().split('T')[0];
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    const next7DaysStr = next7Days.toISOString().split('T')[0];

    let title = 'Inbox';
    let isSmartView = false;
    let projectColor = '#6366f1';
    let targetProject = null;
    let todos = [];

    if (activeViewId === 'view-inbox') {
      targetProject = projects.find((p) => p.isDefault) || projects[0];
      title = 'Inbox';
      todos = targetProject ? [...targetProject.todos] : [];
    } else if (activeViewId === 'view-today') {
      title = 'Today';
      isSmartView = true;
      todos = projects.flatMap((p) => p.todos).filter((t) => t.dueDate === todayStr);
    } else if (activeViewId === 'view-upcoming') {
      title = 'Upcoming';
      isSmartView = true;
      todos = projects.flatMap((p) => p.todos).filter((t) => t.dueDate >= todayStr && t.dueDate <= next7DaysStr);
    } else if (activeViewId === 'view-high-priority') {
      title = 'High Priority';
      isSmartView = true;
      todos = projects.flatMap((p) => p.todos).filter((t) => t.priority === 'high');
    } else {
      targetProject = this.getProjectById(activeViewId);
      if (!targetProject) {
        targetProject = projects[0];
        activeViewId = targetProject.id;
      }
      title = targetProject.name;
      projectColor = targetProject.color;
      todos = [...targetProject.todos];
    }

    // Apply live search filter if active
    if (searchQuery) {
      todos = todos.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery) ||
          t.description.toLowerCase().includes(searchQuery) ||
          t.notes.toLowerCase().includes(searchQuery)
      );
    }

    // Apply sorting
    todos = this.sortTodos(todos, sortBy);

    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const pending = total - completed;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      viewId: activeViewId,
      title,
      isSmartView,
      projectColor,
      project: targetProject,
      todos,
      total,
      completed,
      pending,
      progressPercent,
    };
  },

  /**
   * Sorts array of todos based on selected criteria
   */
  sortTodos(todosList, sortType) {
    const list = [...todosList];
    if (sortType === 'date') {
      return list.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    }
    if (sortType === 'priority') {
      const weight = { high: 1, medium: 2, low: 3 };
      return list.sort((a, b) => (weight[a.priority] || 4) - (weight[b.priority] || 4));
    }
    if (sortType === 'name') {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    // Default: uncompleted first, then by creation date
    return list.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
  },

  getState() {
    return {
      projects,
      activeViewId,
      sortBy,
    };
  },

  loadState(savedState) {
    if (!savedState || !Array.isArray(savedState.projects) || savedState.projects.length === 0) {
      this.initDefaultState();
      return;
    }

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
        color: projectData.color || '#6366f1',
        isDefault: Boolean(projectData.isDefault),
        todos: rehydratedTodos,
      });
    });

    activeViewId = savedState.activeViewId || 'view-inbox';
    sortBy = savedState.sortBy || 'default';
  },
};
