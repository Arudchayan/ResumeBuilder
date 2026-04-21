/**
 * When true, resume-level Undo/Redo shortcuts should not intercept the event,
 * so the browser can handle native editing (e.g. Ctrl/Cmd+Z in a text field).
 *
 * @param {EventTarget | null} target
 * @returns {boolean}
 */
export function shouldDeferGlobalUndoRedo(target) {
  if (!target || typeof Element === "undefined" || !(target instanceof Element)) {
    return false;
  }
  const el = target;
  if (typeof el.closest === "function" && el.closest('[contenteditable="true"]')) {
    return true;
  }
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
    return true;
  }
  const role = el.getAttribute("role");
  if (role === "textbox" || role === "combobox") {
    return true;
  }
  return false;
}
