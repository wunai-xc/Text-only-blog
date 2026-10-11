# User Instruction Memory

This file records user instructions, preferences, and teachings for reference in future interactions.

## Format

### User Instruction Entry
User instruction entries should follow this format:

[User Instruction Summary]
- Date: [YYYY-MM-DD]
- Context: [Mentioned scenario or time]
- Instructions:
  - [Content of user teaching or instruction, described line by line]

### Project Knowledge Entry
Entries discovered by the Agent during task execution should follow this format:

[Project Knowledge Summary]
- Date: [YYYY-MM-DD]
- Context: Discovered by Agent while performing [specific task description]
- Category: [Operations & Deployment|Build Methods|Testing Methods|Troubleshooting & Debugging|Workflow & Collaboration|Environment Configuration]
- Instructions:
  - [Specific knowledge points, described line by line]

## Deduplication Strategy
- Before adding a new entry, check for similar or identical instructions.
- If a duplicate is found, skip the new entry or merge it with the existing one.
- When merging, update the context or date information.
- This helps avoid redundant entries and keeps the memory file tidy.

## Entries

[User Instruction Summary]
- Date: 2026-10-11
- Context: 修改博客内容（如修复文章图片路径）后，Agent 尝试本地 `npm run build` 验证，用户要求停止。
- Instructions:
  - 不要在本机执行构建或构建验证（不使用 `npm run build`、`next build` 等做验证）。
  - 项目构建由用户在 Cloudflare 上完成。
  - 改完内容后直接 `git add` + `commit` + `push` 即可。

[Project Knowledge Summary]
- Date: 2026-10-11
- Context: Discovered by Agent while fixing broken images in a new post.
- Category: Troubleshooting & Debugging
- Instructions:
  - 本仓库为 Next.js 静态站点，构建部署在 Cloudflare 上完成，本地无需也不能作为验证手段。
  - 文章图片统一按仓库目录书写 `/public/xxx.png`；渲染管线（lib/markdown.ts 的 `rehypePublicAssets`）会在渲染时自动去掉 `/public` 前缀，因为 `public/` 实际映射到站点根路径。
