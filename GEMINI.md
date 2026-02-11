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

## 🔄 2026-02-09 Session Retrospective (Admin Navigation & Physics)

### 1. The "Single-Scroll" Admin Principle (管理后台单页滚动原则)
- **Problem**: Traditional tab-based UIs can feel "disconnected" for content-heavy admin panels where users want a holistic view.
- **Rule**: **Content-First Scroll**. For configuration-heavy panels, use a **Single Page Scroll** layout with a fixed sidebar anchor. This provides better context and faster navigation than switching tabs.
- **Implementation**: Instead of `display: none` for tabs, force `display: block` and use `scrollIntoView({ behavior: 'smooth' })` for navigation.

### 2. Naming Parity (命名完全对齐原则)
- **Problem**: Discrepancies between Admin labels ("Collections") and Frontend labels ("Portfolios") cause cognitive friction.
- **Rule**: **Admin Terms == Public Terms**. Do not invent developer-centric names. If the public sees "Portfolios", the admin must say "Portfolios".
- **i18n Pitfall**: When renaming, check **both** HTML static text AND JavaScript i18n dictionaries. JS often overwrites HTML on load.

### 3. "Default-Collapsed" Complexity (默认折叠原则)
- **Problem**: Advanced settings (like Layout Controls) clutter the UI and distract from primary content entry.
- **Rule**: **Hide Complexity**. Wrap low-frequency controls in **`<details>`/`<summary>`** tags. This native HTML element is robust, requires no JS, and keeps the UI clean by default.

### 4. Natural Animation Physics (自然运动物理原则)
- **Problem**: Uniform movement speed feels artificial and robotic.
- **Rule**: **Variance Creates Depth**.
  - **Size-Speed Correlation**: Assign different speeds based on object size (e.g., small flakes = fast/light, large flakes = slow/heavy).
  - **Layering**: Mixing fast and slow elements creates a parallax effect, enhancing realism.

## 🔄 2026-02-10 Session Retrospective (Admin UX & Performance)

### 1. Interaction Physics Principle (物理交互不造轮子)
- **Problem**: Native HTML5 Drag & Drop is fragile, index-unaware, and lacks touch support, making list reordering a nightmare.
- **Rule**: **Outsource Physics**. Use established micro-libraries (like `SortableJS`) for physical interactions like drag-sort, inertia scroll, or gestures. They handle edge cases (touch, animation, ghosting) better than custom code.
- **Implementation**: Replaced 100+ lines of buggy native D&D code with 20 lines of SortableJS config. Immediate win on stability and mobile support.

### 2. Instant Digital Hygiene (入口处极致瘦身)
- **Problem**: Server kept "backup" copies of uploaded images, inflating the repo to 1.5GB with unused raw JPGs. Git operations became painfully slow.
- **Rule**: **Aggressive Optimization at Ingest**. The upload handler must implement a `Raw -> WebP -> Delete Original` pipeline. Never use the repo for backups; use external storage if needed.
- **Action**: Cleaned 1.1GB of redundant images. Updated server to auto-convert and auto-delete originals.

### 3. Live State Anchoring (实时状态锚定)
- **Problem**: Deleting an item after reordering deleted the wrong item because the event listener held a stale closure index.
- **Rule**: **Trust Live DOM Dataset**. For mutable lists, never rely on closure variables created at render time. Always read `element.dataset.index` at the moment of interaction to get the current truth.

### 4. Backend Transparency (后端透明反馈)
- **Problem**: Git publish failed silently or with generic errors because `stderr` was swallowed. Front-end users had no clue it was a permission issue.
- **Rule**: **Echo the Crash**. When executing shell commands (Git, FFmpeg), capture `stderr` and return it raw to the frontend. A specific error ("Permission denied") is actionable; a generic error ("Failed") is not.

