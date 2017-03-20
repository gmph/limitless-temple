import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as ChartjsNode from 'chartjs-node';

let app = express();

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
    response.set('Content-Type', 'image/png');
	getChart().then((buffer: any) => {
        response.send(buffer, 'binary')
    });
});

app.listen(app.get('port'), () => {
  console.log('App running on port', app.get('port'));
});


function getChart(): any {
    let chartNode = new ChartjsNode(600, 600);
    return chartNode.drawChart().then(() => {
        return chartNode.getImageBuffer('image/png');
    })
}