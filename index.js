const express = require('express');
const app = express();
const cors = require('cors');
const generateFiles = require('./generateFiles');
const executeCpp = require('./executeCpp');  //excute cpp
const executePy = require('./executePy'); // execute python code
const executeJs = require('./executeJs'); // execute javascript code
const executeJava = require('./executeJava'); // execute java code

const addJobToQueue= require('./jobQueue'); // import the job queue`

const mongoose = require('mongoose');  //creting database 
mongoose.connect('mongodb://localhost:27017/compilerApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
})

const job = require('./models/job'); // import the job model


app.use(express.urlencoded({ extended: true }));  // for parsing application/x-www-form-urlencoded
app.use(express.json());
app.use(cors()); // enable all cors request

// app.post('/run', async (req, res) => {
//     const { language, code, className } = req.body;
//     console.log(language);

//     if (code == undefined) {
//         res.status(400).send({ error: "empty code" });
//     }
//     let jobData;
//     try {
//         const filePath = await generateFiles(language, code, className); // generate the file with code and language

//         jobData = await new job({ language, filePath }).save(); // save the job 
//         console.log(jobData);
//         const job_id = jobData[`_id`];

//         addJobToQueue(job_id); // add the job to the queue
//         // just after saving data 
//         jobData["startedAt"] = Date.now();
        
//         let output;
//         if (language == "py") {
//             output = await executePy(filePath); // execute the python code and get the output
//             // res.send({filePath,output});
//             console.log(language, code, "output: " + output);

//         }
//         else if (language == "js") {
//             output = await executeJs(filePath); // execute the javascript code and get the output
//             // res.send({filePath,output});
//             console.log(language, code, "output: " + output);
//         }
//         else if (language == "java") {
//             output = await executeJava(filePath); // execute the javascript code and get the output
//             // res.send({filePath,output});
//             console.log(language, code, "output: " + output);
//         }
//         else {
//             output = await executeCpp(filePath); // execute the cpp code and get the output
//             // res.send({filePath,output});
//             console.log(language, code, "output: " + output);
//         }
//         res.status(201).json({ jobId: jobData._id ,output:output}); // send the job id to the client

//         jobData["completedAt"] = new Date();
//         jobData["status"] = "success";
//         jobData["output"] = output; // save the output in the database
//         console.log(jobData);
//         await jobData.save();
//     }catch(error){
//         console.log(error);
//         jobData["completedAt"] = new Date();
//         jobData["status"] = "error";
//         jobData["output"] = JSON.stringify(error); // save the output in the database
//         await jobData.save();
//     }
    
//     }
//     // catch (error) {
//     //     console.error(error);
//     //     res.status(500).json({ success: false, error:JSON.stringify(error) });
//     // }
// );





app.post('/run', async (req, res) => {
    const { language, code, className } = req.body;
    console.log(language);

    if (!code) {
        return res.status(400).send({ error: "Empty code" });
    }

    try {
        const filePath = await generateFiles(language, code, className); // generate file
        const jobData = await new job({ language, filePath }).save();   // save job in DB
        const job_id = jobData._id;

        await addJobToQueue(job_id); // push job into Bull queue

        res.status(201).json({ success: true, jobId: job_id }); // send only job ID back
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: JSON.stringify(error) });
    }
});

//we have to check the current status of job id ,which we recieved
app.get('/status/:id', async (req, res) => {
    const jobId = req.params.id;
    console.log("status id requested", jobId);

    if (!jobId) {
        return res.status(400).json({ success: false,error: "job id is missing" });
    }

    try {
        const jobData = await job.findById(jobId); 
        if (!jobData) {
            return res.status(404).json({ error: "invalid job id" });
        }

        res.status(200).json({success:true,jobData});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});


app.listen(5000, (err) => {
    err ? console.warn('error: ', err) : console.log('Server is running on port 5000')
})




//  for manging big data we can use redis or any other queing system
// installing redis
//installing bull for queing system because bull is important library for redis

/////Important Notes

// Nice! If your mentor asked you to install Redis and use Bull with your compiler app, they’re guiding you toward asynchronous job queueing — a much more scalable and reliable approach than your current direct execution flow.

// Let me break it down for you, Boss 🔧:

// 🧠 Why Redis + Bull?
// Right now, you're:

// Receiving a request

// Executing code immediately

// Waiting (blocking) until it's done

// Returning the result

// That works fine for small apps but becomes a bottleneck when:

// Multiple users submit code

// A long-running script hogs the CPU

// You want better scalability or monitoring


// ✅ What Bull + Redis Brings:

// Feature	Benefit to Your Compiler App
// 🎯 Job Queuing	No more immediate execution in main thread
// 🕒 Delayed Jobs	You can process jobs even after a few seconds
// 📊 Status Tracking	Built-in job progress, retries, failures
// ⚡ Scalability	Handle 10s, 100s, 1000s of jobs cleanly
// 🔁 Retries / Failures	Automatically retry failed executions
// 🧰 Separate Worker File	Run your code processing in a separate process