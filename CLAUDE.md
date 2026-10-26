# CLAUDE.md

## Skills

Project skills live in `.claude/skills/` and are tracked in `skills-lock.json`.

Before starting a task, check whether an installed skill covers it and use it.

If no installed skill fits the request:

1. Search the skills registry: `npx -y skills find <keywords>` (see https://skills.sh).
2. Pick the most relevant, well-maintained skill and tell the user which one and why, in one or two lines.
3. Install it for Claude Code at project level, non-interactively:
   `npx -y skills add <owner/repo> --skill <name> --agent claude-code -y`
4. Skim the installed files before using them. Skills run with full agent permissions, so flag any bundled scripts that look risky and ask before running them.
5. Commit the new `.claude/skills/<name>/` folder and the updated `skills-lock.json` so later sessions have it.

Do not install a skill when the task is a simple one-off you can handle directly.
