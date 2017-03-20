import crypto = require('crypto');
import Rx = require('rxjs/Rx');
import request = require('request');
import express = require('express');
import bodyParser = require('body-parser');
import { isNotCommonWord, isImportantWord } from './common-words';

interface Url {
    protocol : string;
    host : string;
    path : string;
}

interface imageDetails {
    title : string;
    url : string;
    errordetails? : Object;
}

class Api {
    baseUrl: Url;
    constructor(baseUrl: Url){
        this.baseUrl = baseUrl;
    }
    newRequest(method: string = 'GET', path: string = '', data: Object = null, parameters: Object = null): Rx.Observable<any> {
        return Rx.Observable.create((observer: Rx.Observer<any>) => {
            var requestUrl: string = this.baseUrl.protocol + "://" + this.baseUrl.host + this.baseUrl.path + path + this.getParameterStringFromObject(parameters);
            request({
                'url' : requestUrl,
                'method' : method,
                'headers' : { 'Content-Type' : 'application/json' }
            }, (error, response, body) => {
                if (error) { observer.error(error); }
                else { observer.next({response: response, body: this.parse(body) }); }
                observer.complete();
            });
        });
    }
    stringify(data: Object): string{
        return JSON.stringify(data);
    }
    parse(data: string): Object{
        return JSON.parse(data);
    }
    getParameterStringFromObject(parameters: Object): string{
        if (Object.keys(parameters).length){
            let str = "?";
            for (let key in parameters) {
                if (str != "") {
                    str += "&";
                }
                str += key + "=" + encodeURIComponent(parameters[key]);
            }
            return str;
        } else {
            return "";
        }
    }
}

let apiWikipedia = new Api({
    'protocol' : 'http',
    'host' : 'en.wikipedia.org',
    'path' : '/w/api.php'
});

let apiDuckDuckGo = new Api({
    'protocol' : 'https',
    'host' : 'duckduckgo.com',
    'path' : ''
});

let app = express();

let store = {
    'status' : 'up',
    'stats' : {
        '/' : 0,
        '/echo' : 0,
        '/images' : 0
    }
}

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://gmph.co');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.all('/', (request, response) => {
    setStatValue('/', true);
	response.json({
		'status' : store.status,
        'stats' : store.stats
	});
});

app.post('/echo', (request, response) => {
    setStatValue('/echo', true);
	response.json(request.body);
});

app.post('/images', (request, response) => {
    setStatValue('/images', true);
    let allWords = [...new Set(getSplitPlainText(request.body.plaintext).filter(isNotCommonWord))];
    let imageList = [];
    let completedRequests = 0;
    let responsesExpected = (n) => n + 1;
    getImageListObservableFromWordList(allWords)
    .catch(function(error, caught): Rx.Observable<any> {
        console.log(error.method + " " + error.domain + " => " + error.statusCode + ": " + error.statusMessage);
        return Rx.Observable.empty();
    })
    .subscribe((data) => {
        if (data && data.body && data.body.RelatedTopics) {
            for (let i in data.body.RelatedTopics){
                let RelatedTopic = data.body.RelatedTopics[i];
                if (RelatedTopic.Icon && RelatedTopic.Icon.URL != ""){
                    imageList.push({
                        'title' : RelatedTopic.Text,
                        'url' : RelatedTopic.Icon.URL
                    });
                }
                if (RelatedTopic.Topics){
                    for (let i in RelatedTopic.Topics){
                        let Topic = RelatedTopic.Topics[i];
                        if (Topic.Icon && Topic.Icon.URL != ""){
                            imageList.push({
                                'title' : Topic.Text,
                                'url' : Topic.Icon.URL
                            });
                        }
                    }
                }
            }
        }
        if (data.body && data.body.query && data.body.query.pages){
            let pages = data.body.query.pages;
            for (let id in pages){
                if (pages[id].imageinfo){
                    for (let i in pages[id].imageinfo){
                        if (isGoodImageUrl(pages[id].imageinfo[i].url)){
                            imageList.push({
                                'title' : pages[id].title.replace(/File\:/, ''),
                                'url' : pages[id].imageinfo[i].url
                            });
                        }
                    }
                }
            }
        }
        completedRequests++;
        if (completedRequests >= responsesExpected(allWords.length)){
            response.json({
                'words' : allWords,
                'images' : imageList
            });
        }
    });
});

app.listen(app.get('port'), () => {
  console.log('App running on port', app.get('port'));
});

let getWikiFileUrlFromTitle = function(title:string): string {
    let simplifiedTitle: string = title.replace(/\s/g, '_');
    if (simplifiedTitle.indexOf('File:') === 0) simplifiedTitle = simplifiedTitle.replace(/File\:/, '');
    let hash: string = crypto.createHash('md5').update(simplifiedTitle).digest('hex');
    return 'https://upload.wikimedia.org/wikipedia/commons/' + hash.substring(0,1) + '/' + hash.substring(0,2) + '/' + encodeURI(simplifiedTitle);
}

let setStatValue = function(key:string, increase: boolean): number {
    store.stats[key] = increase ? store.stats[key] + 1 : store.stats[key];
    return store.stats[key];
}

let setReturnValue = function(key:string, value: any): void {
    store[key] = value;
}

let getSplitPlainText = function(plaintext: string): Array<string> {
    let list = plaintext
        .split(/([^0-9A-Za-z|\-]+(?=[^A-Z]))/g)
        .filter((x) => { return x.replace(/[^0-9A-Za-z|\-]+/, '').length });
    list = list.map((x) => {
        if (/[^0-9A-Za-z|\-]+/.test(x) && /(^[a-z0-9|\-]+)|(([^0-9A-Za-z|\-]+[a-z0-9|\-]+))|(^[^0-9A-Za-z|\-]+[A-za-z0-9])/.test(x)){
            let y = x.split(/[^0-9A-Za-z|\-]+/);
            list.push(y[0]);
            y.shift();
            return y.join(' ');;
        } else {
            return x;
        }
    });
    return list;
}

let isGoodImageUrl = function(imageUrl: string): boolean {
    let badImages = ["https://upload.wikimedia.org/wikipedia/en/5/5f/Disambig_gray.svg","https://upload.wikimedia.org/wikipedia/en/4/4a/Commons-logo.svg","https://upload.wikimedia.org/wikipedia/commons/0/06/Wiktionary-logo-v2.svg","https://upload.wikimedia.org/wikipedia/en/9/99/Question_book-new.svg"];
    let goodFileTypes = ["png", "jpg", "jpeg", "tiff", "gif"];
    var imageFileType = imageUrl.split('.')[imageUrl.split('.').length - 1].toLowerCase();
    return badImages.indexOf(imageUrl) === -1 && goodFileTypes.indexOf(imageFileType) !== -1;
}

let getImageListObservableFromWordList = function(words): Rx.Observable<any> {
    let imageListObservables: Array<Rx.Observable<any>> = [getWikiImageListObservableFromWords(words)];
    for (let i in words) imageListObservables.push(getDuckDuckGoImageListObservableFromWord(words[i]));
    return Rx.Observable.merge(...imageListObservables);
}

let getDuckDuckGoImageListObservableFromWord = function(word: string): any {
    return apiDuckDuckGo.newRequest('GET', '', {}, {
        'q' : word,
        'iar' : 'images',
        'ia' : 'images',
        'iax' : '1',
        'format' : 'json',
    });
}

let getWikiImageListObservableFromWords = function(words: Array<string>): any {
    return apiWikipedia.newRequest('GET', '', {}, {
        'format' : 'json',
        'action' : 'query',
        'prop' : 'imageinfo',
        'iiprop' : 'url',
        'gimlimit' : 'max',
        'generator' : 'images',
        'titles' : words.join('|'),
        'redirects' : 1,
    });
}
