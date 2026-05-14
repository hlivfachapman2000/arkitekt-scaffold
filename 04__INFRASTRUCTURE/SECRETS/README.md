# 🔐 ARKITEKT SECRETS VAULT

**Cross-machine secret management for the Arkitekt scaffold.**

## Philosophy

- **`.env`** = Live secrets. Never committed. Machine-local by default.
- **`.env.example`** = Committed template. The canonical "what secrets exist" reference.
- **`.env.age`** = Encrypted bundle. Safe to commit or share via any channel.
- **`04__INFRASTRUCTURE/SECRETS/keys/`** = Per-machine `age` private keys. Never committed.

## Quick Start

### 1. First-Time Setup (on your primary machine)

```bash
# Install age if you don't have it
brew install age          # macOS
apt-get install age       # Debian/Ubuntu
# Or: https://github.com/FiloSottile/age

# Generate a key pair for this machine
mkdir -p 04__INFRASTRUCTURE/SECRETS/keys
age-keygen -o 04__INFRASTRUCTURE/SECRETS/keys/primary.key

# The public key is printed to stdout — save it in .env:
# AGE_PUBLIC_KEY=age1...

# Copy .env.example to .env and fill in your secrets
cp .env.example .env
# ... edit .env with your actual keys ...

# Encrypt .env into .env.age (safe to commit!)
./04__INFRASTRUCTURE/SECRETS/encrypt.sh
```

### 2. Adding a Second Machine

```bash
# On the NEW machine, after cloning the repo:
mkdir -p 04__INFRASTRUCTURE/SECRETS/keys
age-keygen -o 04__INFRASTRUCTURE/SECRETS/keys/primary.key

# Copy the NEW public key to your primary machine
# On PRIMARY machine, add the new public key:
./04__INFRASTRUCTURE/SECRETS/add_recipient.sh "age1...new-machine-public-key..."

# Re-encrypt .env so both machines can decrypt it
./04__INFRASTRUCTURE/SECRETS/encrypt.sh

# Push the updated .env.age
# On the NEW machine, pull and decrypt:
git pull
./04__INFRASTRUCTURE/SECRETS/decrypt.sh
```

### 3. Daily Workflow

```bash
# After editing .env:
./04__INFRASTRUCTURE/SECRETS/encrypt.sh
git add .env.age && git commit -m "Rotate API keys"

# After pulling on another machine:
git pull
./04__INFRASTRUCTURE/SECRETS/decrypt.sh
```

## Directory Layout

```
04__INFRASTRUCTURE/SECRETS/
├── README.md                 # This file
├── TEMPLATE.md               # Human-readable description of every secret
├── encrypt.sh                # Encrypt .env → .env.age
├── decrypt.sh                # Decrypt .env.age → .env
├── add_recipient.sh          # Add a new machine to the recipient list
├── remove_recipient.sh       # Revoke a machine's access
├── validate.sh               # Check all required secrets are present
├── rotate.sh                 # Rotate / regenerate all secrets
├── keys/                     # Per-machine age private keys (gitignored)
│   ├── primary.key
│   └── backup.key
├── recipients.txt            # List of authorized public keys (committed)
└── .env.age                  # Encrypted secrets bundle (committed)
```

## Security Rules

1. **Never commit `.env`** — it is gitignored globally
2. **Never commit `keys/*.key`** — these are machine-bound
3. **Do commit `recipients.txt`** — public keys are safe to share
4. **Do commit `.env.age`** — encryption is your safety net
5. **Rotate keys quarterly** — use `./04__INFRASTRUCTURE/SECRETS/rotate.sh`
6. **Revoke lost machines immediately** — use `remove_recipient.sh` and re-encrypt

## Alternative: Password Manager Sync

If `age` feels heavy, use your password manager's CLI:

```bash
# 1Password
op inject -i .env.example -o .env

# Bitwarden
bw get notes "Arkitekt Env" > .env
```

Then skip `.env.age` entirely — your password manager becomes the sync layer.

## Validation

Before running any agent or script, validate secrets:

```bash
./04__INFRASTRUCTURE/SECRETS/validate.sh
```

This checks:
- All required variables from `TEMPLATE.md` are present in `.env`
- No dummy values remain (`change-me`, `sk-...`, etc.)
- No obviously malformed keys (length, prefix checks)
- File permissions are strict (`chmod 600`)

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `age: no identity matched` | Your machine's key isn't in `recipients.txt`. Run `add_recipient.sh` on a machine that CAN decrypt. |
| `.env` not found | Run `decrypt.sh` first, or copy from `.env.example`. |
| Validation fails on optional keys | Edit `validate.sh` or set the optional variable to empty. |
| Committed `.env` by accident | Rotate ALL secrets immediately. Use `git-filter-repo` or BFG to purge from history. |

---
*Part of the Arkitekt Universal Project Scaffold v3.1*
