import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Users, FileText, Layers, Code2, CheckCircle2, Star, Clock, TrendingUp } from 'lucide-react';

const STAGES = [
  { icon: FileText, label: 'Analysis', desc: 'We understand your requirements and break them down clearly.', color: '#5AD1E0' },
  { icon: Layers, label: 'Architecture', desc: 'We design the structure — simple, focused, not over-built.', color: '#5AD1E0' },
  { icon: Code2, label: 'Construction', desc: 'We build clean, working code that matches your vision.', color: '#E8935B' },
  { icon: CheckCircle2, label: 'Quality Audit', desc: 'We test, secure, and polish everything before delivery.', color: '#5AD1A8' },
];

const FEATURES = [
  { icon: Zap, title: 'Live Progress', desc: 'Watch each step complete in real-time — no waiting, no guessing.' },
  { icon: ShieldCheck, title: 'Quality Assured', desc: 'Every project passes security, performance, and code quality checks.' },
  { icon: Users, title: 'Your Feedback Matters', desc: 'Approve or request changes at every step. You stay in control.' },
  { icon: TrendingUp, title: 'Transparent Process', desc: 'See exactly what happens at each stage — in plain language.' },
];

export default function LandingPage({ onStartProject, hasProjects, onViewProjects }) {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-badge">
          <Sparkles size={14} />
          <span>AI-Powered Software Studio</span>
        </div>
        <h1 className="hero-title">
          Your Software Idea,<br />
          <span className="gradient-text">Built & Delivered</span>
        </h1>
        <p className="hero-subtitle">
          Describe what you want to build. Our team of AI specialists handles everything — 
          from planning and design to development and quality checks. You watch it happen, live.
        </p>
        <div className="hero-actions">
          <button className="btn-primary hero-cta" onClick={onStartProject}>
            Start a New Project
            <ArrowRight size={18} />
          </button>
          {hasProjects && (
            <button className="btn-secondary hero-cta-secondary" onClick={onViewProjects}>
              View My Projects
            </button>
          )}
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-value">8</div>
            <div className="stat-label">Specialist Agents</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-value">4</div>
            <div className="stat-label">Quality Checks</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-value">100%</div>
            <div className="stat-label">Transparent</div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="landing-section">
        <div className="section-header">
          <div className="eyebrow">How It Works</div>
          <h2>From Idea to Delivery in 4 Simple Stages</h2>
          <p>No technical jargon. No confusion. Just a clear path from your idea to a working product.</p>
        </div>
        <div className="stages-grid">
          {STAGES.map((stage, i) => (
            <div key={stage.label} className="stage-card fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="stage-number">0{i + 1}</div>
              <div className="stage-icon" style={{ background: `${stage.color}22`, color: stage.color }}>
                <stage.icon size={22} />
              </div>
              <h3>{stage.label}</h3>
              <p>{stage.desc}</p>
              {i < STAGES.length - 1 && <div className="stage-arrow"><ArrowRight size={16} /></div>}
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-section">
        <div className="section-header">
          <div className="eyebrow">Why Choose Us</div>
          <h2>Built for Clients, Not Developers</h2>
          <p>We translate complex software development into a simple, visual experience you can follow.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((feature, i) => (
            <div key={feature.title} className="feature-card glass-panel fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="feature-icon">
                <feature.icon size={20} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial / Trust Section */}
      <section className="landing-section">
        <div className="trust-banner glass-panel">
          <div className="trust-content">
            <div className="trust-stars">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <h3>Trusted by teams who value clarity</h3>
            <p>
              "The best part? I could see exactly what was happening at every step. 
              No black box, no surprises — just clear progress and quality work."
            </p>
            <div className="trust-meta">
              <div className="trust-avatar">AK</div>
              <div>
                <div className="trust-name">Alex Kim</div>
                <div className="trust-role">Product Manager</div>
              </div>
            </div>
          </div>
          <div className="trust-cta">
            <Clock size={20} />
            <span>Average project delivery: <strong>under 10 minutes</strong></span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-section landing-cta-section">
        <div className="cta-card">
          <h2>Ready to Build Something Great?</h2>
          <p>Start your project now — it takes less than a minute to describe what you need.</p>
          <button className="btn-primary hero-cta" onClick={onStartProject}>
            Start a New Project
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}