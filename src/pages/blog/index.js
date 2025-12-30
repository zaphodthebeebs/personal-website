import React, { useState, useEffect } from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col } from "react-bootstrap";
import { meta } from "../../content_option";
import { Link } from "react-router-dom";

export const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog/posts');

      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }

      const data = await response.json();
      // Reverse to show latest posts first
      setPosts((data.posts || []).reverse());
      setError(null);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <HelmetProvider>
      <Container className="About-header">
        <Helmet>
          <meta charSet="utf-8" />
          <title> Blog | {meta.title}</title>
          <meta name="description" content={meta.description} />
        </Helmet>
        <Row className="mb-5 mt-3 pt-md-3">
          <Col lg="8">
            <h1 className="display-4 mb-4 glitch" data-text="The Blog">The Blog</h1>
            <hr className="t_border my-4 ml-0 text-left cyber-border" />
          </Col>
        </Row>

        {loading && (
          <div className="blog-loading">
            <div className="cyber-loader"></div>
            <p>Loading posts...</p>
          </div>
        )}

        {error && (
          <div className="blog-error">
            <p>{error}</p>
            <button onClick={fetchBlogPosts} className="btn btn-cyber">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="blog-empty">
            <p>No blog posts yet. Check back soon!</p>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="mb-5 po_items_ho">
            {posts.map((data, i) => (
              <div key={i} className="po_item blog-item">
                <Link to={`/blog/${data.slug}`}>
                  <div className="content">
                    <div className="blog-meta">
                      <span className="blog-date">{data.date}</span>
                      <span className="blog-reading-time">{data.readingTime} min read</span>
                    </div>
                    <h3 className="blog-title">{data.title}</h3>
                    <p className="blog-excerpt">{data.excerpt}</p>
                    <div className="blog-tags">
                      {data.tags && data.tags.map((tag, idx) => (
                        <span key={idx} className="blog-tag">{tag}</span>
                      ))}
                    </div>
                    <div className="blog-read-more">
                      Read Article →
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Container>
    </HelmetProvider>
  );
};
