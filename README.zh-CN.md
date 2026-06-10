# CoreClaw n8n 商业工作流套件

本仓库包含一组围绕 CoreClaw 官方 n8n 节点打造的商业级工作流。整体设计参考成熟的 Apify 自动化模板，但数据抓取和任务运行以 CoreClaw 为核心。

## 工作流列表

| 文件 | 本地 n8n 名称 | 使用场景 |
| --- | --- | --- |
| `coreclaw-gmaps-leads-simple.json` | CoreClaw地图线索 / Maps Leads | 本地商家线索抓取 |
| `coreclaw-gmaps-leads-email-extraction-simple.json` | CoreClaw地图邮箱 / Maps Email | 网站邮箱提取和线索补全 |
| `coreclaw-gmaps-b2b-enrichment-simple.json` | CoreClaw B2B增强 / B2B Enrich | AI 辅助 B2B 线索增强 |
| `coreclaw-gmaps-reviews-monitor-simple.json` | CoreClaw评论监控 / Reviews Monitor | 轻量级口碑监控 |
| `coreclaw-gmaps-to-sheets.json` | CoreClaw表格线索 / Sheets Leads | Google Sheets 线索运营载荷 |
| `coreclaw-gmaps-leads-email-extraction.json` | CoreClaw外联线索 / Email Outreach | AI 话术和外联载荷 |
| `coreclaw-gmaps-airtable-email.json` | CoreClaw Airtable管道 / Airtable Pipeline | Airtable 或 CRM 管道载荷 |
| `coreclaw-gmaps-leads-complete-enhanced.json` | CoreClaw完整线索运营 / Lead Ops | 多目标系统线索运营 |
| `coreclaw-gmaps-reviews-monitor.json` | CoreClaw口碑运营 / Reputation Ops | Slack、Notion、Sheets 口碑运营载荷 |
| `coreclaw-google-maps-leads-complete-global.json` | CoreClaw全球拓客 / Global Prospecting | 全球本地商家拓客 |
| `coreclaw-amazon-product-intelligence.json` | CoreClaw亚马逊情报 / Amazon Intel | 亚马逊商品、价格、卖家和竞品情报 |
| `coreclaw-instagram-profile-intelligence.json` | CoreClaw小红书式账号情报 / Instagram Intel | Instagram 达人、品牌账号和合作机会分析 |

## 包含能力

- 使用 CoreClaw 官方节点完成 scraper 启动、状态轮询和结果获取。
- 使用标准 n8n 节点完善自动化：`HTTP Request`、`Code`、`Wait`、`If`、`Switch`、`Split In Batches`、`Remove Duplicates`、`Aggregate`、`Markdown`、`No Operation`。
- 通过 HTTP 调用大模型做商业分析。公开 JSON 使用 `YOUR_LLM_API_KEY` 占位，运行前请配置自己的密钥。
- 生成 Google Sheets、Airtable、Slack、Notion、Gmail 或 CRM 可用的数据载荷，初次导入不需要这些第三方凭证。
- 本地 n8n 工作流使用中英双语简洁名称，保持列表清晰。

## 基本用法

1. 在 n8n 中导入 JSON 工作流。
2. 在每个 CoreClaw 节点选择 CoreClaw API 凭证。
3. 修改 `Input Config / 输入配置`。
4. 手动运行并检查 `Success Summary / 成功摘要`。
5. 确认载荷字段后，再接入真实 SaaS 节点。
6. 定时工作流必须先手动验证成功后再激活。

## 商业场景

- **本地线索生成**：按关键词和城市查找商家，评分并生成 CRM 可用载荷。
- **邮箱补全**：抓取官网，提取邮箱，准备外联数据。
- **B2B 销售运营**：用 AI 判断客户画像、痛点、销售话术、风险和下一步动作。
- **口碑监控**：跟踪评论并准备 Slack、Notion、Sheets 告警载荷。
- **亚马逊商品情报**：监控搜索结果、卖家、评分、评论数和商品机会。
- **Instagram 账号情报**：分析达人、品牌账号、合作机会和账号监控信号。

## 安全说明

- 不要提交私有 CoreClaw API Key 或第三方大模型 Key。
- 公开 JSON 文件使用大模型凭证占位符。
- 生产环境建议把密钥迁移到 n8n 凭证或环境变量。
- 测试阶段保持较小的结果数量，控制成本和运行时间。

## 验证说明

这些工作流基于真实 CoreClaw API schema 生成。Google Maps、Amazon 商品、Instagram Profile scraper 在发布准备前都已用真实 CoreClaw 运行做过小样本烟测。
