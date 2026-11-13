
export type Rs1TextLayout =
  | "body"
  | "objectives"
  | "references"
  | "simple"
  | "lines";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export function splitRs1Paragraphs(
  value: string,
  mode: Rs1TextLayout
): string[] {
  const normalized = value.replace(/\r\n?/g, "\n").trim();

  if (!normalized) return [];

  const chunks =
    mode === "lines"
      ? normalized.split(/\n+/)
      : normalized.split(/\n[ \t]*\n+/);

  const blocks = chunks
    .flatMap((block) => {
      if (mode === "lines") return [block.trim()];
      const result: string[] = [];
      for (const rawLine of block.split("\n")) {
        const line = rawLine.replace(/[ \t]{2,}/g, " ").trim();
        if (!line) continue;
        if (/^(?:\d+[.)]|[-•▪◦○o])\s+/u.test(line) || !result.length) result.push(line);
        else result[result.length - 1] = `${result[result.length - 1]} ${line}`;
      }
      return result;
    })
    .filter(Boolean);

  if (mode === "objectives") {
    return blocks.map((block, index) =>
      /^\d+[.)]\s/.test(block)
        ? block
        : `${index + 1}. ${block}`
    );
  }

  return blocks;
}

export function wordParagraphs(
  value: string,
  mode: Rs1TextLayout = "body"
): string {
  const blocks = splitRs1Paragraphs(value, mode);

  return blocks
    .map((block, index) => {
      const isBody =
        mode === "body" || mode === "objectives";

      const isReference = mode === "references";

      // ตั้งค่าการย่อหน้า
      const indent = isReference
        ? '<w:ind w:left="720" w:hanging="720"/>'
        : isBody
          ? '<w:ind w:left="0" w:firstLine="720"/>'
          : mode === "lines"
            ? '<w:ind w:left="360"/>'
            : '<w:ind w:left="0" w:firstLine="720"/>';

      // Thai prose should stay left-aligned so Word does not stretch spaces between words.
      const align = "left";

      // ป้องกันหัวข้อย่อยไปอยู่ท้ายหน้า
      const shortSubheading =
        isBody &&
        /^\d+[.)]\s/.test(block) &&
        block.length < 90 &&
        index < blocks.length - 1;

      const keepNext = shortSubheading
        ? "<w:keepNext/>"
        : "";

      const italic = '<w:i w:val="0"/><w:iCs w:val="0"/>';

      return (
        "<w:p>" +
        "<w:pPr>" +
        "<w:widowControl/>" +
        '<w:wordWrap w:val="breakWord"/>' +
        keepNext +
        '<w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>' +
        indent +
        `<w:jc w:val="${align}"/>` +
        "</w:pPr>" +
        "<w:r>" +
        "<w:rPr>" +
        '<w:rFonts w:ascii="TH Sarabun New" w:eastAsia="TH Sarabun New" w:hAnsi="TH Sarabun New" w:cs="TH Sarabun New"/>' +
        '<w:lang w:val="th-TH" w:eastAsia="th-TH"/>' +
        italic +
        '<w:color w:val="000000"/>' +
        '<w:sz w:val="32"/>' +
        '<w:szCs w:val="32"/>' +
        "</w:rPr>" +
        `<w:t xml:space="preserve">${escapeXml(block)}</w:t>` +
        "</w:r>" +
        "</w:p>"
      );
    })
    .join("");
}
