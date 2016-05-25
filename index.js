var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var Wit = require('node-wit');
var app = express();

app.set('port', (process.env.PORT || 5000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'harvey_bot_development') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token, woops')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        if (event.message && event.message.text) {
            text = event.message.text
            if(text === 'What\'s the weather like in San Jose?') {
              sendWeatherMessage(sender)
            }
            sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
        }
    }
    res.sendStatus(200)
})

var token = "EAAQtPmyLcRwBABDJORRklIWNOMgFNqQphGyuASod6kuyZBeYHsgi6vBLj449wbZCrFJZAZAIqWiMJgQwNWpWiirNZAPgFGywsusnY3kMOPDZB9pMAnb5lW7eWvmDjPm19lxtzRzbZCXoy5VFRbuUmXJ1QCJAqZAUUZB7u4R3OBGVQsgZDZD"

function sendWeatherMessage(sender) {
  messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Weather Forecast",
                    "subtitle": "Weather type",
                    "image_url": "http://phandroid.s3.amazonaws.com/wp-content/uploads/2014/04/yahoo.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://weather.com",
                        "title": "Weather Report"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }, {
                    "title": "Second card",
                    "subtitle": "possible other stuff",
                    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:process.env.PAGE_TOKEN},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
