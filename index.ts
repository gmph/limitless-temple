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

let chartConfig = {
    type: 'horizontalBar',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
}

function getChart(): any {
    let chartNode = new ChartjsNode(600, 600);
    return chartNode.drawChart(chartConfig).then(() => {
        return chartNode.getImageBuffer('image/png');
    })
}