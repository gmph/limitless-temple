import * as ChartjsNode from 'chartjs-node';

export function getChart(labels: string, values: string, title?: string): any {
    let chartNode = new ChartjsNode(800, 104*(splitListString(labels).length+1));
    return chartNode.drawChart(getConfigFromRequest(labels, values, title)).then(() => {
        let buffer = chartNode.getImageBuffer('image/png');
        chartNode.destroy();
        return buffer;
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
                data: splitListString(values).map((s: string): number => parseFloat(s)),
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
            layout: {
                padding: {
                    top: 20,
                    left: 40,
                    bottom: 40,
                    right: 40
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontSize: 20,
                        fontColor: '#666',
                        fontStyle: 'bold',
                        padding: 16
                    }
                }],
                xAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontSize: 16,
                        fontColor: '#666',
                        fontStyle: 'bold',
                    }
                }]
            },
            plugins: {
                beforeDraw: function(chartInstance) {
                    var ctx = chartInstance.chart.ctx;
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, chartInstance.chart.width, chartInstance.chart.height);
                }
            }
        }
    }
}