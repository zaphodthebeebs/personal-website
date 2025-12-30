const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3301;
const API_KEY = process.env.API_KEY;
const BLOG_DATA_FILE = path.join(__dirname, 'data', 'blog-posts.json');

// Validate API_KEY is set in production
if (!API_KEY && process.env.NODE_ENV === 'production') {
  console.error('FATAL: API_KEY environment variable must be set in production');
  process.exit(1);
}

// Rate limiters
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 write requests per windowMs
  message: 'Too many write requests from this IP, please try again later.'
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:3301", "https://mabus.ai"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: ['http://localhost:3300', 'https://mabus.ai', 'https://www.mabus.ai'],
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Apply rate limiting to all routes
app.use('/api/', publicLimiter);

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Authentication middleware for protected routes
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - Missing API key' });
  }

  const token = authHeader.substring(7);

  if (token !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized - Invalid API key' });
  }

  next();
};

// Helper functions
async function ensureDataFile() {
  try {
    await fs.access(BLOG_DATA_FILE);
  } catch {
    // File doesn't exist, create it with empty array
    await fs.mkdir(path.dirname(BLOG_DATA_FILE), { recursive: true });
    await fs.writeFile(BLOG_DATA_FILE, JSON.stringify([], null, 2));
  }
}

async function readBlogPosts() {
  await ensureDataFile();
  const data = await fs.readFile(BLOG_DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

async function writeBlogPosts(posts) {
  await ensureDataFile();
  await fs.writeFile(BLOG_DATA_FILE, JSON.stringify(posts, null, 2));
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET all blog posts (public)
app.get('/api/blog/posts', async (req, res) => {
  try {
    const posts = await readBlogPosts();

    // Sort by date, newest first
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Return list view (without full content)
    const postList = posts.map(post => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      excerpt: post.excerpt,
      tags: post.tags,
      readingTime: post.readingTime,
      qualityScore: post.qualityScore
    }));

    res.json({ posts: postList, count: postList.length });
  } catch (error) {
    console.error('Error reading blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// GET single blog post by slug (public)
app.get('/api/blog/posts/:slug',
  param('slug').isSlug().trim().escape(),
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }

    try {
      const posts = await readBlogPosts();
      const post = posts.find(p => p.slug === req.params.slug);

      if (!post) {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      res.json({ post });
    } catch (error) {
      console.error('Error reading blog post:', error);
      res.status(500).json({ error: 'Failed to fetch blog post' });
    }
  }
);

// POST new blog post (protected - requires API key)
app.post('/api/blog/posts',
  authenticate,
  writeLimiter,
  [
    body('slug').isSlug().trim().escape(),
    body('title').isString().trim().isLength({ min: 1, max: 500 }),
    body('content').isString().notEmpty(),
    body('excerpt').optional().isString().trim().isLength({ max: 1000 }),
    body('tags').optional().isArray(),
    body('tags.*').optional().isString().trim(),
    body('readingTime').optional().isInt({ min: 1, max: 999 }),
    body('qualityScore').optional().isFloat({ min: 0, max: 100 }),
    body('date').optional().isISO8601(),
    body('sources').optional().isArray(),
    body('sources.*.url').optional().isURL(),
    body('sources.*.title').optional().isString().trim()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    try {
      const {
        slug,
        title,
        date,
        excerpt,
        tags,
        readingTime,
        qualityScore,
        content,
        sources,
        editorNotes
      } = req.body;

      const posts = await readBlogPosts();

      // Check if slug already exists
      const existingIndex = posts.findIndex(p => p.slug === slug);

      // Sanitize HTML content to prevent XSS
      const sanitizedContent = sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'title'],
          a: ['href', 'target', 'rel']
        },
        allowedSchemes: ['http', 'https', 'mailto'],
        allowedSchemesByTag: {
          img: ['http', 'https', 'data']
        }
      });

      const newPost = {
        slug,
        title,
        date: date || new Date().toISOString().split('T')[0],
        excerpt: excerpt || '',
        tags: tags || [],
        readingTime: readingTime || 5,
        qualityScore: qualityScore || null,
        content: sanitizedContent,
        sources: sources || [],
        editorNotes: editorNotes || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingIndex !== -1) {
        // Update existing post
        newPost.createdAt = posts[existingIndex].createdAt;
        posts[existingIndex] = newPost;
        await writeBlogPosts(posts);

        return res.json({
          message: 'Blog post updated successfully',
          post: newPost,
          updated: true
        });
      } else {
        // Add new post
        posts.push(newPost);
        await writeBlogPosts(posts);

        return res.status(201).json({
          message: 'Blog post created successfully',
          post: newPost,
          updated: false
        });
      }
    } catch (error) {
      console.error('Error creating blog post:', error);
      res.status(500).json({ error: 'Failed to create blog post' });
    }
  }
);

// DELETE blog post by slug (protected - requires API key)
app.delete('/api/blog/posts/:slug',
  authenticate,
  writeLimiter,
  param('slug').isSlug().trim().escape(),
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }

    try {
      const posts = await readBlogPosts();
      const postIndex = posts.findIndex(p => p.slug === req.params.slug);

      if (postIndex === -1) {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      const deletedPost = posts.splice(postIndex, 1)[0];
      await writeBlogPosts(posts);

      res.json({
        message: 'Blog post deleted successfully',
        post: deletedPost
      });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ error: 'Failed to delete blog post' });
    }
  }
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Blog API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Data file: ${BLOG_DATA_FILE}`);
  ensureDataFile().then(() => {
    console.log('Data file ready');
  });
});
