import React from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col } from "react-bootstrap";
import { meta } from "../../content_option";

export const Resources = () => {
  const llmEngines = [
    {
      name: "Ollama",
      description: "Easiest setup with built-in web UI. Perfect for getting started with local LLMs.",
      url: "https://github.com/zaphodthebeebs/llm-playbook/tree/main/ollama",
      github: "https://github.com/ollama/ollama"
    },
    {
      name: "vLLM",
      description: "High-performance inference optimized for throughput. Best for production deployments.",
      url: "https://github.com/zaphodthebeebs/llm-playbook/tree/main/vllm",
      github: "https://github.com/vllm-project/vllm"
    },
    {
      name: "Text Generation Inference (TGI)",
      description: "HuggingFace ecosystem integration with excellent model support.",
      url: "https://github.com/zaphodthebeebs/llm-playbook/tree/main/tgi",
      github: "https://github.com/huggingface/text-generation-inference"
    },
    {
      name: "llama.cpp",
      description: "GGUF model support with fine-grained control. Efficient CPU inference.",
      url: "https://github.com/zaphodthebeebs/llm-playbook/tree/main/llama.cpp",
      github: "https://github.com/ggerganov/llama.cpp"
    },
    {
      name: "LocalAI",
      description: "OpenAI-compatible multi-modal capabilities. Drop-in replacement for OpenAI API.",
      url: "https://github.com/zaphodthebeebs/llm-playbook/tree/main/localai",
      github: "https://github.com/mudler/LocalAI"
    },
    {
      name: "Aphrodite Engine",
      description: "Enhanced sampling for creative writing with advanced generation features.",
      url: "https://github.com/zaphodthebeebs/llm-playbook/tree/main/aphrodite",
      github: "https://github.com/PygmalionAI/aphrodite-engine"
    },
    {
      name: "KoboldCpp",
      description: "Interactive story-writing focused interface with excellent UI.",
      url: "https://github.com/zaphodthebeebs/llm-playbook/tree/main/koboldcpp",
      github: "https://github.com/LostRuins/koboldcpp"
    }
  ];

  const additionalTools = [
    {
      name: "Stable Diffusion",
      description: "Local image generation with multiple models and LoRAs.",
      url: "https://github.com/zaphodthebeebs/llm-playbook/tree/main/stable-diffusion",
      github: "https://github.com/AUTOMATIC1111/stable-diffusion-webui"
    },
    {
      name: "n8n",
      description: "Workflow automation for AI agents and integrations.",
      url: "https://github.com/zaphodthebeebs/llm-playbook/tree/main/n8n",
      github: "https://github.com/n8n-io/n8n"
    }
  ];

  const zkProjects = [
    {
      name: "circom",
      description: "zkSnark circuit compiler for building zero-knowledge proofs.",
      github: "https://github.com/iden3/circom"
    },
    {
      name: "snarkjs",
      description: "zkSNARK implementation in JavaScript & WASM.",
      github: "https://github.com/iden3/snarkjs"
    },
    {
      name: "o1js",
      description: "TypeScript framework for zk-SNARKs and zkApps.",
      github: "https://github.com/o1-labs/o1js"
    }
  ];

  return (
    <HelmetProvider>
      <Container className="About-header resources-page">
        <Helmet>
          <meta charSet="utf-8" />
          <title>AI Resources | {meta.title}</title>
          <meta name="description" content="Curated AI resources, LLM engines, and zero-knowledge tools" />
        </Helmet>

        <Row className="mb-5 mt-3 pt-md-3">
          <Col lg="10">
            <h1 className="display-4 mb-4 glitch" data-text="AI Resources">AI Resources</h1>
            <hr className="t_border my-4 ml-0 text-left cyber-border" />
          </Col>
        </Row>

        <Row className="mb-5">
          <Col lg="10">
            <p className="resources-intro">
              A curated collection of AI tools, LLM inference engines, and zero-knowledge technologies.
              All resources are tested on i9-14900K, 128GB RAM, RTX 4090 (24GB VRAM).
            </p>

            <div className="resource-section">
              <h2>LLM Inference Engines</h2>
              <p className="section-description">
                Run large language models locally with these powerful inference engines.
                Each comes with setup guides, Docker configs, and performance benchmarks.
              </p>

              <div className="resources-grid">
                {llmEngines.map((engine, idx) => (
                  <div key={idx} className="resource-card">
                    <h3>{engine.name}</h3>
                    <p>{engine.description}</p>
                    <div className="resource-links">
                      <a href={engine.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                        Setup Guide
                      </a>
                      <a href={engine.github} target="_blank" rel="noopener noreferrer" className="resource-link">
                        GitHub →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="resource-section">
              <h2>Additional AI Tools</h2>
              <div className="resources-grid">
                {additionalTools.map((tool, idx) => (
                  <div key={idx} className="resource-card">
                    <h3>{tool.name}</h3>
                    <p>{tool.description}</p>
                    <div className="resource-links">
                      <a href={tool.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                        Setup Guide
                      </a>
                      <a href={tool.github} target="_blank" rel="noopener noreferrer" className="resource-link">
                        GitHub →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="resource-section">
              <h2>Zero-Knowledge Technologies</h2>
              <p className="section-description">
                Explore zero-knowledge proofs and zkApps with these powerful frameworks.
              </p>
              <div className="resources-grid">
                {zkProjects.map((project, idx) => (
                  <div key={idx} className="resource-card">
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <div className="resource-links">
                      <a href={project.github} target="_blank" rel="noopener noreferrer" className="resource-link">
                        GitHub →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="resource-section">
              <h2>LLM Playbook</h2>
              <p className="section-description">
                The complete guide to running LLMs locally. Includes performance comparisons,
                feature matrices, and Docker configurations for all engines.
              </p>
              <a
                href="https://github.com/zaphodthebeebs/llm-playbook"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-cyber mt-3"
              >
                View Full Playbook on GitHub
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </HelmetProvider>
  );
};
