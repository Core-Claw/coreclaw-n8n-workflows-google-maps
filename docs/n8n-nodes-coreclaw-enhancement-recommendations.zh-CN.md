# n8n-nodes-coreclaw 节点改造建议

本文面向 `n8n-nodes-coreclaw` 后续迭代。目标不是把所有复杂逻辑塞进工作流模板，而是把高频、易错、应标准化的能力下沉到节点里，让公开模板更短、更稳、更适合普通 n8n 用户使用。

## 当前核心不足

1. 缺少一体化的 **Run and Wait** 操作。

   当前工作流必须用 `Run -> Wait -> Get -> If` 组合做轮询。这样可以工作，但模板会变长，用户也更容易改错分支。建议在节点中新增 `Scraper: Run and Wait` 或 `Run: Wait for Completion`，由节点内部处理轮询间隔、最大次数、终态判断和超时输出。

2. `Scraper Run` 对 `customParams` 仍然要求用户手写 JSON。

   这对开发者可以接受，但对模板用户不友好。建议在 `Get Details` 之后提供 schema-aware 表单生成、常见 scraper 的参数助手，或至少提供 JSON schema 校验与错误提示。

3. 缺少可复用的动态版本绑定。

   正确做法是每次先调用 `Get Details` 获取当前 `version`，再传给 `Run`。这个规则目前只能靠文档和模板约束。建议给 `Run` 增加一个选项：`Resolve latest version automatically`，内部先查 detail 再运行。

4. 错误输出不够结构化。

   当前错误主要依赖 n8n 节点异常和 CoreClaw API 原始信息。建议统一输出 `{ code, message, details, run_slug, retryable }`，方便 n8n 分支判断和用户排障。

5. 导出参数命名容易误用。

   已验证导出应使用 `format = csv|json`，不是 `type = csv`。建议 UI 帮助文本明确说明 API 字段映射，并对空/非法格式给出前置校验。

6. 缺少代理/网络诊断能力。

   节点不应把代理写进工作流，但可以提供 `Account: Connectivity Test` 或 credential test 增强，明确区分 API key 错误、DNS/TLS/代理错误、CoreClaw 服务错误。

7. README 和包内文案需要编码与语言清理。

   当前本地安装版本里曾出现编码/文案可读性问题。公开发布前应保证 README、参数描述、错误信息均为干净英文；中文说明可以放入独立 `README_CN.md`，不要混在主 README 中。

## 建议优先级

### P0: 发布阻塞项

- 修复 README、package metadata、节点描述中的编码问题。
- 明确 `exportResults` 使用 `format` 参数。
- 增强 credential test 错误信息，区分未填 key、401、网络失败。
- 补齐最小端到端测试：`getDetails -> run -> get -> getResults -> exportResults -> getLogs`。

### P1: 让模板显著变短

- 新增 `Run and Wait` 操作，支持：
  - `pollIntervalSeconds`
  - `maxPollAttempts`
  - `timeoutSeconds`
  - `successStatus`
  - `failureStatus`
  - `includeLogsOnFailure`
  - `includeResultPreview`
- 新增 `Resolve latest version automatically`。
- 为 `getResults` 和 `exportResults` 输出稳定字段，例如 `items`, `count`, `headers`, `download_url`。

### P2: 降低普通用户配置成本

- 根据 scraper detail schema 动态渲染参数表单。
- 对 Google Maps 等高频 scraper 提供预设参数组件。
- 增加参数校验：必填字段、数字范围、boolean 类型、数组字段结构。
- 增加 cost/usage 预估或至少把 CoreClaw 返回的 usage 统一透出。

### P3: 运营与社区发布

- 使用 `@n8n/node-cli` 或 n8n 推荐结构重新整理仓库。
- 加入 community node lint 和 CI。
- 使用 GitHub Actions 发布 npm 包并带 provenance。
- 准备 n8n verified community node 所需的英文 README、UX 文案、截图和测试说明。

## 对当前 GitHub 工作流模板的影响

在节点能力增强前，当前 GitHub 模板采用保守实现：

- 不写入任何 credential。
- 每次执行先读取 scraper detail。
- 从 detail 中动态取 `version`。
- 用固定 6 次轮询模拟 `Run and Wait`。
- 用成功、失败、超时三条分支保证可解释性。
- 不把中国内地本地代理写进工作流 JSON。

等节点提供原生 `Run and Wait` 后，可以把 Complete 模板从几十个节点压缩到大约 8 到 12 个节点，模板可读性和可维护性都会明显提升。
