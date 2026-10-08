import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../l10n/strings.dart';
import '../models/task.dart';
import '../providers/task_provider.dart';
import '../widgets/add_task_bar.dart';
import '../widgets/task_item.dart';
import '../widgets/task_summary.dart';

/// The main home screen featuring search, category chips, status filters,
/// undoable actions, dark mode toggle, and an optimized task list.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showUndoSnackBar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 4),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        action: SnackBarAction(
          label: Strings.undo,
          textColor: Theme.of(context).colorScheme.primaryContainer,
          onPressed: () {
            context.read<TaskProvider>().undo();
          },
        ),
      ),
    );
  }

  void _confirmClearCompleted(BuildContext context) {
    final completedCount = context.read<TaskProvider>().completedCount;
    if (completedCount == 0) return;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(Strings.clearCompleted),
        content: Text(Strings.clearCompletedConfirm),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(Strings.cancel),
          ),
          FilledButton.tonal(
            onPressed: () {
              Navigator.pop(ctx);
              context.read<TaskProvider>().clearCompleted();
              _showUndoSnackBar(Strings.completedCleared);
            },
            child: Text(Strings.confirm),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final isDarkMode = context.select<TaskProvider, bool>((p) => p.isDarkMode);
    final completedCount = context.select<TaskProvider, int>((p) => p.completedCount);

    return Scaffold(
      backgroundColor: colorScheme.surfaceContainerLowest,
      appBar: AppBar(
        backgroundColor: colorScheme.surfaceContainerLowest,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsetsDirectional.all(6),
              decoration: BoxDecoration(
                color: colorScheme.primary.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                Icons.task_alt_rounded,
                color: colorScheme.primary,
                size: 22,
              ),
            ),
            const SizedBox(width: 10),
            Text(
              Strings.appName,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: colorScheme.onSurface,
                  ),
            ),
          ],
        ),
        actions: [
          // Clear completed tasks button
          if (completedCount > 0)
            IconButton(
              icon: const Icon(Icons.cleaning_services_rounded),
              tooltip: Strings.clearCompleted,
              onPressed: () => _confirmClearCompleted(context),
            ),

          // Theme toggle button
          IconButton(
            icon: Icon(
              isDarkMode ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
              color: colorScheme.onSurfaceVariant,
            ),
            tooltip: Strings.toggleTheme,
            onPressed: () {
              context.read<TaskProvider>().toggleTheme();
            },
          ),
          const SizedBox(width: 4),
        ],
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(74),
          child: TaskSummary(),
        ),
      ),
      body: Column(
        children: [
          // Search & Filter Toolbar
          Padding(
            padding: const EdgeInsetsDirectional.fromSTEB(14.0, 4.0, 14.0, 6.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: Strings.searchHint,
                prefixIcon: const Icon(Icons.search_rounded, size: 20),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        tooltip: Strings.clearSearch,
                        onPressed: () {
                          _searchController.clear();
                          context.read<TaskProvider>().setSearchQuery('');
                          setState(() {});
                        },
                      )
                    : null,
                filled: true,
                fillColor: colorScheme.surface,
                isDense: true,
                contentPadding: const EdgeInsetsDirectional.symmetric(
                  horizontal: 14,
                  vertical: 10,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: colorScheme.outlineVariant.withValues(alpha: 0.3),
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: colorScheme.outlineVariant.withValues(alpha: 0.3),
                  ),
                ),
              ),
              onChanged: (value) {
                context.read<TaskProvider>().setSearchQuery(value);
                setState(() {});
              },
            ),
          ),

          // Horizontal Categories Filter Chips
          const _CategoriesBar(),

          // Status Filters Row
          const _StatusFilterBar(),

          const SizedBox(height: 4),

          // Optimized Task List with Single-Computation local variable
          Expanded(
            child: Selector<TaskProvider, List<Task>>(
              selector: (_, provider) => provider.tasks,
              shouldRebuild: (prev, next) => true, // Tasks list changes
              builder: (context, tasks, _) {
                // Computed once in the builder for highest performance
                if (tasks.isEmpty) {
                  final isSearching = _searchController.text.isNotEmpty;
                  return _EmptyState(isSearching: isSearching);
                }

                return ListView.builder(
                  padding: const EdgeInsetsDirectional.only(top: 4, bottom: 8),
                  itemCount: tasks.length,
                  itemBuilder: (context, index) {
                    final task = tasks[index];
                    return TaskItem(
                      key: ValueKey(task.id),
                      task: task,
                      onDeleted: () => _showUndoSnackBar(Strings.taskDeleted),
                    );
                  },
                );
              },
            ),
          ),

          // Add Task Bar
          const AddTaskBar(),
        ],
      ),
    );
  }
}

/// Horizontal scrollable bar for selecting task categories.
class _CategoriesBar extends StatelessWidget {
  const _CategoriesBar();

  @override
  Widget build(BuildContext context) {
    final categories = context.select<TaskProvider, List<Category>>((p) => p.categories);
    final selectedCategory =
        context.select<TaskProvider, String>((p) => p.selectedCategory);

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsetsDirectional.symmetric(horizontal: 14.0, vertical: 2.0),
      child: Row(
        children: categories.map((cat) {
          final isSelected = selectedCategory == cat.id;
          final catColor = Color(cat.colorHex);

          return Padding(
            padding: const EdgeInsetsDirectional.only(end: 6.0),
            child: ChoiceChip(
              avatar: cat.id == 'all'
                  ? const Icon(Icons.layers_rounded, size: 16)
                  : CircleAvatar(
                      radius: 5,
                      backgroundColor: catColor,
                    ),
              label: Text(cat.name),
              selected: isSelected,
              onSelected: (val) {
                if (val) {
                  context.read<TaskProvider>().setSelectedCategory(cat.id);
                }
              },
              visualDensity: VisualDensity.compact,
              labelStyle: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

/// Status filters bar: الكل, نشطة, مكتملة, اليوم.
class _StatusFilterBar extends StatelessWidget {
  const _StatusFilterBar();

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final currentFilter = context.select<TaskProvider, String>((p) => p.statusFilter);

    final filters = [
      {'key': 'all', 'label': Strings.filterAll},
      {'key': 'active', 'label': Strings.filterActive},
      {'key': 'completed', 'label': Strings.filterCompleted},
      {'key': 'today', 'label': Strings.filterToday},
    ];

    return Padding(
      padding: const EdgeInsetsDirectional.fromSTEB(14.0, 4.0, 14.0, 2.0),
      child: Row(
        children: filters.map((f) {
          final isSelected = currentFilter == f['key'];
          return Expanded(
            child: Padding(
              padding: const EdgeInsetsDirectional.symmetric(horizontal: 2.0),
              child: InkWell(
                borderRadius: BorderRadius.circular(8),
                onTap: () {
                  context.read<TaskProvider>().setStatusFilter(f['key']!);
                },
                child: Container(
                  padding: const EdgeInsetsDirectional.symmetric(vertical: 6),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? colorScheme.primaryContainer
                        : colorScheme.surfaceContainerHighest.withValues(alpha: 0.4),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isSelected
                          ? colorScheme.primary.withValues(alpha: 0.3)
                          : Colors.transparent,
                    ),
                  ),
                  alignment: AlignmentDirectional.center,
                  child: Text(
                    f['label']!,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      color: isSelected
                          ? colorScheme.onPrimaryContainer
                          : colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

/// Empty state widget localized in Arabic.
class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.isSearching});

  final bool isSearching;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsetsDirectional.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsetsDirectional.all(20),
              decoration: BoxDecoration(
                color: colorScheme.primary.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isSearching ? Icons.search_off_rounded : Icons.inbox_rounded,
                size: 56,
                color: colorScheme.primary.withValues(alpha: 0.6),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              isSearching ? Strings.noMatchingTasks : Strings.noTasksYet,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: colorScheme.onSurface,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 6),
            Text(
              isSearching
                  ? Strings.noMatchingTasksSubtitle
                  : Strings.noTasksSubtitle,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
