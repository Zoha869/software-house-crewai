import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Send, X } from 'lucide-react';

export default function FeedbackPanel({ agentName, existingFeedback, onSubmit }) {
  const [type, setType] = useState(existingFeedback?.type || 'approved');
  const [comment, setComment] = useState(existingFeedback?.comment || '');

  const handleSubmit = () => {
    if (type === 'changes' && !comment.trim()) return;
    onSubmit(type, comment.trim());
  };

  return (
    <div className="feedback-panel">
      <div className="feedback-header">
        <div className="feedback-title">
          <MessageSquare size={14} />
          <span>Your feedback on: {agentName}</span>
        </div>
      </div>

      <div className="feedback-options">
        <button
          className={`feedback-option ${type === 'approved' ? 'selected' : ''}`}
          onClick={() => setType('approved')}
        >
          <ThumbsUp size={16} />
          <span>Approve</span>
        </button>
        <button
          className={`feedback-option ${type === 'changes' ? 'selected' : ''}`}
          onClick={() => setType('changes')}
        >
          <MessageSquare size={16} />
          <span>Request Changes</span>
        </button>
      </div>

      {type === 'changes' && (
        <div className="feedback-comment">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you'd like changed..."
            rows={3}
          />
        </div>
      )}

      <div className="feedback-actions">
        <button
          className="btn-primary btn-sm"
          onClick={handleSubmit}
          disabled={type === 'changes' && !comment.trim()}
        >
          <Send size={14} />
          <span>Submit Feedback</span>
        </button>
      </div>

      <p className="feedback-note">
        {type === 'approved'
          ? 'Your approval will be shared with the next specialist in the pipeline.'
          : 'Your requested changes will be shared with the next specialist in the pipeline.'}
      </p>
    </div>
  );
}