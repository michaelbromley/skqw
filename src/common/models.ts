
/**
 * A sample is a single frame of the audio buffer.
 * { ft: fourier transform array, ts: time series array }
 */
export interface Sample {
    ft: number[];
    ts: number[];
}

export interface Dimensions {
    width: number;
    height: number;
}

export interface Parameter {
    value: number | boolean;
    type: 'range' | 'boolean';
    label: string;
    min?: number;
    max?: number;
    step?: number;
}

export interface LibraryEntry {
    id: string;
    name: string;
    path: string;
    error: boolean;
}

export interface Preset {
    name: string;
    entryId: string;
    params: { [key: string]: any };
}

/** 
 * A visualization object
 */
export interface Visualization {
    name: string;
    init: () => void;
    tick: (timestamp: number) => void;
    resize?: () => void;
    destroy?: () => void;
    paramChange?: (change: ParamUpdate) => void;
    params?: { [name: string]: Parameter }
}

export interface ParamUpdate {
    paramKey: string;
    newValue: number | boolean;
}