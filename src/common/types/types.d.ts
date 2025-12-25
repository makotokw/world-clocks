interface Window {
    jQuery: any;
    $: any;
}

// To support JQuery plugins
interface JQuery {
    [key: string]: any;
}

// To support implicit conversion of symbol to string
interface Symbol {
    toString(): string;
}
