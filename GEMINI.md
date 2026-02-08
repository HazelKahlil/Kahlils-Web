# AI Collaboration Memory & Engineering Principles

This file serves as a persistent "memory" of shared principles and retrospective lessons from our collaboration.

## Universal Engineering Roles & Rules

### 1. Diagnosis First (诊断前置)
- **Do not guess code changes.** If a UI or logic issue persists, use browser tools to fetch **Computed Styles** and **Bounding Boxes** first.
- Debugging must be data-driven to avoid "looping" on incorrect assumptions.

### 2. Professional Advisory (顺从但不盲从)
- Act as a Senior Engineer, not a "yes-man."
- If a request involves changing core system files (e.g., `index.html`, `.env`), provide a **Risk Warning** before execution.

### 3. Integrated Cleanup (关联清理)
- Code changes have side effects. If removing a dynamic feature (like an animation), always check if the static state (like `opacity: 0`) needs to be reset.

### 4. Extreme Verification (极致验证)
- After critical pushes, perform a **Cache-Cleared Reload** and check for **Browser Console Errors**.

### 5. Root Cause Analysis (全系统思维)
- Look "upstream" to parent containers and global state management before applying localized CSS/JS band-aids.

## Project Specific Notes (Hazel Kahlil Portfolio)
- **Homepage Requirement**: Must always be named `index.html` for server compatibility.
- **Hero Gallery Layout**: Relies on `hero-container` having a calculated height (not 0); otherwise, percentage widths/tops will collapse.

## 🔄 2026-02-08 Session Retrospective (Admin UI Refactor)

### 1. Robust Link Handling Principle (链接健壮性原则)
- **Problem**: Users often input URLs without protocols (e.g., `xiaohongshu.com`), causing frontend routing crashes or page refreshes because browsers treat them as relative paths.
- **Rule**: **Frontend Must Auto-Fix Protocols**. Always implement logic: `if (!url.startsWith('http')) url = 'https://' + url;`.
- **UI Logic**: **Hide Empty Links**. If a CMS field is empty, the corresponding UI icon/button must be `display: none`. Do not show broken links or empty placeholders that confuse users.

### 2. Design System Consistency (设计系统一致性)
- **Context**: "Swiss Editorial" style relies on high contrast (Black/White), fine lines, and typography.
- **Rule**: **No Dark Cards in Light Themes**. When refactoring to a minimal light theme, aggressively remove all legacy "Dark Mode" containers (e.g., dark gray cards). Use **Border-Only** styling instead to maintain the "Airy" feel.
- **Visual Feedback**: **Drag & Drop needs Visuality**. Interaction is invisible without feedback. Always add `.dragging` (opacity, scale) and `.drag-over` (border highlight) states to confirm user actions.

### 3. Lightweight i18n Strategy (轻量级国际化)
- **Pattern**: For Admin panels or simple apps, avoid heavy i18n libraries.
- **Approach**: 
  1. Define a dictionary: `const i18n = { en: {...}, zh: {...} }`.
  2. Create a simple `t(key)` function.
  3. Persist preference in `localStorage`.
  4. Apply translations immediately on load to prevent content flashing.
