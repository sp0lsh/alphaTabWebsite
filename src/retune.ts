import * as alphaTab from '@coderline/alphatab';

const maxFret = 24;

// tuning of the staff and strings of the notes as loaded from the file, kept on the first retune
const fileTunings = new WeakMap<alphaTab.model.Staff, number[]>();
const fileStrings = new WeakMap<alphaTab.model.Note, number>();

/**
 * Semitones the staff tuning was shifted relative to the loaded file.
 */
export function fileTuningOffset(staff: alphaTab.model.Staff): number {
    const fileTuning = fileTunings.get(staff);
    return fileTuning ? staff.tuning[0] - fileTuning[0] : 0;
}

/**
 * Shifts every string of the staff by the given semitones and moves the frets the opposite way,
 * so every note keeps its pitch.
 * @returns the number of notes which cannot be played as written in the new tuning
 */
export function retuneStaff(staff: alphaTab.model.Staff, semitones: number): number {
    if (!fileTunings.has(staff)) {
        fileTunings.set(staff, [...staff.tuning]);
    }

    // staff.tuning lists the highest string first, note.string 1 is the lowest string
    const oldTuning = staff.tuning;
    const newTuning = oldTuning.map(t => t + semitones);
    const stringCount = oldTuning.length;
    const oldOpen = (string: number) => oldTuning[stringCount - string];
    const newOpen = (string: number) => newTuning[stringCount - string];
    const fits = (fret: number) => fret >= 0 && fret <= maxFret;

    let outOfRange = 0;
    for (const bar of staff.bars) {
        for (const voice of bar.voices) {
            for (const beat of voice.beats) {
                for (const note of beat.notes) {
                    if (!note.isStringed) {
                        continue;
                    }
                    if (!fileStrings.has(note)) {
                        fileStrings.set(note, note.string);
                    }
                    const pitch = note.fret + oldOpen(note.string);
                    // prefer the string from the file, so stepping back restores the original tab
                    const fileString = fileStrings.get(note)!;
                    const fileStringFree = !beat.notes.some(o => o !== note && o.string === fileString);
                    let string = fits(pitch - newOpen(fileString)) && fileStringFree ? fileString : note.string;
                    let fret = pitch - newOpen(string);
                    if (!fits(fret)) {
                        const freeString = Array.from({ length: stringCount }, (_, i) => i + 1)
                            .filter(s => fits(pitch - newOpen(s)) && !beat.notes.some(o => o !== note && o.string === s))
                            .sort((a, b) => Math.abs(a - note.string) - Math.abs(b - note.string))[0];
                        if (freeString) {
                            string = freeString;
                            fret = pitch - newOpen(string);
                        } else {
                            outOfRange++;
                        }
                    }
                    // a shifted natural harmonic is no longer on a harmonic node
                    if (note.harmonicType === alphaTab.model.HarmonicType.Natural) {
                        outOfRange++;
                    }
                    note.string = string;
                    note.fret = fret;
                }
            }
        }
    }

    staff.stringTuning.tunings = newTuning;
    staff.stringTuning.name = '';
    return outOfRange;
}
