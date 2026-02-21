# Server & DNS Setup Guide

This guide outlines the steps required to configure your Namecheap DNS, initialize the production server, and set up GitHub Actions for automated deployment.

## 1. Domain & DNS Configuration (Namecheap)
Log into your Namecheap account and navigate to the Advanced DNS settings for `atgifter.com`.
Add the following `A Records` pointing to your server IP (`65.21.62.149`):

| Type | Host  | Value          | TTL       |
|------|-------|----------------|-----------|
| A    | @     | 65.21.62.149   | Automatic |
| A    | www   | 65.21.62.149   | Automatic |
| A    | api   | 65.21.62.149   | Automatic |
| A    | brands| 65.21.62.149   | Automatic |
| A    | panel | 65.21.62.149   | Automatic |

## 2. Server Initial Setup
SSH into your server (`65.21.62.149`) and perform the following initial setup:

### Install Docker & Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ensure Docker starts on boot
sudo systemctl enable docker
sudo systemctl start docker

# Add your user to the docker group
sudo usermod -aG docker $USER
```
*(Log out and log back in for the group changes to take effect)*

### Set Up Project Directory & Git
```bash
# Create directory for the app
sudo mkdir -p /opt/gifter
sudo chown -R $USER:$USER /opt/gifter

cd /opt/gifter
git init
git remote add origin https://github.com/YOUR_USERNAME/gifter.git
git fetch
git checkout main
```

### Environment Variables
Environment variables are now managed securely via [Doppler](https://doppler.com). You no longer need to manually create `.env` files on the server. The GitHub Actions pipeline will automatically fetch the latest variables during deployment.

## 3. GitHub Actions CI/CD Configuration
We have set up `.github/workflows/deploy.yml` which deploys via SSH and Doppler.
In your GitHub repository, go to **Settings > Secrets and variables > Actions > New repository secret** and add the following:

- `SERVER_IP`: `65.21.62.149`
- `SERVER_USER`: Your SSH username on the server (e.g. `ubuntu` or `root`)
- `SERVER_SSH_KEY`: The private SSH key (`~/.ssh/id_rsa` or `id_ed25519`) allowing passwordless access to the server. You must add the corresponding public key to the server's `~/.ssh/authorized_keys` file.
- `DOPPLER_TOKEN`: A Service Token generated from your Doppler project's Production environment.

Once these secrets are set and DNS propagation is complete, every push to the `main` branch will automatically pull secrets and deploy updates to the server.
