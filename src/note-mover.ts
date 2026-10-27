import * as alphaTab from '@coderline/alphatab';
import { useEffect, useRef } from 'react';
import { useAlphaTabEvent } from '@site/src/hooks';
import { moveNoteString } from '@site/src/retune';

const selectedColor = alphaTab.model.Color.fromJson('#e13238')!;

/**
 * Selects a tab note on click and moves it to another string with the up/down arrow keys, keeping its pitch.
 */
export function useNoteMover(api: alphaTab.AlphaTabApi | undefined) {
    const selected = useRef<alphaTab.model.Note | null>(null);

    const select = (note: alphaTab.model.Note | null) => {
        if (selected.current) {
            selected.current.style = undefined;
        }
        selected.current = note;
        if (note) {
            note.style = new alphaTab.model.NoteStyle();
            note.style.colors.set(alphaTab.model.NoteSubElement.GuitarTabFretNumber, selectedColor);
        }
        api!.render();
    };

    useAlphaTabEvent(api, 'noteMouseDown', note => {
        if (note.isStringed && note !== selected.current) {
            select(note);
        }
    });

    useAlphaTabEvent(api, 'scoreLoaded', () => {
        selected.current = null;
    });

    useEffect(() => {
        if (!api) {
            return;
        }
        const onKeyDown = (e: KeyboardEvent) => {
            const note = selected.current;
            if (!note || (e.target as HTMLElement).closest('input, select, textarea')) {
                return;
            }
            if (e.key === 'Escape') {
                select(null);
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                if (moveNoteString(note, e.key === 'ArrowUp' ? 1 : -1)) {
                    api.render();
                }
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [api]);
}
