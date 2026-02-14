---
description: Kahlil Portfolio 项目开发规范和经验总结（持续更新）
---

# 🧠 Kahlil Portfolio — 开发规范与经验手册

> 最后更新: 2026-02-14
> 目的: 让每次工作都能从之前积累的经验开始，而不是重新踩坑

---

## 一、项目架构概览

### 技术栈
- **前端**: 原生 HTML/CSS/JS，无框架
- **SPA 路由**: Barba.js（页面间无刷新过渡）
- **后端**: Python `http.server` (server.py，端口 5002)
- **数据**: `data.json`（单 JSON 文件驱动全站内容）
- **CMS**: `admin.html`（单文件 124KB，含内嵌 CSS/JS）
- **图片**: 全部 WebP 格式，存放在 `images/` 目录

### 文件结构
```
├── index.html          # 首页（Hero Gallery）
├── portfolios/         # 作品列表页
├── project/            # 项目详情页（?id=xxx）
├── info/               # 关于/简介页
├── contact/            # 联系页
├── 404.html            # 404 页面（Void 主题）
├── admin.html          # CMS 管理面板
├── style.css           # 主样式表（~2200 行）
├── script.js           # 主脚本（~1080 行）
├── data.json           # 全站数据源
├── server.py           # 本地开发服务器 + API
├── fonts/              # 自托管字体文件
└── images/             # WebP 图片资源
```

---

## 二、字体系统 ⚠️ 重要经验

### 原则: 绝不依赖 Google Fonts CDN
- **原因**: `display=swap` 会导致 FOUT（Flash of Unstyled Text），用户会看到字体闪烁
- **解决方案**: 自托管 woff2 字体文件到 `/fonts/` 目录
- **@font-face 必须用 `font-display: block`**，不要用 `swap`

### macOS Futura 字体限制 ⚠️
- macOS 自带的 Futura 只有 **Medium (500)** 和 **Bold (700)**
- **没有 Futura Light！** 设置 `font-weight: 300` 无效，浏览器会 fallback 到 Medium
- 解决方案: 用 **Jost** 字体替代细体（`/fonts/jost-300.woff2`）
- Jost 是 Futura 的最佳开源替代品，视觉上几乎一致

### 当前字体配置
```css
/* 左列标签（粗）*/
.contact-label {
    font-family: "Futura", "Trebuchet MS", Arial, sans-serif;
    font-weight: 500;
}

/* 右列值（细）*/
.contact-link {
    font-family: 'Jost', "Futura", "Trebuchet MS", Arial, sans-serif;
    font-weight: 300;
}
```

---

## 三、版本管理规范

### CSS/JS 缓存控制
- 所有 HTML 文件中的 `style.css` 和 `script.js` 引用都带版本号: `?v=X.X`
- **每次修改 CSS 或 JS 后，必须同步更新所有 6 个 HTML 文件的版本号**
- 涉及文件: `index.html`, `portfolios/index.html`, `project/index.html`, `info/index.html`, `contact/index.html`, `404.html`
- 当前版本: `v=9.6`

### Git 推送
- Commit message 格式: `vX.X: 简短描述`
- 推送命令: `git add -A && git commit -m "消息" && git push`
- server.py 内置了 `/api/publish` 端点，也可以从 Admin 面板一键推送

---

## 四、音效系统规范

### 规则
1. **只有可点击的元素才有音效** — 用 `a.contact-link` 而非 `.contact-link`
2. **移动端完全关闭音效** — 通过 `isMobileDevice()` 检测
3. 音效文件位于 `assets/sounds/`
4. `soundSelectors` 定义在 `script.js` 顶部

### CSS 选择器对应行为的原则
- 需要区分"可交互"和"纯展示"元素时，用标签限定: `a.class` vs `span.class`
- 不要用泛选择器 `.class` 匹配所有同名元素

---

## 五、data.json 数据结构

### 活跃字段（正在使用）
```json
{
  "site": {
    "title", "description", "bio", "copyright",
    "contact_items": [...],        // 联系信息（替代旧的 studio/email/instagram）
    "void_messages": [...],        // 404 页面随机诗意消息
    "header_social_instagram",     // Header 社交链接
    "header_social_link",          
    "header_social_email",         
    "home_images": [...],          // 首页 Hero 图片
    "contact_random_mode": true    // 联系页图片随机模式
  },
  "projects": [...]
}
```

### 已废弃字段（已清理，勿再添加）
- ~~studio~~, ~~commercial_email~~, ~~contact_email~~, ~~instagram~~ → 被 `contact_items` 取代
- ~~contact_fixed_images~~, ~~bio_layout~~, ~~contact_info_layout~~, ~~contact_gallery_layout~~ → 空值，Admin 保存时会自动重建

### `_collapsed` 字段
- 仅 Admin UI 状态，不影响前端
- 留着不碍事，但本质上不应该持久化

---

## 六、Bug 修复经验法则

### 修复前必做
1. **先用 grep 检查 Bug 是否已修复** — 多次会话后，很多 Bug 可能已在之前修好
2. **查看 audit 报告中的行号可能已偏移** — 代码在不断修改，行号会变
3. **修改 CSS/JS 后记得刷 cache** — 更新版本号

### 常见陷阱
- **Python `cgi` 模块**: Python 3.13+ 完全删除，用自定义解析替代
- **Barba.js `overflow: hidden`**: 转场后必须在 `hooks.after` 中清除
- **`innerHTML +=` 在循环中**: 性能灾难，先拼字符串再一次赋值
- **`IntersectionObserver` + `setTimeout`**: 不要重复触发动画，选一即可

### 安全原则
- 文件上传: 白名单验证扩展名 + 限制文件大小
- 用户数据渲染: 用 `escapeHTML()` 或 `textContent` 防 XSS
- Git 操作: 设置 `GIT_TERMINAL_PROMPT=0` + `timeout` 防挂起

---

## 七、CSS 维护注意事项

### 已知的结构性问题（长期优化）
- `@media (max-width: 768px)` 出现 4 次，分散在不同位置
- 修改移动端样式时，必须搜索所有 `768px` 媒体查询确保不冲突
- 建议未来合并同类媒体查询

### 页面特定样式的位置
- 联系页: 搜索 `.contact-label`, `.contact-link`, `.contact-row`
- 首页 Hero: 搜索 `.hero-gallery`, `.hero-img`
- 作品列表: 搜索 `.archive-grid`, `.project-card`
- 404 页面: 搜索 `.void-container`, `.void-text`

---

## 八、启动开发环境

```bash
# 启动本地服务器（端口 5002）
cd /Users/kahlilhazel/Documents/700-AI tools/710-AI-Kahlils/AI-分身/共享工作区/项目文档/Kahlil_Portfolio
python3 server.py

# 访问
# 前端: http://localhost:5002
# 管理: http://localhost:5002/admin.html
```

---

## 九、协作原则（人机协作最佳实践）

1. **修改前先审查现状** — 不要假设 Bug 仍存在，先 grep 确认
2. **小步快跑** — 每个修复独立验证，不要一次改太多
3. **版本号是护城河** — 每次修改后统一更新，避免缓存问题
4. **系统字体 > CDN 字体** — 性能和可靠性优先
5. **移动端 ≠ 桌面端** — 音效、动画等行为要分开处理
6. **数据结构演进要清理残留** — 新字段替代旧字段后，清理旧字段避免混淆
