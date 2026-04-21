import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { shouldDeferGlobalUndoRedo } from "../appKeyboard.js";

describe("shouldDeferGlobalUndoRedo", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("returns false for non-Element targets", () => {
    expect(shouldDeferGlobalUndoRedo(null)).toBe(false);
    expect(shouldDeferGlobalUndoRedo(document.createTextNode("x"))).toBe(false);
  });

  it("returns false for plain div", () => {
    expect(shouldDeferGlobalUndoRedo(container)).toBe(false);
  });

  it("returns true for input", () => {
    const input = document.createElement("input");
    container.appendChild(input);
    expect(shouldDeferGlobalUndoRedo(input)).toBe(true);
  });

  it("returns true for textarea", () => {
    const ta = document.createElement("textarea");
    container.appendChild(ta);
    expect(shouldDeferGlobalUndoRedo(ta)).toBe(true);
  });

  it("returns true for select", () => {
    const sel = document.createElement("select");
    container.appendChild(sel);
    expect(shouldDeferGlobalUndoRedo(sel)).toBe(true);
  });

  it("returns true for descendant of contenteditable", () => {
    const host = document.createElement("div");
    host.setAttribute("contenteditable", "true");
    const inner = document.createElement("span");
    host.appendChild(inner);
    container.appendChild(host);
    expect(shouldDeferGlobalUndoRedo(inner)).toBe(true);
  });

  it("returns true for role=textbox", () => {
    const div = document.createElement("div");
    div.setAttribute("role", "textbox");
    div.setAttribute("tabindex", "0");
    container.appendChild(div);
    expect(shouldDeferGlobalUndoRedo(div)).toBe(true);
  });
});
