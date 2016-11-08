
/**
 * A sample is a single frame of the audio buffer.
 * { ft: fourier transform array, ts: time series array }
 */
export interface ISample {
    ft: number[];
    ts: number[];
}

export interface IDimensions {
    width: number;
    height: number;
}

export interface IParameter {
    value: number | boolean;
    type: 'range' | 'boolean';
    label: string;
    min?: number;
    max?: number;
    step?: number;
}

/** 
 * A visualization object
 */
export interface IVisualization {
    name: string;
    init: () => void;
    tick: (timestamp: number) => void;
    resize?: () => void;
    destroy?: () => void;
    paramChange?: (change: IParamUpdate) => void;
    params?: { [name: string]: IParameter }
}

export interface IParamUpdate {
    paramKey: string;
    newValue: number | boolean;
}