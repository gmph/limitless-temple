$(document).on('click', '#create-chart', updateChartFromForm);
$(document).on('focus keyup', '.chart-form .chart-bar input', function(e){
    this.setAttribute('value', this.value);
    updateChartUI();
});
$(document).on('error', '#chart-image', setSrcToDefaultUrl);
$(document).ready(init);

function init(){
    setSrcToDefaultUrl($('#chart-image'));
}

function setSrcToDefaultUrl(element){
    var $element = $(element);
    var exampleChart = {
        'title': 'Example store performance',
        'type': 'hor',
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
    var chartBaseUrl = location.protocol + '//' + location.host + '/chart';
    return chartBaseUrl + "?title=" + chartData.title + "&labels=" + chartData.labels.join(',') + "&values=" + chartData.values.join(',') + "&type=" + chartData.type;
}

function updateChartUI(){
    updateDynamicChartSizes();
    updateChartBarCount();
}

function updateDynamicChartSizes(){
    var chartData = getChartData();
    var maxValue = getMaxOfArray(chartData.values);
    var limit = maxValue * 1.429;
    var percentValues = chartData.values.map((value) => isNaN(value) ? 0 : Math.round(value / limit * 100));
    $('.chart-form .percentage-bar').css('width', '0');
    $('.chart-form .chart-bar .value:not([value=""])').each((i, value) => {
        var $bar = $(value).closest('.chart-bar');
        $bar.find('.percentage-bar').css('width', percentValues[i] + '%');
    })
}

function getMaxOfArray(numArray){
    return Math.max.apply(null, numArray);
}

function getChartData(){
    var labels = [];
    var values = [];
    var units = "";
    var title = $('.chart-form .chart-title').val();
    var type = $('.chart-form .chart-type').val();
    $('.chart-form .label').each((i, label) => {
        var value = $('.chart-form .value').get(i);
        if (chartBarIsValid(label, value)) {
            var barUnits = value.value.replace(/[^£$%€¢¥km]/g,'').split('')[0];
            if (barUnits && barUnits.length) units = value.value.replace(/[^£$%€¢¥km]/g,'').split('')[0];
            labels.push(label.value && label.value.length ? label.value : '–');
            values.push(value.value && value.value.length ? parseFloat(value.value.replace(/[^0-9\.\-]/g,'')) : 0);
        }
    });
    return {
        'title' : units.length ? (title ? title + ' (' + units + ')' : units) : title,
        'type' : type,
        'labels' : labels,
        'values' : values
    }
}

function chartBarIsValid(label, value){
    return label.value && label.value.length || value.value && value.value.length;
}

function updateChartBarCount(){
    var $chartBars = $('.chart-form .chart-bar');
    var validity = $chartBars.map((i, chartBar) => {
        var $chartBar = $(chartBar);
        var validValue = $chartBar.find('.value').val().length != 0;
        var validLabel = $chartBar.find('.label').val().length != 0;
        return (i < 2 || validLabel || validValue);
    })
    var maxValid = -1;
    for (var i = 0; i < validity.length; i++){
        if (validity[i]) maxValid = i;
    }
    if (maxValid + 1 >= $chartBars.length) {
        addChartBar();
    }
    for (var i = 0; i < $chartBars.length; i++){
        if (i > 2 && maxValid + 1 < i) $chartBars.eq(i).remove();
    }
}

function addChartBar(){
    var $chartBars = $('.chart-form .chart-bar');
    var n = $chartBars.length + 1;
    var $chartBar = $('<div class="chart-bar"><input class="label" placeholder="Label '+n+'" value="" /><input class="value" placeholder="Value" value="" /><div class="percentage-bar"></div></div>');
    $('.chart-form').append($chartBar);
}