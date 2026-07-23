#!/bin/bash
# Push PCENT repo to GitHub
# Usage: ./push-to-github.sh <your-github-username>

if [ -z "$1" ]; then
  echo "Usage: ./push-to-github.sh <github-username>"
  echo ""
  echo "Steps:"
  echo "  1. Create a new repo at https://github.com/new"
  echo "     Name: persistent-cent"
  echo "     Description: PCENT — Persistent Cent. USD0-backed vault token."
  echo "     Visibility: Public (recommended) or Private"
  echo "     DO NOT initialize with README, .gitignore, or license"
  echo ""
  echo "  2. Run this script:"
  echo "     ./push-to-github.sh your-username"
  exit 1
fi

USERNAME="$1"
REPO="persistent-cent"

echo "Pushing to github.com/$USERNAME/$REPO"
echo ""

# Commit
git add -A
git commit -m "Initial commit: PCENT token with USD0-backed vault architecture

- PersistentCent.sol: ERC20 token with presale mechanism
- PCENTVault.sol: USD0 backing vault (ERC-4626-style)
- PCENTStaking.sol: Staking with vault-backed rewards
- SubmissionVault.sol: Fee collection → vault forwarding
- Frontend: Next.js web app with presale widget
- Deploy scripts for Ethereum mainnet"

# Push
git remote add origin "https://github.com/$USERNAME/$REPO.git"
git branch -M main
git push -u origin main

echo ""
echo "Done! https://github.com/$USERNAME/$REPO"
