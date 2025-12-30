const fs = require('fs');
const path = require('path');

const BLOG_DATA_FILE = path.join(__dirname, 'data', 'blog-posts.json');

// Read blog posts
const data = fs.readFileSync(BLOG_DATA_FILE, 'utf-8');
const posts = JSON.parse(data);

console.log(`Found ${posts.length} blog posts`);

let cleanedCount = 0;

// Clean each post
posts.forEach((post, index) => {
  let originalContent = post.content;
  let cleanedContent = originalContent;

  // Remove editor notes sections (case insensitive, multiline)
  cleanedContent = cleanedContent
    // Remove QUALITY SCORE lines
    .replace(/QUALITY SCORE:.*?<\/p>/gis, '')
    .replace(/<p>QUALITY SCORE:.*?$/gim, '')

    // Remove ISSUES FOUND sections
    .replace(/<h[1-6][^>]*>ISSUES FOUND<\/h[1-6]>[\s\S]*?(?=<h[1-6]|$)/gi, '')
    .replace(/<p>ISSUES FOUND[\s\S]*?(?=<p>IMPROVEMENTS MADE|<h|$)/gi, '')
    .replace(/ISSUES FOUND:?[\s\S]*?(?=IMPROVEMENTS MADE|FINAL|<h|$)/gi, '')

    // Remove IMPROVEMENTS MADE sections
    .replace(/<h[1-6][^>]*>IMPROVEMENTS MADE<\/h[1-6]>[\s\S]*?(?=<h[1-6]|$)/gi, '')
    .replace(/<p>IMPROVEMENTS MADE[\s\S]*?(?=<h|$)/gi, '')
    .replace(/IMPROVEMENTS MADE:?[\s\S]*?(?=FINAL|<h|$)/gi, '')

    // Remove common list patterns from editor notes
    .replace(/<ul>[\s\S]*?(?:Minor grammatical errors|Inconsistent use|Table formatting|Code block lacked|Some sentences|The post could benefit)[\s\S]*?<\/ul>/gi, '')
    .replace(/<ul>[\s\S]*?(?:Corrected hyphenation|Replaced em|Re‑formatted|Added a python|Tightened prose|Improved overall)[\s\S]*?<\/ul>/gi, '')

    // Clean up excessive whitespace and empty tags
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/<h[1-6][^>]*>\s*<\/h[1-6]>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Only update if content changed
  if (cleanedContent !== originalContent) {
    post.content = cleanedContent;
    cleanedCount++;
    console.log(`✓ Cleaned post ${index + 1}: "${post.title}"`);
  }
});

// Write back to file
fs.writeFileSync(BLOG_DATA_FILE, JSON.stringify(posts, null, 2));

console.log(`\n✅ Cleaned ${cleanedCount} out of ${posts.length} posts`);
console.log(`Updated file: ${BLOG_DATA_FILE}`);
