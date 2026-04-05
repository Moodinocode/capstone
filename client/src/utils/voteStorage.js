const TOKEN_KEY  = 'spotlight_vote_token';
const VOTED_KEY  = 'spotlight_voted_project';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getBrowserToken() {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = generateUUID();
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

export function getVotedProject() {
  return localStorage.getItem(VOTED_KEY);
}

export function setVotedProject(projectId) {
  localStorage.setItem(VOTED_KEY, projectId);
}
