const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function noteName(midi: number) {
    return noteNames[midi % 12];
}

// semitone gaps between neighbouring strings (low to high) in E standard
function standardGaps(stringCount: number) {
    const gaps = new Array<number>(stringCount - 1).fill(5);
    // guitars have a major third between the G and B string
    if (stringCount >= 6) {
        gaps[stringCount - 3] = 4;
    }
    return gaps;
}

function tuningName(strings: number[]) {
    const gaps = strings.slice(1).map((s, i) => s - strings[i]);
    const standard = standardGaps(strings.length);
    const restMatches = gaps.slice(1).every((g, i) => g === standard[i + 1]);
    if (!restMatches) {
        return 'Custom';
    }
    if (gaps[0] === standard[0]) {
        // the string which is the low E in E standard
        const eStringIndex = strings.length >= 6 ? strings.length - 6 : strings.length - 4;
        const eString = noteName(strings[Math.max(eStringIndex, 0)]);
        return eString === 'E' ? 'Standard' : `${eString} Standard`;
    }
    if (gaps[0] === standard[0] + 2) {
        return `Drop ${noteName(strings[0])}`;
    }
    return 'Custom';
}

/**
 * Formats a staff tuning for display, e.g. "Drop D (D A D G B E)".
 * @param tuning the midi values of the strings, highest string first (as in alphaTab's Staff.tuning)
 */
export function formatTuning(tuning: number[]): string {
    const strings = [...tuning].reverse();
    if (strings.length < 2) {
        return strings.map(noteName).join(' ');
    }
    return `${tuningName(strings)} (${strings.map(noteName).join(' ')})`;
}
