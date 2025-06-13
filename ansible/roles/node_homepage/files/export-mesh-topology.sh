#!/bin/bash

# Set a minimal PATH manually to avoid cron issues
export PATH=/usr/sbin:/usr/bin:/sbin:/bin

OUT="/var/www/mesh-home/neighbours.json"
BATCTL=$(command -v batctl)

# Check that batctl exists and is executable
if [[ -x "$BATCTL" ]]; then
    "$BATCTL" meshif bat0 originators_json > "$OUT"
else
    echo "[] (batctl not found)" > "$OUT"
fi