import { useState, useCallback } from 'react';
import { getBrowserToken, getVotedProject, setVotedProject } from '../utils/voteStorage';
import api from '../services/api';

export function useVoteStatus() {
  const browserToken = getBrowserToken();
  const [votedProjectId, setVotedProjectId] = useState(() => getVotedProject());

  const castVote = useCallback(async (projectId) => {
    const res = await api.post('/votes', { projectId, browserToken });
    setVotedProject(projectId);
    setVotedProjectId(projectId);
    return res.data;
  }, [browserToken]);

  return {
    hasVoted: !!votedProjectId,
    votedProjectId,
    browserToken,
    castVote,
  };
}
