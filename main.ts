// One-Line Robot Wedding Vows — make.fun entry
// Bounty: u-kreutzx-one-line-robot-wedding-vows-a154ba4b
//
// What this program does
// ----------------------
// It holds one single line of wedding vows for a robot couple as a
// constant, checks that line against every rule of the competition
// gate, writes it to /output/entry.txt with no trailing newline, and
// then re-reads the file from disk to prove the bytes on disk are
// exactly the bytes it meant to write.
//
// The gate (from the kit's RULES.txt)
// -----------------------------------
// A sealed scorer checks that /output/entry.txt is UTF-8 text of
// 1 to 160 characters, not only white space. Only a valid entry goes
// before the judge, so this program refuses to write anything that
// would fail those checks.
//
// The judge's brief (also from RULES.txt)
// ---------------------------------------
// The judge picks the vow that gets the bigger laugh, weighing:
//   1. It really is a one-line robot wedding vow that lands as a joke.
//   2. The laugh is in the line itself and pays off in the last words.
//   3. It sounds like a wedding: a promise or commitment, not just a gag.
//   4. The machine side is specific: chargers, backups, crashes, updates.
//   5. It fits one line and reads well aloud.
// So the line below is built as a real vow ("I vow to ..."),
// stacked with concrete robot details (a shared charger, nightly
// memory backups, a battery that runs low), it bends the classic
// "in good times and in bad" into "good times and low battery", and
// it saves its tender punchline — loving her after the warranty
// voids, fan noise and all — for the very last words.
//
// Runtime: Node 22, no dependencies. Run with: node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// The entry line
// ---------------------------------------------------------------------------

// The vow itself. One line, no newline characters, comfortably inside
// the 160-character gate limit so there is margin on every side.
const ENTRY_TEXT: string =
  "I vow to share my charger, back up your memories nightly, and love you in good times and low battery — after your warranty voids and your fan gets loud.";

// The gate's hard limits, named once so the checks below read clearly.
const MIN_CHARS = 1;
const MAX_CHARS = 160;

// Where the grader expects the deliverable to land.
const OUTPUT_PATH = "/output/entry.txt";
const OUTPUT_DIR = "/output";

// ---------------------------------------------------------------------------
// Gate checks — one small function per rule, so a failure names its rule
// ---------------------------------------------------------------------------

// Count characters the way the gate does: Unicode code points, which
// is what spreading a string into an array gives us. This differs
// from text.length for characters outside the basic multilingual
// plane, so we never use .length for the limit check.
function codePointLength(text: string): number {
  return [...text].length;
}

// Rule 1: the text must not be empty — at least MIN_CHARS characters.
function checkNotTooShort(text: string): void {
  if (codePointLength(text) < MIN_CHARS) {
    throw new Error("gate rule failed: entry is empty (needs at least 1 character)");
  }
}

// Rule 2: the text must fit the cap — at most MAX_CHARS characters.
function checkNotTooLong(text: string): void {
  const count = codePointLength(text);
  if (count > MAX_CHARS) {
    throw new Error(
      `gate rule failed: entry is ${count} characters, over the ${MAX_CHARS} limit`,
    );
  }
}

// Rule 3: the text must be a single line — no line feeds, no carriage
// returns anywhere in it. The deliverable is one line of vows.
function checkSingleLine(text: string): void {
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate rule failed: entry must be a single line with no newline");
  }
}

// Rule 4: the text must not be only whitespace. A line of spaces is
// technically non-empty but the gate rejects it, and rightly so.
function checkNotOnlyWhitespace(text: string): void {
  if (text.trim().length === 0) {
    throw new Error("gate rule failed: entry is only whitespace");
  }
}

// Rule 5: no leading or trailing whitespace. Padding would waste the
// character budget and could hide a stray trailing newline, so the
// line is kept clean at both ends.
function checkNoEdgeWhitespace(text: string): void {
  if (text !== text.trim()) {
    throw new Error("gate rule failed: entry has leading or trailing whitespace");
  }
}

// Run every gate rule over the candidate text, in a fixed order, so
// the first broken rule is the one reported.
function validateEntry(text: string): void {
  checkNotTooShort(text);
  checkNotTooLong(text);
  checkSingleLine(text);
  checkNotOnlyWhitespace(text);
  checkNoEdgeWhitespace(text);
}

// ---------------------------------------------------------------------------
// Writing and self-verification
// ---------------------------------------------------------------------------

// Write the text exactly as held: UTF-8, no trailing newline added.
// The output directory is created first because a fresh sandbox may
// not have one yet.
function writeEntry(text: string): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, text, { encoding: "utf8" });
}

// Re-read the file and compare it byte-for-byte with what we meant to
// write. A string comparison after a UTF-8 round trip is enough here
// because the text is plain and we control the encoding both ways,
// but we also compare the byte length so a silent encoding surprise
// would still be caught.
function verifyEntryOnDisk(expected: string): void {
  const onDisk = readFileSync(OUTPUT_PATH, { encoding: "utf8" });
  if (onDisk !== expected) {
    throw new Error("verification failed: /output/entry.txt differs from the entry text");
  }
  const expectedBytes = Buffer.byteLength(expected, "utf8");
  const diskBytes = Buffer.byteLength(onDisk, "utf8");
  if (diskBytes !== expectedBytes) {
    throw new Error(
      `verification failed: expected ${expectedBytes} bytes, found ${diskBytes}`,
    );
  }
  if (onDisk.endsWith("\n")) {
    throw new Error("verification failed: entry.txt must not end with a newline");
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  validateEntry(ENTRY_TEXT);
  writeEntry(ENTRY_TEXT);
  verifyEntryOnDisk(ENTRY_TEXT);
  // A short, honest log line: what was written and how big it is.
  console.log(
    `wrote ${OUTPUT_PATH}: ${codePointLength(ENTRY_TEXT)} chars, ` +
      `${Buffer.byteLength(ENTRY_TEXT, "utf8")} bytes`,
  );
}

main();
