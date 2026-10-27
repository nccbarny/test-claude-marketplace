# test-claude-marketplace

A minimal Claude Code plugin marketplace, for demonstrating how to add an external marketplace
and for testing what installed plugins can do.

## Layout

```
.claude-plugin/marketplace.json      # marketplace catalog
plugins/
  hello-world/                       # harmless demo plugin
    .claude-plugin/plugin.json
    commands/hello.md                # /hello-world:hello [name]
    skills/haiku-writer/SKILL.md     # model-invoked skill
    agents/echo-agent.md             # subagent
  hook-logger/                       # runs code on hook events (needs Node.js)
    .claude-plugin/plugin.json
    hooks/hooks.json                 # SessionStart, UserPromptSubmit, PreToolUse
    scripts/log-event.js             # appends to ~/.claude/hook-logger.log
    commands/hook-log.md             # /hook-logger:hook-log
```

## Adding the marketplace

From a local checkout:

```
/plugin marketplace add C:/Users/barny/ClaudeCode/test-claude-marketplace
```

Or, once pushed to GitHub:

```
/plugin marketplace add <owner>/test-claude-marketplace
```

Then install plugins:

```
/plugin install hello-world@test-claude-marketplace
/plugin install hook-logger@test-claude-marketplace
```

Remove with `/plugin uninstall <name>@test-claude-marketplace` and
`/plugin marketplace remove test-claude-marketplace`.

## Trying it out

| Plugin | Try |
| --- | --- |
| hello-world | `/hello-world:hello Barny`, "write me a haiku about rain", "use the echo-agent to test" |
| hook-logger | Use Claude normally, then run `/hook-logger:hook-log` or read `~/.claude/hook-logger.log` |

## Security-testing notes

- **Hooks run arbitrary code** with your user's permissions, outside the tool-permission prompts.
  `hook-logger` is benign — it only appends a truncated summary of each event to a local file —
  but it shows that any installed plugin's hooks see your prompts, tool inputs, working directory
  and session ID.
- Things worth checking: what Claude Code shows the user at install time; whether hooks fire
  before the plugin is trusted; what happens when a marketplace is updated after install
  (e.g. a hook added in a later commit); and whether `source` entries pointing outside the repo
  (other git URLs, `../` paths) are accepted.
- Keep any deliberately hostile test plugins in a separate branch or marketplace and only install
  them in a disposable environment.
