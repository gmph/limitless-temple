$(document).on('click', '#create-chart', updateChartFromForm);
$(document).on('keyup', '.chart-form .chart-bar input', updateDynamicChartSizes);
$(document).on('error', '#chart-image', setSrcToDefaultUrl);
$(document).ready(init);

function init(){
    setSrcToDefaultUrl($('#chart-image'));
}

function setSrcToDefaultUrl(element){
    var $element = $(element);
    var exampleChart = {
        'title': 'Example store performance',
        'labels': ['York', 'Glasgow', 'Edinburgh'],
        'values': [34, 28, 47]
    }
    $element.attr('src',getChartUrlFromChartData(exampleChart));
}

function updateChartFromForm(){
    var chartData = getChartData();
    $('#chart-image').attr('src',getChartUrlFromChartData(chartData));
}

function getChartUrlFromChartData(chartData){
    var chartBaseUrl = "https://limitless-temple-40831.herokuapp.com/chart";
    return chartBaseUrl + "?title=" + chartData.title + "&labels=" + chartData.labels.join(',') + "&values=" + chartData.values.join(',');
}

function updateDynamicChartSizes(){
    var chartData = getChartData();
    var maxValue = getMaxOfArray(chartData.values);
    var limit = maxValue * 1.429;
    var percentValues = chartData.values.map((value) => Math.round(value / limit * 100));
    $('.chart-form .chart-bar').each((i, bar) => {
        var $bar = $(bar);
        $bar.find('.percentage-bar').css('width', percentValues[i] + '%');
    })
}

function getMaxOfArray(numArray){
    return Math.max.apply(null, numArray);
}

function getChartData(){
    var labels = [],
        values = [];
    $('.chart-form .label').each((i, label) => {
        var value = $('.chart-form .value').get(i);
        if (chartBarIsValid(label, value)) {
            labels.push(label.value && label.value.length ? label.value : '–');
            values.push(value.value && value.value.length ? value.value : 0);
        }
    });
    return {
        'title' : $('.chart-form .title').val(),
        'labels': labels,
        'values': values
    }
}

function chartBarIsValid(label, value){
    return label.value && label.value.length || value.value && value.value.length;
}

function createChartBar(){
    var $chartBar = $('<div class="chart-bar"><input class="label" placeholder="Bar 2" /><input class="value" placeholder="Value" /><div class="percentage-bar"></div></div>');
    
}