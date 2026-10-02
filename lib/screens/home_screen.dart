import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/task_provider.dart';
import '../widgets/add_task_bar.dart';
import '../widgets/task_item.dart';
import '../widgets/task_summary.dart';

/// The main (and only) screen of the QuickTasks app.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: colorScheme.surfaceContainerLowest,
      appBar: AppBar(
        backgroundColor: colorScheme.surfaceContainerLowest,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: [
            Icon(
              Icons.checklist_rounded,
              color: colorScheme.primary,
              size: 26,
            ),
            const SizedBox(width: 8),
            Text(
              'QuickTasks',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: colorScheme.onSurface,
                  ),
            ),
          ],
        ),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(48),
          child: TaskSummary(),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: Consumer<TaskProvider>(
              builder: (context, provider, _) {
                if (provider.tasks.isEmpty) {
                  return _EmptyState();
                }
                return ListView.builder(
                  padding: const EdgeInsets.only(top: 8, bottom: 8),
                  itemCount: provider.tasks.length,
                  itemBuilder: (context, index) {
                    return TaskItem(task: provider.tasks[index]);
                  },
                );
              },
            ),
          ),
          const AddTaskBar(),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.inbox_rounded,
            size: 72,
            color: colorScheme.onSurface.withValues(alpha: 0.18),
          ),
          const SizedBox(height: 16),
          Text(
            'No tasks yet',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: colorScheme.onSurface.withValues(alpha: 0.45),
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 6),
          Text(
            'Add a task below to get started.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onSurface.withValues(alpha: 0.35),
                ),
          ),
        ],
      ),
    );
  }
}
