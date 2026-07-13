#!/bin/sh
# ═══ Eternal Nagual — one-command deploy ═══
# Usage:
#   ./deploy.sh              # build + run the agent
#   ./deploy.sh dashboard    # also build + run the dashboard on :8090
#   ./deploy.sh update       # rebuild agent image and hot-swap the container (data volume survives)
set -e

IMG=nagual:latest
NAME=nagual
VOL=nagual_data
NET=nagual_net

[ -f config.env ] || { echo "ERROR: config.env not found. cp config.env.example config.env and add at least one LLM key."; exit 1; }
grep -qE '^(NVIDIA|GOOGLE|OPENROUTER|ANTHROPIC|OPENAI|XAI|DEEPSEEK)_API_KEY=.+' config.env || {
  echo "ERROR: no LLM provider key set in config.env — the mind needs at least one brain."; exit 1; }

docker network inspect $NET >/dev/null 2>&1 || docker network create $NET
docker volume  inspect $VOL >/dev/null 2>&1 || docker volume  create $VOL

echo "── building agent image ──"
docker build -t $IMG .

if [ "$1" = "update" ] && docker ps -a --format '{{.Names}}' | grep -qx $NAME; then
  echo "── hot-swapping container (state survives on volume) ──"
  docker stop $NAME && docker rm $NAME
fi

if ! docker ps -a --format '{{.Names}}' | grep -qx $NAME; then
  echo "── starting agent ──"
  docker run -d --name $NAME \
    --network $NET \
    --restart unless-stopped \
    --memory 4g --memory-swap 8g \
    -p 127.0.0.1:8000:8000 \
    -v $VOL:/app/data \
    $IMG
else
  docker start $NAME
fi

# NOTE: port 8000 is bound to 127.0.0.1 ON PURPOSE. The agent's internal API has
# shell access to its own container. Never expose it publicly; the dashboard proxies it.

if [ "$1" = "dashboard" ]; then
  echo "── building dashboard ──"
  docker build -t nagual-dash:latest ./dashboard
  docker rm -f nagual-dash 2>/dev/null || true
  docker run -d --name nagual-dash \
    --network $NET \
    --restart unless-stopped \
    -p 8090:3000 \
    -v nagual_dash_data:/data \
    -e NAGUAL_BACKEND_URL=http://nagual:8000 \
    nagual-dash:latest
  echo "Dashboard: http://<your-host>:8090/watch"
fi

echo ""
echo "═══ Nagual is breathing ═══"
echo "  logs:   docker logs -f $NAME"
echo "  health: curl -s http://127.0.0.1:8000/api/status"
echo "  stop:   docker stop $NAME   (its memory survives on volume '$VOL')"
