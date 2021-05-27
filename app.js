const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );
const ejsLint = require('ejs-lint');
const { json } = require('body-parser');
const { on } = require('events');
const { stringify } = require('querystring');
const { response } = require('express');
const { exit } = require('process');
const { stat } = require('fs');
const { ADDRCONFIG } = require('dns');
const { globalAgent } = require('http');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

var myObj = {"key": 12, "key2" : 34, "key3" : 144};

var lastMonthData = [];
var lastMonthDates = [];

//Storing main info in separate array to put it into the table 
var stateNames = [  "Andaman and Nicobar Islands",  "Andhra Pradesh",  "Arunachal Pradesh",  "Assam",  "Bihar",  "Chandigarh",  "Chhattisgarh",  "Delhi",  "Dadra and Nagar Haveli",  "Goa",  "Gujarat",  "Himachal Pradesh",  "Haryana",  "Jharkhand",  "Jammu and Kashmir",  "Karnataka",  "Kerala",  "Ladakh",  "Lakshadweep",  "Maharashtra",  "Meghalaya",  "Manipur",  "Madhya Pradesh",  "Mizoram",  "Nagaland",  "Odisha",  "Punjab",  "Puducherry",  "Rajasthan",  "Sikkim",  "Telangana",  "Tamil Nadu",  "Tripura",  "TT",  "Uttar Pradesh",  "Uttarakhand",  "West Bengal"];
const url = "https://api.covid19india.org/v4/min/data.min.json";
var stateConfirmed = [];
var stateActive = [];
var stateRecovered = [];
var stateDeceased = [];
var stateTested = [];
var stateVaccinated = [];

https.get(url, function(response){
    var chunks = [];
    response.on("data", function(data){
        chunks.push(data);
    }).on("end", function(){
        var data = JSON.parse(Buffer.concat(chunks));
        var i = 0; 
        $.each(data, function(key, val){
            stateConfirmed.push(Number(val.total.confirmed).toLocaleString());
            stateRecovered.push(Number(val.total.recovered).toLocaleString());
            stateDeceased.push(Number(val.total.deceased).toLocaleString());
            stateTested.push(Number(val.total.tested).toLocaleString());
            stateVaccinated.push(Number(val.total.vaccinated).toLocaleString());
            stateActive.push((Number(val.total.confirmed) - (Number(val.total.recovered) + Number(val.total.deceased))).toLocaleString());
            i++;
        })
    })
})


app.get("/", function(req, res){
    // sending country data on home page
    // url for country data
    const url = "https://api.covid19india.org/data.json";
    // const url = "https://api.covid19india.org/v4/min/data.min.json";
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
            //vaccination data            
            var vaccinationData = data.tested[data.tested.length-1];
            var firstDose = vaccinationData.firstdoseadministered;
            var fullyVaccinated = vaccinationData.seconddoseadministered;
            var percentage = ((fullyVaccinated/1380004385)*100).toFixed(2);

            dailyConfirmed = Number(dailyConfirmed).toLocaleString();
            totalConfirmed = Number(totalConfirmed).toLocaleString();
            totalRecovered = Number(totalRecovered).toLocaleString();
            totalDeaths = Number(totalDeaths).toLocaleString();
            firstDose = Number(firstDose).toLocaleString();
            fullyVaccinated = Number(fullyVaccinated).toLocaleString();
            
            var tempData  = data.cases_time_series;
            //setting last month data == null (if user searches multiple 
            // times then last month data will be added again and again and this will cause a weird graph)
            lastMonthData = [];
            lastMonthDates = [];
            //looping through the data nd getting last 30 day data
            for(let i = 7; i>0; i--){
                lastMonthData.push(tempData[data.cases_time_series.length-i].dailyconfirmed);
                lastMonthDates.push(tempData[data.cases_time_series.length-i].date);
            }

            res.render("index", {dailyConfirmedEJS: dailyConfirmed, totalConfirmedEJS: totalConfirmed, totalRecoveredEJS: totalRecovered, totalDeathsEJS: totalDeaths, monthData: lastMonthData, monthDates: lastMonthDates, firstDoseEJS: firstDose, fullyVaccinatedEJS: fullyVaccinated, percentageFullyVaccinatedEJS: percentage, stateConfirmedEJS: stateConfirmed, stateActiveEJS: stateActive, stateRecoveredEJS: stateRecovered, stateTestedEJS:stateTested, stateVaccinatedEJS: stateVaccinated, stateDeceasedEJS: stateDeceased, stateNamesEJS:stateNames});

        })

    })
})


app.post("/", function(req, res){
    console.log(req.body);
    var state = req.body.stateSelect;
    var district = req.body.districtSelect;

    if(!district || !state){                 //if the input is not entered properly
        res.redirect("/failure");
    }else{


        //url for district wise data
        const url = "https://api.covid19india.org/v4/min/data.min.json";
        https.get(url, function(response){
            var chunks = [];
            response.on("data", function(data){
                chunks.push(data);
            }).on("end", function(){
                var data = JSON.parse(Buffer.concat(chunks));
                // console.log(data[state].districts[district]);
                var confirmed = data[state].districts[district].total.confirmed;
                var recovered = data[state].districts[district].total.recovered;
                var vaccinated = data[state].districts[district].total.vaccinated;
                var deceased = data[state].districts[district].total.deceased;
                var active = Number(confirmed) - Number(recovered+deceased);
                var population = data[state].districts[district].meta.population;
                
                confirmed = Number(confirmed).toLocaleString();
                recovered = Number(recovered).toLocaleString();
                vaccinated = Number(vaccinated).toLocaleString();
                deceased = Number(deceased).toLocaleString();
                active = (active).toLocaleString();
                population = Number(population).toLocaleString();

                console.log(active);
                console.log(deceased);

                res.render('result', {activeEJS: active, confirmedEJS: confirmed, districtEJS: district, deathsEJS: deceased, monthData: lastMonthData, monthDates: lastMonthDates, stateEJS: state, populationEJS:population, stateConfirmedEJS: stateConfirmed, stateActiveEJS: stateActive, stateRecoveredEJS: stateRecovered, stateTestedEJS:stateTested, stateVaccinatedEJS: stateVaccinated, stateDeceasedEJS: stateDeceased, stateNamesEJS:stateNames})
            })
            
        });



    }

    
})


app.get("/failure", function(req, res){
    res.render('failure');
})

app.post("/failure", function(req, res){
    res.redirect("/");
})


app.listen(process.env.PORT||3000, function(){
    console.log("server is running on 3000");
})