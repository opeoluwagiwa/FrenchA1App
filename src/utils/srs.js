// SM-2 Spaced Repetition Algorithm
// Adapted from SuperMemo's SM-2 algorithm

export function calculateNextReview(card, quality) {
  // quality: 0-5 (0=complete blackout, 5=perfect response)
  // Returns updated card with new interval, repetition, easeFactor, nextReview

  let { repetition = 0, interval = 0, easeFactor = 2.5 } = card;

  if (quality >= 3) {
    // Correct response
    if (repetition === 0) {
      interval = 1; // 1 day
    } else if (repetition === 1) {
      interval = 6; // 6 days
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
  } else {
    // Incorrect response - reset
    repetition = 0;
    interval = 1;
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const now = Date.now();
  const nextReview = now + interval * 24 * 60 * 60 * 1000; // Convert days to ms

  return {
    ...card,
    repetition,
    interval,
    easeFactor: Math.round(easeFactor * 100) / 100,
    nextReview,
    lastReview: now,
    reviewCount: (card.reviewCount || 0) + 1,
  };
}

export function isDueForReview(card) {
  if (!card.nextReview) return true; // Never reviewed
  return Date.now() >= card.nextReview;
}

export function getDueCards(cards, limit = 20) {
  const due = cards.filter(isDueForReview);
  // Sort by priority: new cards first, then overdue cards sorted by how overdue they are
  due.sort((a, b) => {
    if (!a.nextReview && b.nextReview) return -1;
    if (a.nextReview && !b.nextReview) return 1;
    if (!a.nextReview && !b.nextReview) return 0;
    return a.nextReview - b.nextReview;
  });
  return due.slice(0, limit);
}

export function getCardStatus(card) {
  if (!card.lastReview) return 'new';
  if (card.repetition >= 5) return 'mastered';
  if (card.repetition >= 2) return 'learning';
  return 'reviewing';
}

// Convert quality rating from swipe gesture
// left = hard (quality 1), middle = ok (quality 3), right = easy (quality 5)
export function swipeToQuality(direction) {
  switch (direction) {
    case 'left': return 1;   // Hard - show again soon
    case 'up': return 3;     // Good - normal interval
    case 'right': return 5;  // Easy - longer interval
    default: return 3;
  }
}
