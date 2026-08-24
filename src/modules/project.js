/**
 * Factory function to create a new Project container.
 *
 * @param {Object} options - Project configuration
 * @param {string} options.name - Display name of the project (required)
 * @param {string} [options.id] - Unique ID (auto-generated if omitted)
 * @param {boolean} [options.isDefault=false] - If true, this project cannot be deleted (e.g. Inbox)
 * @param {Array} [options.todos=[]] - Array holding Todo objects
 * @returns {Object} A pure data Project object
 */
export function createProject({
  name,
  id = crypto.randomUUID(),
  isDefault = false,
  todos = [],
} = {}) {
  // 1. Validation: Ensure a valid name is provided
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('Project name is required and cannot be empty.');
  }

  // 2. Return the plain Project object
  return {
    id,
    name: name.trim(),
    isDefault: Boolean(isDefault),
    todos: Array.isArray(todos) ? todos : [],
  };
}
