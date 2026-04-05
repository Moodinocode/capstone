import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useDebounce } from './useDebounce';

export function useAutoSave(projectId, scores, feedback, enabled = true) {
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const isFirstRender = useRef(true);

  const debouncedScores   = useDebounce(scores, 1500);
  const debouncedFeedback = useDebounce(feedback, 1500);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!enabled || !projectId) return;

    const save = async () => {
      setSaveStatus('saving');
      try {
        await api.put(`/grades/${projectId}/draft`, { scores: debouncedScores, feedback: debouncedFeedback });
        setSaveStatus('saved');
        setLastSavedAt(new Date());
      } catch {
        setSaveStatus('error');
      }
    };
    save();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedScores, debouncedFeedback]);

  const saveNow = async () => {
    if (!enabled || !projectId) return;
    setSaveStatus('saving');
    try {
      await api.put(`/grades/${projectId}/draft`, { scores, feedback });
      setSaveStatus('saved');
      setLastSavedAt(new Date());
    } catch {
      setSaveStatus('error');
    }
  };

  return { saveStatus, lastSavedAt, saveNow };
}
