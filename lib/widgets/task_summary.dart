import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../l10n/strings.dart';
import '../providers/task_provider.dart';

/// Displays pending/completed counts, real streak count, and a clear progress bar.
class TaskSummary extends StatelessWidget {
  const TaskSummary({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Consumer<TaskProvider>(
      builder: (context, provider, _) {
        final pending = provider.pendingCount;
        final completed = provider.completedCount;
        final streak = provider.streakCount;
        final progress = provider.progressPercentage;

        return Padding(
          padding: const EdgeInsetsDirectional.fromSTEB(16.0, 4.0, 16.0, 10.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Metric Badges Row
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _StatBadge(
                      icon: Icons.hourglass_top_rounded,
                      label: '$pending ${Strings.pending}',
                      backgroundColor: colorScheme.secondaryContainer,
                      foregroundColor: colorScheme.onSecondaryContainer,
                    ),
                    const SizedBox(width: 8),
                    _StatBadge(
                      icon: Icons.check_circle_outline_rounded,
                      label: '$completed ${Strings.completed}',
                      backgroundColor: colorScheme.tertiaryContainer,
                      foregroundColor: colorScheme.onTertiaryContainer,
                    ),
                    const SizedBox(width: 8),
                    _StatBadge(
                      icon: Icons.local_fire_department_rounded,
                      label: '$streak ${Strings.streakLabel}',
                      backgroundColor: Colors.amber.withValues(alpha: 0.18),
                      foregroundColor: Colors.orange.shade800,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              // Progress Bar Row
              Row(
                children: [
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(999),
                      child: LinearProgressIndicator(
                        value: provider.totalCount > 0 ? (progress / 100.0) : 0.0,
                        minHeight: 7,
                        backgroundColor: colorScheme.surfaceContainerHighest,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          progress == 100 && provider.totalCount > 0
                              ? Colors.green.shade600
                              : colorScheme.primary,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    '%$progress',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: colorScheme.primary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _StatBadge extends StatelessWidget {
  const _StatBadge({
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
    return Container(
      padding: const EdgeInsetsDirectional.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 15, color: foregroundColor),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(
              color: foregroundColor,
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
