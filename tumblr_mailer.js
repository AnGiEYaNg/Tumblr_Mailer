var fs=require('fs');
var ejs = require('ejs');

var csvFile=fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.html', 'utf8');
var tumblr = require('tumblr.js');

var client = tumblr.createClient({
  consumer_key: '0fFFmcYNqQQYdoVpvStDwJlsMhQ8Mvn87ix5VklA1HQxkcLZu0',
  consumer_secret: 'AAnxlr4M7Jto5gdHbJzEAKAF7xMREv21n8HK81PrSBnvIzEVro',
  token: '1d4sGXxyS6Z8f73Dzdg5PSdd0oFsGtxu2kwoqUOeNnst13Jsmy',
  token_secret: 'GAgnbD4Aq7RFOPtYsLwVfOEHiwceDiLkyhqvW2fCzuF6FN8eOU'
});

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('bAsksHHTJMqLdXFQjCLM7Q');

/*function csvParse(file){
var arr=[];
var newFile=file.replace('\n',',').split(',');

for(var i=4; i<newFile.length;i+=4 ){
var obj={};
obj.firstName=newFile[i];
obj.lastName=newFile[i+1];
obj.numMonthsSinceContact=newFile[i+2];
obj.emailAddress=newFile[i+3].slice(0,-1);
//return obj;
arr.push(obj);
}
return arr;
}

var csv_data = csvParse(csvFile)
console.log(csv_data);*/

function csvParse(csvFile){
  var arrayOfObjects = [];
  var arr = csvFile.split("\n");
  var newObj;
 
  keys = arr.shift().split(",");
 
  arr.forEach(function(contact){
    contact = contact.split(",");
    newObj = {};
    
    for(var i =0; i < contact.length; i++){
      newObj[keys[i]] = contact[i];
    }
 
    arrayOfObjects.push(newObj);
 
  })
 
  return arrayOfObjects;
}
 
  client.posts('angi3yang.tumblr.com', function(err, blog){
    var latestPosts = [];
    blog.posts.forEach(function(post){
      var today=new Date();
      var postDate=new Date(post.date);
      var noOfDays = DaysDifference(postDate, today);
    if(noOfDays<7){
      var blogObj={};
      blogObj.href=post.post_url;
      blogObj.title=post.title;
      latestPosts.push(blogObj);
    }
    })
    
    csvData = csvParse(csvFile);
   
    csvData.forEach(function(row){
      firstName = row['firstName'];
      numMonthsSinceContact = row['numMonthsSinceContact'];
      copyTemplate = emailTemplate;
      
      var customizedTemplate = ejs.render(copyTemplate, {firstName: firstName,
                     numMonthsSinceContact: numMonthsSinceContact,
                     latestPosts: latestPosts                 
       });
      //console.log(customizedTemplate);
      sendEmail(firstName, row["emailAddress"], "Angie Yang", "angi3yang@gmail.com", "testing", customizedTemplate);      
    
    });                             
});
 
function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
  var message = {
      "html": message_html,
      "subject": subject,
      "from_email": from_email,
      "from_name": from_name,
      "to": [{
              "email": to_email,
              "name": to_name
          }],
      "important": false,
      "track_opens": true,    
      "auto_html": false,
      "preserve_recipients": true,
      "merge": false,
      "tags": [
          "Fullstack_Tumblrmailer_Workshop"
      ]    
  };
  var async = false;
  var ip_pool = "Main Pool";
  mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
              
  }, function(e) {
      // Mandrill returns the error as an object with name and message keys
      console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
      // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
  });
} 

function DaysDifference( date1, date2 ) {
 
var d1 = date1;
var d2 = date2;
 
//Get 1 day in milliseconds
var one_day=1000*60*60*24;
 
// Convert both dates to milliseconds
var date1_ms = d1.getTime();
var date2_ms = d2.getTime();
 
// Calculate the difference in milliseconds
var difference_ms = date2_ms - date1_ms;
 
// Convert back to days and return
return Math.round(difference_ms/one_day);
}
