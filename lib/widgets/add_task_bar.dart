import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../l10n/strings.dart';
import '../models/task.dart';
import '../providers/task_provider.dart';

/// An interactive task creation bar featuring quick submission via Enter
/// and an expandable tray for description, priority, category, due date, and pin toggle.
class AddTaskBar extends StatefulWidget {
  const AddTaskBar({super.key});

  @override
  State<AddTaskBar> createState() => _AddTaskBarState();
}

class _AddTaskBarState extends State<AddTaskBar> {
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  final FocusNode _titleFocus = FocusNode();

  bool _isExpanded = false;
  PriorityLevel _priority = PriorityLevel.medium;
  String _categoryId = 'personal';
  String? _dueDate;
  bool _isPinned = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _titleFocus.dispose();
    super.dispose();
  }

  void _submit() {
    final title = _titleController.text.trim();
    if (title.isEmpty) {
      _titleFocus.requestFocus();
      return;
    }

    final description = _descController.text.trim();

    context.read<TaskProvider>().addTask(
      title: title,
      description: description.isEmpty ? null : description,
      priority: _priority,
      categoryId: _categoryId,
      dueDate: _dueDate,
      isPinned: _isPinned,
    );

    _titleController.clear();
    _descController.clear();
    setState(() {
      _priority = PriorityLevel.medium;
      _categoryId = 'personal';
      _dueDate = null;
      _isPinned = false;
      _isExpanded = false;
    });

    _titleFocus.requestFocus();
  }

  Future<void> _pickDueDate(BuildContext context) async {
    final now = DateTime.now();
    DateTime initial = now;
    if (_dueDate != null) {
      final parsed = DateTime.tryParse(_dueDate!);
      if (parsed != null) initial = parsed;
    }

    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: now.subtract(const Duration(days: 365)),
      lastDate: now.add(const Duration(days: 365 * 5)),
      locale: const Locale('ar'),
    );

    if (picked != null) {
      setState(() {
        _dueDate = picked.toIso8601String().split('T')[0];
      });
    }
  }

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

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final categories = context.select<TaskProvider, List<Category>>(
      (p) => p.categories.where((c) => c.id != 'all').toList(),
    );

    final hasAdvancedValues = _descController.text.isNotEmpty ||
        _priority != PriorityLevel.medium ||
        _categoryId != 'personal' ||
        _dueDate != null ||
        _isPinned;

    return Container(
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHigh,
        border: Border(
          top: BorderSide(
            color: colorScheme.outlineVariant.withValues(alpha: 0.35),
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      padding: EdgeInsetsDirectional.fromSTEB(
        12,
        8,
        12,
        MediaQuery.of(context).viewInsets.bottom + 12,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Expandable Options Drawer
          AnimatedCrossFade(
            duration: const Duration(milliseconds: 220),
            crossFadeState:
                _isExpanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
            firstChild: const SizedBox.shrink(),
            secondChild: Padding(
              padding: const EdgeInsetsDirectional.only(bottom: 10.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Optional Description Field
                  TextField(
                    controller: _descController,
                    maxLines: 2,
                    decoration: InputDecoration(
                      hintText: Strings.optionalDescription,
                      filled: true,
                      fillColor: colorScheme.surface,
                      isDense: true,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsetsDirectional.all(10),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Priority Selector
                  Text(
                    Strings.priority,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: PriorityLevel.values.map((lvl) {
                      final isSelected = _priority == lvl;
                      final lvlColor = _getPriorityColor(lvl);
                      return Padding(
                        padding: const EdgeInsetsDirectional.only(end: 6.0),
                        child: ChoiceChip(
                          label: Text(_getPriorityLabel(lvl)),
                          selected: isSelected,
                          onSelected: (val) {
                            if (val) setState(() => _priority = lvl);
                          },
                          selectedColor: lvlColor.withValues(alpha: 0.2),
                          labelStyle: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            color: isSelected ? lvlColor : colorScheme.onSurface,
                          ),
                          side: BorderSide(
                            color: isSelected ? lvlColor : Colors.transparent,
                          ),
                          visualDensity: VisualDensity.compact,
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 10),

                  // Category Selector
                  Text(
                    Strings.category,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 4),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: categories.map((cat) {
                        final isSelected = _categoryId == cat.id;
                        final catColor = Color(cat.colorHex);
                        return Padding(
                          padding: const EdgeInsetsDirectional.only(end: 6.0),
                          child: ChoiceChip(
                            avatar: CircleAvatar(
                              radius: 5,
                              backgroundColor: catColor,
                            ),
                            label: Text(cat.name),
                            selected: isSelected,
                            onSelected: (val) {
                              if (val) setState(() => _categoryId = cat.id);
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
                  ),
                  const SizedBox(height: 10),

                  // Due Date and Pin Action Row
                  Row(
                    children: [
                      // Due Date Picker Button
                      OutlinedButton.icon(
                        onPressed: () => _pickDueDate(context),
                        icon: const Icon(Icons.calendar_today_rounded, size: 16),
                        label: Text(
                          _dueDate ?? Strings.selectDueDate,
                          style: const TextStyle(fontSize: 12),
                        ),
                        style: OutlinedButton.styleFrom(
                          visualDensity: VisualDensity.compact,
                          padding: const EdgeInsetsDirectional.symmetric(horizontal: 10),
                        ),
                      ),
                      if (_dueDate != null) ...[
                        const SizedBox(width: 4),
                        IconButton(
                          icon: const Icon(Icons.close_rounded, size: 16),
                          tooltip: Strings.cancel,
                          visualDensity: VisualDensity.compact,
                          onPressed: () => setState(() => _dueDate = null),
                        ),
                      ],
                      const Spacer(),
                      // Pin Toggle
                      FilterChip(
                        avatar: Icon(
                          _isPinned ? Icons.push_pin_rounded : Icons.push_pin_outlined,
                          size: 16,
                          color: _isPinned ? colorScheme.primary : colorScheme.onSurfaceVariant,
                        ),
                        label: Text(
                          Strings.pinned,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: _isPinned ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                        selected: _isPinned,
                        onSelected: (val) => setState(() => _isPinned = val),
                        visualDensity: VisualDensity.compact,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Primary Row: Options Toggle + Title Input + Submit Button
          Row(
            children: [
              // Expand/Collapse Options Toggle
              IconButton(
                icon: Stack(
                  alignment: Alignment.topRight,
                  children: [
                    Icon(
                      _isExpanded ? Icons.expand_more_rounded : Icons.tune_rounded,
                      color: _isExpanded || hasAdvancedValues
                          ? colorScheme.primary
                          : colorScheme.onSurfaceVariant,
                    ),
                    if (hasAdvancedValues && !_isExpanded)
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: colorScheme.primary,
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),
                tooltip: _isExpanded ? Strings.hideOptions : Strings.moreOptions,
                onPressed: () => setState(() => _isExpanded = !_isExpanded),
              ),
              const SizedBox(width: 4),

              // Title Field
              Expanded(
                child: TextField(
                  controller: _titleController,
                  focusNode: _titleFocus,
                  textInputAction: TextInputAction.done,
                  decoration: InputDecoration(
                    hintText: Strings.addNewTaskHint,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    filled: true,
                    fillColor: colorScheme.surface,
                    contentPadding: const EdgeInsetsDirectional.symmetric(
                      horizontal: 14,
                      vertical: 12,
                    ),
                  ),
                  onSubmitted: (_) => _submit(),
                ),
              ),
              const SizedBox(width: 8),

              // Submit Button
              FilledButton(
                onPressed: _submit,
                style: FilledButton.styleFrom(
                  minimumSize: const Size(48, 48),
                  padding: EdgeInsets.zero,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Icon(Icons.add_rounded),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
