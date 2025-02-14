import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: Color(0xFF1E40AF),
      accentColor: Color(0xFF3B82F6),
      backgroundColor: Color(0xFFF4F4F4),
      textTheme: TextTheme(
        bodyText1: TextStyle(color: Color(0xFF333333)),
        bodyText2: TextStyle(color: Color(0xFF333333)),
      ),
      fontFamily: 'Roboto',
    );
  }
}
