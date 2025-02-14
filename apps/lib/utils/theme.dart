import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: Color(0xFF1E40AF),
      textTheme: TextTheme(
        bodyLarge: TextStyle(color: Color(0xFF333333)),
        bodyMedium: TextStyle(color: Color(0xFF333333)),
      ),
      fontFamily: 'Roboto',
      colorScheme: ColorScheme.fromSwatch()
          .copyWith(secondary: Color(0xFF3B82F6))
          .copyWith(background: Color(0xFFF4F4F4)),
    );
  }
}
