import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/task.dart';
import '../providers/task_provider.dart';

/// A single row representing one task in the list.
class TaskItem extends StatelessWidget {
  const TaskItem({super.key, required this.task});

  final Task task;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 4.0),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: colorScheme.outlineVariant.withValues(alpha: 0.5),
        ),
      ),
      color: task.isCompleted
          ? colorScheme.surfaceContainerLow
          : colorScheme.surface,
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 8.0, vertical: 2.0),
        leading: Checkbox(
          value: task.isCompleted,
          onChanged: (_) {
            context.read<TaskProvider>().toggleTask(task.id);
          },
          shape: const CircleBorder(),
        ),
        title: Text(
          task.title,
          style: textTheme.bodyLarge?.copyWith(
            decoration:
                task.isCompleted ? TextDecoration.lineThrough : null,
            decorationThickness: 2,
            color: task.isCompleted
                ? colorScheme.onSurface.withValues(alpha: 0.45)
                : colorScheme.onSurface,
          ),
        ),
        trailing: IconButton(
          icon: Icon(
            Icons.delete_outline_rounded,
            color: colorScheme.error.withValues(alpha: 0.7),
          ),
          tooltip: 'Delete task',
          onPressed: () {
            context.read<TaskProvider>().deleteTask(task.id);
          },
        ),
      ),
    );
  }
}
