var path = require('path');
const express = require('express')
const app = express()
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');




app.use(express.static('./'));
app.use(cors())
app.use(bodyParser.json());

app.get('/getfiles', function (req, res) {

   const directoryPath = './Review';
   const fileExtension = '.sigml';
   let las="None yet"

   const fileList = fs.readdirSync(directoryPath)
   .filter(file => path.extname(file) === fileExtension)
   .map(file => ({
      name: file.split('.')[0],
      value: fs.readFileSync(path.join(directoryPath, file), 'utf-8')
   }));

   fs.readFile('lastupdated.txt', 'utf8', (err, data) => {
      if (err) throw err;
      last=data
      res.send({filelist:fileList,last:last});
    });
   //console.log(fileList);

    
 })
 
app.post('/posthere',(req,res)=>{
   console.log(req.body)
   const data = req.body;
   fs.appendFile('./Review/Reviews.txt', data.name+": "+data.comment+"\n", (err) => {
   if (err) throw err;
   console.log('File written successfully');
   fs.writeFile('./lastupdated.txt',req.body.name,(e)=>{
      if(e)
         throw e;
      res.send(JSON.stringify(req.body))
   })
   });
   
   
})

 
 var server = app.listen(8080, function () {
    var host = server.address().address
    var port = server.address().port
    
    
    console.log("Example app listening at http://%s:%s", host, port)
 })





