#!/usr/bin/env bash

# check_render.sh – verifies that the Render Cloud Engine endpoint is healthy
# Usage: ./check_render.sh

URL="https://gma-lockers-engine.onrender.com/api/tenants"
TOKEN="dev-secret-key-123"

echo "Sending POST request to $URL..."

response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nombre_empresa":"TenantPrueba","cantidad_lockers":"10"}')

# Split body and code
body=$(echo "$response" | sed -n '1,$p' | sed -e 's/HTTP_CODE:.*//')
code=$(echo "$response" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)

echo "HTTP Status: $code"
if [ "$code" -ge 200 ] && [ "$code" -lt 300 ]; then
  echo "✅ Endpoint is healthy. Response body:"
  echo "$body"
else
  echo "❌ Endpoint returned error. Status code: $code"
  echo "Response body:"
  echo "$body"
fi
