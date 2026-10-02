import 'package:flutter/foundation.dart';
import '../models/task.dart';

/// Manages the in-memory list of tasks and notifies listeners on every change.
class TaskProvider extends ChangeNotifier {
  final List<Task> _tasks = [];

  /// An unmodifiable view of the current task list.
  List<Task> get tasks => List.unmodifiable(_tasks);

  /// Number of tasks that have not been completed.
  int get pendingCount => _tasks.where((t) => !t.isCompleted).length;

  /// Number of tasks that have been completed.
  int get completedCount => _tasks.where((t) => t.isCompleted).length;

  /// Adds a new task with the given [title].
  ///
  /// Does nothing if [title] is empty or contains only whitespace.
  void addTask(String title) {
    final trimmed = title.trim();
    if (trimmed.isEmpty) return;

    _tasks.add(Task(
      id: DateTime.now().microsecondsSinceEpoch.toString(),
      title: trimmed,
    ));
    notifyListeners();
  }

  /// Toggles the completion state of the task identified by [id].
  void toggleTask(String id) {
    final index = _tasks.indexWhere((t) => t.id == id);
    if (index == -1) return;

    _tasks[index].isCompleted = !_tasks[index].isCompleted;
    notifyListeners();
  }

  /// Removes the task identified by [id] from the list.
  void deleteTask(String id) {
    _tasks.removeWhere((t) => t.id == id);
    notifyListeners();
  }
}
