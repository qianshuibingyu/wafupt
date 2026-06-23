# Ptwafu 与 Enwafu 逐页对齐文档

> **基准站（英文）：** `d:\WebSite\Enwafu` → [wafuen.com](https://wafuen.com)  
> **待对齐站（葡语）：** `d:\WebSite\Ptwafu` → [wafulockpt.com](https://wafulockpt.com)  
> **文档日期：** 2026-06-22  
> **目标：** 以英文站为结构/功能基准，逐页补齐葡语站差异（文案翻译为葡语，结构与交互保持一致）

**相关文档：** [PT-EN-AUDIT-zh.md](./PT-EN-AUDIT-zh.md)（SEO、部署、CSS 体积等专项审计）

**自动化工具：**

```bash
node scripts/compare-en-pt.mjs          # 文件数量、sitemap、CSS/JS 体积
node scripts/page-alignment-audit.mjs   # 逐页区块/标记对比（输出 page-alignment-output.json）
```

---

## 1. 执行摘要

| 维度 | 英文站 Enwafu | 葡语站 Ptwafu | 对齐状态 |
|------|--------------|--------------|----------|
| 公开 HTML 页面 | 71 | 71 | ✅ 数量一致 |
| Sitemap URL | 69 | 69 | ✅（8 篇资源文章 slug 不同，hreflang 互链） |
| 结构完全一致页面 | — | **5** | ⚠️ 仅 `404`、`google验证`、`news`、`privacy`、`resource/technology` |
| 首页主内容区块 | 10 个 section | **8 个**（缺 2 个） | ❌ **严重不一致** |
| 页脚「全球站点」列 | 68 页有 | **3 页有** | ❌ 全站模板缺口 |
| `analytics-deferred.js` | 70/71 页 | **21/71 页** | ❌ 统计缺口 |
| 页脚隐私政策链接 | 68 页有 | **3 页有** | ❌ 全站模板缺口 |
| 分享按钮 CSS | 有 | HTML 有、**CSS 缺** | ⚠️ 36 页显示异常 |
| `components.css` | 33,474 B | 30,009 B | ⚠️ 缺约 3.5 KB |

**结论：** 页面文件齐全，但**首页与全站页脚/页头模板**与英文站差距最大；多数内页差异来自同一套模板未同步，修一次可覆盖数十页。

---

## 2. 首页 `index.html`（最高优先级）

### 2.1 主内容区块对比

| 顺序 | 英文站 section | 葡语站 | 状态 |
|------|----------------|--------|------|
| 1 | `carousel` | `carousel` | ✅ |
| 2 | `section-about` | `section-about` | ✅ |
| 3 | `high-precision-equipment-section` | `high-precision-equipment-section` | ✅ |
| 4 | `scenes-section` | `scenes-section` | ✅ |
| 5 | `tech-advantages-section` | `tech-advantages-section` | ✅ |
| 6 | `news-section` | — | ❌ **顺序错误：PT 把新闻区放到第 8 位** |
| 7 | `reviews-section` | — | ❌ **整段缺失** |
| 8 | `b2b-guide-section` | — | ❌ **整段缺失** |
| 9 | `faq-section` | `faq-section` | ⚠️ PT 在第 6 位（应在 B2B 指南之后） |
| 10 | `contact-section` | `contact-section` | ⚠️ PT 在第 7 位 |

**英文站正确顺序：**

```
carousel → about → 高精设备 → 场景 → 技术优势 → 新闻 → 客户评价 → B2B采购指南 → FAQ → 联系
```

**葡语站当前顺序：**

```
carousel → about → 高精设备 → 场景 → 技术优势 → FAQ → 联系 → 新闻
```

### 2.2 缺失区块说明

#### `reviews-section`（客户评价跑马灯）

- 英文站：约 676–1020 行，含文字评价 + `./reviews/*.avif` 图片评价
- 葡语站：**无此 section**（本地 `reviews/` 已有 6 张 `.avif`，可直接引用）
- 需翻译：标题、副标题、`Verified buyer` 等 UI 文案；评价原文可保留多语言（与 EN 一致）

#### `b2b-guide-section`（B2B 采购指南）

- 英文站：约 1024–1115 行，含 OEM/ODM 说明、规格对照表、白皮书链接
- 葡语站：**无此 section**
- 需从 EN 复制结构，全文翻译为葡语，内部产品链接改为 PT 路径

### 2.3 `<head>` 差异

| 项目 | 英文站 | 葡语站 | 操作 |
|------|--------|--------|------|
| `article:modified_time` | ✅ `2026-06-22` | ❌ | 同步 meta |
| `hreflang="zh-CN"` | ✅ | ❌ | 补中文站 alternate |
| YouTube 封面 preload | ✅ `i.ytimg.com/...` | ❌ | about 区视频首屏优化 |
| JSON-LD `@graph` | ✅ Organization + WebSite + WebPage + ItemList + LocalBusiness | ❌ 仅 Organization + WebSite | 翻译后同步完整图谱 |
| JSON-LD `FAQPage` | ✅ 页脚前 8 问 | ❌ | 翻译 FAQ 后添加 |
| Microsoft Clarity | ❌ | ✅ | PT 独有，可保留 |
| CSS 版本号 | `20260612` / `20260615n` | `20260618` | 对齐后统一 bump |

### 2.4 导航与页脚差异

| 项目 | 英文站 | 葡语站 |
|------|--------|--------|
| 语言切换（导航） | 7 种语言 | 7 种语言（**缺中文**链接） |
| 页脚列数 | **5 列**（含 Global Sites） | **4 列**（缺全球站点） |
| 页脚版权 | `© 2026 WAFU Smart Lock` | `© 2026 Shenzhen Huafu Intelligent Technology Co., Ltd.` |
| 页脚隐私链接 | ✅ `footer-privacy` | ❌ 仅 sitemap，**无隐私政策** |
| 联系邮箱展示 | outlook + gmail | 同左 + **额外 CET 时段行**（EN 无，可保留） |

---

## 3. 全站模板差异（一次修复 → 多页生效）

以下问题在 **64+ 页面**重复出现，应优先做**模板级**同步，而非逐页手改。

### 3.1 页脚第五列「全球站点 / Sites Globais」

| | 英文站 | 葡语站 |
|--|--------|--------|
| 覆盖页面 | 68 页（除 `404`、`sitemap`、`google验证` 等） | **3 页**（`privacy`、`b2b-whitepaper`） |
| 内容 | English / Deutsch / Español / Português / Français / Italiano / Русский / **中文** | — |

**操作：** 从 `Enwafu/index.html` 复制 `footer-col`（Global Sites），翻译标题为「Sites Globais」，插入到「产品」列与「联系我们」列之间。

### 3.2 页脚隐私政策链接

| | 英文站 | 葡语站 |
|--|--------|--------|
| `footer-privacy` → `./privacy` | 68 页 | **3 页** |

**操作：** 在 `footer-bottom` 中补 `<a href="./privacy" class="footer-privacy">Política de Privacidade</a>`。

### 3.3 `analytics-deferred.js` 引用

| | 英文站 | 葡语站 |
|--|--------|--------|
| 引用页数 | 70/71 | **21/71** |

**PT 已有 analytics 的页面：** `index`、`products.html`、全部 17 个产品页、`privacy`、`b2b-whitepaper`

**PT 缺失 analytics 的页面（50 页）：**  
`about`、`contact`、`applicable`（含 5 子页）、`resource`（含全部文章）、`news`（含 10 篇）、`sitemap`、`404` 等

**操作：** 在各页 `</body>` 前统一添加：

```html
<script src="./js/analytics-deferred.js?v=20260609" defer></script>
```

（路径深度不同的子目录页注意 `../` 前缀）

### 3.4 导航语言菜单缺中文

英文站导航与页脚均含 `https://wafulockcn.com/`（中文）。葡语站两处都缺。

### 3.5 `hreflang="zh-CN"`（`<head>`）

英文站全站 `<head>` 含 `zh-CN` alternate；葡语站绝大多数页面缺失（sitemap 亦仅 1/69 条含 zh-CN）。

### 3.6 分享按钮样式（`components.css`）

- 36 页 HTML 含 `wafu-share-buttons`，但 PT `components.css` 比 EN **少约 3.5 KB**
- 缺：`.wafu-share-buttons`、`.share-round.*`、面包屑对齐、正文内链色等

**操作：** 从 EN `components.css` 合并缺失块（保留 PT 已有修复，见 §7）。

---

## 4. 逐页对齐清单

图例：**✅** 已对齐 · **⚠️** 轻微差异 · **❌** 需修复 · **➖** 有意不同（slug/语言）

### 4.1 根目录页面（12）

| 页面 | 结构 | 页脚5列 | Analytics | 隐私链接 | 备注 |
|------|------|---------|-----------|----------|------|
| `index.html` | ❌ | ❌ | ✅ | ❌ | 缺 reviews + b2b-guide；区块顺序错；JSON-LD 偏薄 |
| `about.html` | ⚠️ | ❌ | ❌ | ❌ | 主内容 section 一致；PT 多约 129 行 |
| `products.html` | ⚠️ | ❌ | ✅ | ❌ | |
| `applicable.html` | ⚠️ | ❌ | ❌ | ❌ | |
| `resource.html` | ⚠️ | ❌ | ❌ | ❌ | |
| `news.html` | ✅ | ❌ | ❌ | ❌ | 结构对齐；模板项未同步 |
| `contact.html` | ⚠️ | ❌ | ❌ | ❌ | |
| `privacy.html` | ✅ | ✅ | ✅ | ✅ | 少数已对齐页之一 |
| `sitemap.html` | ⚠️ | ❌ | ❌ | ❌ | |
| `404.html` | ✅ | ➖ | ❌ | ➖ | |
| `google9e6e6ddd48f0c62d.html` | ✅ | ➖ | ➖ | ➖ | 验证文件，保持不动 |

### 4.2 适用场景 `applicable/`（5）

| 页面 | 结构 | 页脚5列 | Analytics | 备注 |
|------|------|---------|-----------|------|
| `residence.html` | ⚠️ | ❌ | ❌ | `residence.css` 比 EN 小 1.7KB |
| `office.html` | ⚠️ | ❌ | ❌ | |
| `apartment.html` | ⚠️ | ❌ | ❌ | |
| `hotel.html` | ⚠️ | ❌ | ❌ | |
| `dormitory.html` | ⚠️ | ❌ | ❌ | |

### 4.3 产品 `products/`（17）

| 页面 | 结构 | 页脚5列 | Analytics | 备注 |
|------|------|---------|-----------|------|
| `product-010` ~ `product-026` 等 16 款 | ⚠️ | ❌ | ✅ | 模板一致 |
| **`product-F3.html`** | **❌** | ❌ | ✅ | **缺 `specifications-table` 规格表 section** |

### 4.4 新闻 `news/`（10）

| 页面 | 结构 | 页脚5列 | Analytics | 分享按钮 |
|------|------|---------|-----------|----------|
| `news-one` ~ `news-ten` | ⚠️ | ❌ | ❌ | HTML 有 / CSS 缺 |

### 4.5 资源中心 `resource/`（27）

| 类型 | 数量 | 结构 | 页脚5列 | Analytics | 备注 |
|------|------|------|---------|-----------|------|
| `technology-one` ~ `eleven` | 11 | ⚠️ | ❌ | ❌ | |
| 语义 slug 文章（8 篇） | 8 | ⚠️ | ❌ | ❌ | 与 EN `technology-12~21` 对应，slug 不同属正常 |
| 共用 slug 文章 | 8 | ⚠️ | ❌ | 部分 ❌ | 见下表 |

**需单独处理的文章：**

| 葡语文件 | 问题 |
|----------|------|
| `smart-invisible-lock-solutions.html` | ❌ canonical/og/schema 仍指向旧域名 `wafulock.com`（P0） |
| `b2b-smart-lock-oem-whitepaper.html` | ⚠️ 页脚/Global Sites 已有；head hreflang 仅 en/pt |
| `technology.html` | ✅ 结构已对齐；`invisible-lock-guide` 链接重复出现 |

**slug 对照（8 篇，内容等价）：**

| 英文 canonical | 葡语 canonical |
|----------------|----------------|
| `technology-twelve` | `invisible-lock-tech` |
| `technology-thirteen` | `invisible-lock-ODM` |
| `technology-fourteen` | `bulk-invisible-lock` |
| `technology-sixteen` | `anti_pry-invisible-lock` |
| `technology-seventeen` | `invisible-lock-troubleshooting` |
| `technology-nineteen` | `rental-invisible-lock` |
| `technology-twenty` | `invisible-lock-guide` |
| `technology-twentyone` | `invisible-lock-line` |

---

## 5. CSS / JS 差异摘要

| 文件 | EN (B) | PT (B) | 影响 |
|------|--------|--------|------|
| `components.css` | 33,474 | 30,009 | 分享按钮、面包屑、FAQ 手风琴 |
| `index.css` | 42,998 | 41,454 | 首页 reviews / b2b-guide 样式可能也在此 |
| `residence.css` | 9,142 | 7,412 | 住宅场景子页布局 |
| `resource.css` | 6,440 | 4,746 | 资源中心列表页 |
| `applicable.css` | 5,636 | 4,262 | 适用场景首页 |
| `allproduct.css` | 14,743 | 17,260 | PT 领先（单产品居中），**勿覆盖** |
| `all.js` | 34,571 | 34,571 | ✅ 完全一致 |

**PT 独有（同步时勿删）：**

- `css/recruitment.css` — 孤儿文件，无引用
- `index.html` 内联 about 网格 fallback
- `allproduct.css` 单产品 `:only-child` 居中

---

## 6. 基础设施差异

| 项目 | 英文站 | 葡语站 | 建议 |
|------|--------|--------|------|
| `_redirects` | 56 行，无扩展名 + 旧路径 | 31 行 + `_middleware.js` | 功能等价，保持 PT 方案 |
| `_headers` 静态缓存 | ✅ 1 年 immutable | ❌ | 从 EN 合并缓存规则 |
| `_headers` 安全头 | ❌ | ✅ | 保留 PT |
| `functions/api/contact.js` | ✅ | ✅（近期已添加） | 确认部署 |
| `robots.txt` `Disallow: /search` | ✅ | ❌ | 建议补上 |

---

## 7. 推荐修复顺序

### 阶段 A — 模板（覆盖 60+ 页）

1. 同步页脚：**全球站点列** + **隐私政策链接**
2. 导航语言菜单补 **中文** 链接
3. 全站 `<head>` 补 `hreflang="zh-CN"`
4. 批量补 `analytics-deferred.js`（50 页）
5. 从 EN 合并 `components.css` 缺失样式

### 阶段 B — 首页

6. 从 EN 复制 `reviews-section` → 翻译 UI 文案
7. 从 EN 复制 `b2b-guide-section` → 全文翻译
8. 调整 section 顺序与 EN 一致
9. 补 `FAQPage` + 完整 `@graph` JSON-LD
10. 同步 `index.css` 中 reviews / b2b 相关样式

### 阶段 C — 单页修补

11. `products/product-F3.html` 补 `specifications-table`
12. `resource/smart-invisible-lock-solutions.html` 修正 canonical（P0）
13. 按需同步 `residence.css` / `resource.css` / `applicable.css`

### 阶段 D — SEO 优化（见 PT-EN-AUDIT-zh.md §16）

14. 缩短过长 title / description
15. 统一 `?v=` 缓存版本
16. sitemap 补全 zh-CN hreflang

---

## 8. 完全对齐页面（当前仅 5 页）

以下页面经 `page-alignment-audit.mjs` 检测，**区块结构与标记均无差异**（仍可能有文案/SEO 差异）：

- `404.html`
- `google9e6e6ddd48f0c62d.html`
- `news.html`
- `privacy.html`
- `resource/technology.html`

其余 **66/71** 页均存在至少一项结构或模板差异（多数是页脚列数）。

---

## 9. 对齐验收标准

每页完成后核对：

- [ ] 主内容 `<section>` 类名与顺序与 EN 一致（翻译除外）
- [ ] 页脚 5 列齐全（含 Sites Globais + Contacte-nos）
- [ ] `footer-privacy` 链接存在
- [ ] `analytics-deferred.js` 已引用
- [ ] `<head>` hreflang 含 `zh-CN`
- [ ] 分享按钮（若有）显示正常
- [ ] 葡语文案完整，无英文 UI 漏翻（评价区原文多语言除外）

---

## 10. 重新生成对比数据

```bash
# 站点级对比
node scripts/compare-en-pt.mjs

# 逐页结构对比（生成 scripts/page-alignment-output.json）
node scripts/page-alignment-audit.mjs

# SEO 专项（canonical、title 长度等）
node scripts/seo-scan.mjs
```

---

*以 Enwafu 为结构基准。完成阶段 A+B 后，绝大多数页面可达视觉与功能一致；阶段 C+D 处理剩余边角与 SEO。*
