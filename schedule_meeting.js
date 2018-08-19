const env = require('node-env-file');

module.exports.schedule_meetings = chedule_meetings;

function schedule_meetings(array) {
    console.log(" CSV DATA ", array);
   var meeting_data = array;

    array.forEach(element => {


        var meetingName = "Meeting with " + "element.AdvisorName";
        var date = element.interview_date;
        var time =element.Time;
        
        parts=[];
        parts = date.split('/')
      
        var mydate = new Date('20'+parts[2], parts[0] - 1, parts[1]); 
        console.log(mydate);
 var final_date=mydate.toISOString().replace("07:00:00.000Z",time+":00-07:00Z")
            
        console.log(mydate.toISOString().replace("07:00:00.000Z",time+":00-07:00Z"));
        // expected output: Wed Jul 28 1993
        
        const options = {
            uri: "",
            form: {
                "api_key": process.env.ZOOM_API_KEY,
                "api_secret":process.env.ZOOM_API_SECRET,
                "type": "2",
                "host_id": process.env.HOST_ID,
                "topic": meetingName,
                "start_time": final_date,
                "duration": 120,
                "option_jbh": "true"
            },
            headers: {
                'Accept': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + process.env.ACCESS_TOKEN
            },
            json: true,

        };

        request.post(options)
            .then((response) => {
                console.log('Success in scheduling meeting', response.body);
                var meeting_id = response.body.id;
                


            })
            .catch(err => {
                console.error(` failed inserting- ${err}`);
            });


    });
}