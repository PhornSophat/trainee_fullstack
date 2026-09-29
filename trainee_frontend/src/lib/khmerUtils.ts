const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

/**
 * Converts an Arabic/English number or digit string to Khmer numerals.
 * e.g. 1 -> "១", 2 -> "២", 12 -> "១២"
 */
export function toKhmerNumber(num: number | string): string {
  return String(num)
    .split('')
    .map((char) => {
      const n = parseInt(char, 10);
      return isNaN(n) ? char : KHMER_DIGITS[n];
    })
    .join('');
}

/**
 * Formats a chapter title to ensure it starts with "ជំពូកទី <Khmer number>៖ <title>",
 * e.g. chapterIndex = 3, title = "test chapter" -> "ជំពូកទី ៤៖ test chapter"
 * e.g. chapterIndex = 0, title = "ការចាប់ផ្តើម" -> "ជំពូកទី ១៖ ការចាប់ផ្តើម"
 *
 * It cleans any existing leading Khmer or English chapter prefixes before prepending.
 */
export function formatKhmerChapterTitle(title: string | undefined | null, chapterIndex: number): string {
  if (!title) return '';
  const cleaned = title
    .replace(/^(ជំពូកទី|ជំពូក|Chapter|Section)\s*([0-9]+|[០-៩]+)\s*[\:\៖\-–—\.]?\s*/i, '')
    .replace(/^([0-9]+|[០-៩]+)\s*[\:\៖\-–—\.]\s*/, '')
    .trim();
  const khmerNum = toKhmerNumber(chapterIndex + 1);
  return cleaned ? `ជំពូកទី ${khmerNum}៖ ${cleaned}` : `ជំពូកទី ${khmerNum}`;
}

/**
 * Formats a lesson title to ensure it starts with the chapter-relative Khmer number,
 * e.g., for lessonIndex = 0: "១. <title>"
 * e.g., for lessonIndex = 1: "២. <title>"
 *
 * It cleans any existing leading English number (e.g. "1.", "1.1", "3.")
 * or Khmer number (e.g. "១.", "៣.") from the title before prepending the proper chapter-relative number.
 */
export function formatKhmerLessonTitle(title: string | undefined | null, lessonIndex: number): string {
  if (!title) return '';
  // Strip any leading English numbers, chapter.lesson notation, or Khmer numbers followed by punctuation/space
  const cleaned = title
    .replace(/^([0-9]+(\.[0-9]+)*|[០-៩]+(\.[០-៩]+)*)(\s*[\.\:\-–—]|\s+)\s*/, '')
    .trim();
  const khmerNum = toKhmerNumber(lessonIndex + 1);
  return `${khmerNum}. ${cleaned || title.trim()}`;
}
