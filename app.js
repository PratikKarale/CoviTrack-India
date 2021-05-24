const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const { json } = require('body-parser');
const { on } = require('events');
const { stringify } = require('querystring');
const { response } = require('express');
const { exit } = require('process');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');


var lastMonthData = [];
var lastMonthDates = [];


app.get("/", function(req, res){

    // sending country data on home page
    // url for country data
    const url = "https://api.covid19india.org/data.json";
    var chunks = [];

    https.get(url, function(response){

        response.on("data", function(data){
            chunks.push(data);
        }).on("end", function(){
            var data = JSON.parse(Buffer.concat(chunks));
            var latestData = data.cases_time_series[data.cases_time_series.length-1];
            var dailyConfirmed = latestData.dailyconfirmed;
            var totalConfirmed = latestData.totalconfirmed;
            var totalRecovered = latestData.totalrecovered;
            var totalDeaths = latestData.totaldeceased;
            // console.log(latestData);
            
            // last 7 days data
            var tempData  = data.cases_time_series;

            lastMonthData = [];
            lastMonthDates = [];
            
            for(let i = 30; i>0; i--){
                lastMonthData.push(tempData[data.cases_time_series.length-i].dailyconfirmed);
                lastMonthDates.push(tempData[data.cases_time_series.length-i].date);
            }

            var vaccinationData = data.tested[data.tested.length-1];
            var firstDose = vaccinationData.firstdoseadministered;
            var fullyVaccinated = vaccinationData.seconddoseadministered;
            var percentage = ((fullyVaccinated/1380004385)*100).toFixed(2);

            res.render("index", {dailyConfirmedEJS: dailyConfirmed, totalConfirmedEJS: totalConfirmed, totalRecoveredEJS: totalRecovered, totalDeathsEJS: totalDeaths, monthData: lastMonthData, monthDates: lastMonthDates, firstDoseEJS: firstDose, fullyVaccinatedEJS: fullyVaccinated, percentageFullyVaccinatedEJS: percentage});

        })

    })
})


app.post("/", function(req, res){

    var district = (req.body.districtInput);
    var stateOfDistrictInput = 'null';
    var url_states = "https://raw.githubusercontent.com/thatisuday/indian-cities-database/master/cities.json";

    https.get(url_states, function(response){
        var chunks = [];
        response.on("data", function(data){
            chunks.push(data);
        }).on("end", function(){
            var data = JSON.parse(Buffer.concat(chunks));
            for(var i = 0; i<1481 ; i++){
                if(data[i].city == district){
                    stateOfDistrictInput = data[i].state;
                    console.log(stateOfDistrictInput);
                }
            }
        })
    })

    //url for district wise data
    const url = "https://api.covid19india.org/state_district_wise.json";
    https.get(url, function(response){
        var chunks = [];
        response.on("data", function(data){
            chunks.push(data);
        }).on("end", function(){
            var data = JSON.parse(Buffer.concat(chunks));
            if(stateOfDistrictInput === 'null'){
                res.render('result', {activeEJS: "-", confirmedEJS: "-", deathsEJS: "-", districtEJS: "err", monthData: lastMonthData, monthDates: lastMonthDates})
            }else{
                console.log(data[stateOfDistrictInput].districtData[district]);
                var active = data[stateOfDistrictInput].districtData[district].active;
                var confirmed = data[stateOfDistrictInput].districtData[district].confirmed;
                var deceased = data[stateOfDistrictInput].districtData[district].deceased;

                res.render('result', {activeEJS: active, confirmedEJS: confirmed, districtEJS: district, deathsEJS: deceased, monthData: lastMonthData, monthDates: lastMonthDates})
            }
        })
        
    });
    
})





app.listen(process.env.PORT||3000, function(){
    console.log("server is running on 3000");
})