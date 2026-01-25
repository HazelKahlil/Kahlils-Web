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
