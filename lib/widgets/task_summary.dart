import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/task_provider.dart';

/// Displays two chips showing the pending and completed task counts.
class TaskSummary extends StatelessWidget {
  const TaskSummary({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Consumer<TaskProvider>(
      builder: (context, provider, _) {
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Row(
            children: [
              _SummaryChip(
                icon: Icons.hourglass_empty_rounded,
                label: '${provider.pendingCount} pending',
                backgroundColor: colorScheme.secondaryContainer,
                foregroundColor: colorScheme.onSecondaryContainer,
              ),
              const SizedBox(width: 8),
              _SummaryChip(
                icon: Icons.check_circle_outline_rounded,
                label: '${provider.completedCount} done',
                backgroundColor: colorScheme.tertiaryContainer,
                foregroundColor: colorScheme.onTertiaryContainer,
              ),
            ],
          ),
        );
      },
    );
  }
}

class _SummaryChip extends StatelessWidget {
  const _SummaryChip({
    required this.icon,
    required this.label,
    required this.backgroundColor,
    required this.foregroundColor,
  });

  final IconData icon;
  final String label;
  final Color backgroundColor;
  final Color foregroundColor;

  @override
  Widget build(BuildContext context) {
    return Chip(
      avatar: Icon(icon, size: 16, color: foregroundColor),
      label: Text(
        label,
        style: TextStyle(
          color: foregroundColor,
          fontWeight: FontWeight.w600,
          fontSize: 13,
        ),
      ),
      backgroundColor: backgroundColor,
      side: BorderSide.none,
      visualDensity: VisualDensity.compact,
    );
  }
}
