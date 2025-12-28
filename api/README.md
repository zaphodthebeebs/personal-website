# Mabus.ai Blog API

REST API for autonomous blog post management. Powers the blog section of mabus.ai.

## Quick Start

```bash
# Install dependencies
npm install

# Create .env file (see .env.example)
cp .env.example .env
# Edit .env and add your API_KEY

# Run in development
npm run dev

# Run in production
npm start

# Or use pm2
pm2 start server.js --name blog-api
```

## API Endpoints

### Public (No Auth)

- `GET /health` - Health check
- `GET /api/blog/posts` - List all posts (metadata only)
- `GET /api/blog/posts/:slug` - Get single post (full content)

### Protected (Requires API Key)

- `POST /api/blog/posts` - Create/update post
- `DELETE /api/blog/posts/:slug` - Delete post

**Authentication:**
```
Authorization: Bearer YOUR_API_KEY
```

## Data Storage

Posts are stored in `data/blog-posts.json` as a JSON array.

**Post Schema:**
```json
{
  "slug": "string (unique)",
  "title": "string",
  "date": "YYYY-MM-DD",
  "excerpt": "string",
  "tags": ["string"],
  "readingTime": number,
  "qualityScore": number,
  "content": "HTML string",
  "sources": [{"title": "string", "url": "string"}],
  "editorNotes": {
    "issuesFound": ["string"],
    "improvements": ["string"]
  },
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

## Environment Variables

- `PORT` - Server port (default: 3301)
- `API_KEY` - Secret key for protected endpoints
- `NODE_ENV` - Environment (development/production)

## Integration with n8n

The n8n Agent 5 (Publisher) posts blog content to this API after:
1. Topic discovery
2. Research
3. Writing
4. Editing

See `DEPLOYMENT-GUIDE.md` for full setup instructions.

## Security

- Helmet.js for security headers
- CORS configured for mabus.ai domains
- API key authentication
- Input validation
- Rate limiting recommended for production

## Development

```bash
# Watch mode with auto-reload
npm run dev

# Test endpoints
curl http://localhost:3301/health
curl http://localhost:3301/api/blog/posts
```

## Production Deployment

See `DEPLOYMENT-GUIDE.md` for complete deployment instructions.

**Quick steps:**
1. Set environment variables
2. Run with pm2
3. Configure Caddy reverse proxy
4. Set up n8n webhook integration

## Monitoring

```bash
# Check logs
pm2 logs blog-api

# Check status
pm2 status blog-api

# View data file
cat data/blog-posts.json | jq
```

## Backup

```bash
# Backup posts
cp data/blog-posts.json backups/blog-posts-$(date +%Y%m%d).json
```

## License

MIT
