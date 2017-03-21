import * as ChartjsNode from 'chartjs-node';

export function getChart(labels: string, values: string, title?: string, type?: string): any {
    let config = getConfigFromRequest(labels, values, title, type);
    let chartNode = new ChartjsNode(config.type == 'doughnut' ? 600 : 800, config.type == 'doughnut' ? 600 : 104*(splitListString(labels).length+1));
    return chartNode.drawChart(config).then(() => {
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

function getValidChartType(type: string){
    let types = {
        'hor' : 'horizontalBar',
        'ver' : 'bar',
        'line' : 'line',
        'doughnut' : 'doughnut'
    }
    return type in types ? types[type] : types[Object.keys(types)[0]];
}

function getConfigFromRequest(labels: string, values: string, title?: string, type?: string): any {
    let validType = getValidChartType(type);
    let legend = validType == 'doughnut' ? {
        display: true,
        position: 'right',
        labels: {
            fontSize: 16,
            fontStyle: 'bold',
            colorColor: '#666'
        }
    } : {
        display: false
    }
    let scales = validType == 'doughnut' ?  { 
            display: false,
            yAxes: [{
                ticks: { display: false },
                gridLines : {
                    display : false,
                    drawBorder : false
                }
            }],
            xAxes: [{ 
                ticks: { display: false },
                gridLines : {
                    display : false,
                    drawBorder: false
                }
            }] 
        } : {
        yAxes: [{
            id: '1',
            ticks: {
                beginAtZero: true,
                fontSize: 20,
                fontColor: '#666',
                fontStyle: 'bold',
                padding: 16
            }
        }],
        xAxes: [{
            id: '0',
            ticks: {
                beginAtZero: true,
                fontSize: 16,
                fontColor: '#666',
                fontStyle: 'bold',
            }
        }]
    }
    return {
        type: validType,
        data: {
            labels: splitListString(labels),
            datasets: [{
                label: '',
                data: splitListString(values).map((s: string): number => parseFloat(s)),
                backgroundColor: validType == 'line' ? getColorList(labels.length)[0] : getColorList(labels.length),
                borderWidth: 0,
                lineTension: 0.2,
                pointRadius: 4,
                pointBackgroundColor: 'rgba(0,0,0,.5)',
                xAxisID : '0',
                yAxisID : '1'
            }]
        },
        options: {
            title: {
                display: title ? true : false,
                fontSize: 24,
                fontColor: '#000',
                padding: 32,
                text: title ? title : ''
            },
            legend: legend,
            layout: {
                padding: {
                    top: title ? 8 : 32,
                    left: 32,
                    bottom: 20,
                    right: 32
                }
            },
            scales: scales,
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