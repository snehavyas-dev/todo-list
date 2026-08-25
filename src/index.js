import './styles/style.css';
import { projectManager } from './modules/projectManager.js';
import { storageManager } from './modules/storage.js';
import { displayController } from './modules/displayController.js';

// 1. Initialize State & Storage
const savedState = storageManager.loadState();

if (savedState) {
  projectManager.loadState(savedState);
} else {
  projectManager.initDefaultState();
  storageManager.saveState(projectManager.getState());
}

// 2. Initial Render
function updateUI() {
  const projects = projectManager.getProjects();
  const activeProjectId = projectManager.getActiveProjectId();
  const activeProject = projectManager.getActiveProject();

  displayController.renderProjects(projects, activeProjectId);
  displayController.renderActiveProject(activeProject);
}

// Ensure DOM is ready and render
document.addEventListener('DOMContentLoaded', () => {
  displayController.initElements();
  updateUI();
  console.log('UI successfully rendered to DOM.');
});
