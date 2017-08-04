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

var vote;
var target_channel;
var threshold;


// Again, we define a port we want to listen to
const PORT=4390;

// Lets start our server
app.listen(PORT, function () {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Example app listening on port " + PORT);
    //https://slack.com/api/users.list
    vote = 0;    
    target_channel = 'C6HULCRQT'; // vincent-test for development
        // channel = 'C5TA84QL8'; // always-loyalist
});


// This route handles GET requests to our root ngrok address and responds with the same "Ngrok is working message" we used before
app.get('/', function(req, res) {
    res.send('Ngrok is working! Path Hit: ' + req.url);
});

function getChannels() {
    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/x-www-form-urlencoded'
    };

    /* Look for all channels */
    var options = {
        url: 'https://slack.com/api/channels.list',
        method: 'POST',
        headers: headers,
        form: {
            'token': 'xoxp-2523418242-199931701171-222088546772-89b911e345c5b5c6559a383df8566e9d',
            'exclude_archived': 'true',
            'exclude_members': 'true'
        }
    };
    request(options, function(err, resp, body) {
        if (err) {
            console.log("Could not get all channels");
        }
        else {
            return JSON.parse(body).channels;
        }
    });
}

function getChannelInfo(channel) {
    if (!channel) {
        channel = target_channel;
    }

    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/x-www-form-urlencoded'
    };
    /* Look for channel info */
    var options = {
        url: 'https://slack.com/api/channels.info',
        method: 'POST',
        headers: headers,
        form: {
            'token': 'xoxp-2523418242-199931701171-222088546772-89b911e345c5b5c6559a383df8566e9d',
            'channel':channel
        }
    };
    request(options, function(err, resp, body) {
        return (body);
    });
}

/* Reply a message to the user privately */
function reply(req, res, msg) {
    res.end(msg);
}


app.post('/', function(req, res) {
    console.log(req.body);
    var text = req.body.text;
    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/x-www-form-urlencoded'
    };

    inp = text.split(" ");


    console.log(inp[0]);
    console.log(Number.isInteger(parseInt(inp[1])));

    if (inp[0] == 'start' && Number.isInteger(parseInt(inp[1]))) {
        /* Is this a valid game? */
        if (parseInt(inp[1]) <= 3) {
            /* How many people do you want? */
            if (Number.isInteger(parseInt(inp[2]))) {
                threshold = parseInt(inp[2]);

                /* How much time can you wait? */
                if (Number.isInteger(parseInt(inp[3])) && parseInt(inp[3]) > -1) {
                    //setInterval(function() {res.send("Time up!")}, parseInt(inp[3])); // need to send to the whole channel
                    reply(req, res, "Starting game number " + inp[1] + " when we have " + threshold + " people within " + parseInt(inp[3]) + " minutes.");
                }
                reply(req, res, "Starting game number " + inp[1] + " when we have " + threshold + " people with no time limit.");
            }
            reply(req, res, "Missing number of people needed");
        }
        else {
            reply(req, res, 'Invalid game number');
        }
    }
    else if (inp[0] == 'reset') {
        vote = 0;
        threshold = 0;
        res.end();
    }
    else if (text == "yes" || text == "y") {
        vote = vote + 1;
        // tell the channel what the current count is! 

        if (vote > 0 && vote >= threshold) {
            reply(req, res, "Start the game!");
        }
        console.log("Yes: " + vote);
        res.end();
    }
    else if (text == "no" || text == 'n') {
        console.log("Vote no");
        res.end();
    }
    else if (text == 'help' || text == 'h') {
        var msg = "/cmd start [game-num] [people-num] [time]";
        reply(req, res, msg);
    }
    else if (text.substring(0, 5) == "start" || text.substring(0, 2) == 's ') {
        console.log(text);
        res.end();
    }
    else if (text == "games" || text == 'g') {
        var msg = "Game List:\n1) Secret Palpatine\n2) Codenames\n3) Splendor";
        sendToChannel(null, msg);
    }
    else if (text == "view" || text == 'v') {
        var id = req.body.user_id;
        var channel_id = req.body.channel_id;

        var msg = "The vote is currently " + vote;
        reply(req, res, msg);
    }
    else {
        var id = req.body.user_id;
        var channel_id = req.body.channel_id;
        console.log("channel id is " + channel_id);

        //res.send('<@' + req.body.user_id + '>');

        var msg = 'Would you like to join a game <@' + req.body.user_id + '>?';
        sendToChannel(channel_id, msg);
    }
});

function sendToChannel(channel_id, msg) {
    if (!channel_id) {
        channel_id = target_channel;
    }
    var options = {
        url: 'https://slack.com/api/chat.postMessage',
        method: 'POST',
        headers: headers,
        form: {
            'token': 'xoxp-2523418242-199931701171-222088546772-89b911e345c5b5c6559a383df8566e9d',
            // this is the channel id for always-loyalist
            'channel':target_channel,
            'text': msg,
            'username' : 'Game Maker'
        }
    };

    request(options, function(err, resp, body) {
        console.log(body);
    });

    res.end();
}


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
