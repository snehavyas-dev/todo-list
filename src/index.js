import './styles/style.css';
import { projectManager } from './modules/projectManager.js';

// 1. Initialize default state
projectManager.initDefaultState();
console.log('--- Initial State ---');
console.log('Projects:', projectManager.getProjects());
console.log('Active Project:', projectManager.getActiveProject());

// 2. Add a new Project
const college = projectManager.addProject('College');
console.log('Added Project:', college);

// 3. Add a Todo to the new Project
const mathTask = projectManager.addTodo(college.id, {
  title: 'Complete Calculus Assignment',
  dueDate: '2026-09-01',
  priority: 'high',
});
console.log('Added Todo:', mathTask);

// 4. Toggle completion
projectManager.toggleTodoComplete(college.id, mathTask.id);
console.log('After Toggling Complete:', projectManager.getTodo(college.id, mathTask.id));

// 5. Test State snapshot for storage
console.log('Full State Snapshot:', projectManager.getState());
