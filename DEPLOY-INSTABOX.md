# Deploy Aries AI — Instabox machine + Cloudflare (aries.ai.id)

Fork: `hardihardi/chat-agent` (Aries v0.8.8). UI sudah dibranding Aries AI, responsif
Desktop & Mobile (komponen Aries memakai theme tokens + breakpoint 768px bawaan).

## 1. Buat mesin di Instabox
```bash
npx @insforge/instabox-cli create --template universal
```
Template `universal` sudah ada Node 20 + Docker. Ukuran 4 vCPU / 8 GiB cukup
(Aries + MongoDB memakai ~2 GiB).

## 2. Jalankan stack di dalam mesin
```bash
git clone https://github.com/hardihardi/chat-agent.git aries && cd aries
cp aries.aries.yaml aries.yaml   # template sudah disiapkan di repo
# isi 3 key di .env (lihat .env.example):
#   ANTHROPIC_API_KEY=...   (Claude)
#   GOOGLE_KEY=...          (Gemini)
#   OPENAI_API_KEY=...      (ChatGPT)
#   APP_TITLE="Aries AI"
#   ALLOW_REGISTRATION=false
docker compose -f deploy-compose.yml up -d
```
Port 3080 terbuka di dalam mesin.

## 3.Expose via Instabox public port
```bash
instabox ports expose 3080
```
Ini memberi HTTPS URL publik mesin (mis. `https://3080.<machine>.instabox.app`).

## 4. Arahkan Cloudflare
- DNS `aries.ai.id` → CNAME ke URL publik Instabox (proxy ON, oranye).
- SSL/TLS mode: **Full (strict)**.
- Cegah Cloudflare 100s idle timeout saat tool/agent berjalan lama — config sudah
  set `streamKeepaliveIntervalMs` via default 25000 ms.

## 5. Fitur yang aktif setelah deploy
- **Agent Marketplace** — katalog agent, kategori, sort, filter "mine"
- **New Agent** — builder: model, instructions/prompt, tools, actions, MCP
- **Skills** — `/api/agents/v1/skills` (inline skills + files per skill)
- **Prompt** — prompt library bawaan + per-agent starters
- **Memory** — panel Memories (memori lintas percakapan per user)
- **Bookmark** — panel Bookmarks (simpan percakapan/prompt favorit)
- **File** — upload per chat & per agent (fileConfig di atas: 10 file / 50 MB)
- **MCP** — MCPBuilder + Tools marketplace (server MCP per agent)
- Provider: **Claude, Gemini, ChatGPT** (3 endpoint custom di aries.aries.yaml)

## Catatan build
- Node 20 + bun/npm; `docker compose` build ±10 menit di mesin 4 vCPU.
- `APP_TITLE=Aries AI` + judul tab sudah diganti di `client/index.html`.
