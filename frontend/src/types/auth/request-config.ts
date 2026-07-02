export interface RequestConfig extends Omit<RequestInit, "headers"> {
    url: string;
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean>;
    timeout?: number;
}
