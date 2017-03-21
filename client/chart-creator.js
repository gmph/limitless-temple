$('#create-chart').click(function(){
    var labels = [],
        values = [];
    $('.chart-form .label').each(function(i, label){
        if (label.value && label.value.length) {
            labels.push(label.value);
            var value = $('.chart-form .value').get(i);
            values.push(value.value && value.value.length ? value.value : 0);
        }
    });
    $('#chart-image').attr('src',getChartUrlFromParams(labels, values));
});

function getChartUrlFromParams(labels, values){
    var chartBaseUrl = "https://limitless-temple-40831.herokuapp.com/chart";
    return chartBaseUrl + "?labels=" + labels.join(',') + "&values=" + values.join(',');
}