# Oracle VM Auto-Deploy Setup

To have GitHub Actions deploy to your Oracle VM on every push to `main`:

## 1. Add repository secrets

In **GitHub → Settings → Secrets and variables → Actions**, add:

| Secret Name | Value |
|-------------|-------|
| `ORACLE_VM_HOST` | `152.70.53.27` |
| `ORACLE_VM_USER` | `ubuntu` (or your VM username) |
| `ORACLE_VM_SSH_KEY` | Your SSH private key (entire content, including `-----BEGIN ... -----`) |

## 2. Generate SSH key (if needed)

On your **local machine**:

```bash
ssh-keygen -t ed25519 -C "github-deploy" -f oracle_vm_key -N ""
```

Copy the **public** key to the VM:

```bash
ssh-copy-id -i oracle_vm_key.pub ubuntu@152.70.53.27
```

Add the **private** key (`oracle_vm_key`) content as `ORACLE_VM_SSH_KEY`.

## 3. One-time VM setup

SSH into the VM and ensure Docker is installed. Clone the repo and create `.env.prod`:

```bash
ssh ubuntu@152.70.53.27
git clone https://github.com/mr-robot77/task-manager-fullstack.git
cd task-manager-fullstack
cp deploy/oracle/.env.prod.example deploy/oracle/.env.prod
nano deploy/oracle/.env.prod   # Set APP_SECRET, DB_PASSWORD, JWT_PASSPHRASE, CORS_ALLOW_ORIGIN
```

## 4. Manual deploy (without GitHub Actions)

SSH into the VM and run:

```bash
cd task-manager-fullstack
./deploy/oracle/sync-and-deploy.sh
```
