async function handleJsonResponse(response) { // returs data + res.ok + status
  const data = await response.json();
  return { ok: response.ok, status: response.status, ...data };
}

export async function postAction(action, requestType) {
  const body = JSON.stringify({ action, requestType });
  const response = await fetch(`/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  return handleJsonResponse(response);
}

export async function getState() {
  const response = await fetch('/state');
  return handleJsonResponse(response);
}
