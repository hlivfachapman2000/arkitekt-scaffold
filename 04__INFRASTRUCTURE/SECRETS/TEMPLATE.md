# 🔐 SECRETS TEMPLATE — Arkitekt Scaffold v3.1

This file documents **every** secret variable the scaffold expects.
It is the single source of truth for:
- `.env.example` (committed)
- `validate.sh` (checks)
- `.env.age` (encrypted live values)

## Variable Catalog

### Project Identity
| Variable | Required | Format | Example | Description |
|----------|----------|--------|---------|-------------|
| `ARKITEKT_PROJECT_NAME` | Yes | string | `MyApp` | Project identifier |
| `ARKITEKT_ENVIRONMENT` | Yes | dev\|staging\|prod | `development` | Runtime environment |

### AI / LLM Providers
| Variable | Required | Format | Example | Description |
|----------|----------|--------|---------|-------------|
| `OPENAI_API_KEY` | Conditional | `sk-...` | `sk-abc123...` | OpenAI (Codex, GPT) |
| `ANTHROPIC_API_KEY` | Conditional | `sk-ant-...` | `sk-ant-api03-...` | Anthropic (Claude) |
| `GOOGLE_API_KEY` | Conditional | string | `AIza...` | Google (Gemini) |
| `MOONSHOT_API_KEY` | Conditional | string | `sk-...` | Moonshot (Kimi) |
| `GROQ_API_KEY` | Conditional | `gsk_...` | `gsk_abc...` | Groq inference |

> **Note:** At least one LLM provider key is required. Fill all that you use. Unused keys may be left empty.

### Vector Database
| Variable | Required | Format | Example | Description |
|----------|----------|--------|---------|-------------|
| `QDRANT_URL` | Yes | URL | `http://localhost:6333` | Qdrant REST endpoint |
| `QDRANT_API_KEY` | No | string | `...` | Only if Qdrant is secured |

### Structured Memory
| Variable | Required | Format | Example | Description |
|----------|----------|--------|---------|-------------|
| `SQLITE_DB_PATH` | Yes | path | `07__MEMORY_SYSTEM/SQLITE/agent_state.db` | Agent memory SQLite file |

### Context Database (Optional)
| Variable | Required | Format | Example | Description |
|----------|----------|--------|---------|-------------|
| `OPENVIKING_HOST` | No | host | `localhost` | OpenViking server host |
| `OPENVIKING_PORT` | No | port | `7474` | OpenViking server port |
| `OPENVIKING_API_KEY` | No | string | `...` | OpenViking auth token |

### Web Crawl
| Variable | Required | Format | Example | Description |
|----------|----------|--------|---------|-------------|
| `TINYFISH_API_KEY` | No | string | `...` | TinyFish web agent |
| `FIRECRAWL_API_KEY` | No | string | `...` | Firecrawl scraper |

### Prompt Testing (Optional)
| Variable | Required | Format | Example | Description |
|----------|----------|--------|---------|-------------|
| `PROMPTFOO_API_KEY` | No | string | `...` | PromptFoo cloud sharing |

### Alerts / Webhooks
| Variable | Required | Format | Example | Description |
|----------|----------|--------|---------|-------------|
| `ALERT_WEBHOOK_URL` | No | URL | `https://hooks.slack.com/...` | Budget overrun alerts |

### Git / GitHub
| Variable | Required | Format | Example | Description |
|----------|----------|--------|---------|-------------|
| `GITHUB_TOKEN` | No | `ghp_...` | `ghp_abc...` | GitHub CLI / API access |
| `GITHUB_USERNAME` | No | string | `arkitekt` | Your GitHub handle |

### SSH / Signing
| Variable | Required | Format | Example | Description |
|----------|----------|--------|---------|-------------|
| `SSH_KEY_PATH` | No | path | `~/.ssh/id_ed25519` | Default SSH key |
| `GPG_SIGNING_KEY` | No | fingerprint | `A1B2C3D4...` | Git commit signing |

### Container Registry
| Variable | Required | Format | Example | Description |
|----------|----------|--------|---------|-------------|
| `DOCKER_REGISTRY_URL` | No | URL | `ghcr.io` | Registry host |
| `DOCKER_REGISTRY_USER` | No | string | `arkitekt` | Registry username |
| `DOCKER_REGISTRY_PASS` | No | string | `...` | Registry password / token |

### Cloud Providers (Optional)
| Variable | Required | Format | Example | Description |
|----------|----------|--------|---------|-------------|
| `AWS_ACCESS_KEY_ID` | No | `AKIA...` | `AKIAIOS...` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | No | string | `...` | AWS secret key |
| `AWS_REGION` | No | region | `us-east-1` | AWS default region |
| `AZURE_SUBSCRIPTION_ID` | No | UUID | `...` | Azure subscription |
| `GCP_PROJECT_ID` | No | string | `my-project-123` | GCP project |

### Databases (for backend projects)
| Variable | Required | Format | Example | Description |
|----------|----------|--------|---------|-------------|
| `DATABASE_URL` | No | connection string | `postgres://...` | Primary DB |
| `POSTGRES_URL` | No | connection string | `postgres://...` | PostgreSQL specific |
| `REDIS_URL` | No | URL | `redis://localhost:6379` | Redis cache |
| `MONGODB_URI` | No | URI | `mongodb://...` | MongoDB |

### Monitoring
| Variable | Required | Format | Example | Description |
|----------|----------|--------|---------|-------------|
| `SENTRY_DSN` | No | URL | `https://...@sentry.io/...` | Sentry error tracking |
| `DATADOG_API_KEY` | No | string | `...` | Datadog monitoring |

### Arkitekt Internal
| Variable | Required | Format | Example | Description |
|----------|----------|--------|---------|-------------|
| `AGE_PUBLIC_KEY` | Yes* | `age1...` | `age1ql3z...` | For `.env.age` encryption |
| `ARKITEKT_MASTER_SECRET` | Yes | 64+ chars | `...` | Internal crypto seed |

> `AGE_PUBLIC_KEY` is required only if using `.env.age` encryption. Skip if using a password manager.

## Validation Rules

### Strict Checks (Hard Fail)
- `ARKITEKT_PROJECT_NAME` — non-empty, <= 64 chars
- `ARKITEKT_ENVIRONMENT` — one of: `development`, `staging`, `production`, `test`
- `ARKITEKT_MASTER_SECRET` — >= 64 characters, not equal to default
- At least one of `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, `MOONSHOT_API_KEY`, `GROQ_API_KEY` — non-empty

### Soft Checks (Warning)
- API keys match known prefix patterns (`sk-`, `sk-ant-`, `gsk_`, `AIza`)
- `AGE_PUBLIC_KEY` matches `age1...` pattern if present
- `QDRANT_URL` is a valid URL if `QDRANT_API_KEY` is set
- File permissions on `.env` are `600` (owner read/write only)

### Dummy Value Detection
The following are rejected as "not configured":
- `change-me`, `CHANGE-ME`, `replace-me`
- `sk-...`, `sk-ant-...` (literal ellipsis)
- `your-key-here`, `your-api-key`, `xxx`
- `TODO`, `FIXME`, `placeholder`
- Empty strings for required variables

---
*Generated by Arkitekt Secrets Vault*
