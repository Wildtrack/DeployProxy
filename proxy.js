var httpProxy = require ('http-proxy'), 
	http = require('http'),
  url = require('url');

var mainAddress = {target:'http://thanatos.lodr.me'},     //main
    canaryAddress = {target:'http://kronos.lodr.me'};     //canary

CANARYCUTOFF = 0.5; // below = canary, above = notcanary
CANARY = false;

var canaryUsers = [];
var mainUsers = [];

var proxy1 = httpProxy.createServer();
var proxy2 = httpProxy.createServer();

http.createServer(function (req, res) {

  var path = url.parse(req.url).pathname;

  console.log(path);

  if(path == '/canary'){
    CANARY = !CANARY

    console.log("Canary = " + CANARY)

    canaryUsers = [];
    mainUsers = [];

    res.end('Changed Canary to ' + CANARY);
  }else{

    console.log(req.connection.remoteAddress);

    if(CANARY){

      user = req.connection.remoteAddress;

      if(canaryUsers.indexOf(user) == -1 && mainUsers.indexOf(user) == -1){

          rando = Math.random();

          console.log("User is new")

          if(rando < CANARYCUTOFF){
            
            canaryUsers.push(user);

            target = canaryAddress;

          }else{

            mainUsers.push(user);

            target = mainAddress;

          }
      }else{

        if(canaryUsers.indexOf(user) != -1){

          target = canaryAddress;

        }else{

          target = mainAddress;
        }
      }
    }else{

      target = mainAddress;
    }

    console.log("target is " + target.target);

    console.log('balancing request to: ', target);

    proxy1.web(req, res, target);
  }

}).listen(80);  //change to port 80

