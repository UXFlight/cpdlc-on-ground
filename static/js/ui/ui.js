
// loader
export function showSpinner(action) {
  const spinner = document.getElementById(`${action}_spinner`);
  const tick = document.getElementById(`${action}_tick`);
  if (spinner) spinner.style.display = "inline-block";
  if (tick) tick.style.display = "none";
}

export function showTick(action, isError = false) {
  const spinner = document.getElementById(`${action}_spinner`);
  const tick = document.getElementById(`${action}_tick`);
  const wrapper = document.querySelector(`.overlay[data-action="${action}"]`);

  if (spinner) spinner.style.display = "none";

  if (tick) {
    tick.style.display = "inline-block";
    if (isError) {
      tick.textContent = "✖";
      tick.classList.add('error');
      tick.classList.remove('success');
    } else {
      tick.textContent = "✔"; 
      tick.classList.add('success');
      tick.classList.remove('error');
    }
  }
  if (wrapper) {
    wrapper.setAttribute('data-status', isError ? 'error' : 'fulfilled');
  }
}

export function hideSpinner(action) {
  const spinner = document.getElementById(`${action}_spinner`);
  if (spinner) spinner.style.display = "none";
}

export function hideTick(tickId) {
  const tick = document.getElementById(tickId);
  if (tick) {
    tick.style.display = 'none';
    tick.classList.remove('error');
  }
}

export function changeFilterIcon(isFiltered) {
  const svg = document.getElementById("filter-icon");
  if(svg) svg.classList.toggle("filtered");
}
