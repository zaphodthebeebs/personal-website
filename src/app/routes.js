import React, { lazy, Suspense } from "react";
import { Route, Routes} from "react-router-dom";
import withRouter from "../hooks/withRouter"
import { Socialicons } from "../components/socialicons";
import { CSSTransition, TransitionGroup } from "react-transition-group";

// Lazy load page components for better performance
const Home = lazy(() => import("../pages/home").then(module => ({ default: module.Home })));
const Portfolio = lazy(() => import("../pages/portfolio").then(module => ({ default: module.Portfolio })));
const About = lazy(() => import("../pages/about").then(module => ({ default: module.About })));
const Blog = lazy(() => import("../pages/blog").then(module => ({ default: module.Blog })));
const BlogPost = lazy(() => import("../pages/blog/BlogPost").then(module => ({ default: module.BlogPost })));
const Resources = lazy(() => import("../pages/resources").then(module => ({ default: module.Resources })));

const AnimatedRoutes = withRouter(({ location }) => (
  <TransitionGroup>
    <CSSTransition
      key={location.key}
      timeout={{
        enter: 400,
        exit: 400,
      }}
      classNames="page"
      unmountOnExit
    >
      <Suspense fallback={
        <div className="cyber-loader" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}></div>
      }>
        <Routes location={location}>
          <Route exact path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </CSSTransition>
  </TransitionGroup>
));

function AppRoutes() {
  return (
    <div className="s_c">
      <AnimatedRoutes />
      <Socialicons />
    </div>
  );
}

export default AppRoutes;
