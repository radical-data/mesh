#!/bin/bash

OUT="/var/www/mesh-home/ygg.json"
export PATH=/usr/sbin:/usr/bin:/sbin:/bin

SELF=$(yggdrasilctl -json getSelf)
PEERS=$(yggdrasilctl -json getPeers)
PATHS=$(yggdrasilctl -json getPaths)

jq -n \
  --argjson self "$SELF" \
  --argjson peers "$PEERS" \
  --argjson paths "$PATHS" \
  '{self: $self, peers: $peers.peers, paths: $paths.paths}' > "$OUT"