import { setClearance } from "../state/clearance.js";
import { updateTaxiClearanceMsg } from "../ui/ui.js";

export function updateClearance(data) {
  const { kind, instruction } = data;
  console.log("updateClearance", kind, instruction);
  setClearance(kind, instruction);
  updateTaxiClearanceMsg();
}