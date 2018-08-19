/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    fs = require('fs');

var app = express();

var db;



var cloudant;

var fileToUpload;

var dbCredentials = {
    dbName: 'pcv_db'
};

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var multipart = require('connect-multiparty')
const csv=require('csvtojson')
var CronJob = require('cron').CronJob;
var _ = require('lodash');
var request = require('request')


const accountSid = 'AC68694c8a914917919a17bb57c4ea0a1e';
const authToken = 'b01a778f2018f15c2ca14a276341bb7b';
const client = require('twilio')(accountSid, authToken);

var cronjob = new CronJob('* */2 * * * *', function() {
    console.log('You will see this message every 2 minutes', new Date(Date.now() + 120000).toISOString());
    //console.log("date in 2 minutes",Date.now(),  Date.now() + new Date(0,0,0,0,2,0))
    if(db.find)
    db.find({
        "selector": {
           "time_stamp": {
              "$gt": new Date(Date.now() + 120000).toISOString()
           }
        },
        "sort": [
           {
              "time_stamp": "asc"
           }
        ]}, (err, res)=>{
     _.forEach(res.docs, (elm)=>{
        //console.log("ELM", elm.time_stamp >  new Date(Date.now() + 120000).toISOString())
       // var val = elm.time_stamp < new Date(Date.now() + 120000).toISOString();
        //if(val)
       // {
            client.messages
            .create({from: '+19167028035', body: "You have a meeting scheduled with PVC. Mentor:" + elm.Advisor + " Client: " + elm.SBO + ". Dial: +1-408-638-0986 And enter meeting id: " + elm.meeting_id, to: "+15303006909"})
            .then(message => console.log(message.sid))
            .done();

            // client.messages
            // .create({from: '+19167028035', body: "You have a meeting scheduled with PVC. Mentor:" + elm.Advisor + " Client: " + elm.SBO + ". Dial: +1-408-638-0986 And enter meeting id: " + elm.meeting_id, to: "+15303006909"})
            // .then(message => console.log(message.sid))
            // .done();
       // }
    });
    //console.log('filtered', filtered)

   });
  }, null, true, 'America/Los_Angeles');
  
  cronjob.start();




//   var cronjob2 = new CronJob('* */2 * * * *', function() {
//     console.log('You will see this message every 2 minutes', new Date(Date.now() + 120000).toISOString());
//     //console.log("date in 2 minutes",Date.now(),  Date.now() + new Date(0,0,0,0,2,0))
//     if(db.find)
//     db.find({
//         "selector": {
//            "time_stamp": {
//               "$lt": new Date(Date.now() + 120000).toISOString()
//            }
//         },
//         "sort": [
//            {
//               "time_stamp": "asc"
//            }
//         ]}, (err, res)=>{
//      _.forEach(res.docs, (elm)=>{
//         //console.log("ELM", elm.time_stamp >  new Date(Date.now() + 120000).toISOString())
//        // var val = elm.time_stamp < new Date(Date.now() + 120000).toISOString();
//         //if(val)
//        // {
//             client.messages
//             .create({from: '+19167028035', body: "You have a meeting scheduled with PVC. Mentor:" + elm.Advisor + " Client: " + elm.SBO + ". Dial: +1-408-638-0986 And enter meeting id: " + elm.meeting_id, to: "+15303006909"})
//             .then(message => console.log(message.sid))
//             .done();

//             // client.messages
//             // .create({from: '+19167028035', body: "You have a meeting scheduled with PVC. Mentor:" + elm.Advisor + " Client: " + elm.SBO + ". Dial: +1-408-638-0986 And enter meeting id: " + elm.meeting_id, to: "+15303006909"})
//             // .then(message => console.log(message.sid))
//             // .done();
//        // }
//     });
//     //console.log('filtered', filtered)

//    });
//   }, null, true, 'America/Los_Angeles');
  
//   cronjob2.start();



//   var options = { method: 'GET',
//   url: 'https://api.zoom.us/v2/past_meetings/679660202/participants',
//   headers: 
//    { 'Postman-Token': '92dfe128-6b6f-47f1-9f48-8f2a1f5bc32a',
//      'Cache-Control': 'no-cache',
//      Authorization: 'Bearer  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJQV2xIakpVcFJEU2p4LTJJV1lILWFBIiwiaWF0IjoxNTM0Njg0NTk4LCJleHAiOjE1MzQ5MTg2NDd9.sHxB_wE9qlUI_h67hIIK_O7FcebFTx59jPYhk7Kn7So' } };

// request(options, function (error, response, body) {
//   if (error) throw new Error(error);

//   console.log(body);
// });


const {startUpcomingNotificationCron} = require("./services/cronjob");

const {schedule_meetings} = require("./schedule_meeting");

var multipartMiddleware = multipart();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, '/views/style')));

// development only
if ('development' == app.get('env')) {
    app.use(errorHandler());
}

function getDBCredentialsUrl(jsonData) {
    var vcapServices = JSON.parse(jsonData);
    return vcapServices.url;
    // Pattern match to find the first instance of a Cloudant service in
    // VCAP_SERVICES. If you know your service key, you can access the
    // service credentials directly by using the vcapServices object.
    // for (var vcapService in vcapServices) {
    //     if (vcapService.match(/cloudant/i)) {
    //         //return vcapServices[vcapService][0].credentials.url;
    //         //return vcapService.url;

    //     }
    // }
}

function initDBConnection() {
    //When running on Bluemix, this variable will be set to a json object
    //containing all the service credentials of all the bound services
    if (process.env.VCAP_SERVICES) {
        dbCredentials.url = getDBCredentialsUrl(process.env.VCAP_SERVICES);
    } else { //When running locally, the VCAP_SERVICES will not be set

        // When running this app locally you can get your Cloudant credentials
        // from Bluemix (VCAP_SERVICES in "cf env" output or the Environment
        // Variables section for an app in the Bluemix console dashboard).
        // Once you have the credentials, paste them into a file called vcap-local.json.
        // url will be in this format: https://username:password@xxxxxxxxx-bluemix.cloudant.com
        dbCredentials.url = getDBCredentialsUrl(fs.readFileSync("vcap-local.json", "utf-8"));
    }

    cloudant = require('cloudant')(dbCredentials.url);

    // check if DB exists if not create
    cloudant.db.create(dbCredentials.dbName, function (err, res) {
        if (err) {
            console.log('Could not create new db: ' + dbCredentials.dbName + ', it might already exist.');
        }
        else 
        {
            //startUpcomingNotificationCron(db);
        }
    });

    db = cloudant.use(dbCredentials.dbName);
    
}

initDBConnection();

app.get('/', routes.index);

function createResponseData(id, name, value, attachments) {

    var responseData = {
        id: id,
        name: sanitizeInput(name),
        value: sanitizeInput(value),
        attachements: []
    };


    attachments.forEach(function (item, index) {
        var attachmentData = {
            content_type: item.type,
            key: item.key,
            url: '/api/favorites/attach?id=' + id + '&key=' + item.key
        };
        responseData.attachements.push(attachmentData);

    });
    return responseData;
}

// function sendmessage(req, res) {
//     console.log(req.body);
//     client.messages
//           .create({from: '+19167028035', body: req.body.body, to: req.body.to})
//           .then(message => console.log(message.sid))
//           .done();
// }

// app.post('/messaging', sendmessage());

app.post('/notification/inbound', function (request, response) {
    console.log(request.body);
    response.send("OKAAAAY");

});

app.post('/notification/outbound', function (request, response) {
    console.log(request.body);
    response.sendStatus(200);

});

app.post('/notification/fallback', function (request, response) {
console.log(request.body);
response.sendStatus(200);
});

app.post('/notification/monthly-inbound', function (request, response) {
    console.log(request.body);
    response.send("OKAAAAY");

});
app.post('/notification/monthly-outbound', function (request, response) {
    console.log(request.body);
    response.sendStatus(200);

});

app.post('/notification/monthly-fallback', function (request, response) {
console.log(request.body);
response.sendStatus(200);
});

function sanitizeInput(str) {
    return String(str).replace(/&(?!amp;|lt;|gt;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

var saveDocument = function (id, name, value, response) {

    if (id === undefined) {
        // Generated random id
        id = '';
    }

    db.insert({
        name: name,
        value: value
    }, id, function (err, doc) {
        if (err) {
            console.log(err);
            response.sendStatus(500);
        } else
            response.sendStatus(200);
        response.end();
    });

}

app.get('/api/favorites/attach', function (request, response) {
    var doc = request.query.id;
    var key = request.query.key;

    db.attachment.get(doc, key, function (err, body) {
        if (err) {
            response.status(500);
            response.setHeader('Content-Type', 'text/plain');
            response.write('Error: ' + err);
            response.end();
            return;
        }

        response.status(200);
        response.setHeader("Content-Disposition", 'inline; filename="' + key + '"');
        response.write(body);
        response.end();
        return;
    });
});

app.post('/api/favorites/attach', multipartMiddleware, function (request, response) {

    console.log("Upload File Invoked..", request.files.file);
    console.log('Request: ' + JSON.stringify(request.headers));

    var id;
    if (request.files.file.type !== 'text/csv') {
        response.sendStatus(400);
    }
    else {

        db.get(request.query.id, function (err, existingdoc) {

            var isExistingDoc = false;
            if (!existingdoc) {
                id = '-1';
            } else {
                id = existingdoc.id;
                isExistingDoc = true;
            }

            var name = sanitizeInput(request.query.name);
            var value = sanitizeInput(request.query.value);

            var file = request.files.file;
            var newPath = './public/uploads/' + file.name;

            var insertAttachment = function (file, id, rev, name, value, response) {

                fs.readFile(file.path, function (err, data) {
                    if (!err) {

                        if (file) {

                            csv()
                                .fromString(data.toString())
                                .then((parsedData) => {
                                    console.log("this is parsed data",parsedData[0],typeof parsedData[0],parsedData[0].Advisor,typeof parsedData[0].Advisor,parsedData[0]["Advisor Phone"],typeof parsedData[0]["Advisor Phone"]) // => [["1","2","3"], ["4","5","6"], ["7","8","9"]]
                                    schedule_meetings(parsedData, db);
                                    db.attachment.insert(id, file.name, data, file.type, {
                                        rev: rev
                                    }, function (err, document) {
                                        if (!err) {
                                            console.log('Attachment saved successfully.. ');

                                            db.get(document.id, function (err, doc) {
                                                console.log('Attachements from server --> ' + JSON.stringify(doc._attachments));

                                                var attachements = [];
                                                var attachData;
                                                for (var attachment in doc._attachments) {
                                                    if (attachment == value) {
                                                        attachData = {
                                                            "key": attachment,
                                                            "type": file.type
                                                        };
                                                    } else {
                                                        attachData = {
                                                            "key": attachment,
                                                            "type": doc._attachments[attachment]['content_type']
                                                        };
                                                    }
                                                    attachements.push(attachData);
                                                }
                                                var responseData = createResponseData(
                                                    id,
                                                    name,
                                                    value,
                                                    attachements);
                                                console.log('Response after attachment: \n' + JSON.stringify(responseData));
                                                response.write(JSON.stringify(responseData));
                                                response.end();
                                                return;
                                            });
                                        } else {
                                            console.log(err);
                                        }
                                    });
                                })
                        }
                    }
                });
            }

            if (!isExistingDoc) {
                existingdoc = {
                    name: name,
                    value: value,
                    create_date: new Date()
                };

                // save doc
                db.insert({
                    name: name,
                    value: value
                }, '', function (err, doc) {
                    if (err) {
                        console.log(err);
                    } else {

                        existingdoc = doc;
                        console.log("New doc created ..");
                        console.log(existingdoc);
                        insertAttachment(file, existingdoc.id, existingdoc.rev, name, value, response);

                    }
                });

            } else {
                console.log('Adding attachment to existing doc.');
                console.log(existingdoc);
                insertAttachment(file, existingdoc._id, existingdoc._rev, name, value, response);
            }

        });
    }
});

app.post('/api/favorites', function (request, response) {

    console.log("Create Invoked..");
    console.log("Name: " + request.body.name);
    console.log("Value: " + request.body.value);

    // var id = request.body.id;
    var name = sanitizeInput(request.body.name);
    var value = sanitizeInput(request.body.value);

    saveDocument(null, name, value, response);

});

app.delete('/api/favorites', function (request, response) {

    console.log("Delete Invoked..");
    var id = request.query.id;
    // var rev = request.query.rev; // Rev can be fetched from request. if
    // needed, send the rev from client
    console.log("Removing document of ID: " + id);
    console.log('Request Query: ' + JSON.stringify(request.query));

    db.get(id, {
        revs_info: true
    }, function (err, doc) {
        if (!err) {
            db.destroy(doc._id, doc._rev, function (err, res) {
                // Handle response
                if (err) {
                    console.log(err);
                    response.sendStatus(500);
                } else {
                    response.sendStatus(200);
                }
            });
        }
    });

});

app.put('/api/favorites', function (request, response) {

    console.log("Update Invoked..");

    var id = request.body.id;
    var name = sanitizeInput(request.body.name);
    var value = sanitizeInput(request.body.value);

    console.log("ID: " + id);

    db.get(id, {
        revs_info: true
    }, function (err, doc) {
        if (!err) {
            console.log(doc);
            doc.name = name;
            doc.value = value;
            db.insert(doc, doc.id, function (err, doc) {
                if (err) {
                    console.log('Error inserting data\n' + err);
                    return 500;
                }
                return 200;
            });
        }
    });
});

app.get('/api/favorites', function (request, response) {

    console.log("Get method invoked.. ")

    db = cloudant.use(dbCredentials.dbName);
    var docList = [];
    var i = 0;
    db.list(function (err, body) {
        if (!err) {
            var len = body.rows.length;
            console.log('total # of docs -> ' + len);
            if (len == 0) {
                // push sample data
                // save doc
                var docName = 'Enter doc name';
                var docDesc = 'Enter document description';
                db.insert({
                    name: docName,
                    value: 'Document Description'
                }, '', function (err, doc) {
                    if (err) {
                        console.log(err);
                    } else {

                        console.log('Document : ' + JSON.stringify(doc));
                        var responseData = createResponseData(
                            doc.id,
                            docName,
                            docDesc, []);
                        docList.push(responseData);
                        response.write(JSON.stringify(docList));
                        console.log(JSON.stringify(docList));
                        console.log('ending response...');
                        response.end();
                    }
                });
            } else {

                body.rows.forEach(function (document) {

                    db.get(document.id, {
                        revs_info: true
                    }, function (err, doc) {
                        if (!err) {
                            if (doc['_attachments']) {

                                var attachments = [];
                                for (var attribute in doc['_attachments']) {

                                    if (doc['_attachments'][attribute] && doc['_attachments'][attribute]['content_type']) {
                                        attachments.push({
                                            "key": attribute,
                                            "type": doc['_attachments'][attribute]['content_type']
                                        });
                                    }
                                    console.log(attribute + ": " + JSON.stringify(doc['_attachments'][attribute]));
                                }
                                var responseData = createResponseData(
                                    doc._id,
                                    doc.name,
                                    doc.value,
                                    attachments);

                            } else {
                                var responseData = createResponseData(
                                    doc._id,
                                    doc.name,
                                    doc.value, []);
                            }

                            docList.push(responseData);
                            i++;
                            if (i >= len) {
                                response.write(JSON.stringify(docList));
                                console.log('ending response...');
                                response.end();
                            }
                        } else {
                            console.log(err);
                        }
                    });

                });
            }

        } else {
            console.log(err);
        }
    });

});


http.createServer(app).listen(app.get('port'), '0.0.0.0', function () {
    console.log('Express server listening on port ' + app.get('port'));
});
