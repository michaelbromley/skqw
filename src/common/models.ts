
/**
 * A sample is a single frame of the audio buffer.
 * { ft: fourier transform array, ts: time series array }
 */
export interface ISample {
    ft: number[];
    ts: number[];
}

export interface ISkqw {
    createCanvas: (domElement?: HTMLCanvasElement) => HTMLCanvasElement;
    dimensions: {
        width: number;
        height: number;
    };
    sample: {
        ts: number[];
        ft: number[];
    }
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
    init: (skqw: ISkqw) => void;
    tick: (skqw: ISkqw, timestamp: number) => void;
    resize?: (skqw: ISkqw) => void;
    destroy?: (skqw: ISkqw) => void;
    paramChange?: (change: IParamUpdate) => void;
    params?: { [name: string]: IParameter }
}

export interface IParamUpdate {
    paramKey: string;
    newValue: number | boolean;
}