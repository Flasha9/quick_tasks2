/// Represents a single to-do task.
class Task {
  /// Unique identifier generated from the current timestamp in microseconds.
  final String id;

  /// The user-entered description of the task.
  final String title;

  /// Whether the task has been completed.
  bool isCompleted;

  Task({
    required this.id,
    required this.title,
    this.isCompleted = false,
  });
}
