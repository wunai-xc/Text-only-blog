# English posts go here

- One post per `.md` file. The slug comes from the path: `hello.md` → `/en/posts/hello/`, `notes/a.md` → `/en/posts/notes/a/`.
- Start the file with `---` (YAML) or `+++` (TOML) frontmatter — see [../README.md](../README.md) (Chinese).
- This file (`README.md`) is never treated as a post, and so are files starting with `_`.
- No sample posts on purpose: write your own first one.
- CJK typography is fixed up at render time (spaces between CJK and Latin, halfwidth → fullwidth punctuation) — see [../README.md](../README.md) section 9.

Minimal start:

```markdown
---
title: Title
date: 2026-01-01
tags: [notes]
---

Body.
```
