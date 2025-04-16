const path= require('path');
const fs = require('fs');
const {v4 :uuid}=require('uuid');  // it helps to generate unique id for each file and use v4 function (of uuid) as uuid
const dirPath= path.join(__dirname, 'codes');
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log('Directory created:', dirPath);
}

const generateFiles = async(format, code,className=null) => { // (code_language,code)
    let jobId = className || uuid(); // generate unique id for each file
    
    const filename=`${jobId}.${format}`; // create filename with unique id and format  //index.cpp
    const filePath = path.join(dirPath, filename); // create file path with directory and filename for cross platform availability
    await fs.writeFileSync(filePath,code);
    return filePath; // return the file path
};
module.exports = generateFiles; 




















