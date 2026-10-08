enum PriorityLevel { low, medium, high }
enum CompletionQuality { perfect, good, half }

class Subtask {
  final String id;
  final String title;
  bool isCompleted;

  Subtask({
    required this.id,
    required this.title,
    this.isCompleted = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'isCompleted': isCompleted,
    };
  }

  factory Subtask.fromMap(Map<String, dynamic> map) {
    return Subtask(
      id: map['id'] ?? '',
      title: map['title'] ?? '',
      isCompleted: map['isCompleted'] ?? false,
    );
  }
}

class Category {
  final String id;
  final String name;
  final int colorHex;
  final String icon;

  Category({
    required this.id,
    required this.name,
    required this.colorHex,
    required this.icon,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'colorHex': colorHex,
      'icon': icon,
    };
  }

  factory Category.fromMap(Map<String, dynamic> map) {
    int parsedColor = 0xFF6366F1;
    if (map['colorHex'] is int) {
      parsedColor = map['colorHex'];
    } else if (map['colorHex'] != null) {
      parsedColor = int.tryParse(map['colorHex'].toString()) ?? 0xFF6366F1;
    }

    return Category(
      id: map['id']?.toString() ?? '',
      name: map['name']?.toString() ?? '',
      colorHex: parsedColor,
      icon: map['icon']?.toString() ?? 'layers',
    );
  }
}

class Task {
  final String id;
  String title;
  String? description;
  bool isCompleted;
  PriorityLevel priority;
  String categoryId;
  String? dueDate;
  bool isPinned;
  CompletionQuality? completionQuality;
  List<Subtask> subtasks;
  DateTime createdAt;

  Task({
    required this.id,
    required this.title,
    this.description,
    this.isCompleted = false,
    this.priority = PriorityLevel.medium,
    this.categoryId = 'personal',
    this.dueDate,
    this.isPinned = false,
    this.completionQuality,
    List<Subtask>? subtasks,
    DateTime? createdAt,
  })  : subtasks = subtasks ?? [],
        createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'isCompleted': isCompleted,
      'priority': priority.name,
      'categoryId': categoryId,
      'dueDate': dueDate,
      'isPinned': isPinned,
      'completionQuality': completionQuality?.name,
      'subtasks': subtasks.map((s) => s.toMap()).toList(),
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory Task.fromMap(Map<String, dynamic> map) {
    return Task(
      id: map['id']?.toString() ?? '',
      title: map['title']?.toString() ?? '',
      description: map['description']?.toString(),
      isCompleted: map['isCompleted'] == true,
      priority: PriorityLevel.values.firstWhere(
        (p) => p.name == map['priority'],
        orElse: () => PriorityLevel.medium,
      ),
      categoryId: map['categoryId']?.toString() ?? 'personal',
      dueDate: map['dueDate']?.toString(),
      isPinned: map['isPinned'] == true,
      completionQuality: map['completionQuality'] != null
          ? CompletionQuality.values.firstWhere(
              (q) => q.name == map['completionQuality'],
              orElse: () => CompletionQuality.perfect,
            )
          : null,
      subtasks: (map['subtasks'] as List<dynamic>?)
              ?.map((s) => Subtask.fromMap(Map<String, dynamic>.from(s)))
              .toList() ??
          [],
      createdAt: map['createdAt'] != null
          ? (DateTime.tryParse(map['createdAt'].toString()) ?? DateTime.now())
          : DateTime.now(),
    );
  }
}
