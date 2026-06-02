import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workflowsDir = resolve(root, 'workflows');

mkdirSync(workflowsDir, { recursive: true });

const GOOGLE_MAPS_KEYWORD_SCRAPER = '01KPD6M5YQADCQKGVKPDZVYC63';
const GOOGLE_MAPS_KEYWORD_NAME = 'Google Map Details By Keyword';
const MAX_POLL_ATTEMPTS = 6;

function node({
  id,
  name,
  type,
  typeVersion,
  position,
  parameters = {},
  extra = {},
}) {
  return {
    parameters,
    id,
    name,
    type,
    typeVersion,
    position,
    ...extra,
  };
}

function coreClawNode({ id, name, position, parameters, extra = {} }) {
  return node({
    id,
    name,
    type: 'n8n-nodes-coreclaw.coreClaw',
    typeVersion: 1,
    position,
    parameters,
    extra: {
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 5000,
      notesInFlow: true,
      notes: 'Select your own CoreClaw API credential after importing this workflow.',
      ...extra,
    },
  });
}

function stickyNote({ id, name, position, width, height, content }) {
  return node({
    id,
    name,
    type: 'n8n-nodes-base.stickyNote',
    typeVersion: 1,
    position,
    parameters: {
      content,
      width,
      height,
    },
  });
}

function campaignConfigNode(position) {
  return node({
    id: 'campaign-config',
    name: 'Campaign Config',
    type: 'n8n-nodes-base.set',
    typeVersion: 3.4,
    position,
    parameters: {
      assignments: {
        assignments: [
          { id: 'keyword', name: 'keyword', value: 'coffee shop', type: 'string' },
          { id: 'base_location', name: 'base_location', value: 'New York, USA', type: 'string' },
          { id: 'max_results', name: 'max_results', value: 5, type: 'number' },
          { id: 'lang', name: 'lang', value: 'en-US', type: 'string' },
          { id: 'fetch_reviews', name: 'fetch_reviews', value: false, type: 'boolean' },
          { id: 'fetch_social_info', name: 'fetch_social_info', value: false, type: 'boolean' },
          { id: 'max_reviews_per_place', name: 'max_reviews_per_place', value: 5, type: 'number' },
          { id: 'result_limit', name: 'result_limit', value: 20, type: 'number' },
          { id: 'max_results_hard_limit', name: 'max_results_hard_limit', value: 100, type: 'number' },
          { id: 'wait_seconds', name: 'wait_seconds', value: 30, type: 'number' },
          { id: 'cpus', name: 'cpus', value: 1, type: 'number' },
          { id: 'memory', name: 'memory', value: 4096, type: 'number' },
          { id: 'execute_limit_time_seconds', name: 'execute_limit_time_seconds', value: 900, type: 'number' },
          { id: 'max_total_charge', name: 'max_total_charge', value: 0, type: 'number' },
          { id: 'max_total_traffic', name: 'max_total_traffic', value: 0, type: 'number' },
          {
            id: 'export_filter_keys',
            name: 'export_filter_keys',
            value: 'title,address,phone,website,review_rating,review_count,primary_category,url',
            type: 'string',
          },
        ],
      },
      options: {},
    },
  });
}

function manualTrigger(position, name = 'Manual Trigger', id = 'manual-trigger') {
  return node({
    id,
    name,
    type: 'n8n-nodes-base.manualTrigger',
    typeVersion: 1,
    position,
    parameters: {},
  });
}

function getScraperDetails(position) {
  return coreClawNode({
    id: 'get-scraper-details',
    name: 'Get Current Scraper Details',
    position,
    parameters: {
      resource: 'scraper',
      operation: 'getDetails',
      scraperSlug: {
        __rl: true,
        mode: 'id',
        value: GOOGLE_MAPS_KEYWORD_SCRAPER,
        cachedResultName: GOOGLE_MAPS_KEYWORD_NAME,
      },
    },
  });
}

function buildRunParameters(position) {
  return node({
    id: 'build-run-parameters',
    name: 'Build Run Parameters',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position,
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `
const detail = $input.all()[0]?.json ?? {};
const cfg = $node["Campaign Config"].json;

const version = detail.version;
if (!version) {
  throw new Error("CoreClaw scraper detail did not include a version. Re-check the scraper slug or API response.");
}

const keyword = String(cfg.keyword ?? "").trim();
const baseLocation = String(cfg.base_location ?? "").trim();
if (!keyword) throw new Error("keyword is required.");
if (!baseLocation) throw new Error("base_location is required.");

const hardLimit = Math.max(1, Number(cfg.max_results_hard_limit || 100));
const maxResults = Math.min(Math.max(1, Number(cfg.max_results || 5)), hardLimit);
const fetchReviews = Boolean(cfg.fetch_reviews);
const fetchSocialInfo = Boolean(cfg.fetch_social_info);

return [{
  json: {
    scraper_slug: "${GOOGLE_MAPS_KEYWORD_SCRAPER}",
    scraper_title: "${GOOGLE_MAPS_KEYWORD_NAME}",
    version,
    keyword,
    base_location: baseLocation,
    max_results: maxResults,
    result_limit: Math.max(1, Number(cfg.result_limit || maxResults || 20)),
    wait_seconds: Math.max(5, Number(cfg.wait_seconds || 30)),
    max_poll_attempts: ${MAX_POLL_ATTEMPTS},
    export_filter_keys: String(cfg.export_filter_keys || "title,address,phone,website,review_rating,review_count,primary_category,url"),
    customParams: JSON.stringify({
      url: [{
        lang: String(cfg.lang || "en-US"),
        keyword,
        max_results: maxResults,
        base_location: baseLocation,
        fetch_reviews: fetchReviews,
        fetch_social_info: fetchSocialInfo,
        max_reviews_per_place: Math.max(0, Number(cfg.max_reviews_per_place || 0)),
      }],
    }),
    systemParams: JSON.stringify({
      cpus: Math.max(1, Number(cfg.cpus || 1)),
      memory: Math.max(1024, Number(cfg.memory || 4096)),
      execute_limit_time_seconds: Math.max(60, Number(cfg.execute_limit_time_seconds || 900)),
      max_total_charge: Math.max(0, Number(cfg.max_total_charge || 0)),
      max_total_traffic: Math.max(0, Number(cfg.max_total_traffic || 0)),
    }),
  },
}];
`.trim(),
    },
  });
}

function startRun(position) {
  return coreClawNode({
    id: 'start-coreclaw-run',
    name: 'Start CoreClaw Run',
    position,
    parameters: {
      resource: 'scraper',
      operation: 'run',
      scraperSlug: {
        __rl: true,
        mode: 'id',
        value: GOOGLE_MAPS_KEYWORD_SCRAPER,
        cachedResultName: GOOGLE_MAPS_KEYWORD_NAME,
      },
      version: '={{ $json.version }}',
      customParams: '={{ $json.customParams }}',
      additionalFields: {
        systemParams: '={{ $json.systemParams }}',
      },
    },
  });
}

function waitNode(index, position) {
  return node({
    id: `wait-before-poll-${index}`,
    name: `Wait Before Poll ${index}`,
    type: 'n8n-nodes-base.wait',
    typeVersion: 1.1,
    position,
    parameters: {
      resume: 'timeInterval',
      amount: '={{ Number($node["Build Run Parameters"].json.wait_seconds || 30) }}',
      unit: 'seconds',
    },
  });
}

function getRunStatus(index, position) {
  return coreClawNode({
    id: `get-run-status-${index}`,
    name: `Get Run Status ${index}`,
    position,
    parameters: {
      resource: 'run',
      operation: 'get',
      runSlug: '={{ $node["Start CoreClaw Run"].json.run_slug }}',
    },
    extra: {
      continueOnFail: true,
    },
  });
}

function ifStatus(index, status, label, position) {
  return node({
    id: `if-run-${label.toLowerCase()}-${index}`,
    name: `If Run ${label} ${index}`,
    type: 'n8n-nodes-base.if',
    typeVersion: 2.2,
    position,
    parameters: {
      conditions: {
        options: {
          caseSensitive: true,
          leftValue: '',
          typeValidation: 'strict',
          version: 2,
        },
        conditions: [
          {
            id: `status-${status}-${index}`,
            leftValue: '={{ Number($json.status) }}',
            rightValue: status,
            operator: {
              type: 'number',
              operation: 'equals',
            },
          },
        ],
        combinator: 'and',
      },
      options: {},
    },
  });
}

function getResults(position) {
  return coreClawNode({
    id: 'get-run-results',
    name: 'Get Run Results',
    position,
    parameters: {
      resource: 'run',
      operation: 'getResults',
      runSlug: '={{ $node["Start CoreClaw Run"].json.run_slug }}',
      returnAll: false,
      limit: '={{ Number($node["Build Run Parameters"].json.result_limit || 20) }}',
    },
  });
}

function summarizeResults(position) {
  return node({
    id: 'summarize-results',
    name: 'Summarize Results',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position,
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `
const results = $input.all().map((item) => item.json);
const first = results[0] ?? {};
return [{
  json: {
    run_slug: $node["Start CoreClaw Run"].json.run_slug,
    result_items_returned: results.length,
    first_result_title: first.title ?? "",
    first_result_address: first.address ?? "",
    first_result_phone: first.phone ?? "",
    first_result_website: first.website ?? "",
    sample_results: results.slice(0, 3),
  },
}];
`.trim(),
    },
  });
}

function exportCsv(position) {
  return coreClawNode({
    id: 'export-csv',
    name: 'Export CSV',
    position,
    parameters: {
      resource: 'run',
      operation: 'exportResults',
      runSlug: '={{ $node["Start CoreClaw Run"].json.run_slug }}',
      format: 'csv',
      filterKeys: '={{ $node["Build Run Parameters"].json.export_filter_keys }}',
    },
  });
}

function getLogs(name, id, position) {
  return coreClawNode({
    id,
    name,
    position,
    parameters: {
      resource: 'run',
      operation: 'getLogs',
      runSlug: '={{ $node["Start CoreClaw Run"].json.run_slug }}',
    },
    extra: {
      continueOnFail: true,
    },
  });
}

function buildSummary(kind, position) {
  const isSuccess = kind === 'Success';
  const statusNodes = Array.from({ length: MAX_POLL_ATTEMPTS }, (_, i) => `Get Run Status ${i + 1}`);
  return node({
    id: `build-${kind.toLowerCase()}-summary`,
    name: `Build ${kind} Summary`,
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position,
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `
function firstJson(nodeName) {
  try {
    const items = $items(nodeName);
    return items?.[0]?.json ?? null;
  } catch (error) {
    return null;
  }
}

const status = ${JSON.stringify(statusNodes)}.map(firstJson).filter(Boolean).at(-1) ?? {};
const logs = $input.all()[0]?.json ?? {};
const runSlug = $node["Start CoreClaw Run"].json.run_slug;
const cfg = $node["Build Run Parameters"].json;
const resultSummary = firstJson("Summarize Results") ?? {};
const exportResult = firstJson("Export CSV") ?? {};

return [{
  json: {
    outcome: "${kind.toLowerCase()}",
    run_slug: runSlug,
    scraper_slug: cfg.scraper_slug,
    scraper_title: cfg.scraper_title,
    version: cfg.version,
    keyword: cfg.keyword,
    base_location: cfg.base_location,
    requested_max_results: cfg.max_results,
    run_status: status.status ?? null,
    run_error_message: status.err_msg ?? "",
    coreclaw_result_count: status.results ?? null,
    duration_seconds: status.duration ?? null,
    returned_result_items: resultSummary.result_items_returned ?? 0,
    first_result_title: resultSummary.first_result_title ?? "",
    first_result_address: resultSummary.first_result_address ?? "",
    csv_download_url: exportResult.download_url ?? "",
    logs_url: logs.all_logs_url ?? "",
    log_count: Array.isArray(logs.list) ? logs.list.length : 0,
    next_step: ${isSuccess
      ? '"Use csv_download_url or sample_results for downstream CRM, sheet, or notification steps."'
      : '"Open logs_url and inspect run_error_message before retrying with smaller max_results or longer timeout."'},
    sample_results: resultSummary.sample_results ?? [],
  },
}];
`.trim(),
    },
  });
}

function buildStarterSummary(position) {
  return node({
    id: 'build-starter-summary',
    name: 'Build Starter Summary',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position,
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `
const run = $input.all()[0]?.json ?? {};
const cfg = $node["Build Run Parameters"].json;
return [{
  json: {
    outcome: "started",
    run_slug: run.run_slug,
    scraper_slug: cfg.scraper_slug,
    scraper_title: cfg.scraper_title,
    version: cfg.version,
    keyword: cfg.keyword,
    base_location: cfg.base_location,
    requested_max_results: cfg.max_results,
    next_step: "Use Run > Get, Get Results, Export Results, or Logs with this run_slug after the run completes.",
  },
}];
`.trim(),
    },
  });
}

function connect(connections, from, to, outputIndex = 0) {
  if (!connections[from]) connections[from] = { main: [] };
  while (connections[from].main.length <= outputIndex) connections[from].main.push([]);
  connections[from].main[outputIndex].push({ node: to, type: 'main', index: 0 });
}

function workflowBase({ id, name, nodes, connections }) {
  return {
    id,
    name,
    active: false,
    nodes,
    connections,
    settings: {
      executionOrder: 'v1',
      saveManualExecutions: true,
    },
    staticData: null,
    meta: {},
    pinData: {},
    tags: [],
  };
}

function buildCompleteWorkflow() {
  const nodes = [
    stickyNote({
      id: 'note-setup',
      name: 'Setup Note',
      position: [-1060, -320],
      width: 560,
      height: 280,
      content:
        '## CoreClaw Google Maps Leads - Complete Global\\n\\n1. Install `n8n-nodes-coreclaw`.\\n2. Create a CoreClaw API credential.\\n3. Select that credential on every CoreClaw node after import.\\n4. Edit Campaign Config, then execute.\\n\\nNo API key, local path, or proxy setting is stored in this workflow.',
    }),
    manualTrigger([-980, 120]),
    campaignConfigNode([-760, 120]),
    getScraperDetails([-500, 120]),
    buildRunParameters([-260, 120]),
    startRun([0, 120]),
    getResults([1900, -340]),
    summarizeResults([2160, -340]),
    exportCsv([2420, -340]),
    getLogs('Get Success Logs', 'get-success-logs', [2680, -340]),
    buildSummary('Success', [2940, -340]),
    getLogs('Get Failure Logs', 'get-failure-logs', [1900, 240]),
    buildSummary('Failure', [2160, 240]),
    getLogs('Get Timeout Logs', 'get-timeout-logs', [1900, 520]),
    buildSummary('Timeout', [2160, 520]),
  ];

  const connections = {};
  connect(connections, 'Manual Trigger', 'Campaign Config');
  connect(connections, 'Campaign Config', 'Get Current Scraper Details');
  connect(connections, 'Get Current Scraper Details', 'Build Run Parameters');
  connect(connections, 'Build Run Parameters', 'Start CoreClaw Run');

  for (let i = 1; i <= MAX_POLL_ATTEMPTS; i += 1) {
    const y = 120 + (i - 1) * 180;
    nodes.push(waitNode(i, [260 + (i - 1) * 260, y]));
    nodes.push(getRunStatus(i, [260 + (i - 1) * 260, y + 120]));
    nodes.push(ifStatus(i, 3, 'Succeeded', [260 + (i - 1) * 260, y + 260]));
    nodes.push(ifStatus(i, 4, 'Failed', [260 + (i - 1) * 260, y + 420]));

    if (i === 1) {
      connect(connections, 'Start CoreClaw Run', 'Wait Before Poll 1');
    }
    connect(connections, `Wait Before Poll ${i}`, `Get Run Status ${i}`);
    connect(connections, `Get Run Status ${i}`, `If Run Succeeded ${i}`);
    connect(connections, `If Run Succeeded ${i}`, 'Get Run Results', 0);
    connect(connections, `If Run Succeeded ${i}`, `If Run Failed ${i}`, 1);
    connect(connections, `If Run Failed ${i}`, 'Get Failure Logs', 0);
    if (i < MAX_POLL_ATTEMPTS) {
      connect(connections, `If Run Failed ${i}`, `Wait Before Poll ${i + 1}`, 1);
    } else {
      connect(connections, `If Run Failed ${i}`, 'Get Timeout Logs', 1);
    }
  }

  connect(connections, 'Get Run Results', 'Summarize Results');
  connect(connections, 'Summarize Results', 'Export CSV');
  connect(connections, 'Export CSV', 'Get Success Logs');
  connect(connections, 'Get Success Logs', 'Build Success Summary');
  connect(connections, 'Get Failure Logs', 'Build Failure Summary');
  connect(connections, 'Get Timeout Logs', 'Build Timeout Summary');

  return workflowBase({
    id: 'coreclawGoogleMapsLeadsCompleteGlobal',
    name: 'CoreClaw Google Maps Leads Complete Global',
    nodes,
    connections,
  });
}

function buildStarterWorkflow() {
  const nodes = [
    stickyNote({
      id: 'note-starter',
      name: 'Setup Note',
      position: [-860, -260],
      width: 520,
      height: 240,
      content:
        '## CoreClaw Google Maps Leads - Starter Global\\n\\nStarts a CoreClaw Google Maps keyword run and returns `run_slug`.\\n\\nAfter import, select your own CoreClaw API credential on each CoreClaw node.',
    }),
    manualTrigger([-760, 120]),
    campaignConfigNode([-520, 120]),
    getScraperDetails([-260, 120]),
    buildRunParameters([0, 120]),
    startRun([260, 120]),
    buildStarterSummary([520, 120]),
  ];
  const connections = {};
  connect(connections, 'Manual Trigger', 'Campaign Config');
  connect(connections, 'Campaign Config', 'Get Current Scraper Details');
  connect(connections, 'Get Current Scraper Details', 'Build Run Parameters');
  connect(connections, 'Build Run Parameters', 'Start CoreClaw Run');
  connect(connections, 'Start CoreClaw Run', 'Build Starter Summary');
  return workflowBase({
    id: 'coreclawGoogleMapsLeadsStarterGlobal',
    name: 'CoreClaw Google Maps Leads Starter Global',
    nodes,
    connections,
  });
}

function writeWorkflow(filename, workflow) {
  const file = resolve(workflowsDir, filename);
  writeFileSync(file, `${JSON.stringify(workflow, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${file}`);
}

writeWorkflow('coreclaw-google-maps-leads-complete-global.json', buildCompleteWorkflow());
writeWorkflow('coreclaw-google-maps-leads-starter-global.json', buildStarterWorkflow());
