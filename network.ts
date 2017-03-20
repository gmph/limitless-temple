import request = require('request');
import Rx = require('rxjs/Rx');

interface Url {
    protocol : string;
    host : string;
    path : string;
}

export class Api {
    baseUrl: Url;
    constructor(baseUrl: Url) {
        this.baseUrl = baseUrl;
    }
    newRequest(method: string = 'GET', path: string = '', data: Object = {}, parameters: Object = {}, headers: Object = {}): Rx.Observable<any> {
        return Rx.Observable.create((observer: Rx.Observer<any>) => {
            request(this.getRequestData(method, path, data, parameters, headers), (error, response, body) => {
                if (error) { observer.error(error); }
                else { observer.next({ response: response, body: this.parse(body) }); }
                observer.complete();
            });
        });
    }
    getRequestData(method: string = 'GET', path: string = '', data: Object = {}, parameters: Object = {}, headers: Object = {}): any {
        parameters[(new Date()).getTime()] = null; // timestamp key makes requests unique
        let parametersString = this.getParameterStringFromObject(parameters);
        let requestUrl: string = this.baseUrl.protocol + "://" + this.baseUrl.host + this.baseUrl.path + path + parametersString;
        let requestHeaders = data ? { 'Content-Type' : 'application/json' } : {};
        for (let key in headers){ requestHeaders[key] = headers[key] };
        return {
            'url' : requestUrl,
            'method' : method,
            'headers' : requestHeaders,
        }
    }
    stringify(data: Object): string {
        return JSON.stringify(data);
    }
    parse(data: string): Object | null {
        try {
            return JSON.parse(data);
        } catch (e){
            return null;
        }
    }
    getParameterStringFromObject(parameters: Object): string {
        if (Object.keys(parameters).length){
            let str = "?";
            for (let key in parameters) {
                if (str != "") str += "&";
                str += key + "=" + encodeURIComponent(parameters[key]);
            }
            return str;
        } else {
            return "";
        }
    }
}
