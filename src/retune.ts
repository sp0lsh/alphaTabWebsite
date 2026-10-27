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

/**
 * Moves the note to the adjacent string in the given direction, keeping its pitch.
 * The note stays when that string is used by another note of the beat or cannot play the pitch.
 * @param direction 1 for the next higher string, -1 for the next lower string
 * @returns whether the note was moved
 */
export function moveNoteString(note: alphaTab.model.Note, direction: 1 | -1): boolean {
    const tuning = note.beat.voice.bar.staff.tuning;
    const open = (string: number) => tuning[tuning.length - string];
    const string = note.string + direction;
    if (string < 1 || string > tuning.length) {
        return false;
    }
    const fret = note.fret + open(note.string) - open(string);
    const free = !note.beat.notes.some(o => o !== note && o.string === string);
    if (fret < 0 || fret > maxFret || !free) {
        return false;
    }
    note.string = string;
    note.fret = fret;
    // keep the manual choice when the staff is retuned later
    if (fileStrings.has(note)) {
        fileStrings.set(note, string);
    }
    return true;
}
