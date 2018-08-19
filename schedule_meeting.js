const env = require('node-env-file');

module.exports.schedule_meetings = chedule_meetings;

function schedule_meetings(array) {
    console.log(" CSV DATA ", array);

    array.forEach(element => {


        var meetingName = "Meeting with " + "element.AdvisorName";

        const options = {
            uri: "https://slack.com/api/chat.postMessage",
            form: {
                "key": "api_key",
                "value": "PWlHjJUpRDSjx-2IWYH-aA",
                "type": "2",
                "host_id": process.env.HOST_ID,
                "topic": meetingName,
                "start_time": "",//have to convert date and time to iso format 2018-08-19T01:03:21-07:00Z
                "duration": 120,
                "option_jbh": "true"
            },
            headers: {
                'Accept': 'application/json',
                //'Authorization': 'Bearer ' + process.env.ACCESS_TOKEN
            },
            json: true,

        };

        request.post(options)
            .then(() => {
                console.log('');
            })
            .catch(err => {
                console.error(` failed - ${err}`);
            });


    });
}