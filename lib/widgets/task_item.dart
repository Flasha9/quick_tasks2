import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../l10n/strings.dart';
import '../models/task.dart';
import '../providers/task_provider.dart';

/// An interactive task item card presenting title, description, priority badge,
/// category badge, due date, subtask progress, pin toggle, and tap-to-open details sheet.
class TaskItem extends StatelessWidget {
  const TaskItem({
    super.key,
    required this.task,
    this.onDeleted,
  });

  final Task task;
  final VoidCallback? onDeleted;

  Color _getPriorityColor(PriorityLevel level) {
    switch (level) {
      case PriorityLevel.high:
        return const Color(0xFFEF4444);
      case PriorityLevel.medium:
        return const Color(0xFFF59E0B);
      case PriorityLevel.low:
        return const Color(0xFF10B981);
    }
  }

  String _getPriorityLabel(PriorityLevel level) {
    switch (level) {
      case PriorityLevel.high:
        return Strings.priorityHigh;
      case PriorityLevel.medium:
        return Strings.priorityMedium;
      case PriorityLevel.low:
        return Strings.priorityLow;
    }
  }

  String _formatDueDate(String dueDateStr) {
    final now = DateTime.now();
    final todayStr = now.toIso8601String().split('T')[0];
    final tomorrowStr = now.add(const Duration(days: 1)).toIso8601String().split('T')[0];
    final yesterdayStr = now.subtract(const Duration(days: 1)).toIso8601String().split('T')[0];

    if (dueDateStr == todayStr) return Strings.today;
    if (dueDateStr == tomorrowStr) return Strings.tomorrow;
    if (dueDateStr == yesterdayStr) return Strings.yesterday;
    return dueDateStr;
  }

  void _openDetailsSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => _TaskDetailsSheet(taskId: task.id),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    final categories = context.select<TaskProvider, List<Category>>((p) => p.categories);
    final category = categories.firstWhere(
      (c) => c.id == task.categoryId,
      orElse: () => Category(
        id: task.categoryId,
        name: task.categoryId,
        colorHex: 0xFF6366F1,
        icon: 'folder',
      ),
    );

    final priorityColor = _getPriorityColor(task.priority);
    final categoryColor = Color(category.colorHex);
    final completedSubtasksCount = task.subtasks.where((s) => s.isCompleted).length;

    return Card(
      margin: const EdgeInsetsDirectional.symmetric(horizontal: 12.0, vertical: 4.0),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(
          color: task.isPinned
              ? colorScheme.primary.withValues(alpha: 0.45)
              : colorScheme.outlineVariant.withValues(alpha: 0.45),
          width: task.isPinned ? 1.5 : 1.0,
        ),
      ),
      color: task.isCompleted
          ? colorScheme.surfaceContainerLow.withValues(alpha: 0.8)
          : colorScheme.surface,
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () => _openDetailsSheet(context),
        child: Padding(
          padding: const EdgeInsetsDirectional.fromSTEB(8.0, 10.0, 12.0, 10.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Completion Checkbox
              Checkbox(
                value: task.isCompleted,
                onChanged: (_) {
                  context.read<TaskProvider>().toggleTask(task.id);
                },
                shape: const CircleBorder(),
                activeColor: colorScheme.primary,
              ),

              // Title, Description, and Badges
              Expanded(
                child: Padding(
                  padding: const EdgeInsetsDirectional.only(top: 2.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Task Title
                      Text(
                        task.title,
                        style: textTheme.bodyLarge?.copyWith(
                          decoration:
                              task.isCompleted ? TextDecoration.lineThrough : null,
                          decorationThickness: 2,
                          fontWeight: FontWeight.w600,
                          color: task.isCompleted
                              ? colorScheme.onSurface.withValues(alpha: 0.45)
                              : colorScheme.onSurface,
                        ),
                      ),

                      // Optional Description (Max 2 lines)
                      if (task.description != null && task.description!.isNotEmpty) ...[
                        const SizedBox(height: 3),
                        Text(
                          task.description!,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: textTheme.bodySmall?.copyWith(
                            color: task.isCompleted
                                ? colorScheme.onSurface.withValues(alpha: 0.35)
                                : colorScheme.onSurfaceVariant,
                            height: 1.3,
                          ),
                        ),
                      ],

                      const SizedBox(height: 8),

                      // Badges Wrap: Priority, Category, Due Date, Subtasks Count
                      Wrap(
                        spacing: 6,
                        runSpacing: 4,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          // Priority Badge
                          _Badge(
                            label: _getPriorityLabel(task.priority),
                            backgroundColor: priorityColor.withValues(alpha: 0.12),
                            foregroundColor: priorityColor,
                            dotColor: priorityColor,
                          ),

                          // Category Badge
                          _Badge(
                            label: category.name,
                            backgroundColor: categoryColor.withValues(alpha: 0.12),
                            foregroundColor: categoryColor,
                            dotColor: categoryColor,
                          ),

                          // Due Date Badge
                          if (task.dueDate != null)
                            _Badge(
                              icon: Icons.calendar_today_rounded,
                              label: _formatDueDate(task.dueDate!),
                              backgroundColor: colorScheme.surfaceContainerHighest,
                              foregroundColor: colorScheme.onSurfaceVariant,
                            ),

                          // Subtasks Count Badge
                          if (task.subtasks.isNotEmpty)
                            _Badge(
                              icon: Icons.checklist_rounded,
                              label: '$completedSubtasksCount/${task.subtasks.length}',
                              backgroundColor: colorScheme.surfaceContainerHighest,
                              foregroundColor: completedSubtasksCount == task.subtasks.length
                                  ? Colors.green.shade700
                                  : colorScheme.onSurfaceVariant,
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              // Action Buttons: Pin & Delete
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: Icon(
                      task.isPinned ? Icons.push_pin_rounded : Icons.push_pin_outlined,
                      size: 20,
                      color: task.isPinned
                          ? colorScheme.primary
                          : colorScheme.onSurfaceVariant.withValues(alpha: 0.5),
                    ),
                    tooltip: task.isPinned ? Strings.pinned : Strings.pinTask,
                    visualDensity: VisualDensity.compact,
                    onPressed: () {
                      context.read<TaskProvider>().togglePin(task.id);
                    },
                  ),
                  IconButton(
                    icon: Icon(
                      Icons.delete_outline_rounded,
                      size: 20,
                      color: colorScheme.error.withValues(alpha: 0.75),
                    ),
                    tooltip: Strings.deleteTask,
                    visualDensity: VisualDensity.compact,
                    onPressed: () {
                      context.read<TaskProvider>().deleteTask(task.id);
                      if (onDeleted != null) {
                        onDeleted!();
                      }
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({
    this.icon,
    required this.label,
    required this.backgroundColor,
    required this.foregroundColor,
    this.dotColor,
  });

  final IconData? icon;
  final String label;
  final Color backgroundColor;
  final Color foregroundColor;
  final Color? dotColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsetsDirectional.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (dotColor != null) ...[
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                color: dotColor,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 4),
          ],
          if (icon != null) ...[
            Icon(icon, size: 12, color: foregroundColor),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: foregroundColor,
            ),
          ),
        ],
      ),
    );
  }
}

/// BottomSheet showing full task description, metadata, and interactive subtask checklist.
class _TaskDetailsSheet extends StatefulWidget {
  const _TaskDetailsSheet({required this.taskId});

  final String taskId;

  @override
  State<_TaskDetailsSheet> createState() => _TaskDetailsSheetState();
}

class _TaskDetailsSheetState extends State<_TaskDetailsSheet> {
  final TextEditingController _subtaskController = TextEditingController();

  @override
  void dispose() {
    _subtaskController.dispose();
    super.dispose();
  }

  void _handleAddSubtask(BuildContext context) {
    final text = _subtaskController.text.trim();
    if (text.isEmpty) return;
    context.read<TaskProvider>().addSubtask(widget.taskId, text);
    _subtaskController.clear();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    final provider = context.watch<TaskProvider>();
    final taskIndex = provider.tasks.indexWhere((t) => t.id == widget.taskId);

    // If task was deleted while modal is open
    if (taskIndex == -1) {
      return Container(
        decoration: BoxDecoration(
          color: colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: const EdgeInsetsDirectional.all(24),
        child: Text(Strings.noTasksYet),
      );
    }

    final task = provider.tasks[taskIndex];
    final categories = provider.categories;
    final category = categories.firstWhere(
      (c) => c.id == task.categoryId,
      orElse: () => Category(
        id: task.categoryId,
        name: task.categoryId,
        colorHex: 0xFF6366F1,
        icon: 'folder',
      ),
    );

    return Container(
      padding: EdgeInsetsDirectional.fromSTEB(
        20,
        16,
        20,
        MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Drag Handle
            Center(
              child: Container(
                width: 38,
                height: 4,
                decoration: BoxDecoration(
                  color: colorScheme.outlineVariant.withValues(alpha: 0.6),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Header Row: Title & Close Button
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    task.title,
                    style: textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      decoration: task.isCompleted ? TextDecoration.lineThrough : null,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  tooltip: Strings.close,
                  visualDensity: VisualDensity.compact,
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),

            // Full Description
            if (task.description != null && task.description!.isNotEmpty) ...[
              const SizedBox(height: 10),
              Container(
                width: double.infinity,
                padding: const EdgeInsetsDirectional.all(12),
                decoration: BoxDecoration(
                  color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  task.description!,
                  style: textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                    height: 1.4,
                  ),
                ),
              ),
            ],

            const SizedBox(height: 14),

            // Task Meta Badges Row
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                _Badge(
                  label: category.name,
                  backgroundColor: Color(category.colorHex).withValues(alpha: 0.15),
                  foregroundColor: Color(category.colorHex),
                  dotColor: Color(category.colorHex),
                ),
                if (task.dueDate != null)
                  _Badge(
                    icon: Icons.calendar_today_rounded,
                    label: task.dueDate!,
                    backgroundColor: colorScheme.surfaceContainerHighest,
                    foregroundColor: colorScheme.onSurfaceVariant,
                  ),
                if (task.isPinned)
                  _Badge(
                    icon: Icons.push_pin_rounded,
                    label: Strings.pinned,
                    backgroundColor: colorScheme.primaryContainer,
                    foregroundColor: colorScheme.onPrimaryContainer,
                  ),
              ],
            ),

            const SizedBox(height: 20),
            const Divider(),
            const SizedBox(height: 10),

            // Subtasks Section Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  Strings.subtasks,
                  style: textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: colorScheme.onSurface,
                  ),
                ),
                Text(
                  '${task.subtasks.where((s) => s.isCompleted).length}/${task.subtasks.length}',
                  style: TextStyle(
                    fontSize: 12,
                    color: colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Subtasks List
            if (task.subtasks.isEmpty)
              Padding(
                padding: const EdgeInsetsDirectional.symmetric(vertical: 8.0),
                child: Text(
                  'لا توجد مهام فرعية مضافة',
                  style: textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant.withValues(alpha: 0.7),
                  ),
                ),
              )
            else
              ...task.subtasks.map((subtask) {
                return Padding(
                  padding: const EdgeInsetsDirectional.symmetric(vertical: 2.0),
                  child: Row(
                    children: [
                      Checkbox(
                        value: subtask.isCompleted,
                        onChanged: (_) {
                          provider.toggleSubtask(task.id, subtask.id);
                        },
                        visualDensity: VisualDensity.compact,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      Expanded(
                        child: Text(
                          subtask.title,
                          style: textTheme.bodyMedium?.copyWith(
                            decoration: subtask.isCompleted
                                ? TextDecoration.lineThrough
                                : null,
                            color: subtask.isCompleted
                                ? colorScheme.onSurface.withValues(alpha: 0.45)
                                : colorScheme.onSurface,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 16),
                        tooltip: Strings.delete,
                        visualDensity: VisualDensity.compact,
                        onPressed: () {
                          provider.deleteSubtask(task.id, subtask.id);
                        },
                      ),
                    ],
                  ),
                );
              }),

            const SizedBox(height: 10),

            // Add Subtask Row
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _subtaskController,
                    decoration: InputDecoration(
                      hintText: Strings.addSubtaskHint,
                      isDense: true,
                      filled: true,
                      fillColor: colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsetsDirectional.symmetric(
                        horizontal: 12,
                        vertical: 10,
                      ),
                    ),
                    onSubmitted: (_) => _handleAddSubtask(context),
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton.tonal(
                  onPressed: () => _handleAddSubtask(context),
                  style: FilledButton.styleFrom(
                    visualDensity: VisualDensity.compact,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: Text(Strings.addSubtask),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
