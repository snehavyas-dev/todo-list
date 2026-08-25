/**
 * Factory function to create a new Project container.
 *
 * @param {Object} options - Project configuration
 * @param {string} options.name - Display name of the project (required)
 * @param {string} [options.id] - Unique ID (auto-generated if omitted)
 * @param {string} [options.color='#6366f1'] - Color accent for project tags
 * @param {boolean} [options.isDefault=false] - If true, this project cannot be deleted (e.g. Inbox)
 * @param {Array} [options.todos=[]] - Array holding Todo objects
 * @returns {Object} A pure data Project object
 */
export function createProject({
  name,
  id = crypto.randomUUID(),
  color = '#6366f1',
  isDefault = false,
  todos = [],
} = {}) {
  // 1. Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('Project name is required and cannot be empty.');
  }

  // 2. Return clean project object
  return {
    id,
    name: name.trim(),
    color: color || '#6366f1',
    isDefault: Boolean(isDefault),
    todos: Array.isArray(todos) ? todos : [],
  };
}
