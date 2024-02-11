const substring_to_highlighter_map: Readonly<Record<string,string>> = {
    'ERROR': 'error',
    'FAIL': 'error',
    'SUCCESS': 'success',
    'WARN': 'warn',
    'INFO': 'info',
};

// intent of prefix: anchor start of line, then maybe some whitespace, then
// maybe an open bracket.  Meant to be concatenated with search strings like:
// e.g. pattern_prefix + 'ERROR'
const pattern_prefix = "^[ \\t]*\\[?";

export function chooseLineColor(line: string): string {
    for (const substring in substring_to_highlighter_map) {
        const pattern = pattern_prefix + substring;
        if (line.match(pattern)) {
            return substring_to_highlighter_map[substring];
        }
    }
    return 'default';
}
