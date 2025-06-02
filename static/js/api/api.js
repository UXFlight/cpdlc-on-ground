export async function sendRequest(action) {
  const response = await fetch(`/request/${action}`);
  return response.json();
}

export async function postAction(action, requestType=null) {
  const body = requestType
    ? JSON.stringify({ action, requestType })
    : JSON.stringify({ action });

  const response = await fetch(`/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  return response.json();
}

export async function postCancelRequest(action) {
  const response = await fetch(`/cancel-request/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  return await response.json();
}

export async function getState() {
  const response = await fetch('/state');
  return response.json();
}