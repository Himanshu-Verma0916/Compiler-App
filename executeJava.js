const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const outputDirPath = path.join(__dirname, 'javaOutputs');
if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath, { recursive: true });
    console.warn('Directory created:', outputDirPath);
}

const executeJava = async (filePath) => {
    // const jobId = path.basename(filePath).split('.')[0];
    // const outputFilePath = path.join(outputDirPath, `${jobId}.exe`); // .exe for Windows
    const filename=path.basename(filePath);
    const className = path.basename(filePath, '.java');  // Now safe to use as class name

    const dir=path.dirname(filePath);
    const command = `cd "${dir}" && javac "${filename}" && java ${className}`;

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

module.exports = executeJava;
