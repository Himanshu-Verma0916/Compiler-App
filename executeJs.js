const {exec}=require('child_process');

const executeJs = (filepath) => {
    console.log(`Executing file: ${filepath}`);
    return new Promise((resolve, reject) => {
        exec(`node ${filepath}`,{timeout:60000}, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing JavaScript file: ${error}`);
                reject(`Error: ${stderr}`);
            } else {
                resolve(stdout);
            }
        });
    });
};
module.exports = executeJs;
