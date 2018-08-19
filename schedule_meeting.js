const env = require('node-env-file');
env(__dirname + '/.env');
const request = require('request')
module.exports.schedule_meetings = schedule_meetings;

function schedule_meetings(array, db) {
    console.log(" CSV DATA ", array);
    var meeting_data = array;

    array.forEach(element => {


        var meetingName = "Meeting with " + "element.AdvisorName";
        var date = element.interview_date;
        var time = element.Time;

        parts = [];
        parts = date.split('/')
        timeparts = time.split(':')
        var mydate = new Date('20' + parts[2], parts[0] - 1, parts[1], timeparts[0], timeparts[1] );
        console.log(mydate);
        var final_date = mydate.toISOString();//.replace("07:00:00.000Z", time + ":00-07:00Z")

        console.log(mydate.toISOString()); //.replace("07:00:00.000Z", time + ":00-07:00Z"));
        // expected output: Wed Jul 28 1993

        const options = {
            uri: "https://api.zoom.us/v2/users/" + process.env.HOST_ID + "/meetings",
            body: {
                "type": "2",
                "topic": meetingName,
                "start_time": final_date,
                "duration": 120,
                "settings": 
                {"join_before_host": "true"}
            },
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJQV2xIakpVcFJEU2p4LTJJV1lILWFBIiwiaWF0IjoxNTM0Njg0NTk4LCJleHAiOjE1MzQ4MTg2NDd9.vmrQyzaYIkTPay7O-YNvMNeBBjZs5TntSMEYhrwOCTY"//process.env.ACCESS_TOKEN
            },
            json: true
        };

        request.post(options, (err, response) => {
            if (!err) {
                console.log('Success in scheduling meeting', response.body);
                var meeting_id = response.body.id;

                db.insert(Object.assign(element, { meeting_id, "time_stamp": final_date }), (err, res) => {
                    if (err) {
                        console.error("ERROR: Could not post data after meeting creation");
                    }
                    else {
                        console.log("successful insert");
                    }
                })
            }
            else {
                console.error(` failed inserting- ${err}`);
            }
        }
        )


    });
}