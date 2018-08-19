var CronJob = require('cron').CronJob;

module.exports={
  startUpcomingNotificationCron:function startUpcomingNotificationCron(db){
  console.log("heeeeloooo")
  var cronjob = new CronJob('* * * * *', function() {
    console.log('You will see this message every 2 minutes', Date.now());
    db.list({
      "selector": {
         "time_stamp": {
            "$gt": "2018-08-17T19:00:00.000Z"
         }
      },
      "fields": [
         "_id",
         "_rev",
         "time_stamp"
      ],
      "sort": [
         {
            "time_stamp": "asc"
         }
      ]
   }, (err, res)=>{
    console.log("db list", err, res)
   });
  }, null, true, 'America/Los_Angeles');
  
  cronjob.start();
},


startCompletedMeetingCron : function startCompletedMeetingCron(db){
  console.log("heeeeloooo")
  var cronjob = new CronJob('* */2 * * *', function() {
    console.log('You will see this message every 2 minutes', Date.now());
    db.list({time_stamp})
  }, null, true, 'America/Los_Angeles');
  
  cronjob.start();
}
}
//startCron()
