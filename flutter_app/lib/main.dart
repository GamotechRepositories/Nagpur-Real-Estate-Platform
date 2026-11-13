import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/property_provider.dart';
import 'screens/home/home_screen.dart';
import 'screens/properties/property_list_screen.dart';
import 'screens/projects/projects_list_screen.dart';
import 'screens/agents/agents_list_screen.dart';
import 'screens/localities/localities_list_screen.dart';
import 'screens/tools/emi_calculator_screen.dart';
import 'screens/tools/area_converter_screen.dart';
import 'screens/tools/loan_enquiry_screen.dart';
import 'screens/blog/blog_list_screen.dart';
import 'screens/account/my_properties_screen.dart';
import 'screens/account/saved_properties_screen.dart';
import 'screens/post_property/post_property_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set system UI overlay style matching primary green header
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      statusBarBrightness: Brightness.dark,
    ),
  );

  runApp(const NagpurRealtyApp());
}

class NagpurRealtyApp extends StatelessWidget {
  const NagpurRealtyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => PropertyProvider()),
      ],
      child: MaterialApp(
        title: 'Nagpur Realty',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const HomeScreen(),
        routes: {
          '/home': (_) => const HomeScreen(),
          '/properties': (_) => const PropertyListScreen(),
          '/projects': (_) => const ProjectsListScreen(),
          '/agents': (_) => const AgentsListScreen(),
          '/localities': (_) => const LocalitiesListScreen(),
          '/emi-calculator': (_) => const EmiCalculatorScreen(),
          '/area-converter': (_) => const AreaConverterScreen(),
          '/loan-enquiry': (_) => const LoanEnquiryScreen(),
          '/blog': (_) => const BlogListScreen(),
          '/post-property': (_) => const PostPropertyScreen(),
          '/my-properties': (_) => const MyPropertiesScreen(),
          '/saved': (_) => const SavedPropertiesScreen(),
        },
      ),
    );
  }
}
