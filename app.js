var Travis = require('travis-ci');
var travis = new Travis({
    version: '2.0.0'
});
var fs = require('fs');
var request = require('request');
var RateLimiter = require('limiter').RateLimiter;

var limiter = new RateLimiter(1, 100); // at most 1 request every 100 ms


// var firebase = require("firebase-admin");
//
//
// var serviceAccount = require("./flakytests-56f6d8e66ee3.json");
//
// firebase.initializeApp({
//     credential: firebase.credential.cert(serviceAccount),
//     databaseURL: "https://flakytests.firebaseio.com"
// });

function getAndSaveLog(buildId,sha,jobId)
{
    limiter.removeTokens(1, function() {
        travis.jobs(jobId).log.get(function (err, res) {
            var name = buildId + "_" + jobId + "_" + sha + ".txt";
            console.log(name);
            if (err) {
    console.log(err);
            }
            // console.log(res);
            fs.writeFile("logs/presto/" + name, res, function (err) {
                if (err) {
                    return console.log(err);
                }
            });
        });
    });
}
// getAndSaveLog("242165299","4c60be18704f445b2bb8a91edb4c9bcb93218bd1","242165305");
// fs.mkdirSync("logs/presto");
travis.repos("prestodb", "presto").builds.get(function (err, res) {
    var commits = {};
    for(c in res.commits)
    {
        commits[res.commits[c].id] = res.commits[c].sha;
    }
    for(b in res.builds)
    {
        var build = res.builds[b];
        var sha = commits[build.commit_id];
        for(j in build.job_ids)
        {
                getAndSaveLog(build.id,sha,build.job_ids[j]);
        }
    }
});