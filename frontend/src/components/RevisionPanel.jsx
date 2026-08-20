import React, { useState } from 'react';
import { Star, RotateCcw, CheckCircle2, History, ChevronDown, ChevronUp } from 'lucide-react';

export default function RevisionPanel({
  revisionNumber,
  revisionHistory,
  approved,
  rating,
  onApprove,
  onRequestChanges,
}) {
  const [selectedRating, setSelectedRating] = useState(rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [changeText, setChangeText] = useState('');
  const [showChangeBox, setShowChangeBox] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const displayRating = hoverRating || selectedRating;

  const handleApproveClick = () => {
    if (!selectedRating) return;
    onApprove(selectedRating);
  };

  const handleRequestClick = () => {
    if (!showChangeBox) {
      setShowChangeBox(true);
      return;
    }
    if (!selectedRating || !changeText.trim()) return;
    onRequestChanges(selectedRating, changeText.trim());
    setChangeText('');
    setShowChangeBox(false);
  };

  return (
    <section className="revision-section">
      <div className="revision-header">
        <div>
          <div className="eyebrow">Client Review</div>
          <h2>How does it look?</h2>
          <p>
            Rate this round{revisionNumber > 1 ? ` (Revision ${revisionNumber})` : ''}, then approve
            it or send it back with changes — the whole team picks it up again.
          </p>
        </div>
        {revisionNumber > 1 && (
          <div className="revision-badge">
            <History size={13} />
            <span>Revision {revisionNumber}</span>
          </div>
        )}
      </div>

      {approved ? (
        <div className="revision-approved">
          <CheckCircle2 size={18} />
          <div>
            <div className="revision-approved-title">Project approved</div>
            <div className="revision-approved-sub">
              You rated this {rating} star{rating !== 1 ? 's' : ''}. Still want a tweak? Send a change
              request below and we'll pick it up as a new revision.
            </div>
          </div>
        </div>
      ) : null}

      <div className="revision-stars" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className="revision-star-btn"
            onMouseEnter={() => setHoverRating(n)}
            onClick={() => setSelectedRating(n)}
            aria-label={`Rate ${n} star${n !== 1 ? 's' : ''}`}
          >
            <Star size={22} fill={n <= displayRating ? 'currentColor' : 'none'} />
          </button>
        ))}
        {selectedRating > 0 && <span className="revision-rating-label">{selectedRating}/5</span>}
      </div>

      {showChangeBox && (
        <div className="revision-change-box">
          <textarea
            value={changeText}
            onChange={(e) => setChangeText(e.target.value)}
            placeholder="What should change? Be specific — e.g. 'the delete button should ask for confirmation first'..."
            rows={3}
          />
        </div>
      )}

      <div className="revision-actions">
        <button
          className="btn-primary btn-sm"
          onClick={handleApproveClick}
          disabled={!selectedRating}
        >
          <CheckCircle2 size={14} />
          <span>Approve Project</span>
        </button>
        <button
          className="btn-secondary btn-sm"
          onClick={handleRequestClick}
          disabled={showChangeBox && (!selectedRating || !changeText.trim())}
        >
          <RotateCcw size={14} />
          <span>{showChangeBox ? 'Send for Revision' : 'Request Changes'}</span>
        </button>
      </div>

      {revisionHistory && revisionHistory.length > 0 && (
        <div className="revision-history">
          <button className="revision-history-toggle" onClick={() => setHistoryOpen(!historyOpen)}>
            {historyOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span>Revision history ({revisionHistory.length})</span>
          </button>
          {historyOpen && (
            <div className="revision-history-list">
              {revisionHistory.map((rev, i) => (
                <div className="revision-history-item" key={i}>
                  <div className="revision-history-item-head">
                    <span>Revision {rev.revisionNumber}</span>
                    {rev.rating && (
                      <span className="revision-history-stars">
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </span>
                    )}
                  </div>
                  {rev.changeRequest && <p className="revision-history-note">{rev.changeRequest}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
