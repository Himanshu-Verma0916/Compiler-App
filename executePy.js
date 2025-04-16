const {exec} = require('child_process');

const executePy=(filepath)=>{
    return new Promise((resolve, reject) => {
        exec(`python3 ${filepath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Python script: ${error}`);
                reject(`Error: ${stderr}`);
            } else {
                resolve(stdout);
            }
        });
    });
}
module.exports=executePy;