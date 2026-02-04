# 发给老外的报价页面 — 重新规划

面向**海外客户**打开的报价查看页（`/view/[id]`）：定位、信息结构、文案与扩展项。**优先专业、全英文、符合国际报价单习惯**。

---

## 一、当前问题（针对老外）

| 问题 | 说明 |
|------|------|
| **语言混用** | 标签英文、产品名/客户名可能中文、「Powered by 1039报价雷达」纯中文，老外看不懂、显得不专业 |
| **信息过少** | 仅 Product / FOB / Prepared for，缺报价单号、日期、有效期、条款、公司信息、数量/单位等 |
| **无文档感** | 不像正式 Quotation，缺标题区、引用号、落款区，难以打印或转发给采购 |
| **无行动引导** | 客户看完无法「确认」「询更多」「联系你」，缺少下一步指引 |
| **品牌露出** | 底部中文品牌对海外客户无辨识度，应改为英文或中性 |

---

## 二、页面定位

| 维度 | 说明 |
|------|------|
| **主要访客** | 海外买家（客户），在微信/邮件里点开报价链接 |
| **使用场景** | 收到链接 → 打开查看报价 → 可选申请查看价格（受控时）→ 联系供应商 |
| **目标** | 3 秒内看懂「这是一份正式报价」；信息完整、可打印/转发；全英文界面（产品名/客户名为卖家填写，可仍为中文或英文） |

---

## 三、信息结构（自上而下）

### 3.1 头部 — 文档属性

| 元素 | 说明 | 数据来源 |
|------|------|----------|
| **标题** | "Quotation" 或 "Price Quotation" | 固定 |
| **Quote Ref / No.** | 报价单号，便于邮件/订单对应 | `short_id` 或后续 `quote_number` |
| **Date** | 报价日期 | `created_at` |
| **Valid until**（可选） | 有效期，如 "Valid for 7 days" | 固定文案或后续 `valid_until` 字段 |

### 3.2 主体 — 报价内容

| 元素 | 说明 | 数据来源 |
|------|------|----------|
| **Product / Item** | 产品名称（卖家填，可中可英） | `product_name` |
| **FOB Price (USD)** | 单价，格式如 $ 43.54 | `fob_price_usd` |
| **Prepared for / Attn.** | 客户/收件人 | `customer_name` |
| **Exchange rate**（可选） | 锁定汇率时展示 "1 USD = x.xx CNY (locked on date)" | `exchange_rate_locked`, `rate_updated_at` |

### 3.3 受控访问时（价格未解锁）

| 元素 | 说明 |
|------|------|
| 价格区 | 模糊显示单价，文案如 "Unit price (FOB USD) — Request access to view" |
| 按钮 | "Request to View Price" 或 "Unlock Quote" |
| 提交后 | "Request sent. Price will be visible once the supplier approves."（全英文） |

### 3.4 条款与说明（可选）

| 元素 | 说明 |
|------|------|
| **Terms** | 一句短句，如 "Prices subject to confirmation. FOB named port." 或 "Valid for 7 days from date of issue." |
| **Note** | 如 "For questions or order, please contact your sales representative." |

### 3.5 页脚

| 元素 | 说明 |
|------|------|
| **隐私提示** | "Viewing of this page may be recorded for security."（已有，保持英文） |
| **Powered by** | "Powered by 1039 Quote Radar"（英文品牌名，不出现中文） |

---

## 四、文案规范（全英文）

| 位置 | 当前 | 建议 |
|------|------|------|
| 页面标题 | Quotation | Quotation 或 Price Quotation |
| 产品标签 | Product | Product / Item |
| 价格标签 | FOB Price (USD) | FOB Price (USD) |
| 客户标签 | Prepared for | Prepared for / Attn. |
| 解锁按钮 | Unlock Full Quote / 提交中… | Request to View Price / Submitting… |
| 等待文案 | 已提交申请，供应商授权后… | Request sent. Price will show once the supplier approves. |
| 页脚品牌 | Powered by 1039报价雷达 | Powered by 1039 Quote Radar |
| 汇率说明 | Base Exchange Rate: 1 USD = x.xx CNY | Exchange rate (locked): 1 USD = x.xx CNY |

产品名、客户名保持**卖家填写原文**（可中文可英文），不自动翻译。

---

## 五、版式与视觉

| 项 | 建议 |
|----|------|
| **整体** | 白底、深灰字、单列居中，最大宽度约 480px，像一张可打印的报价单 |
| **层次** | 标题 → Ref + Date → 分隔线 → Product / Price / Prepared for → 可选 Terms → 页脚小字 |
| **价格** | 数字突出（字号大、字重粗），货币符号与数字间距统一（如 $ 43.54） |
| **移动端** | 微信内打开优先：安全区、字号≥15px、按钮≥44px 高 |

---

## 六、可选扩展（后续）

| 扩展项 | 说明 |
|--------|------|
| **Quote number** | 表增加 `quote_number`，展示为 "Quote #Q-202502-001" 等 |
| **Valid until** | 表增加 `valid_until` 或用「创建后 N 天」规则展示有效期 |
| **Terms 文案** | 表增加 `terms_text` 或固定几条可选 |
| **公司名称/Logo** | 表增加 `company_name`、`company_logo_url`，头部展示 |
| **数量/单位** | 表增加 `quantity`、`unit`，展示 Unit price / Total |
| **CTA 按钮** | "Reply to supplier" 跳转 mailto 或复制联系方式（需卖家填联系邮箱/电话） |

当前阶段**先不做**上述表结构变更，仅在现有字段下做到：全英文界面、Ref(Date 用 created_at)、条款一句固定文案、页脚品牌英文。

---

## 七、实施优先级

| 优先级 | 内容 | 说明 |
|--------|------|------|
| P0 | 全英文 UI + 页脚品牌 | 标签、按钮、等待文案、Powered by 全部英文 |
| P1 | 文档属性 | 展示 Quote Ref (short_id)、Date (created_at)、可选 Valid 7 days |
| P2 | 版式与层次 | 卡片式边框、分隔线、价格突出、移动端友好 |
| P3 | 条款一句 | 固定 "Prices subject to confirmation. Valid for 7 days from date of issue." 或类似 |
| P4 | 扩展字段 | Quote number、Valid until、Terms、公司信息等（需表结构） |

先实施 P0～P2，P3 可加一句静态条款，P4 按需迭代。
