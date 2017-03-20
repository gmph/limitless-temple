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

app.get('/chart', (request, response) => {
    if (request && request.query && request.query.labels && request.query.values){
        response.set('Content-Type', 'image/png');
        getChart(request.query.labels, request.query.values, request.query.title).then((buffer: any) => {
            response.status(200).send(buffer);
        });
    } else {
        response.status(500).send('Error: Invalid chart query\n\nExpected labels, values, title (optional)');
    }
});

app.listen(app.get('port'), () => {
  console.log('App running on port', app.get('port'));
});

function getChart(labels: string, values: string, title?: string): any {
    let chartNode = new ChartjsNode(800, 800);
    return chartNode.drawChart(getConfigFromRequest(labels, values, title)).then(() => {
        return chartNode.getImageBuffer('image/png');
    })
}

function splitListString(listString: string): Array<string> {
    return listString.split(/\s*,\s*/g);
}

function getColorList(n: number): Array<string> {
    let colors = ['#4C92FF', '#E6544A', '#FFC51E', '#44C45D', '#90DA31', '#5CC4F8', '#F47846', '#7879FF', '#A458D8', '#D858A3', '#FF9CD6'];
    let l = Math.ceil(n/colors.length);
    let colorList = colors;
    for (let i = 0; i < l; i++){
        colorList = colorList.concat(colors);
    }
    return colorList;
}

function getConfigFromRequest(labels: string, values: string, title?: string): any {
    return {
        type: 'horizontalBar',
        data: {
            labels: splitListString(labels),
            datasets: [{
                label: '',
                data: splitListString(values).map((s: string): number => parseInt(s)),
                backgroundColor: getColorList(labels.length),
                borderWidth: 0
            }]
        },
        options: {
            title: {
                display: title ? true : false,
                fontSize: 24,
                fontColor: '#000',
                padding: 20,
                text: title ? title : ''
            },
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontSize: 20,
                        fontColor: '#666',
                        fontStyle: 'bold'
                    }
                }],
                xAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontSize: 16,
                        fontColor: '#666',
                        fontStyle: 'bold'
                    }
                }]
            }
        }
    }
}