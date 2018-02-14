const http = require("http");
const { spawn } = require('child_process');


let child = null;
function restart() {
  console.log("restarting");
  if (child) {
    child.kill();
    spawn("/usr/bin/killall", ["python"]);
  }
  child = spawn("/usr/bin/python", ["sidewalkcam.py"], {
    cwd: __dirname
  });
}
restart();


let last_frame_count = -1;

function check_alive() {
  http.get("http://localhost/frame_count", (resp) => {
    let data = "";
    resp.on("data", (chunk) => {
      data += chunk;
    });
    resp.on("end", () => {
      console.log("received", data);
      let frame_count = +data;
      if (frame_count === last_frame_count) {
        restart();
      }
      last_frame_count = frame_count;
    });
  }).on("error", (err) => {
    console.log("error", err);
    restart();
  });  
}

setInterval(check_alive, 5000);
