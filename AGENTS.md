# Ptwafu（葡萄牙语）

> 先读 [`../AGENTS.md`](../AGENTS.md)，再读本文。

## 1. 身份

| 项 | 值 |
|----|-----|
| 目录 | `Ptwafu/` |
| 域名 | https://wafulockpt.com/ |
| `html lang` | `pt-PT` |
| `og:locale` | `pt_PT` |
| hreflang 常见值 | `pt`（以页面既有 `hreflang` 为准，勿随意改成 `pt-BR`） |
| 角色 | 外文站 |

## 2. 实现注意

- 分享：Twitter/X + Facebook；主机 `wafulockpt.com`；禁止国内平台模板。
- 客服/页脚跟本站葡语壳（外文逻辑，非常见微信）。
- `x-default` → `wafuen.com`。
- UTF-8 无 BOM；注意 ã/õ/ç/á 等字符。
- 站内链无 `.html`。

## 2.1 联系表单（本站是 API 路径）

- 前端：`fetch('/api/contact')`（见 `js/contact-form.js`），**不是**浏览器直连 EmailJS。
- 后端：`functions/api/contact.js` → EmailJS（需 **Cloudflare Pages Functions** 已部署）。
- **本地 Live Server 测必失败**（无 `/api/contact`）——属环境问题，不是表单 HTML 坏了。
- 改表单时保留字段 id；勿删 functions。详解根 `AGENTS.md` §8。

## 3. Slug 别名（与 DE/FR 类似）

| 英文站 | 本站实际 |
|--------|----------|
| `./technology-twenty` | `./invisible-lock-guide` |
| `./technology-fourteen` | `./bulk-invisible-lock` |

挂页、正文内链、related-list、回链都要解析别名。详见 `../.cursor/invisible-lock-odm-development-guide-locale-rollout.md` §0.1。

## 4. 改文章最小检查

- [ ] 域名 = `wafulockpt.com`
- [ ] 别名路径存在且可点
- [ ] 无中文分享误植；无 BOM
