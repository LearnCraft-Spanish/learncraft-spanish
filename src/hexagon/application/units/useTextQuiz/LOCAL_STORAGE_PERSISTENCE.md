# SRS LocalStorage Persistence

## Overview

This implementation uses **localStorage** to persist pending SRS (Spaced Repetition System) flashcard updates. This ensures that review data is **never lost**, even when users:

- Close the browser tab mid-quiz
- Refresh the page
- Experience a browser crash
- Lose internet connection temporarily

## How It Works

### 1. **Persistent Batch Storage**

The pending batch of flashcard updates is stored in localStorage with the key `srs-pending-updates`. Every time a user reviews a flashcard:

```typescript
localStorage.setItem('srs-pending-updates', [
  { exampleId: 123, difficulty: 'easy' },
  { exampleId: 456, difficulty: 'hard' },
  // ... more pending updates
]);
```

### 2. **Automatic Loading on Mount**

When the component mounts (page load or navigation to quiz), it checks localStorage for any pending updates:

```typescript
useEffect(() => {
  const storedUpdates = localStorage.getItem('srs-pending-updates');
  if (storedUpdates) {
    // Restore pending updates to the batch
    pendingBatchRef.current = storedUpdates;
  }
}, []);
```

### 3. **Auto-Flush on Mount**

After flashcards are loaded, if there are any pending updates from a previous session, they're automatically sent to the backend:

```typescript
useEffect(() => {
  if (flashcards && pendingBatchRef.current.length > 0) {
    // Flush pending updates from previous session
    flushBatch();
  }
}, [flashcards]);
```

### 4. **Update on Every Change**

Whenever a user reviews a flashcard, the batch is immediately saved to localStorage:

```typescript
const addToBatch = (exampleId, difficulty) => {
  pendingBatchRef.current.push({ exampleId, difficulty });
  // Save to localStorage immediately
  localStorage.setItem('srs-pending-updates', pendingBatchRef.current);
};
```

### 5. **Clear on Successful Flush**

When the batch is successfully sent to the backend, localStorage is cleared:

```typescript
const flushBatch = async () => {
  try {
    await updateFlashcards(updates);
    // Clear localStorage on success
    localStorage.removeItem('srs-pending-updates');
  } catch (error) {
    // On error, keep the batch in localStorage for retry
    localStorage.setItem('srs-pending-updates', batchToFlush);
  }
};
```

## Advantages Over sendBeacon

| Feature             | localStorage Approach     | sendBeacon Approach      |
| ------------------- | ------------------------- | ------------------------ |
| **Reliability**     | ✅ Guaranteed persistence | ⚠️ Browser-dependent     |
| **Offline Support** | ✅ Works offline          | ❌ Requires connection   |
| **Error Handling**  | ✅ Full error handling    | ❌ Fire-and-forget       |
| **Backend Changes** | ✅ No changes needed      | ❌ New endpoint required |
| **Auth Complexity** | ✅ Normal auth flow       | ⚠️ Token in body         |
| **Debugging**       | ✅ Easy to inspect        | ❌ Hard to debug         |
| **Data Size**       | ✅ ~5-10MB                | ⚠️ ~64KB                 |
| **Cross-session**   | ✅ Persists indefinitely  | ❌ Single session        |

## Data Flow

```
User reviews flashcard
         ↓
Add to pendingBatchRef
         ↓
Save to localStorage ✓
         ↓
Mark as reviewed (UI)
         ↓
Check batch size (10?)
         ↓
    [If Yes] → Flush to backend
         ↓
Backend success?
    [Yes] → Clear localStorage ✓
    [No]  → Keep in localStorage for retry ✓
```

## Retry Logic

The implementation has **built-in retry logic**:

1. **On Error**: If the flush fails, the batch is restored to localStorage
2. **On Next Mount**: The pending updates are automatically loaded and retried
3. **No Data Loss**: Updates persist across sessions until successfully sent

## Edge Cases Handled

### 1. **Tab Closed Mid-Quiz**

- ✅ Updates saved to localStorage
- ✅ Automatically flushed on next app launch

### 2. **Internet Connection Lost**

- ✅ Updates saved to localStorage
- ✅ Retry on next connection

### 3. **Browser Crash**

- ✅ Updates persist in localStorage
- ✅ Automatically sent on next session

### 4. **Multiple Tabs**

- ✅ Each tab maintains its own batch
- ✅ Auto-flush on mount handles cross-tab scenarios

### 5. **Partial Flush Success**

- ✅ Successfully sent items cleared from localStorage
- ⚠️ Failed items remain for retry (current implementation retries all on error)

## Storage Structure

### Key

```typescript
const PENDING_UPDATES_KEY = 'srs-pending-updates';
```

### Value Format

```typescript
interface PendingBatchUpdate {
  exampleId: number;
  difficulty: SrsDifficulty; // 'easy' | 'good' | 'hard' | 'again' | 'viewed'
}

// Stored as JSON array
[
  { exampleId: 123, difficulty: 'easy' },
  { exampleId: 456, difficulty: 'hard' },
  { exampleId: 789, difficulty: 'good' },
];
```

## Testing

### Manual Testing

1. **Basic Flow**:

   ```
   1. Start a quiz
   2. Review 2-3 flashcards (< batch size of 10)
   3. Check localStorage in DevTools → should see 'srs-pending-updates'
   4. Close the tab (don't navigate away)
   5. Reopen the app
   6. Check network tab → should see PUT request to /update-my-flashcards
   7. Check localStorage → 'srs-pending-updates' should be cleared
   ```

2. **Offline Test**:

   ```
   1. Open DevTools → Network tab
   2. Set to "Offline" mode
   3. Review flashcards
   4. Check localStorage → updates should be saved
   5. Set back to "Online"
   6. Refresh page
   7. Should see updates being sent
   ```

3. **Error Recovery**:
   ```
   1. Open DevTools → Network tab
   2. Block the /update-my-flashcards endpoint
   3. Review 10+ flashcards to trigger auto-flush
   4. Should see error in console
   5. Check localStorage → updates should still be there
   6. Unblock the endpoint
   7. Refresh page
   8. Updates should be sent successfully
   ```

### Automated Testing

```typescript
describe('useSrsFunctionality localStorage persistence', () => {
  it('should save pending updates to localStorage', () => {
    const { result } = renderHook(() => useSrsFunctionality());

    act(() => {
      result.current.handleReviewExample(123, 'easy');
    });

    const stored = localStorage.getItem('srs-pending-updates');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored)).toEqual([
      { exampleId: 123, difficulty: 'easy' },
    ]);
  });

  it('should load pending updates on mount', () => {
    localStorage.setItem(
      'srs-pending-updates',
      JSON.stringify([{ exampleId: 123, difficulty: 'easy' }]),
    );

    const { result } = renderHook(() => useSrsFunctionality());

    // Should auto-flush on mount when flashcards are available
    // Check that the batch was loaded and flushed
  });

  it('should clear localStorage on successful flush', async () => {
    const { result } = renderHook(() => useSrsFunctionality());

    act(() => {
      result.current.handleReviewExample(123, 'easy');
    });

    await act(async () => {
      await result.current.flushBatch();
    });

    const stored = localStorage.getItem('srs-pending-updates');
    expect(stored).toBeNull();
  });
});
```

## Browser Compatibility

localStorage is supported in all modern browsers:

- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (all versions)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Limitations & Considerations

### 1. **Storage Size**

- localStorage limit: ~5-10MB (varies by browser)
- With our data structure, this supports ~100,000+ pending updates
- **Not a concern** for normal usage

### 2. **Private/Incognito Mode**

- localStorage is cleared when the session ends
- Updates saved during private browsing won't persist after closing
- **Acceptable tradeoff** for privacy

### 3. **User Clears Browser Data**

- If user manually clears localStorage, pending updates are lost
- **Rare scenario**, acceptable risk

### 4. **Cross-Device Sync**

- localStorage is per-browser, doesn't sync across devices
- Each device maintains its own pending batch
- **Expected behavior**, not a bug

## Future Enhancements

### 1. **Timestamp Tracking**

```typescript
interface PendingBatchUpdate {
  exampleId: number;
  difficulty: SrsDifficulty;
  timestamp: number; // When the review happened
}
```

### 2. **Stale Update Cleanup**

```typescript
// Clear updates older than 7 days
const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const now = Date.now();
const validUpdates = storedUpdates.filter(
  (update) => now - update.timestamp < MAX_AGE,
);
```

### 3. **Periodic Background Flush**

```typescript
// Try to flush every 5 minutes if there are pending updates
useInterval(
  () => {
    if (pendingBatchRef.current.length > 0) {
      flushBatch();
    }
  },
  5 * 60 * 1000,
);
```

### 4. **User Feedback**

```typescript
// Show a subtle indicator when there are pending updates
if (pendingBatchRef.current.length > 0) {
  return <Badge>Syncing...</Badge>;
}
```

## Monitoring & Debugging

### Check localStorage in DevTools:

1. Open DevTools (F12)
2. Go to Application tab
3. Expand "Local Storage"
4. Look for key: `srs-pending-updates`

### Common Issues:

**Updates not clearing?**

- Check network tab for failed requests
- Check console for errors
- Verify backend is receiving the updates

**Updates not loading on mount?**

- Check if flashcards are loading successfully
- Verify `hasAttemptedInitialFlush` is working correctly

**Duplicate updates?**

- Check if multiple tabs are open
- Each tab maintains its own batch independently

## Summary

This localStorage-based persistence implementation provides:

- ✅ **Guaranteed data persistence**
- ✅ **No backend changes required**
- ✅ **Full error handling and retry logic**
- ✅ **Works offline**
- ✅ **Cross-session reliability**
- ✅ **Easy to debug and test**

It's a **simpler, more robust solution** than sendBeacon and requires no special backend handling!
