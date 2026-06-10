# CoreClaw n8n Commercial Workflow Pack

This repository contains business-ready n8n workflows built around the official CoreClaw n8n node. The pack is inspired by mature Apify workflow templates, but CoreClaw is the primary scraping and data-extraction platform.

## Workflows

| File | Local n8n Name | Use Case |
| --- | --- | --- |
| `coreclaw-gmaps-leads-simple.json` | CoreClaw地图线索 / Maps Leads | Local business lead scraping |
| `coreclaw-gmaps-leads-email-extraction-simple.json` | CoreClaw地图邮箱 / Maps Email | Website email enrichment |
| `coreclaw-gmaps-b2b-enrichment-simple.json` | CoreClaw B2B增强 / B2B Enrich | AI-assisted B2B lead enrichment |
| `coreclaw-gmaps-reviews-monitor-simple.json` | CoreClaw评论监控 / Reviews Monitor | Lightweight reputation monitoring |
| `coreclaw-gmaps-to-sheets.json` | CoreClaw表格线索 / Sheets Leads | Google Sheets-ready lead operations |
| `coreclaw-gmaps-leads-email-extraction.json` | CoreClaw外联线索 / Email Outreach | AI pitch and outreach payloads |
| `coreclaw-gmaps-airtable-email.json` | CoreClaw Airtable管道 / Airtable Pipeline | Airtable or CRM pipeline payloads |
| `coreclaw-gmaps-leads-complete-enhanced.json` | CoreClaw完整线索运营 / Lead Ops | Multi-destination lead operations |
| `coreclaw-gmaps-reviews-monitor.json` | CoreClaw口碑运营 / Reputation Ops | Slack/Notion/Sheets-ready reputation workflow |
| `coreclaw-google-maps-leads-complete-global.json` | CoreClaw全球拓客 / Global Prospecting | Global local-business prospecting |
| `coreclaw-amazon-product-intelligence.json` | CoreClaw亚马逊情报 / Amazon Intel | Amazon product, pricing, seller, and competitor intelligence |
| `coreclaw-instagram-profile-intelligence.json` | CoreClaw小红书式账号情报 / Instagram Intel | Instagram creator, brand, and partnership intelligence |

## What Is Included

- CoreClaw official node for scraper run, status polling, and result retrieval.
- Standard n8n nodes for practical automation: `HTTP Request`, `Code`, `Wait`, `If`, `Switch`, `Split In Batches`, `Remove Duplicates`, `Aggregate`, `Markdown`, and `No Operation` routing placeholders.
- AI analysis through an HTTP chat-completion endpoint. Public workflow JSON uses `YOUR_LLM_API_KEY`; configure your own key before running AI nodes.
- Destination payload preparation for Google Sheets, Airtable, Slack, Notion, Gmail, or CRM systems without requiring those credentials during first import.
- Bilingual, concise local workflow names for a clean n8n workflow list.

## Core Usage Pattern

1. Import a JSON workflow into n8n.
2. Select a CoreClaw API credential on each CoreClaw node.
3. Configure `Input Config / 输入配置`.
4. Run manually and inspect `Success Summary / 成功摘要`.
5. Connect real SaaS nodes after payload fields are confirmed.
6. Activate scheduled workflows only after a manual run succeeds.

## Commercial Scenarios

- **Local lead generation**: Find businesses by keyword and city, score leads, and create CRM-ready payloads.
- **Email enrichment**: Fetch websites, extract emails, and prepare outreach data.
- **B2B sales operations**: Use AI to identify persona, pain point, pitch, risk, and next step.
- **Reputation monitoring**: Track reviews and prepare Slack/Notion/Sheets alerts.
- **Amazon product intelligence**: Monitor product search results, seller data, rating, review count, and opportunities.
- **Instagram creator intelligence**: Analyze profiles for brand partnership, influencer discovery, and account monitoring.

## Security Notes

- Do not commit private CoreClaw API keys or third-party LLM keys.
- Public JSON files intentionally use placeholders for LLM credentials.
- Move production keys into n8n credentials or environment variables.
- Keep small limits during testing to control cost and runtime.

## Validation

The included workflows were generated from live CoreClaw API schemas. Google Maps, Amazon product, and Instagram profile scrapers were smoke-tested with real CoreClaw runs before publication preparation.
