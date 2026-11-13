// This is a basic Flutter widget test.
import 'package:flutter_test/flutter_test.dart';

import 'package:nagpur_realty/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const NagpurRealtyApp());
    expect(find.byType(NagpurRealtyApp), findsOneWidget);
    // Drain pending timers from network initialization
    await tester.pump(const Duration(seconds: 15));
  });
}

