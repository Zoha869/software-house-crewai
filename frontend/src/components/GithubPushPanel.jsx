import React, { useState } from 'react';
import { Github, Loader2, CheckCircle2, AlertCircle, ExternalLink, Lock, RotateCcw } from 'lucide-react';

function slugify(text) {
  return (text || 'crewai-project')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'crewai-project';
}

export default function GithubPushPanel({ apiBase, files, projectName }) {
  const [token, setToken] = useState('');
  const [repoName, setRepoName] = useState(() => slugify(projectName));
  const [isPrivate, setIsPrivate] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null);

  const hasFiles = files && files.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim() || !repoName.trim() || !hasFiles) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const response = await fetch(`${apiBase}/api/push-to-github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github_token: token,
          repo_name: repoName.trim(),
          private: isPrivate,
          files: files.map((f) => ({ path: f.path, code: f.code })),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || `Server returned status ${response.status}`);
      }

      setResult(data);
      setStatus('success');
      setToken(''); // token ab kaam ka nahi raha, memory se hata dete hain
    } catch (err) {
      setErrorMsg(err.message || 'Push failed — try again.');
      setStatus('error');
    }
  };

  const handlePushAgain = () => {
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
  };

  if (status === 'success' && result) {
    return (
      <div className="github-push-panel">
        <div className="github-push-success">
          <CheckCircle2 size={20} />
          <div>
            <div className="github-push-success-title">Pushed to GitHub</div>
            <div className="github-push-success-sub">
              <a href={result.repo_url} target="_blank" rel="noopener noreferrer">
                {result.repo_url} <ExternalLink size={12} />
              </a>
            </div>
            {result.pushed?.length > 0 && (
              <div className="github-push-file-list">
                {result.pushed.length} file{result.pushed.length !== 1 ? 's' : ''}: {result.pushed.join(', ')}
              </div>
            )}
            {result.failed?.length > 0 && (
              <div className="github-push-error" style={{ marginTop: '8px' }}>
                <AlertCircle size={14} />
                <span>{result.failed.length} file(s) failed to push.</span>
              </div>
            )}
          </div>
        </div>
        <button className="btn-secondary btn-sm" onClick={handlePushAgain} style={{ marginTop: '14px' }}>
          <RotateCcw size={13} />
          <span>Push again / different repo</span>
        </button>
      </div>
    );
  }

  return (
    <div className="github-push-panel">
      <form className="github-push-form" onSubmit={handleSubmit}>
        <div className="github-push-field">
          <label htmlFor="gh-token">
            <Lock size={12} /> GitHub Personal Access Token
          </label>
          <input
            id="gh-token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            autoComplete="off"
            required
          />
        </div>

        <div className="github-push-field">
          <label htmlFor="gh-repo">Repository name</label>
          <input
            id="gh-repo"
            type="text"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            placeholder="my-crewai-project"
            required
          />
        </div>

        <label className="github-push-checkbox">
          <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
          <span>Make repository private</span>
        </label>

        {status === 'error' && (
          <div className="github-push-error">
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {!hasFiles && (
          <p className="github-push-hint">
            Developer agent ke output mein koi code file detect nahi hui — push karne ke liye kuch nahi hai.
          </p>
        )}

        <button
          type="submit"
          className="btn-primary btn-sm"
          disabled={status === 'loading' || !hasFiles}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="spin" size={14} />
              <span>Pushing...</span>
            </>
          ) : (
            <>
              <Github size={14} />
              <span>Push to GitHub</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
