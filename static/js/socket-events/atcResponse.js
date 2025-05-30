import { createActiveLogs } from "../messages/activeLogs.js";

export const handleAtcResponse = (data) => {
    console.log("ATC Response:", data);
    createActiveLogs(data);
}