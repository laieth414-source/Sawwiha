#!/bin/bash
set -e
MSG="${1:-Update project from Google AI Studio: $(date)}"
git add .
if git diff --staged --quiet; then
  echo "No changes to commit."
else
  git commit -m "$MSG"
  git push origin main
  echo "Successfully pushed changes to GitHub repository!"
fi
