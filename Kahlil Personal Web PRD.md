# Kahlil's Personal Website - 产品需求文档 (PRD)

---

## 📋 文档信息

| 项目 | 详情 |
|------|-----|
| **产品名称** | Kahlil's Personal Website (Hazel Kahlil Portfolio) |
| **版本** | v4.0 |
| **文档创建日期** | 2026-01-23 |
| **最后更新** | 2026-01-23 |
| **负责人** | Hazel Kahlil |
| **技术协作** | Antigravity AI |

---

## 🎯 1. 产品概述

### 1.1 产品定位

一个**极简主义摄影师作品集网站**，旨在展示 Hazel Kahlil 的摄影作品。网站设计遵循日本侘寂美学（Wabi-sabi），强调留白、细节与呼吸感，为观众提供沉浸式的视觉体验。

### 1.2 核心理念

- **极简主义 (Minimalism)**: 线条细腻（1px）、透明度分层（0.6/1.0）
- **呼吸感 (Breathing Space)**: 布局宁可留白也不拥挤
- **Ueda Pure 设计语言**: 借鉴日本摄影师上田义彦（Yoshihiko Ueda）的网站风格
- **内容优先**: 让摄影作品成为绝对主角

### 1.3 目标用户

| 用户类型 | 描述 |
|----------|------|
| **艺术爱好者** | 寻求高质量摄影作品欣赏的观众 |
| **潜在客户** | 寻找摄影师合作的品牌/机构 |
| **同行摄影师** | 关注作品风格与技术的同业 |
| **杂志/画廊** | 寻找作品发布或展览的媒体方 |

---

## 🏗️ 2. 产品架构

### 2.1 技术栈

```
┌─────────────────────────────────────────────────────┐
│                   前端技术栈                         │
├─────────────────────────────────────────────────────┤
│  HTML5 + CSS3 + Vanilla JavaScript                  │
│  ├── 纯静态页面，无框架依赖                          │
│  ├── CSS 变量系统 (Custom Properties)               │
│  ├── 响应式设计 (Mobile First)                       │
│  └── 渐进式增强                                      │
├─────────────────────────────────────────────────────┤
│                   设计系统                           │
├─────────────────────────────────────────────────────┤
│  ├── 字体: Papyrus (主), Futura (标题)              │
│  ├── 配色: #ffffff (背景), #1a1a1a (文字)           │
│  └── 间距: 20px 基础单位                             │
├─────────────────────────────────────────────────────┤
│                   部署架构                           │
├─────────────────────────────────────────────────────┤
│  ├── 托管: Vercel                                    │
│  ├── 版本控制: Git (GitHub)                          │
│  └── 域名: 自定义域名                                │
└─────────────────────────────────────────────────────┘
```

### 2.2 文件结构

```
Kahlils Personal Website/
├── index.html          # 首页 (Hero Gallery)
├── archive.html        # 作品集列表页 (Portfolios)
├── project.html        # 项目详情页 (Gallery Slider)
├── biography.html      # 关于页面 (Info)
├── contact.html        # 联系页面
├── 404.html           # 404 错误页
├── admin.html         # 后台管理系统 (CMS)
│
├── style.css          # 全局样式表
├── script.js          # 全局交互脚本
├── data.json          # 数据存储 (项目/站点配置)
│
├── images/            # 图片资源目录
│   ├── *.jpg          # 摄影作品
│   └── icon_*.png     # 图标资源
│
├── assets/            # 静态资源
│   └── sounds/        # 音效文件
│       ├── text_custom.mp3    # 文字点击音
│       └── image_custom.mp3   # 图片悬停音
│
└── server.py          # 本地开发服务器 (Python)
```

---

## 📄 3. 页面详细设计

### 3.1 首页 (index.html)

#### 功能描述
首页采用**不规则画廊布局 (Irregular Gallery)**，展示5张精选作品，营造艺术感第一印象。

#### UI 规格

| 元素 | 规格 |
|------|------|
| **Hero 图片数量** | 5张 |
| **布局方式** | 绝对定位 + 自定义位置/尺寸 |
| **图片效果** | 默认灰度 → 悬停彩色 |
| **悬停动效** | `scale(1.02)` + 阴影增强 |
| **页面行为** | 锁定滚动 (`overflow: hidden`) |

#### 图片布局配置 (默认值)

| Slot | Top | Left | Width | 比例 |
|------|-----|------|-------|------|
| 1 | 2% | 0% | 35% | 4:3 |
| 2 | 25% | 38% | 22% | 3:4 |
| 3 | 6% | Right 5% | 32% | 16:9 |
| 4 | 35% | 12% | 20% | 1:1 |
| 5 | 30% | 65% | 26% | 3:2 |

#### 特殊功能
- **雪花特效**: 可通过 Header 按钮开启/关闭，状态持久化于 `localStorage`

---

### 3.2 作品集页 (archive.html)

#### 功能描述
以网格形式展示所有摄影项目，每个项目显示封面图、标题和年份。

#### UI 规格

| 元素 | 规格 |
|------|------|
| **网格布局** | `auto-fill, minmax(280px, 1fr)` |
| **网格间距** | 60px × 40px |
| **缩略图比例** | 3:2 (landscape) |
| **悬停效果** | `scale(1.03)` + 标题显现 |
| **文字透明度** | 默认 0.5 → 悬停 1.0 |

#### 数据来源
从 `data.json` 的 `projects[]` 数组动态加载

---

### 3.3 项目详情页 (project.html)

#### 功能描述
双栏布局展示单个项目：左侧信息区 + 右侧图片轮播。支持键盘、点击、触摸滑动导航。

#### UI 规格

| 区域 | 规格 |
|------|------|
| **左栏 (Info)** | 固定宽度 300px，含标题/年份/描述 |
| **右栏 (Gallery)** | 弹性宽度，图片滑块 |
| **导航箭头** | `‹` `›` 按钮，垂直居中于图片 |
| **计数器** | 右下角显示 `X / Y` |

#### 交互方式

| 方式 | 行为 |
|------|------|
| **点击图片** | 切换下一张 |
| **箭头按钮** | 左/右切换 |
| **键盘 ← →** | 左/右切换 |
| **触摸滑动** | 左滑下一张 / 右滑上一张 |
| **图片点击音效** | 播放 `text_custom.mp3` |

#### 移动端适配
- 禁用滑块，显示所有图片垂直排列
- 隐藏导航箭头和计数器

---

### 3.4 关于页 (biography.html)

#### 功能描述
展示摄影师的个人介绍，支持多段落文本，可自定义布局。

#### UI 规格

| 元素 | 规格 |
|------|------|
| **内容区宽度** | 默认 60%，最大 600px |
| **文字行高** | 1.8 |
| **排版** | 保留空白符 (`white-space: pre-wrap`) |

#### CMS 可配置项

| 字段 | 默认值 | 描述 |
|------|--------|------|
| `bio` | - | 正文内容 (支持换行) |
| `bio_layout.top` | 40px | 顶部内边距 |
| `bio_layout.padding_left` | 60px | 左侧内边距 |
| `bio_layout.width` | 60% | 容器宽度 |
| `bio_layout.max_width` | 600px | 最大宽度 |

---

### 3.5 联系页 (contact.html)

#### 功能描述
双栏布局：左侧联系信息列表 + 右侧随机/固定图片展示。

#### UI 规格

| 区域 | 规格 |
|------|------|
| **左栏 (Info)** | 联系项纵向排列，Label + Value 对齐 |
| **右栏 (Gallery)** | 最多显示3张图片，交错渐显 |

#### 图片模式

| 模式 | 描述 |
|------|------|
| **随机模式** | 每次刷新从所有项目图片中随机抽取3张 |
| **固定模式** | 使用 `contact_fixed_images[]` 指定的图片 |

#### CMS 可配置项

```json
{
  "contact_items": [
    { "label": "Base", "value": "Shanghai,China" },
    { "label": "Email", "value": "xxx@email.com", "link": "mailto:xxx@email.com" }
  ],
  "contact_random_mode": true,
  "contact_fixed_images": []
}
```

---

### 3.6 404 页面 (404.html)

#### 功能描述
优雅的错误页面，显示随机诗意消息。

#### 消息池

```json
{
  "void_messages": [
    "Nothingness is not an absence, but a potential.",
    "We find beauty not in the thing itself, but in the patterns of shadows.",
    "Empty space allows the imagination to enter.",
    "The page you seek has dissolved into light.",
    "A blank sheet of paper is the most diverse object."
  ]
}
```

---

### 3.7 后台管理 (admin.html)

#### 功能描述
一个完整的内容管理系统 (CMS)，允许非技术用户管理网站内容。

#### 访问控制

| 项目 | 详情 |
|------|------|
| **认证方式** | 密码输入 (`hazel2026`) |
| **会话保持** | 无持久化 (刷新需重新登录) |

#### 管理模块

| Tab | 功能 |
|-----|------|
| **PAGE: HOME** | 全局设置 + 首页图片配置 |
| **PAGE: PORTFOLIOS** | 项目增删改查 + 图片库管理 |
| **PAGE: INFO** | 传记内容编辑 + 布局调整 |
| **PAGE: CONTACT** | 联系信息管理 + 图片模式切换 |

#### 核心功能

- **图片上传**: 支持拖拽上传至 `/images/` 目录
- **图片排序**: 拖拽重排画廊顺序
- **布局微调**: 可视化调整各区块位置/尺寸
- **实时预览**: 修改后可立即在 LIVE SITE 查看

---

## 🎨 4. 设计系统

### 4.1 颜色系统

```css
:root {
    --bg-color: #ffffff;      /* 主背景 */
    --text-color: #1a1a1a;    /* 主文字 */
    --nav-color: #666666;     /* 导航默认 */
    --nav-active: #000000;    /* 导航激活 */
}

/* Admin 深色模式 */
:root {
    --bg: #1a1a1a;
    --panel: #252525;
    --text: #eee;
    --border: #333;
    --accent: #4a90e2;
    --danger: #e74c3c;
}
```

### 4.2 字体系统

| 用途 | 字体 | 备选 |
|------|------|------|
| **正文/导航** | Papyrus | fantasy |
| **项目标题** | Futura | Trebuchet MS, Arial |

### 4.3 间距系统

| 变量 | 值 | 用途 |
|------|-----|------|
| `--spacing-base` | 20px | 基础间距单位 |
| `--header-height` | 160px | Header 高度 |
| `--site-max-width` | 1200px | 内容区最大宽度 |
| `--site-padding` | 60px | 页面侧边距 |

### 4.4 动效规范

| 动画 | 持续时间 | 缓动函数 |
|------|----------|----------|
| **页面淡入** | 1.2s | ease-out |
| **悬停变换** | 0.4s | cubic-bezier(0.25, 0.46, 0.45, 0.94) |
| **滤镜切换** | 0.5s | ease-out |
| **阴影过渡** | 0.3s | ease |

---

## 📱 5. 响应式设计

### 5.1 断点定义

| 断点 | 范围 | 布局策略 |
|------|------|----------|
| **Desktop** | > 768px | 完整布局 + 悬停效果 |
| **Mobile** | ≤ 768px | 单列堆叠 + 触摸优化 |

### 5.2 移动端关键调整

#### Header
```
Desktop: 横向排列 [Brand][Nav][Snow][Socials]
Mobile:  纵向堆叠 [Brand]
                   [Nav]
                   [Snow + Socials → 右对齐]
```

#### 首页 Hero
```
Desktop: 不规则绝对定位布局
Mobile:  2列瀑布流 (CSS Columns)
```

#### 项目详情
```
Desktop: 左右分栏 + Slider
Mobile:  纵向堆叠 + 所有图片列表显示
```

---

## 🔊 6. 音效系统

### 6.1 音效资产

| 音效 | 文件 | 触发条件 |
|------|------|----------|
| **Click** | `text_custom.mp3` | 导航链接悬停、图片翻页 |
| **Shutter** | `image_custom.mp3` | Hero图片悬停、项目卡片悬停 |

### 6.2 配置

```javascript
soundAssets: {
    click: new Audio('assets/sounds/text_custom.mp3'),
    shutter: new Audio('assets/sounds/image_custom.mp3')
}
// 音量设置: 0.2 (低调背景音)
```

---

## 🔒 7. 安全与保护

### 7.1 图片保护

| 措施 | 实现 |
|------|------|
| **禁止右键** | `contextmenu` 事件阻止 (仅图片) |
| **禁止拖拽** | `dragstart` 事件阻止 (仅图片) |

### 7.2 Admin 访问控制

| 项目 | 实现 |
|------|------|
| **密码认证** | 前端密码检查 |
| **文件路径** | `/admin.html` 未被 SEO 索引 |

> ⚠️ **安全提示**: 当前认证为前端实现，仅适用于个人项目。生产环境建议添加服务端认证。

---

## 📊 8. 数据模型

### 8.1 data.json 结构

```json
{
  "site": {
    "title": "Hazel Kahlil",
    "description": "Photographer based in Somewhere.",
    "bio": "Biography text...",
    "copyright": "all photographs copyright hazelkahlil 2026",
    
    "header_social_instagram": "https://instagram.com/...",
    "header_social_link": "https://...",
    "header_social_email": "xxx@email.com",
    
    "home_images": [
      { "src": "images/xxx.jpg", "style": { "top": 2, "left": 8, "width": 35 } }
    ],
    
    "contact_items": [
      { "label": "Base", "value": "Shanghai,China", "link": "" }
    ],
    
    "bio_layout": { "top": 40, "padding_left": 60, "width": 60, "max_width": 600 },
    "contact_info_layout": { "top": 40, "left": 0, "width": 45 },
    "contact_gallery_layout": { "top": 40, "left": 0, "width": 50 },
    "contact_random_mode": true,
    "contact_fixed_images": [],
    
    "void_messages": ["..."]
  },
  "projects": [
    {
      "id": "unique-id",
      "title": "Project Title",
      "year": "2025",
      "description": "Project description...",
      "image": "images/cover.jpg",
      "gallery": [
        { "src": "images/1.jpg", "caption": "Location, Year" }
      ],
      "layout": { "top": 40, "left": 0, "width": 30 },
      "gallery_layout": { "top": 0, "left": 0, "width": 100 }
    }
  ]
}
```

---

## 🚀 9. 部署流程

### 9.1 工作流

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   本地开发    │ ──→│   Git Push   │ ──→│   Vercel     │
│ (server.py)  │    │   (GitHub)   │    │  自动部署     │
└──────────────┘    └──────────────┘    └──────────────┘
```

### 9.2 关键原则

> **"本地修改只是过程，Git 推送才是结束。"**

1. 通过 Admin 或直接编辑 `data.json` 修改内容
2. 使用 `git add .` + `git commit` 提交变更
3. 执行 `git push` 触发 Vercel 自动部署
4. 验证线上更新

### 9.3 常用命令

```bash
# 本地开发服务器
python server.py

# 提交并部署
git add .
git commit -m "Update: [描述]"
git push
```

---

## 📈 10. SEO 优化

### 10.1 已实现

| 项目 | 状态 |
|------|------|
| **Meta Description** | ✅ 每页独立描述 |
| **Open Graph 标签** | ✅ 首页已配置 |
| **语义化 HTML** | ✅ `<header>`, `<main>`, `<nav>` |
| **图片 Alt 属性** | ✅ 项目图片含 alt |
| **规范化标题** | ✅ 格式: `PAGE | HAZEL KAHLIL` |

### 10.2 待优化

| 项目 | 优先级 |
|------|--------|
| **结构化数据 (Schema.org)** | P2 |
| **Sitemap.xml** | P2 |
| **robots.txt** | P3 |
| **图片懒加载优化** | P3 (已部分实现) |

---

## 🗓️ 11. 版本历史

| 版本 | 日期 | 主要变更 |
|------|------|----------|
| v1.0 | 2025-08 | 初始版本上线 |
| v2.0 | 2025-10 | 添加 Admin CMS |
| v3.0 | 2025-12 | 项目详情页 Slider 重构 |
| v4.0 | 2026-01 | 动画优化、导航状态、Contact 页重构 |

---

## ✅ 12. 待办事项 (Backlog)

### P0 (紧急)
- [ ] 无

### P1 (重要)
- [ ] 添加图片压缩/优化管道
- [ ] 实现项目批量导入功能
- [ ] Admin 密码加密存储

### P2 (常规)
- [ ] 添加访客统计 (Privacy-friendly analytics)
- [ ] 多语言支持 (EN/CN)
- [ ] Dark Mode 主题切换

### P3 (探索)
- [ ] PWA 离线访问
- [ ] WebP 自动转换
- [ ] 视频作品支持

---

## 📝 13. 附录

### A. 设计灵感来源

- [Yoshihiko Ueda 上田义彦](https://yoshihikoueda.com/) - 布局与美学参考
- 日本侘寂 (Wabi-sabi) 设计哲学
- 极简主义摄影作品集网站

### B. 关联文档

| 文档 | 位置 |
|------|------|
| **部署指南** | `DEPLOY_GUIDE.md` |
| **项目经验总结** | `PROJECT_LEARNINGS.md` |
| **优化复盘记录** | `../复盘记录/2026-01-22_Kahlil_Website_Optimization_Sync.md` |

### C. 相关技术记忆库

- `LESSON_UI_DYNAMIC_DATA_SYNC_2026_01.md` - 动态数据同步最佳实践
- `LESSON_COLLABORATION_PROTOCOL_2026_01.md` - AI 协作协议

---

**文档结束**

*此 PRD 由 Antigravity AI 协助生成，最后更新于 2026-01-23*
