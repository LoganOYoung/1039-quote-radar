# 1039 报价雷达 — 上线到 Vercel（微信可打开）

按下面步骤做完后，会得到一个公网地址（如 `https://xxx.vercel.app`），可直接在微信里打开、使用和分享。绑域名是**可选**的。

---

## 推送上线前检查

- [ ] 本地已执行 `npm run build` 且通过（✓ 已通过）
- [ ] 敏感信息未提交：`.env.local`、`.env` 已在 `.gitignore`（✓ 已忽略）
- [ ] 代码已提交并推送到 GitHub（见下方「一、前置准备」）
- [ ] Vercel 已配置环境变量并完成首次部署，部署后补全 `NEXT_PUBLIC_SITE_URL` 并 Redeploy

---

## 一、前置准备

1. **代码在 Git 里**  
   项目已在本地且能正常 `npm run build`。若还没推送到 GitHub/GitLab，先初始化并推送：
   ```bash
   cd /Users/ouyangheng/coding/1039-quote-radar
   git init
   git add .
   git commit -m "Initial commit"
   # 在 GitHub 新建仓库后：
   git remote add origin https://github.com/你的用户名/1039-quote-radar.git
   git branch -M main
   git push -u origin main
   ```

2. **Vercel 账号**  
   打开 [vercel.com](https://vercel.com)，用 GitHub 登录即可。

---

## 二、在 Vercel 部署

### 1. 导入项目

1. 登录 [Vercel](https://vercel.com) → 点击 **Add New…** → **Project**。
2. 选择 **Import Git Repository**，找到 `1039-quote-radar`（或你仓库名），点 **Import**。

### 2. 配置项目（重要）

- **Framework Preset**：保持 **Next.js**（会自动识别）。
- **Root Directory**：留空（仓库根目录就是项目根）。
- **Build Command**：留空，用默认 `next build`。
- **Output Directory**：留空。
- **Install Command**：留空，用默认 `npm install`。

### 3. 添加环境变量

在 **Environment Variables** 里添加（和本地 `.env.local` 一致，值换成你的真实数据）：

| 变量名 | 说明 | 示例值（勿直接抄） |
|--------|------|--------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://fmxpchewtgdpnkaaihbm.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名 Key | 你的 anon key |
| `NEXT_PUBLIC_SITE_URL` | 站点根 URL（先不填，见下文） | 见下方说明 |
| `DEFAULT_EXCHANGE_RATE` | 默认汇率 | `7.25` |
| `FEISHU_WEBHOOK_URL` | 飞书机器人（可选） | 你的 webhook 或留空 |
| `WECOM_WEBHOOK_URL` | 企业微信机器人（可选） | 你的 webhook 或留空 |

**关于 `NEXT_PUBLIC_SITE_URL`：**

- **第一次部署**：可以先不填，或填 `https://你的项目.vercel.app`（部署完成后 Vercel 会显示实际域名）。
- **部署完成后**：到 Vercel 项目 → **Settings** → **Environment Variables**，把 `NEXT_PUBLIC_SITE_URL` 设为你的访问地址，例如：
  - 用 Vercel 默认域名：`https://1039-quote-radar.vercel.app`
  - 若已绑域名：`https://你的域名.com`
- 改完后在 **Deployments** 里对最新部署点 **Redeploy**，这样仪表盘里「复制链接」才是正确公网链接。

### 4. 部署

点击 **Deploy**，等构建完成（约 1～2 分钟）。  
成功后顶部会显示 **Visit**，点进去就是你的站点，例如：`https://1039-quote-radar-xxxx.vercel.app`。

### 5. 确认并补全 `NEXT_PUBLIC_SITE_URL`

1. 在 Vercel 项目页记下 **Domains** 里的地址（如 `xxx.vercel.app`）。
2. 到 **Settings** → **Environment Variables**，添加或修改：
   - `NEXT_PUBLIC_SITE_URL` = `https://你的项目.vercel.app`（不要末尾斜杠）
3. 到 **Deployments** → 最新一次部署 → 右侧 **⋯** → **Redeploy**，等完成。

之后在站点里「复制链接」会带正确公网域名，微信里分享出去就是对的。

---

## 三、从哪儿访问、搜索和“下载”

### 访问地址（用户怎么打开）

- **部署完成后**：在 Vercel 项目页 → **Domains** 里看到的地址就是站点入口，例如 `https://1039-quote-radar.vercel.app`。
- **若绑了自定义域名**：用户访问你配置的域名即可（如 `https://quote.你的品牌.com`）。
- 本站是**网页应用**，没有上架应用商店，用户通过**链接**访问（你分享链接、发二维码或写在宣传材料里）。

### 搜索（用户怎么找到我们）

- **没有应用商店**：用户无法在应用商店里搜索“1039报价雷达”下载。
- 用户通常通过：你发的链接、微信群/朋友圈链接、宣传物料上的二维码或网址。
- 若做了 SEO 或品牌词投放，用户也可能通过搜索引擎搜「1039报价雷达」等关键词进入官网。

### “下载” = 添加到主屏幕（像 App 一样用）

- 本站支持 **PWA**，无需从应用商店下载。
- **Android（Chrome）**：用浏览器打开上述访问地址 → 地址栏或菜单里出现「安装应用」或「添加到主屏幕」→ 点选即可，桌面会多一个图标，打开后像独立 App 全屏使用。
- **iOS（Safari）**：用 Safari 打开地址 → 底部「分享」→「添加到主屏幕」→ 主屏幕会出现「报价雷达」图标，点开即全屏使用。
- **微信内打开**：若在微信里打开链接，可复制链接到 Safari/Chrome 再「添加到主屏幕」；部分安卓微信内也可通过右上角「…」→「在浏览器中打开」后再安装。

---

## 四、在微信里打开、使用和分享

- 微信内置浏览器支持 **HTTPS** 链接。Vercel 默认就是 HTTPS，无需再配置。
- 把「访问地址」或「报价链接」发到微信（或朋友圈、群、好友），对方点开即可使用。
- 若做了「分享长图」功能，长图里的链接也会是当前站点的公网地址（由 `NEXT_PUBLIC_SITE_URL` 决定）。

**注意：** 微信会缓存页面，若你刚更新了站点，别人可能看到旧版，可让对方「右上角 … → 刷新」或过一段时间再试。

---

## 五、要不要绑自己的域名（可选）

**不绑域名**：用 Vercel 送的 `xxx.vercel.app` 即可上线、微信里能正常打开和分享。

**绑域名**：适合要品牌、好记、对外正式用的场景。

### 绑域名的步骤（简要）

1. **买域名**  
   在阿里云、腾讯云、Cloudflare、Namecheap 等任选一家购买，例如 `yourbrand.com`。

2. **在 Vercel 里添加域名**  
   - 打开 Vercel 项目 → **Settings** → **Domains**。  
   - 在 **Domain** 输入框填你的域名（如 `quote.yourbrand.com` 或 `yourbrand.com`），点 **Add**。  
   - 按页面提示，去域名服务商那里添加 **CNAME** 或 **A 记录**（Vercel 会给出具体主机名和指向）。  
   - 等 DNS 生效（几分钟到几十分钟不等），Vercel 会显示 **Valid Configuration** 并自动配好 HTTPS。

3. **更新 `NEXT_PUBLIC_SITE_URL`**  
   - 在 Vercel **Environment Variables** 里，把 `NEXT_PUBLIC_SITE_URL` 改为 `https://你的域名`（例如 `https://quote.yourbrand.com`），不要末尾斜杠。  
   - 再 **Redeploy** 一次，这样全站链接和分享都会用新域名。

4. **微信里**  
   之后分享时用新域名链接即可，无需额外设置。

---

## 六、自检清单（上线后建议测一遍）

- [ ] 首页能打开。
- [ ] **新建报价** `/quote/new`：创建一条报价，勾选「受控访问」或「锁定汇率」试一下。
- [ ] **报价链接**：用手机微信打开该链接，看是否正常显示（价格模糊/解锁流程是否正常）。
- [ ] **仪表盘**：在电脑浏览器打开 `/dashboard`，看报价列表、访问统计、授权按钮是否正常。
- [ ] **分享**：若用长图/复制链接分享，确认链接是 `NEXT_PUBLIC_SITE_URL` 对应的域名。

---

## 七、常见问题

**Q：部署报错 `Command "next build" exited with 1`？**  
A：在本地执行 `npm run build` 看具体报错（缺依赖、类型错误等），修好后再推送并重新 Deploy。

**Q：微信里打开是空白或报错？**  
A：先在同一网络下用手机浏览器直接打开该链接，若浏览器正常、微信异常，多半是微信缓存，让用户刷新或清除微信缓存再试。

**Q：报价链接在微信里显示不对？**  
A：确认环境变量里 `NEXT_PUBLIC_SITE_URL` 已设为当前访问的根 URL（Vercel 域名或自定义域名），并已 Redeploy。

**Q：必须用 GitHub 吗？**  
A：Vercel 也支持 GitLab、Bitbucket；若只用本地代码，可用 Vercel CLI（`npx vercel`）直接部署，但后续更新不如连 Git 自动部署方便。

---

按上述步骤做完后，站点就「上线」了，可以直接在微信里打开、使用和分享；绑域名按需再做即可。
