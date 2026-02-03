# 1039报价雷达

粘贴截图或文字，一键生成专业报价链接；客户点开，你秒知道。

## 技术栈

- Next.js 14 (App Router)
- Tailwind CSS
- Supabase（数据库 + RPC）
- Lucide React

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

1. 在 [Supabase](https://supabase.com) 新建项目，拿到 **Project URL** 和 **anon public** key。
2. 复制 `.env.example` 为 `.env.local`，填入：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon key
DEFAULT_EXCHANGE_RATE=7.25
```

3. 在 Supabase 控制台 → **SQL Editor** 中执行 `supabase/schema.sql` 中的全部 SQL，创建表与 RPC。

### 3. 启动开发服务器

```bash
npm run dev
```

浏览器打开 [http://localhost:3001](http://localhost:3001)。

## 页面说明

| 路径 | 说明 |
|------|------|
| `/` | 首页，入口「生成报价链接」「仪表盘」 |
| `/quote/new` | 智能粘贴 + 表单，生成报价链接 |
| `/view/[id]` | 客户打开的报价页（白底、英文）；打开即记录 IP/城市/UA |
| `/dashboard` | 报价列表，状态：未读/已读、查看次数 |

## 功能要点

- **智能粘贴**：在 `/quote/new` 粘贴微信聊天、产品描述等，点「解析并填入下方」自动识别产品名、单价、客户名。
- **1039 公式**：FOB_USD = (EXW + Agent费 + 拖车 + 利润) / (汇率 × 0.998)。
- **追踪**：客户打开 `/view/[shortId]` 时，服务端记录访问并写入 `quote_logs`，仪表盘显示已读与次数。

## 部署

- 建议部署到支持 Server 的托管（Vercel、Zeabur、Railway 等）。
- 国内访问可绑定自有域名并选用香港/亚洲节点。
- 环境变量同上，另可设 `NEXT_PUBLIC_SITE_URL` 为站点根 URL（仪表盘复制链接用）。
