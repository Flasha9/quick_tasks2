import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:quick_tasks/l10n/strings.dart';
import 'package:quick_tasks/models/task.dart';
import 'package:quick_tasks/providers/task_provider.dart';
import 'package:quick_tasks/screens/home_screen.dart';

Widget createTestApp(TaskProvider provider) {
  return ChangeNotifierProvider.value(
    value: provider,
    child: MaterialApp(
      locale: const Locale('ar'),
      supportedLocales: const [Locale('ar')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      home: const HomeScreen(),
    ),
  );
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  // Test 1: Adding a task via UI
  testWidgets('اختبار 1: إضافة مهمة جديدة والتحقق من ظهورها في القائمة', (WidgetTester tester) async {
    final provider = TaskProvider();
    await provider.load();

    await tester.pumpWidget(createTestApp(provider));
    await tester.pumpAndSettle();

    final textFieldFinder = find.byType(TextField).last;
    expect(textFieldFinder, findsOneWidget);

    const taskTitle = 'مهمة تجريبية للاختبار السريع';
    await tester.enterText(textFieldFinder, taskTitle);
    await tester.pump();

    final addButtonFinder = find.widgetWithIcon(FilledButton, Icons.add_rounded);
    await tester.tap(addButtonFinder);
    await tester.pumpAndSettle();

    expect(find.text(taskTitle), findsOneWidget);
    expect(provider.tasks.any((t) => t.title == taskTitle), isTrue);
  });

  // Test 2: Toggling a task checkbox
  testWidgets('اختبار 2: تشييك وإكمال مهمة والتحقق من تحديث حالتها', (WidgetTester tester) async {
    final provider = TaskProvider();
    await provider.load();

    provider.addTask(title: 'مهمة للتشييك');
    final createdTask = provider.tasks.firstWhere((t) => t.title == 'مهمة للتشييك');

    await tester.pumpWidget(createTestApp(provider));
    await tester.pumpAndSettle();

    expect(createdTask.isCompleted, isFalse);

    // Find checkbox corresponding to the task
    final checkboxFinder = find.byType(Checkbox).first;
    await tester.tap(checkboxFinder);
    await tester.pumpAndSettle();

    expect(createdTask.isCompleted, isTrue);
    expect(provider.completedCount, greaterThan(0));
  });

  // Test 3: Data persistence (Saving and Loading)
  testWidgets('اختبار 3: حفظ وتحميل المهام باستخدام SharedPreferences', (WidgetTester tester) async {
    // Initial instance saves data
    SharedPreferences.setMockInitialValues({});
    final provider1 = TaskProvider();
    await provider1.load();

    provider1.addTask(
      title: 'مهمة محفوظة في التخزين الدائم',
      description: 'وصف المهمة المحفوظة',
      priority: PriorityLevel.high,
      isPinned: true,
    );

    // Wait for async persistence
    await Future.delayed(const Duration(milliseconds: 50));

    // Secondary fresh instance loads persisted data
    final provider2 = TaskProvider();
    await provider2.load();

    expect(provider2.tasks.any((t) => t.title == 'مهمة محفوظة في التخزين الدائم'), isTrue);
    final loadedTask = provider2.tasks.firstWhere((t) => t.title == 'مهمة محفوظة في التخزين الدائم');
    expect(loadedTask.description, 'وصف المهمة المحفوظة');
    expect(loadedTask.priority, PriorityLevel.high);
    expect(loadedTask.isPinned, isTrue);
  });
}
