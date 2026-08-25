import './styles/style.css';
import { appController } from './modules/appController.js';

// Bootstrap the application on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  appController.init();
  console.log('TaskFlow application successfully mounted and running.');
});
