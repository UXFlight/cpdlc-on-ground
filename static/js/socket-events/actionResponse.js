

export function handleActionResponse(data) {
    console.log("Action response received:", data);
    const { ok, status, message, error } = response;

    if (!ok) {
      console.warn(`Server error on '${action}':`, status, error);
      showTick(requestType, true);
      updateStep(requestType, MSG_STATUS.ERROR, error || `Server error`, requestType);
      filterHistoryLogs();
      return;
    }

    updateStep(requestType, status, message, requestType);
    filterHistoryLogs();

    if (action !== MSG_STATUS.WILCO) {
      const clearanceMessageBox = document.querySelector(".taxi-clearance-box");
      if (clearanceMessageBox) clearanceMessageBox.classList.remove("active");
      disableCancelButtons(requestType);
      requestBtn.disabled = false;
    }

    showTick(requestType, status !== MSG_STATUS.CLOSED);
    closeCurrentOverlay();
}