// Import express and request modules
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');

// Store our app's ID and Secret. These we got from Step 1. 
// For this tutorial, we'll keep your API credentials right here. But for an actual app, you'll want to  store them securely in environment variables. 
var clientId = '2523418242.222048821636';
var clientSecret = '65e45ddbe6bfe53a25217e7c07d602e8';

// Instantiates Express and assigns our app variable to it
var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


// Again, we define a port we want to listen to
const PORT=4390;

// Lets start our server
app.listen(PORT, function () {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Example app listening on port " + PORT);
    //https://slack.com/api/users.list
    
});


// This route handles GET requests to our root ngrok address and responds with the same "Ngrok is working message" we used before
app.get('/', function(req, res) {
    res.send('Ngrok is working! Path Hit: ' + req.url);
});

app.post('/', function(req, res) {
    console.log(req.body);
    var id = req.body.user_id;
    var channel_id = req.body.channel_id;
    console.log("channel id is " + channel_id);

    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/x-www-form-urlencoded'
    };

    var options = {
        //url: 'https://slack.com/api/channels.info',
        url: 'https://slack.com/api/channels.list',
        //url: 'https://slack.com/api/channels.info',
        method: 'POST',
        headers: headers,
        form: {
            //'token': 'xoxp-2523418242-199931701171-222880851478-876149e7bc7126c08d74f4dfe7e1cd1b',
            'token': 'xoxp-2523418242-199931701171-222088546772-89b911e345c5b5c6559a383df8566e9d',
            'exclude_archived': 'true',
            'exclude_members': 'true'
            //'channel':channel_id
        }
    };
    request(options, function(err, resp, body) {
        //console.log(body);
        console.log(body.channels);

    });
    res.send('<@' + req.body.user_id + '>');
});


// This route handles get request to a /oauth endpoint. We'll use this endpoint for handling the logic of the Slack oAuth process behind our app.
app.get('/oauth', function(req, res) {
    // When a user authorizes an app, a code query parameter is passed on the oAuth endpoint. If that code is not there, we respond with an error message
    if (!req.query.code) {
        res.status(500);
        res.send({"Error": "Looks like we're not getting code."});
        console.log("Looks like we're not getting code.");
    } else {
        // If it's there...

        // We'll do a GET call to Slack's `oauth.access` endpoint, passing our app's client ID, client secret, and the code we just got as query parameters.
        request({
            url: 'https://slack.com/api/oauth.access', //URL to hit
            qs: {code: req.query.code, client_id: clientId, client_secret: clientSecret}, //Query string data
            method: 'GET', //Specify the method

        }, function (error, response, body) {
            if (error) {
                console.log(error);
            } else {
                res.json(body);

            }
        })
    }
});

// Route the endpoint that our slash command will point to and send back a simple response to indicate that ngrok is working
app.post('/command', function(req, res) {
    res.send('Your ngrok tunnel is up and running!');
});
