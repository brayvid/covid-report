var days;
function getDataCSV(){
    // var csvfile;
    var request = new XMLHttpRequest();
    request.open('GET', 'https://raw.githubusercontent.com/nychealth/coronavirus-data/master/trends/data-by-day.csv', true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            var type = request.getResponseHeader('Content-Type');
            if (type.indexOf("text/csv") !== 1) {
                var lines = request.responseText.split('\n');
                var headers = getCsvValuesFromLine(lines[0]);
                lines.shift(); // remove header line from array
                days = lines.map(function(line) {
                    var day = {}, lineValues = getCsvValuesFromLine(line);
                    for(let i = 0; i < lines.length; i++) {
                        day[headers[i]] = lineValues[i];
                    }
                    return day;
                });
                var latest = [days.slice(-3)[0]["CASE_COUNT_7DAY_AVG"] , days.slice(-3)[0]["HOSP_COUNT_7DAY_AVG"] , days.slice(-2)[0]["DEATH_COUNT_7DAY_AVG"]];
                var date_range = days.slice(-9)[0]["date_of_interest"] + "  -  " + days.slice(-3)[0]["date_of_interest"]
                document.getElementById("range").innerHTML = date_range;
                document.getElementById("cases").innerHTML = latest[0].toString();
                document.getElementById("hosp").innerHTML = latest[1].toString();
                document.getElementById("deaths").innerHTML = latest[2].toString();
                // console.log(days);
                scatterPlot();
                return "success";
            }else{
                console.log("error w request");
                return "error";
                
            }
        }
    }
}


function scatterPlot(){
    let xyArr = [];
    let last30Days = days.slice(-32);
    
    for(let i = 0; i < 30;i++){
        xyArr.push({
            x: i-30,
            y: last30Days[i]["CASE_COUNT_7DAY_AVG"]
        })
    }

    let scatterData = [{
        label: 'New cases',
        data: xyArr
    }];

    var ctx = document.getElementById('myChart').getContext('2d');

    var myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: scatterData
        },
        backgroundColor: '#ffffff',
        options: {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }]
            }
        }
    });
}


function getCsvValuesFromLine(line) {
    var values = line.split(',');
    value = values.map(function(value){
        return value.replace(/\"/g, '');
        });
    return values;
}


// This code will run once the entire page (DOM) is ready.
// It's the standard way to start executing jQuery-dependent code.
$(document).ready(function() {
    // This is the function call that was previously in your HTML.
    // It will now fetch and display your data.
    getDataCSV(); 
});