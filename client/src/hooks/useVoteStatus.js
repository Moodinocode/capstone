import { useState, useCallback } from 'react';
import { getBrowserToken, getVotedProject, setVotedProject } from '../utils/voteStorage';
import api from '../services/api';

export function useVoteStatus() {
  const browserToken = getBrowserToken();
  const [votedProjectId, setVotedProjectId] = useState(() => getVotedProject());

  const castVote = useCallback(async (projectId) => {
    // Two-step vote: /init exchanges the browser token for a server-signed
    // HMAC; /votes only accepts the cast if that token is presented and
    // unexpired. A naive curl loop that skips /init is rejected when the
    // server is configured with REQUIRE_VOTE_TOKEN=true.
    let voteToken;
    try {
      const init = await api.post('/votes/init', { browserToken });
      voteToken = init.data.voteToken;
    } catch {
      // /init failures are non-fatal — server may have token enforcement off.
    }

    const res = await api.post('/votes', { projectId, browserToken, voteToken });
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
