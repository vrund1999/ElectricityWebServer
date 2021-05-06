// import the express module
const express = require("express");

// setup an express object for the current app
const app = express();


// set the local hostname and the port number
const port = 3000;
const hostname = "localhost";

//Express middleware function to parse incoming requests with JSON
app.use(express.json());


//Object that will store all the device id's and their correponding energy usage values as arrays.
let devices_with_readings = {
};

// Route handler for posting to the web server with the device id.
app.post("/api/:DEVICE_ID", function (req, res) {
    let device_id = req.params.DEVICE_ID;       // Extract the device id from the url using the request params property

    //Check if the request has the energy-usage property
    if (req.body.hasOwnProperty("energy-usage")){

        //Citing https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
        //Use the above reference to find out how to determine if a value is a valid integer.
        if (Number.isInteger(req.body["energy-usage"])){
            let energy_usage = req.body["energy-usage"];            //Get the value of energy-usage from the request body

            // Determine if a post has already been made for the device id
            //If it has then push the energy-usage value to the array
            if (devices_with_readings.hasOwnProperty(device_id)){
                devices_with_readings[device_id].push(energy_usage);
            }

            //If the device id has not already been posted to, then create an empty array at the device id
            //key and push the energy-usage value to the array
            else{
                devices_with_readings[device_id] = [];
                devices_with_readings[device_id].push(energy_usage);
            }

            //Send back a 200 status code once the post has successfully been processed with empty response body
            res.status(200);
            res.send(); // sends empty response body

        }
    }

    //If the request does not have the energy-usage property then send back a 400 status code to the client with
    //a response body that says 'Invalid Request'
    else{
        res.status(400);
        res.setHeader('Content-Type', 'text/plain');
        res.send("Invalid Request"); // sends plain text body containing the text: Invalid Request 
    }
});


// Route handler for get requests that send back a json response body with the total-energy-usage if the
// the device id has values posted to it.
app.get("/api/:DEVICE_ID", function (req, res) {
    let device_id = req.params.DEVICE_ID;       // Get the device is from the request params property

    //Check if the device id has been added to the object as a key
    //If it had been, then return a 200 status code with a json response body with the total-energy-usage
    if (devices_with_readings.hasOwnProperty(device_id)){
        res.status(200)
        res.setHeader('Content-Type', 'application/json');

        res.send("\n" + JSON.stringify({"total-energy-usage": devices_with_readings[device_id]}));    
    }

    //If the device id has not been posted before then send back a plain text response that says
    // 'Device Not Found' with a 404 status code.
    else{
        res.status(404)
        res.setHeader('Content-Type', 'text/plain');

        res.send('Device Not Found');    
    }
});


//Route handler to handle the main webpage when requested by the web server
//It displays all the energy usages for each device id in a HTML table format and displays
//the device IDs with total energy usages that exceed 1000 with a red background.
app.get("/", function(req, res) {
    res.status(200);

    let tableContents;  //Stores the html table rows and columns that will be updated dynamically with the device ids and the corresponding energy usage values.

    //Loop through every device is in the object and calculate the total usage for each device to determine if
    //the row should be colored red or not.
    for (var key in devices_with_readings) {
        let totalUsagePerDevice = 0;
        for (var usage in devices_with_readings[key]){
            totalUsagePerDevice += devices_with_readings[key][usage];
        }

        if (totalUsagePerDevice > 1000){
            tableContents += "<tr style='background-color:red';>" + "<td>" + key + "</td>" + "<td>" + devices_with_readings[key].join(', ') + "</td>" + "</tr>";
        }
        else{
            tableContents += "<tr>" + "<td>" + key + "</td>" + "<td>" + devices_with_readings[key].join(', ') + "</td>" + "</tr>";
        }
    }

    //Send back a HTML response body with a table that displays each device id and it corresponding energy usage values
    //Each row that has total energy usage greater than 1000 is displayed with a red background using css styling
    res.send(`<!DOCTYPE html>
        <html>
            <head>
                <style>
                table, th, td {
                    border: 1.5px solid black;
                    border-collapse: collapse;
                    height:50px;
                    width:200px;
                    text-align:center
                }
                </style>
                <meta charset="utf-8">
                <title>Energy Usage Details By Device Id</title>
            </head>
            <body>
                <table style='margin-left:auto;margin-right:auto';>
                    <tr>
                        <th>Device ID</th>
                        <th>Energy Usage</th>
                    </tr>
                    ${tableContents}
                </table>
            </body>
        </html>`);
});

// Listening for HTTP requests at the url
// http://localhost:3000
app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});
