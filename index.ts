import * as express from 'express';
import * as bodyParser from 'body-parser';
import { getChart } from './api/chart';

let app = express();

app.set('port', (process.env.PORT || 5000));

app.use('/', express.static(__dirname + '/client'));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://gmph.co');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/chart', (request, response) => {
    if (request && request.query && request.query.labels && request.query.values){
        response.set('Content-Type', 'image/png');
        getChart(request.query.labels, request.query.values, request.query.title, request.query.type).then((buffer: any) => {
            response.status(200).send(buffer);
        });
    } else {
        response.status(500).send('Error: Invalid chart query\n\nExpected labels, values, title (optional)');
    }
});

app.listen(app.get('port'), () => {
  console.log('App running on port', app.get('port'));
});