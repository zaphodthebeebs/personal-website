# Blog Integration Guide

The blog section has been added to your personal website at mabus.ai. It's designed to work seamlessly with the n8n multi-agent blog writing system.

## What Was Added

### New Files Created

1. **`src/pages/blog/index.js`** - Blog list page component
2. **`src/pages/blog/BlogPost.js`** - Individual blog post detail page
3. **`src/pages/blog/style.css`** - Blog-specific styling

### Files Modified

1. **`src/app/routes.js`** - Added `/blog` and `/blog/:slug` routes
2. **`src/header/index.js`** - Added "Blog" link to navigation menu

## Features

### Blog List Page (`/blog`)
- Displays all blog posts in a card-based layout
- Shows metadata: date, reading time, quality score
- Displays excerpt and tags
- Cyberpunk-themed design matching the site
- Click any post to view full content

### Blog Post Detail Page (`/blog/:slug`)
- Full blog post content rendered as HTML
- Quality score display
- Sources section with links
- Editor notes (issues found, improvements made)
- Back to blog navigation
- Responsive design

## Current Setup

The blog currently has **3 sample posts** hardcoded in the components:
1. "The Future of Multi-Agent AI Systems"
2. "Building an Autonomous Blog Writing System"
3. "Local LLMs vs Cloud: The Privacy Trade-off"

These are examples to show the layout and features.

## Integrating with n8n Agents

Your n8n agents generate markdown files with frontmatter. To display them on the website, you have a few options:

### Option 1: Simple Static Approach (Recommended to Start)

**Steps:**
1. n8n Agent 5 sends markdown file to Telegram
2. You manually review the post
3. Convert markdown to the blog data format
4. Add to `src/pages/blog/index.js` in the `blogData` array
5. Add full content to `BlogPost.js` in the `blogPostsData` array
6. Rebuild and deploy: `yarn build`

**Example blog data format:**
```javascript
{
  slug: "post-url-slug",
  title: "Your Post Title",
  date: "2025-12-28",
  excerpt: "Brief summary of the post",
  tags: ["AI", "Automation"],
  readingTime: 8,
  qualityScore: 9.2
}
```

### Option 2: API-Based Approach (More Advanced)

**Steps:**
1. Store blog posts in a separate data file or database
2. Create an API endpoint to serve blog posts
3. Modify blog components to fetch data from API
4. n8n Agent 5 posts directly to your API
5. Blog updates automatically without rebuild

**Pros:** Fully automated, no manual intervention
**Cons:** Requires API setup, database, more complex

### Option 3: GitHub-Based Approach (Middle Ground)

**Steps:**
1. Store blog posts as markdown files in a `/public/blog/` directory
2. n8n Agent 5 commits markdown files to GitHub
3. Blog components fetch and parse markdown files
4. Use a markdown parser library (like `react-markdown`)
5. Rebuild/deploy via CI/CD

**Pros:** Version controlled, automated, static files
**Cons:** Requires markdown parser, CI/CD setup

## Recommended Workflow (Option 1 for Now)

1. **n8n generates blog post** → sends to Telegram
2. **You review the markdown file**
3. **Extract frontmatter data:**
   - title → `title`
   - date → `date`
   - tags → `tags`
   - excerpt → `excerpt`
   - qualityScore → `qualityScore`
4. **Convert markdown content to HTML** (use online converter or library)
5. **Add to blog data arrays** in the components
6. **Rebuild:** `cd ~/src/personal-website && yarn build`
7. **Restart pm2:** `pm2 restart mabus-website`

## Next Steps to Automate

### Quick Automation: Create a Helper Script

Create a script that:
1. Reads markdown file from Telegram download
2. Parses frontmatter
3. Converts markdown to HTML
4. Generates the JavaScript objects
5. Updates the blog component files
6. Triggers a rebuild

### Full Automation: Headless CMS

Use a headless CMS like:
- **Strapi** (self-hosted)
- **Ghost** (built for blogs)
- **Directus** (flexible)

n8n Agent 5 → Posts to CMS → React app fetches from CMS

## File Structure

```
src/pages/blog/
├── index.js          # Blog list page
├── BlogPost.js       # Individual post page
└── style.css         # Blog styles
```

## Styling

The blog uses your existing cyberpunk theme variables:
- `--primary-color` (cyan accent)
- `--bg-color` (background)
- `--text-color` (main text)
- `--text-color-2` (secondary text)

All styling is consistent with the rest of your site.

## Testing Locally

```bash
cd ~/src/personal-website
yarn start
# Visit http://localhost:3300/blog
```

## Deployment

Once you're happy with changes:

```bash
# Build
yarn build

# Restart pm2
pm2 restart mabus-website

# Visit https://mabus.ai/blog
```

## Future Enhancements

- [ ] Add pagination for blog list
- [ ] Add search/filter functionality
- [ ] Add categories in addition to tags
- [ ] Add related posts section
- [ ] Add comments system
- [ ] Add social sharing buttons
- [ ] Add RSS feed
- [ ] Connect directly to n8n for automation

## Questions?

The blog is ready to use! Start by testing the sample posts at https://mabus.ai/blog, then integrate your n8n-generated content.
