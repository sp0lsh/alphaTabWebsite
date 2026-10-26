import * as alphaTab from '@coderline/alphatab';

const storageKey = 'alphaTab-playground.settings';

// paths which are controlled by the app itself, not by the user
const notPersisted = new Set(['player.playerMode']);

export type TrackDefaults = {
    enabled: boolean;
    showStandardNotation: boolean;
    showTablature: boolean;
    showSlash: boolean;
    showNumbered: boolean;
};

type Stored = {
    settings: Record<string, unknown>;
    api: Record<string, unknown>;
    trackDefaults: TrackDefaults;
};

const defaultTrackDefaults: TrackDefaults = {
    enabled: false,
    showStandardNotation: true,
    showTablature: true,
    showSlash: false,
    showNumbered: false
};

function load(): Stored {
    let stored: Partial<Stored> = {};
    try {
        stored = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    } catch (error) {
        console.error(error);
    }
    return {
        settings: stored.settings ?? {},
        api: stored.api ?? {},
        trackDefaults: {
            ...defaultTrackDefaults,
            ...stored.trackDefaults
        }
    };
}

function save(update: (stored: Stored) => void) {
    const stored = load();
    update(stored);
    localStorage.setItem(storageKey, JSON.stringify(stored));
}

export function toJsonValue(value: unknown): unknown {
    if (value instanceof alphaTab.model.Color) {
        return alphaTab.model.Color.toJson(value);
    }
    if (value instanceof alphaTab.model.Font) {
        return Object.fromEntries(alphaTab.model.Font.toJson(value)!);
    }
    return value;
}

function fromJsonValue(current: unknown, value: unknown): unknown {
    if (current instanceof alphaTab.model.Color) {
        return alphaTab.model.Color.fromJson(value);
    }
    if (current instanceof alphaTab.model.Font) {
        return alphaTab.model.Font.fromJson(value);
    }
    return value;
}

export function persistSetting(path: string, value: unknown) {
    if (notPersisted.has(path)) {
        return;
    }
    save(s => {
        s.settings[path] = toJsonValue(value);
    });
}

export function persistApiValue(name: string, value: unknown) {
    save(s => {
        s.api[name] = value;
    });
}

export function applyPersistedSettings(settings: alphaTab.Settings) {
    for (const [path, value] of Object.entries(load().settings)) {
        const parts = path.split('.');
        let target: any = settings;
        for (let i = 0; i < parts.length - 1 && target; i++) {
            target = target[parts[i]];
        }
        const name = parts[parts.length - 1];
        if (target && name in target) {
            target[name] = fromJsonValue(target[name], value);
        }
    }
}

export function applyPersistedApiValues(api: alphaTab.AlphaTabApi) {
    for (const [name, value] of Object.entries(load().api)) {
        (api as any)[name] = value;
    }
}

export function loadTrackDefaults(): TrackDefaults {
    return load().trackDefaults;
}

export function persistTrackDefaults(trackDefaults: TrackDefaults) {
    save(s => {
        s.trackDefaults = trackDefaults;
    });
}

export function applyTrackDefaults(score: alphaTab.model.Score) {
    const defaults = loadTrackDefaults();
    const anyVisible =
        defaults.showStandardNotation || defaults.showTablature || defaults.showSlash || defaults.showNumbered;
    if (!defaults.enabled || !anyVisible) {
        return;
    }
    for (const track of score.tracks) {
        for (const staff of track.staves) {
            // non-stringed staves (drums, piano) have no tabs, keep their notation as in the file
            if (!staff.isStringed) {
                continue;
            }
            staff.showStandardNotation = defaults.showStandardNotation;
            staff.showTablature = defaults.showTablature;
            staff.showSlash = defaults.showSlash;
            staff.showNumbered = defaults.showNumbered;
        }
    }
}
