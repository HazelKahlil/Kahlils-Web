# Project Retrospective & Design Principles (Ueda Portfolio)

This document serves as a "memory bank" for the project, capturing key lessons and reusable patterns established during the development of the Hazel Kahlil portfolio.

## 1. Frontend Architecture & Robustness

### **Asset Handling**
*   **Filename Safety**: User-uploaded files often contain spaces or special characters.
    *   *Rule*: Always apply `encodeURI()` to image source paths in JavaScript before processing.
    *   *Why*: Directly using paths like `images/Photo 1.jpg` can lead to broken images or 404s depending on the browser/server URL handling.
*   **Cache Busting**:
    *   *Rule*: Append a timestamp query parameter (e.g., `?t=Date.now()`) when fetching local JSON configuration or critical assets during development.
    *   *Why*: Browsers aggressively cache local JSON files, leading to "I updated the Admin panel but the site didn't change" confusion.

### **Text Rendering**
*   **Respecting Backend Formatting**:
    *   *Rule*: For "Bio" or "Info" sections where users input text with paragraphs, apply `white-space: pre-wrap;` to the container.
    *   *Why*: HTML collapses whitespace by default. Users expect the "Enter" key they pressed in the backend to result in a visual line break.

## 2. User Experience & Asset Protection

### **Image Copyright Protection**
*   *Rule*: **Do not** use `pointer-events: none` on images if you want hover effects (scaling, filters) to work.
*   *Solution*:
    *   Use CSS `user-select: none;` (prevent highlighting).
    *   Use JS `contextmenu` listener (`e.preventDefault()`) to block right-click.
    *   Use JS `dragstart` listener to block dragging.
*   *Result*: Images are protected from casual download, but users can still enjoy interactive animations.

## 3. Visual Design System

### **Layout Alignment**
*   **Grid Consistency**:
    *   *Rule*: Align primary text content (Bio, Contact) with the Header Brand/Logo.
    *   *Measurement*: If layout is fixed/absolute, use explicit padding (e.g., `padding-left: 60px`) to match the Header's padding.
*   **Reading Measures**:
    *   *Rule*: Never let text span the full width of a desktop monitor. Limit `max-width` (e.g., `600px`) or use percentage widths (`60%`) to create comfortable reading columns.
    *   *Style*: Left-aligned layouts often look more "editorial" and organized than centered layouts for informational text.

### **Mobile Responsiveness**
*   **Resetting Constraints**:
    *   *Rule*: Custom desktop layouts (like rigid left columns) must be reset on mobile.
    *   *Action*: In media queries, set `width: 100%`, `padding-left: 0`, and `margin: 0` to ensure content utilizes the full small screen space.

## 4. Deployment & Infrastructure
*   **Simple Server Fallback**: Always have a simple `server.py` and `script.js` fallback for local previews to ensure dynamic fetches (`data.json`) work despite protocol restrictions (`file://` CORS issues).

## 5. Workflow Optimization & Admin UX
*   **Unified Control Principle**:
    *   *Experience*: When managing large sets of assets (like a project gallery), individual controls for every single item create tedious friction.
    *   *Selection*: Switch to **Unified Layout Control** (one setting applies to all items in a set) unless distinct irregularity is the specific design goal.
*   **Contextual Default Values**:
    *   *Problem*: Users often hesitate to adjust "Layout Parameters" (Top/Left/Width) because they don't know the baseline.
    *   *Solution*: Always display the current CSS default value as a **Placeholder** (e.g., `Def: 300px`) in the input field. This provides a "safe anchor" for experimentation.
*   **Visual Density**:
    *   *Observation*: Admin panels should maximize information density. Large "Preview Thumbnails" (100px+) look good but require excessive scrolling.
    *   *Adjustment*: Compact thumbnails (~60px) are superior for "Task-Oriented" interfaces (sorting, deleting, overviewing).
*   **Logic Visualization**:
    *   *Feature*: For complex logic like "Random vs Fixed Images", the Admin UI should make the override relationship clear (e.g., explicit "Upload Fixed to Override Random" section), rather than hiding the logic in documentation.
