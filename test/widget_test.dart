import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:quick_tasks/main.dart';
import 'package:quick_tasks/providers/task_provider.dart';

void main() {
  testWidgets('App renders home screen with empty state', (WidgetTester tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => TaskProvider(),
        child: const QuickTasksApp(),
      ),
    );

    // The app bar title should be visible.
    expect(find.text('QuickTasks'), findsOneWidget);

    // Empty state message should be shown when no tasks exist.
    expect(find.text('No tasks yet'), findsOneWidget);

    // The add task input hint should be present.
    expect(find.text('Add a new task…'), findsOneWidget);
  });
}
