# Setup

## Requirements

- Self-hosted n8n.
- `n8n-nodes-coreclaw` installed in that n8n instance.
- A CoreClaw API key.
- Network access from the n8n server to `https://openapi.coreclaw.com`.

## Install the CoreClaw Community Node

In n8n:

1. Open **Settings**.
2. Open **Community nodes**.
3. Install `n8n-nodes-coreclaw`.
4. Restart n8n if your hosting setup requires a restart for community nodes.

For command-line installations, install the package into the n8n user folder used by your instance. The exact path depends on how n8n is hosted.

## Create the Credential

Create a credential of type **CoreClaw API**:

- Base URL: `https://openapi.coreclaw.com`
- API Key: your CoreClaw API key

Do not edit the workflow JSON to store the API key. Use n8n credentials only.

## Import the Workflow

Use one of these methods:

- n8n editor menu: **Import from URL** using a raw GitHub workflow URL.
- n8n editor menu: **Import from File** after downloading the JSON file.
- n8n CLI import if you manage workflows from the command line.

After importing, open every CoreClaw node and select your credential. The workflow intentionally ships without a credential reference to avoid leaking local names or IDs.

## First Test Run

Start with the default settings:

- `keyword`: `coffee shop`
- `base_location`: `New York, USA`
- `max_results`: `5`
- `fetch_reviews`: `false`
- `fetch_social_info`: `false`

Run a small test first. Increase `max_results`, reviews, and downstream steps only after the first run returns a success summary.
