import 'package:flutter/material.dart';

class AppAnimations {
  static const Duration defaultDuration = Duration(milliseconds: 300);
  static const Duration staggeredDuration = Duration(milliseconds: 100);
  static const Duration pageTransitionDuration = Duration(milliseconds: 300);

  static final Curve defaultCurve = Curves.easeOutCubic;
  static final Curve bouncyCurve = Curves.elasticOut;

  static SlideTransition pageTransition(
    Animation<double> animation,
    Widget child,
  ) {
    return SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(0, 0.1),
        end: Offset.zero,
      ).animate(
        CurvedAnimation(
          parent: animation,
          curve: defaultCurve,
        ),
      ),
      child: FadeTransition(
        opacity: animation,
        child: child,
      ),
    );
  }

  static Animation<double> staggeredAnimation(
    AnimationController controller,
    int index,
  ) {
    return Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: controller,
        curve: Interval(
          (index * 0.1).clamp(0.0, 1.0),
          ((index + 1) * 0.1).clamp(0.0, 1.0),
          curve: defaultCurve,
        ),
      ),
    );
  }

  static Widget cardHoverEffect(Widget child) {
    return TweenAnimationBuilder<double>(
      duration: defaultDuration,
      tween: Tween<double>(begin: 1, end: 1),
      builder: (context, value, child) {
        return Transform.scale(
          scale: value,
          child: child,
        );
      },
      child: MouseRegion(
        onEnter: (_) => {},
        onExit: (_) => {},
        child: child,
      ),
    );
  }

  static Widget fadeInUp(Widget child, {Duration? duration}) {
    return TweenAnimationBuilder<double>(
      duration: duration ?? defaultDuration,
      tween: Tween<double>(begin: 0, end: 1),
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 20 * (1 - value)),
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: child,
    );
  }
}
