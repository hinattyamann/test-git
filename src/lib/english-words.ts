import { promises as fs } from "fs";
import path from "path";

export type EnglishWord = {
  spell: string;
  meaning1: string;
  meaning2: string;
  meaning3: string;
};

const CSV_PATH = path.join(process.cwd(), "src", "data", "English_words.csv");

function parseCsvRows(input: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (inQuotes) {
      if (char === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }

      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((currentRow) =>
    currentRow.some((currentField) => currentField.trim())
  );
}

export function getMeanings(word: EnglishWord) {
  return [word.meaning1, word.meaning2, word.meaning3].filter(Boolean);
}

export async function readEnglishWords() {
  const csv = await fs.readFile(CSV_PATH, "utf8");
  const rows = parseCsvRows(csv);
  const [header, ...bodyRows] = rows;
  const columnIndexes = new Map(
    header.map((column, index) => [column.trim(), index])
  );

  return bodyRows
    .map((row) => ({
      spell: row[columnIndexes.get("spell") ?? 0]?.trim() || "",
      meaning1: row[columnIndexes.get("meaning1") ?? 1]?.trim() || "",
      meaning2: row[columnIndexes.get("meaning2") ?? 2]?.trim() || "",
      meaning3: row[columnIndexes.get("meaning3") ?? 3]?.trim() || "",
    }))
    .filter((word) => word.spell && word.meaning1);
}
