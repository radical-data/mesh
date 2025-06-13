#!/bin/bash
OUT="/var/www/mesh-home/services.json"

avahi-browse -rtp _http._tcp | awk -F';' '
$1 == "=" {
  iface = $2
  proto = $3
  name = $4
  type = $5
  domain = $6
  host = $7
  ip = $8
  port = $9

  # Only include IPv4 mesh-relevant addresses
  if (ip ~ /^127\.|^172\.|^fe80::/ || iface ~ /^(lo|docker|br-|veth)/) next

  gsub(/\\032/, " ", name)
  gsub(/"/, "\\\"", name)

  printf("{\"host\":\"%s\",\"ip\":\"%s\",\"port\":%s,\"name\":\"%s\"},\n", host, ip, port, name)
}' | sed '$ s/},$/}/' | awk 'BEGIN { print "[" } { print } END { print "]" }' > "$OUT"