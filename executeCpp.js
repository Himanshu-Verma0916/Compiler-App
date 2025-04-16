const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const outputDirPath = path.join(__dirname, 'outputs');
if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath, { recursive: true });
    console.warn('Directory created:', outputDirPath);
}

// C:\Users\monuv\OneDrive\Desktop\compiler\backend\codes\13c2c5f9-a581-4457-8607-e5ae2a8f2fc7.cpp  
//13c2c5f9-a581-4457-8607-e5ae2a8f2fc7.cpp is basename
// 13c2c5f9-a581-4457-8607-e5ae2a8f2fc7 is jobId
// C:\Users\monuv\OneDrive\Desktop\compiler\backend\outputs\13c2c5f9-a581-4457-8607-e5ae2a8f2fc7.exe  is output file path
const executeCpp = async (filePath) => {
    const jobId = path.basename(filePath).split('.')[0];
    const outputFilePath = path.join(outputDirPath, `${jobId}.exe`); // .exe for Windows

    const command = `g++ "${filePath}" -o "${outputFilePath}" && "${outputFilePath}"`;

    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error( error.message,stderr);
                return;
            }

            if (stderr) {
                console.error(" stderr:", stderr);
                return ; 
            }

            return resolve(stdout); // ✅ Normal output
        });
    });
};

module.exports = executeCpp;
