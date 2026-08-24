import './styles/style.css';
import { createTodo } from './modules/todo.js';
import { createProject } from './modules/project.js';

// Create a project
const inboxProject = createProject({
  name: 'Inbox',
  id: 'inbox-default',
  isDefault: true,
});

// Create a todo item
const firstTodo = createTodo({
  title: 'Set up Project Architecture',
  description: 'Factories, State Manager, and LocalStorage',
  dueDate: '2026-08-25',
  priority: 'high',
  projectId: inboxProject.id,
});

// Add todo to project
inboxProject.todos.push(firstTodo);

console.log('Project created with todo:');
console.log(inboxProject);
