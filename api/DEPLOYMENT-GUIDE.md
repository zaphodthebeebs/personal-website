# Blog API Deployment Guide

Complete guide to deploying the automated blog system with API integration.

## Overview

The system consists of:
1. **React Frontend** (port 3300) - mabus.ai website
2. **Express API** (port 3301) - Blog post storage and retrieval
3. **n8n Agents** - Autonomous blog writing system
4. **Caddy** - Reverse proxy and HTTPS

## Step 1: Deploy the Blog API

### On the Server (192.168.6.56)

**1. Copy API files to server:**
```bash
# From your workspace
rsync -avz ~/informal-systems/claude-workspace/personal-website/api/ zaphod-beeblebox@192.168.6.56:~/src/personal-website/api/
```

**2. SSH into server and setup:**
```bash
ssh zaphod-beeblebox@192.168.6.56
cd ~/src/personal-website/api
```

**3. Install dependencies:**
```bash
npm install
```

**4. Create .env file:**
```bash
nano .env
```

Add:
```env
PORT=3301
API_KEY=<generate-a-secure-random-key>
NODE_ENV=production
```

To generate a secure API key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**5. Test the API:**
```bash
node server.js
```

Visit http://192.168.6.56:3301/health - should return `{"status":"ok"}`

Press Ctrl+C to stop.

**6. Start with pm2:**
```bash
pm2 start server.js --name blog-api
pm2 save
```

**7. Verify it's running:**
```bash
pm2 list
# Should show blog-api as online

curl http://localhost:3301/health
# Should return {"status":"ok","timestamp":"..."}
```

## Step 2: Update Caddyfile

**1. Edit Caddyfile:**
```bash
sudo nano /etc/caddy/Caddyfile
```

**2. Update the mabus.ai block:**

**BEFORE:**
```
mabus.ai, www.mabus.ai {
    reverse_proxy localhost:3300
}
```

**AFTER:**
```
mabus.ai, www.mabus.ai {
    # API routes (must come first!)
    handle /api/* {
        reverse_proxy localhost:3301
    }

    # Main website
    reverse_proxy localhost:3300
}
```

**3. Reload Caddy:**
```bash
sudo systemctl reload caddy
```

**4. Test API through Caddy:**
```bash
curl https://mabus.ai/api/blog/posts
# Should return {"posts":[],"count":0} if no posts yet
```

## Step 3: Update React Frontend

**1. Rebuild frontend with API integration:**
```bash
cd ~/src/personal-website
yarn build
pm2 restart mabus-website
```

**2. Test the blog page:**

Visit https://mabus.ai/blog

You should see "No blog posts yet" message (this is correct - no posts published yet).

## Step 4: Update n8n Agent 5

**1. Open n8n:**

Visit https://n8n.mabus.ai

**2. Import the new Agent 5:**

- Open the existing "Agent 5: Publisher" workflow
- Click "..." menu → "Duplicate"
- Name it "Agent 5: Publisher (API Version)"
- Delete all nodes
- Import from file: `agent-5-publisher-with-api.json`

**3. Configure environment variables in n8n:**

Go to Settings → Environment Variables and add:
- `BLOG_API_KEY`: The same key you put in the API's .env file
- `TELEGRAM_BLOG_CHAT_ID`: Your Telegram chat ID (if not already set)

**4. Update Agent 4 to call the new Agent 5:**

- Open "Agent 4: Editor/Quality"
- Find the "Call Publisher Agent" node
- Update webhook URL to point to the new Agent 5 webhook

**5. Activate the new Agent 5:**

Toggle the workflow to "Active"

## Step 5: Test End-to-End

**Option A: Manual test (recommended first)**

Send a POST request to Agent 2 with test data:

```bash
curl -X POST https://n8n.mabus.ai/webhook/agent-2-research \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Test Post: The Future of AI",
    "url": "https://example.com",
    "style": "accessible-explanation",
    "length": "short",
    "angle": "Exploring the implications of AI on society"
  }'
```

This will trigger:
1. Agent 2: Research
2. Agent 3: Writing
3. Agent 4: Editing
4. Agent 5: Publishing to API
5. Telegram notification

**Check results:**
1. Watch n8n executions
2. Check Telegram for success notification
3. Visit https://mabus.ai/blog
4. Should see your new post!

**Option B: Full automatic test**

Wait for Agent 1 to run on its schedule (daily), or:

```bash
# Manually execute Agent 1 in n8n
```

## Step 6: Verify Everything Works

**✅ Checklist:**

- [ ] Blog API running on pm2: `pm2 list | grep blog-api`
- [ ] API health check works: `curl https://mabus.ai/api/blog/posts`
- [ ] React app loads: Visit https://mabus.ai/blog
- [ ] n8n Agent 5 is active
- [ ] Environment variables set in n8n
- [ ] Telegram notifications working
- [ ] Test post published successfully
- [ ] Post visible on website

## API Endpoints Reference

### Public Endpoints (No Auth Required)

**GET /api/blog/posts**
- Returns list of all blog posts (without full content)
- Response: `{ posts: [...], count: number }`

**GET /api/blog/posts/:slug**
- Returns single blog post with full content
- Response: `{ post: {...} }`

### Protected Endpoints (Require API Key)

**POST /api/blog/posts**
- Create or update blog post
- Headers: `Authorization: Bearer YOUR_API_KEY`
- Body:
```json
{
  "slug": "post-slug",
  "title": "Post Title",
  "date": "2025-12-28",
  "excerpt": "Brief excerpt",
  "tags": ["tag1", "tag2"],
  "readingTime": 8,
  "qualityScore": 9.2,
  "content": "<html content>",
  "sources": [{"title": "...", "url": "..."}],
  "editorNotes": {"issuesFound": [...], "improvements": [...]}
}
```

**DELETE /api/blog/posts/:slug**
- Delete a blog post
- Headers: `Authorization: Bearer YOUR_API_KEY`

## Manual Blog Post Management

### Add a post manually:

```bash
curl -X POST https://mabus.ai/api/blog/posts \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "my-first-post",
    "title": "My First Blog Post",
    "date": "2025-12-28",
    "excerpt": "This is my first post using the API",
    "tags": ["test", "first"],
    "readingTime": 5,
    "qualityScore": 9,
    "content": "<h2>Hello World</h2><p>This is my first post!</p>",
    "sources": []
  }'
```

### Delete a post:

```bash
curl -X DELETE https://mabus.ai/api/blog/posts/my-first-post \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Troubleshooting

### Blog API not responding

```bash
pm2 logs blog-api
pm2 restart blog-api
```

### Posts not appearing on website

1. Check API has posts: `curl https://mabus.ai/api/blog/posts`
2. Check browser console for errors
3. Verify Caddy proxy: `sudo systemctl status caddy`

### n8n can't post to API

1. Check API key is set: n8n Settings → Environment Variables
2. Check API is accessible: `curl https://mabus.ai/api/blog/posts`
3. Check n8n execution logs for error details

### Caddy not proxying /api

1. Check Caddyfile syntax: `caddy fmt /etc/caddy/Caddyfile`
2. Reload Caddy: `sudo systemctl reload caddy`
3. Check Caddy logs: `sudo journalctl -u caddy -f`

## Monitoring

**Check API status:**
```bash
curl https://mabus.ai/health
```

**Check stored posts:**
```bash
cat ~/src/personal-website/api/data/blog-posts.json | jq
```

**Check pm2 processes:**
```bash
pm2 list
pm2 logs blog-api --lines 50
```

## Backup

**Backup blog posts:**
```bash
cp ~/src/personal-website/api/data/blog-posts.json ~/backups/blog-posts-$(date +%Y%m%d).json
```

**Restore from backup:**
```bash
cp ~/backups/blog-posts-20251228.json ~/src/personal-website/api/data/blog-posts.json
pm2 restart blog-api
```

## Security Notes

1. **API Key**: Keep it secret, rotate regularly
2. **HTTPS**: All API traffic goes through Caddy with automatic HTTPS
3. **CORS**: API only accepts requests from mabus.ai domains
4. **Rate Limiting**: Consider adding rate limiting for production
5. **Validation**: API validates all input data

## Next Steps

Once everything is working:

1. **Set up automatic backups** of blog-posts.json
2. **Add monitoring** (uptime checks for API)
3. **Configure Agent 1 schedule** to run daily
4. **Review and curate** first auto-generated posts
5. **Consider adding** features like:
   - RSS feed
   - Sitemap generation
   - Social media auto-posting
   - Analytics integration

---

**System is now fully automated!** Agent 1 will discover topics daily, and the full pipeline will automatically publish to your blog.

Enjoy your autonomous blog writing system! 🚀
