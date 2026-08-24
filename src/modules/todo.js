/**
 * Factory function to create a new Todo item.
 *
 * @param {Object} options - Todo parameters
 * @param {string} options.title - Title of the task (required)
 * @param {string} [options.description=''] - Detailed description
 * @param {string} [options.dueDate=''] - Due date in YYYY-MM-DD format
 * @param {('low'|'medium'|'high')} [options.priority='medium'] - Priority level
 * @param {string} [options.notes=''] - Additional notes
 * @param {boolean} [options.completed=false] - Completion status
 * @param {string} [options.projectId='default'] - ID of parent project
 * @param {string} [options.id] - Unique ID (auto-generated if not supplied)
 * @param {string} [options.createdAt] - Creation timestamp (auto-generated if not supplied)
 * @returns {Object} A pure data Todo object
 */
export function createTodo({
  title,
  description = '',
  dueDate = '',
  priority = 'medium',
  notes = '',
  completed = false,
  projectId = 'default',
  id = crypto.randomUUID(),
  createdAt = new Date().toISOString(),
} = {}) {
  // 1. Validation: Ensure a valid title exists
  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new Error('Todo title is required and cannot be empty.');
  }

  // 2. Normalization: Sanitize priority input
  const validPriorities = ['low', 'medium', 'high'];
  const normalizedPriority = validPriorities.includes(priority.toLowerCase())
    ? priority.toLowerCase()
    : 'medium';

  // 3. Return a plain JavaScript object (pure data)
  return {
    id,
    projectId,
    title: title.trim(),
    description: description.trim(),
    dueDate,
    priority: normalizedPriority,
    notes: notes.trim(),
    completed: Boolean(completed),
    createdAt,
  };
}

