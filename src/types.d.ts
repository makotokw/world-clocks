interface CoolClockConfig {
    tickDelay: number;
    longTickDelay: number;
    defaultRadius: number;
    renderRadius: number;
    defaultSkin: string;
    showSecs: boolean;
    showAmPm: boolean;
    skins: { [key: string]: any };
    isIE: boolean;
    clockTracker: { [key: string]: any };
    noIdCount: number;
}

interface CoolClockInstance {
    init(options: any): CoolClockInstance;
    setSkin(skinId: string): void;
    tick(): void;
    canvas: HTMLCanvasElement;
    [key: string]: any;
}

interface CoolClockConstructor {
    new (options: any): CoolClockInstance;
    (options: any): CoolClockInstance;
    config: CoolClockConfig;
    prototype: any;
    findAndCreateClocks(): void;
}

declare var CoolClock: any;

interface Window {
    CoolClock: any;
    jQuery: any;
    $: any;
    WorldClocks: any;
}

declare var jQuery: any;
declare var $: any;
declare var WorldClocks: any;

// To support JQuery plugins
interface JQuery {
    [key: string]: any;
}

// To support implicit conversion of symbol to string
interface Symbol {
    toString(): string;
}
