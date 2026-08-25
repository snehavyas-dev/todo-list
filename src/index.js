import './styles/style.css';
import { projectManager } from './modules/projectManager.js';
import { storageManager } from './modules/storage.js';

// Application Initialization Pattern
console.log('--- Testing Storage & State Lifecycle ---');

// 1. Attempt to load existing state from localStorage
const savedState = storageManager.loadState();

if (savedState) {
  console.log('📦 Existing data found in localStorage. Rehydrating state...');
  projectManager.loadState(savedState);
} else {
  console.log('🌱 No prior data found. Initializing default projects and tasks...');
  projectManager.initDefaultState();
  storageManager.saveState(projectManager.getState());
}

console.log('Current Active Project:', projectManager.getActiveProject());
console.log('All Projects in Memory:', projectManager.getProjects());
