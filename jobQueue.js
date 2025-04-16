const job = require('./models/job'); // Import the job model as an ES module
const Queue = require('bull');

const executeCpp = require('./executeCpp');  //excute cpp
const executePy = require('./executePy'); // execute python code
const executeJs = require('./executeJs'); // execute javascript code
const executeJava = require('./executeJava'); // execute java code

const jobQueue = new Queue('jobQueue'); // Create a new queue
const NUM_WORKERS = 5; // number of jobs done concurrently

// Create a queue to process jobs
jobQueue.process(NUM_WORKERS, async ({ data }) => {
    console.log(data);
    const { jobId } = data;  // fixed from id: jobId to just jobId
    const jobData = await job.findById(jobId); // Find the job in the database

    if (!jobData) {
        throw Error("job not found")
    }

    try {
        jobData["startedAt"] = Date.now();

        let output;
        if (jobData.language == "py") {
            output = await executePy(jobData.filePath); // execute the python code and get the output
            // res.send({filePath,output});
            console.log(jobData.language, jobData.code, "output: " + output);

        }
        else if (jobData.language == "js") {
            output = await executeJs(jobData.filePath); // execute the javascript code and get the output
            console.log(jobData.language, jobData.code, "output: " + output);
        }
        else if (jobData.language == "java") {
            output = await executeJava(jobData.filePath); // execute the java code and get the output
            // res.send({filePath,output});
            console.log(jobData.language, jobData.code, "output: " + output);
        }
        else {
            output = await executeCpp(jobData.filePath); // execute the cpp code and get the output
            // res.send({filePath,output});
            console.log(jobData.language, jobData.code, "output: " + output);
        }

        // res.status(201).json({ jobId: jobData._id, output: output }); // send the job id to the client - Not used here in worker
        console.log({ jobId: jobData._id, output: output }); // log the job id and output

        jobData["completedAt"] = new Date();
        jobData["status"] = "success";
        jobData["output"] = output; // save the output in the database
        console.log(jobData);
        await jobData.save();
    } catch (error) {
        console.log(error);
        jobData["completedAt"] = new Date();
        jobData["status"] = "error";
        jobData["output"] = JSON.stringify(error); // save the output in the database
        await jobData.save();
    }

    console.log("fetched job data", jobData);
    return true; // Return true to indicate that the job was processed successfully
});

// job failed event
jobQueue.on("failed", (error) => {
    console.log(error?.data?.id, "failed", error?.failedReason);
});

// Function to add a job to the queue
const addJobToQueue = async (jobId) => {
    console.log("adding job to queue", jobId);
    await jobQueue.add({ jobId });
};

module.exports = addJobToQueue;
