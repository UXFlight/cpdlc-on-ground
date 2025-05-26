// Basic template for API calls : GET and POST
export async function sendRequest(action) {
  const response = await fetch(`/request/${action}`);
  return response.json();
}

export async function postAction(action) {
  const response = await fetch(`/action/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  return response.json();
}

export async function postLoad(requestType) {
  console.log("postLoad called with:", requestType);
  const response = await fetch('/load', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestType }),
  });
  return response.json();
}

export async function postExecute(requestType) {
  const response = await fetch(`/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestType }),
  });
  return response.json();
}
