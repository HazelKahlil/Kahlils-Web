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

## 6. Theme System & Visual Polish (Dark/Light Mode)

### **Custom Iconography & Color Precision**
*   **Avoid Generic Filters**:
    *   *Problem*: Using `filter: invert(1)` globally for Dark Mode is a quick hack but fails for premium designs. It distorts specific brand colors (e.g., turning a custom `#CCCCCC` gray into a muddy dark color).
    *   *Solution*: Create dedicated assets for both modes (e.g., `icon_theme_light.png` and `icon_theme_dark.png`). Use explicit JS logic to swap the `src` attribute.
    *   *CSS Fix*: When using global filters for other elements, *always* exclude your custom theme icons: `img:not(#theme-icon) { filter: invert(1); }`.

### **Micro-Interactions & Animation**
*   **The "Delight" Factor**:
    *   *Experience*: A simple color switch feels functional but mechanical.
    *   *Feature*: Adding a **360° spin animation** (`transform: rotate(360deg)`) to the toggle button masks the transition and adds a playful, tactile feel to the interaction.
    *   *Smoothness*: Apply `transition: background-color 0.6s ease, color 0.6s ease` to the `body` and `header`. This turns a jarring "flash" into a smooth, premium fade effect.

### **Asset Pipeline (Code-Driven Design)**
*   **Python for Design Assets**:
    *   *Technique*: Instead of manually editing icons in design software, use Python (`Pillow`) scripts to process user uploads.
    *   *Capabilities*: Automated center-cropping, circular masking (to remove background grids/edges), thresholding (extracting shapes), and precise recoloring (e.g., enforcing `#1F1F1F` vs `#CCCCCC`).
    *   *Benefit*: Allows for rapid iteration on exact hex values and sizes without re-doing manual work.
*   **Cache Busting**:
    *   *Rule*: When programmatically regenerating assets with the same filename, browsers *will* stubbornly cache the old version.
    *   *Fix*: Always append a dynamic timestamp to the image source in JS: `img.src = "icon.png?v=" + new Date().getTime()`.

### **Mobile Optical Alignment**
*   **Visual vs Mathematical Center**:
    *   *Observation*: Mathematical centering (50%) often looks "off" when mixing text (which has baselines/descenders) with geometric icons.
    *   *Adjustment*: Mobile layouts often require manual pixel-tweaking (e.g., shifting icons up by 5px) to achieve *visual* alignment with navigation text. Trust the eye over the grid.
### **Theme Stability & Performance**
*   **Preventing "White Flash" (FOUT/FOIT for Themes)**:
    *   *Problem*: Loading theme preferences via `DOMContentLoaded` or external scripts is too slow; the browser renders the default (light) background for the first frame before switching.
    *   *Solution*: Inject a **blocking script** directly in the `<head>` of every HTML file *before* any CSS or Body content. This script reads `localStorage` and applies the `data-theme` attribute to `<html>` immediately.
    *   *Effect*: Zero flash. The page is born in the correct color.
*   **Icon Swap Stability**:
    *   *Issue*: Dynamic icon swaps (e.g., Light sun to Dark moon) cause layout shifts and flickering if the new image isn't in memory.
    *   *Container Fix*: Lock the dimensions of the icon container in CSS (`width/height: 24px`) to prevent surrounding elements from "jerking" during the swap.
    *   *JS Fix*: Use `new Image().src = ...` to **preload** the alternative theme icon as soon as the page loads. Switching then becomes instantaneous.
