import 'dart:convert';
import 'package:flutter/foundation.dart' hide Category;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/task.dart';

class TaskProvider extends ChangeNotifier {
  static const String _prefsKeyInitialized = 'quick_tasks_initialized';
  static const String _prefsKeyTasks = 'quick_tasks_items';
  static const String _prefsKeyCategories = 'quick_tasks_categories';
  static const String _prefsKeyDarkMode = 'quick_tasks_dark_mode';
  static const String _prefsKeyStreak = 'quick_tasks_streak';
  static const String _prefsKeyLastStreakDate = 'quick_tasks_last_streak_date';

  List<Task> _tasks = [];
  final List<Category> _categories = [
    Category(id: 'all', name: 'جميع المهام', colorHex: 0xFF6366F1, icon: 'layers'),
    Category(id: 'work', name: 'العمل', colorHex: 0xFF2563EB, icon: 'briefcase'),
    Category(id: 'personal', name: 'شخصي', colorHex: 0xFFDB2777, icon: 'home'),
    Category(id: 'shopping', name: 'تسوق', colorHex: 0xFFD97706, icon: 'shopping_cart'),
    Category(id: 'study', name: 'دراسة', colorHex: 0xFF059669, icon: 'school'),
  ];

  bool _isDarkMode = false;
  int _streakCount = 0;
  String? _lastStreakDate;
  String _searchQuery = '';
  String _selectedCategory = 'all';
  String _statusFilter = 'all';
  List<Task>? _undoTasks;
  bool _isLoaded = false;

  bool get isDarkMode => _isDarkMode;
  bool get isLoaded => _isLoaded;
  List<Category> get categories => List.unmodifiable(_categories);
  int get streakCount => _streakCount;
  String? get lastStreakDate => _lastStreakDate;
  String get searchQuery => _searchQuery;
  String get selectedCategory => _selectedCategory;
  String get statusFilter => _statusFilter;
  bool get canUndo => _undoTasks != null && _undoTasks!.isNotEmpty;

  int get pendingCount => _tasks.where((t) => !t.isCompleted).length;
  int get completedCount => _tasks.where((t) => t.isCompleted).length;
  int get totalCount => _tasks.length;
  int get progressPercentage =>
      totalCount > 0 ? ((completedCount / totalCount) * 100).round() : 0;

  List<Task> get tasks {
    final todayStr = DateTime.now().toIso8601String().split('T')[0];

    final filtered = _tasks.where((task) {
      if (_searchQuery.trim().isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchesTitle = task.title.toLowerCase().contains(q);
        final matchesDesc = task.description?.toLowerCase().contains(q) ?? false;
        if (!matchesTitle && !matchesDesc) return false;
      }

      if (_selectedCategory != 'all' && task.categoryId != _selectedCategory) {
        return false;
      }

      if (_statusFilter == 'active' && task.isCompleted) return false;
      if (_statusFilter == 'completed' && !task.isCompleted) return false;
      if (_statusFilter == 'today' && task.dueDate != todayStr) return false;

      return true;
    }).toList();

    // Pinned tasks first, then by creation date
    filtered.sort((a, b) {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt.compareTo(a.createdAt);
    });

    return filtered;
  }

  /// Initial sample tasks displayed on first launch only
  static List<Task> _createDefaultTasks() {
    final now = DateTime.now();
    final todayStr = now.toIso8601String().split('T')[0];
    final tomorrowStr = now.add(const Duration(days: 1)).toIso8601String().split('T')[0];

    return [
      Task(
        id: '1',
        title: 'مراجعة خطة المشروع والتقرير النهائي 📊',
        description: 'التأكد من اكتمال كافة النقاط وإرسال المسودة للمراجعة',
        priority: PriorityLevel.high,
        categoryId: 'work',
        dueDate: todayStr,
        isPinned: true,
        subtasks: [
          Subtask(id: '1-1', title: 'مراجعة الميزانية المالية', isCompleted: true),
          Subtask(id: '1-2', title: 'تدقيق الأرقام النهائية', isCompleted: false),
        ],
      ),
      Task(
        id: '2',
        title: 'شراء مستلزمات البقالة الأسبوعية 🛒',
        description: 'خضار، فواكه، وحليب طازج مع قهوة مختصة',
        priority: PriorityLevel.medium,
        categoryId: 'shopping',
        dueDate: tomorrowStr,
        isPinned: false,
      ),
      Task(
        id: '3',
        title: 'ممارسة الرياضة الصباحية 🏃‍♂️',
        description: '30 دقيقة جري وتمارين لياقة بدنية',
        isCompleted: true,
        priority: PriorityLevel.low,
        categoryId: 'personal',
        dueDate: todayStr,
        isPinned: false,
      ),
    ];
  }

  /// Load persisted data safely from SharedPreferences
  Future<void> load() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isInitialized = prefs.getBool(_prefsKeyInitialized) ?? false;
      _isDarkMode = prefs.getBool(_prefsKeyDarkMode) ?? false;
      _streakCount = prefs.getInt(_prefsKeyStreak) ?? 0;
      _lastStreakDate = prefs.getString(_prefsKeyLastStreakDate);
      _validateStreak();

      if (prefs.containsKey(_prefsKeyCategories)) {
        final catStr = prefs.getString(_prefsKeyCategories);
        if (catStr != null && catStr.isNotEmpty) {
          try {
            final List decoded = jsonDecode(catStr);
            final loadedCategories = decoded
                .map((item) => Category.fromMap(Map<String, dynamic>.from(item)))
                .toList();
            if (loadedCategories.isNotEmpty) {
              _categories.clear();
              _categories.addAll(loadedCategories);
            }
          } catch (e) {
            debugPrint('Failed to parse categories: $e');
          }
        }
      }

      if (isInitialized) {
        if (prefs.containsKey(_prefsKeyTasks)) {
          final tasksStr = prefs.getString(_prefsKeyTasks);
          if (tasksStr != null && tasksStr.isNotEmpty) {
            try {
              final List decoded = jsonDecode(tasksStr);
              _tasks = decoded
                  .map((item) => Task.fromMap(Map<String, dynamic>.from(item)))
                  .toList();
            } catch (e) {
              debugPrint('Failed to parse tasks: $e');
              _tasks = [];
            }
          } else {
            _tasks = [];
          }
        } else {
          _tasks = [];
        }
      } else {
        // First run only: populate initial sample tasks and persist
        _tasks = _createDefaultTasks();
        _streakCount = 1;
        _lastStreakDate = DateTime.now().toIso8601String().split('T')[0];
        await _saveData();
      }
    } catch (e) {
      debugPrint('Error loading task provider: $e');
      if (_tasks.isEmpty) {
        _tasks = _createDefaultTasks();
      }
    } finally {
      _isLoaded = true;
      notifyListeners();
    }
  }

  /// Persists current state to SharedPreferences safely
  Future<void> _saveData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final tasksJson = jsonEncode(_tasks.map((t) => t.toMap()).toList());
      final categoriesJson = jsonEncode(_categories.map((c) => c.toMap()).toList());

      await prefs.setString(_prefsKeyTasks, tasksJson);
      await prefs.setString(_prefsKeyCategories, categoriesJson);
      await prefs.setBool(_prefsKeyDarkMode, _isDarkMode);
      await prefs.setInt(_prefsKeyStreak, _streakCount);
      if (_lastStreakDate != null) {
        await prefs.setString(_prefsKeyLastStreakDate, _lastStreakDate!);
      }
      await prefs.setBool(_prefsKeyInitialized, true);
    } catch (e) {
      debugPrint('Error saving tasks: $e');
    }
  }

  /// Validates streak continuity. If more than 1 day has passed, streak resets to 0.
  void _validateStreak() {
    if (_lastStreakDate == null) {
      _streakCount = 0;
      return;
    }
    final todayStr = DateTime.now().toIso8601String().split('T')[0];
    final yesterdayStr = DateTime.now()
        .subtract(const Duration(days: 1))
        .toIso8601String()
        .split('T')[0];

    if (_lastStreakDate != todayStr && _lastStreakDate != yesterdayStr) {
      _streakCount = 0;
    }
  }

  /// Increments streak when a task is marked completed for the first time today.
  void _recordTaskCompletionStreak() {
    final todayStr = DateTime.now().toIso8601String().split('T')[0];
    final yesterdayStr = DateTime.now()
        .subtract(const Duration(days: 1))
        .toIso8601String()
        .split('T')[0];

    if (_lastStreakDate == todayStr) {
      return; // Already counted for today
    }

    if (_lastStreakDate == yesterdayStr) {
      _streakCount += 1;
    } else {
      _streakCount = 1;
    }
    _lastStreakDate = todayStr;
  }

  void toggleTheme() {
    _isDarkMode = !_isDarkMode;
    _saveData();
    notifyListeners();
  }

  void setSearchQuery(String q) {
    _searchQuery = q;
    notifyListeners();
  }

  void setSelectedCategory(String catId) {
    _selectedCategory = catId;
    notifyListeners();
  }

  void setStatusFilter(String filter) {
    _statusFilter = filter;
    notifyListeners();
  }

  void togglePin(String id) {
    final index = _tasks.indexWhere((t) => t.id == id);
    if (index == -1) return;
    _tasks[index].isPinned = !_tasks[index].isPinned;
    _saveData();
    notifyListeners();
  }

  void addTask({
    required String title,
    String? description,
    PriorityLevel priority = PriorityLevel.medium,
    String categoryId = 'personal',
    String? dueDate,
    bool isPinned = false,
  }) {
    final trimmed = title.trim();
    if (trimmed.isEmpty) return;

    _tasks.insert(
      0,
      Task(
        id: DateTime.now().microsecondsSinceEpoch.toString(),
        title: trimmed,
        description: description?.trim().isEmpty == true ? null : description?.trim(),
        priority: priority,
        categoryId: categoryId,
        dueDate: dueDate,
        isPinned: isPinned,
      ),
    );
    _saveData();
    notifyListeners();
  }

  void editTask(
    String id, {
    String? title,
    String? description,
    PriorityLevel? priority,
    String? categoryId,
    String? dueDate,
    bool? isPinned,
  }) {
    final index = _tasks.indexWhere((t) => t.id == id);
    if (index == -1) return;
    final existing = _tasks[index];

    _tasks[index] = Task(
      id: existing.id,
      title: title != null && title.trim().isNotEmpty ? title.trim() : existing.title,
      description: description != null
          ? (description.trim().isEmpty ? null : description.trim())
          : existing.description,
      isCompleted: existing.isCompleted,
      priority: priority ?? existing.priority,
      categoryId: categoryId ?? existing.categoryId,
      dueDate: dueDate ?? existing.dueDate,
      isPinned: isPinned ?? existing.isPinned,
      completionQuality: existing.completionQuality,
      subtasks: existing.subtasks,
      createdAt: existing.createdAt,
    );
    _saveData();
    notifyListeners();
  }

  void addCategory(Category category) {
    if (_categories.any((c) => c.id == category.id)) return;
    _categories.add(category);
    _saveData();
    notifyListeners();
  }

  void toggleTask(String id) {
    final index = _tasks.indexWhere((t) => t.id == id);
    if (index == -1) return;

    final willBeCompleted = !_tasks[index].isCompleted;
    _tasks[index].isCompleted = willBeCompleted;

    if (willBeCompleted) {
      _recordTaskCompletionStreak();
    }
    _saveData();
    notifyListeners();
  }

  void deleteTask(String id) {
    final index = _tasks.indexWhere((t) => t.id == id);
    if (index == -1) return;

    _undoTasks = [_tasks[index]];
    _tasks.removeAt(index);
    _saveData();
    notifyListeners();
  }

  void clearCompleted() {
    final completed = _tasks.where((t) => t.isCompleted).toList();
    if (completed.isEmpty) return;

    _undoTasks = List.from(completed);
    _tasks.removeWhere((t) => t.isCompleted);
    _saveData();
    notifyListeners();
  }

  void undo() {
    if (_undoTasks == null || _undoTasks!.isEmpty) return;
    _tasks.insertAll(0, _undoTasks!);
    _undoTasks = null;
    _saveData();
    notifyListeners();
  }

  void toggleSubtask(String taskId, String subtaskId) {
    final taskIndex = _tasks.indexWhere((t) => t.id == taskId);
    if (taskIndex == -1) return;
    final subtaskIndex = _tasks[taskIndex].subtasks.indexWhere((s) => s.id == subtaskId);
    if (subtaskIndex == -1) return;

    _tasks[taskIndex].subtasks[subtaskIndex].isCompleted =
        !_tasks[taskIndex].subtasks[subtaskIndex].isCompleted;
    _saveData();
    notifyListeners();
  }

  void addSubtask(String taskId, String title) {
    if (title.trim().isEmpty) return;
    final taskIndex = _tasks.indexWhere((t) => t.id == taskId);
    if (taskIndex == -1) return;

    _tasks[taskIndex].subtasks.add(
      Subtask(
        id: DateTime.now().microsecondsSinceEpoch.toString(),
        title: title.trim(),
      ),
    );
    _saveData();
    notifyListeners();
  }

  void deleteSubtask(String taskId, String subtaskId) {
    final taskIndex = _tasks.indexWhere((t) => t.id == taskId);
    if (taskIndex == -1) return;

    _tasks[taskIndex].subtasks.removeWhere((s) => s.id == subtaskId);
    _saveData();
    notifyListeners();
  }
}
