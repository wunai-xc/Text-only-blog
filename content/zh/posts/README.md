# 中文文章放这里

- 一篇文章一个 `.md` 文件，slug 由文件路径决定：`hello.md` → `/zh/posts/hello/`，`notes/a.md` → `/zh/posts/notes/a/`。
- 文件第一行写 `---`（YAML）或 `+++`（TOML）开始 frontmatter，细节见 [../README.md](../README.md)。
- 本文件（`README.md`）永远不会被当成文章，下划线开头的文件同理。
- 这里**故意不放示例文章**：第一篇由你亲笔写。
- 中文排版有自动优化（中英文之间补空格、半角标点转全角），细节与开关见 [../README.md 第 9 节](../README.md)。

最省事的起手式：

```markdown
---
title: 标题
date: 2026-01-01
tags: [随笔]
---

正文。
```
