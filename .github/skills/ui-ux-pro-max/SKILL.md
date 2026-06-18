---
name: ui-ux-pro-max
description: 'Comprehensive design guide for web and mobile applications. Use when: designing, creating, implementing, or reviewing UI/UX; dark mode/light mode design; choosing typography, color palettes, spacing, and styles; adding charts; or following React performance guidelines.'
argument-hint: '[query]'
user-invocable: true
---

# UI/UX Pro Max Agent Skill

A comprehensive design guide and helper for creating professional, beautiful, and accessible web and mobile user interfaces.

## When to Use
- Designing new pages, views, or screens
- Choosing theme colors, layout spacing, or typography
- Adding data visualizations and charts
- Improving user experience, accessibility (a11y), and performance

## Script & Tools
You can search the database directly:
- **Design System Search**: `python ./scripts/search.py "<product_type> <industry> <keywords>" --design-system`
- **Specific Domain Search**: `python ./scripts/search.py "<keyword>" --domain <style|typography|color|landing|chart|ux|react|web>`
- **Technology Stack Guidelines**: `python ./scripts/search.py "<keyword>" --stack react`

## Procedures
1. Run the Python design system search to obtain a recommended pattern, palette, and typography.
2. If persistent guidelines are desired, use the `--persist` flag.
3. Apply those styles to `App.tsx` and `styles.css`.
4. Run a detailed UX search for animations or loading components to make the UI feel premium.