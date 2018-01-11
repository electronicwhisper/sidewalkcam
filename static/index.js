var image_url = "/thresholded";
var settings_url = "/settings";
var raw_readings_url = "/raw_readings";

var image_width = 1280;
var image_height = 720;

var settings = false;
var raw_readings = {};


// ----------------------------------------------------------------------------
// Settings
// ----------------------------------------------------------------------------

// Load initial settings from the server
fetch(settings_url + "?" + Math.random())
  .then(function (response) { return response.json(); })
  .then(function (data) {
    settings = data;
    render();
  });

function push_settings() {
  fetch(settings_url, {
    method: 'post',
    body: JSON.stringify(settings)
  });
}


// ----------------------------------------------------------------------------
// Raw Readings
// ----------------------------------------------------------------------------

function load_raw_readings() {
  fetch(raw_readings_url + "?" + Math.random())
  .then(function (response) { return response.json(); })
  .then(function (data) {
    raw_readings = data;
    render();
    setTimeout(load_raw_readings, 50);
  });
}
load_raw_readings();

// ----------------------------------------------------------------------------
// Rendering
// ----------------------------------------------------------------------------

function now_seconds() {
  return Math.floor(Date.now()/1000);
}

function render() {
  if (!settings) return;

  var overlay_html = "";
  for (name in settings.zones) {
    var zone = settings.zones[name];
    var resize = 8;
    overlay_html += `
      <rect class="zone_overlay" onmousedown="start_zone_drag('${name}')" x="${zone.x}" y="${zone.y}" width="${zone.width}" height="${zone.height}"></rect>
      <rect class="zone_resize" onmousedown="start_zone_resize('${name}')" x="${zone.x+zone.width-resize}" y="${zone.y+zone.height-resize}" width="${resize*2}" height="${resize*2}"></rect>
      <text class="zone_name" onclick="rename_zone('${name}')" x="${zone.x}" y="${zone.y - 2}">${name} - ${raw_readings[name]}</text>
    `;
  }

  var html = `
    <div id="container">
      <div id="main">
        <img id="camera_image" src="${image_url}?${now_seconds()}">
        <svg id="overlay" width="${image_width}" height="${image_height}">
          ${overlay_html}
        </svg>
      </div>
      <div id="settings">
        <div><button onclick="new_zone()">New Zone</button></div>
        <div><button onclick="set_zero_point()">Set Zero Point</button></div>
        <div>
          Trigger
          <input type="text" value="${settings.trigger}" onchange="set_setting('trigger', this.value)">
        </div>
        <div>
          Threshold
          <input type="range" min="0" max="255" step="1" value="${settings.threshold_value}" oninput="set_setting('threshold_value', this.value)">
          ${settings.threshold_value}
        </div>
        <div>
          Shutter Speed (ms)
          <input type="text" value="${settings.shutter_speed}" onchange="set_setting('shutter_speed', this.value)">
        </div>
      </div>
    </div>
  `;
  setDOM(document.querySelector("#container"), html);
}

setInterval(render, 1000);


// ----------------------------------------------------------------------------
// Actions
// ----------------------------------------------------------------------------

function rename_zone(old_name) {
  var new_name = window.prompt("Rename zone:\n(remove name to delete zone)", old_name);
  if (new_name !== null && new_name !== old_name) {
    if (new_name !== "") {
      settings.zones[new_name] = settings.zones[old_name];
    }
    delete settings.zones[old_name];
    push_settings();
  }
}

function new_zone() {
  var name = window.prompt("Zone name:");
  if (name) {
    settings.zones[name] = {x: 100, y:100, width: 100, height: 100};
    push_settings();
  }
}

function start_zone_drag(name) {
  var zone = settings.zones[name];
  var offset_x = current_mouse_x - zone.x;
  var offset_y = current_mouse_y - zone.y;
  start_drag(function (x, y) {
    zone.x = x - offset_x;
    zone.y = y - offset_y;
  });
}

function start_zone_resize(name) {
  var zone = settings.zones[name];
  var offset_x = current_mouse_x - zone.width;
  var offset_y = current_mouse_y - zone.height;
  start_drag(function (x, y) {
    zone.width = x - offset_x;
    zone.height = y - offset_y;
  });  
}

function set_setting(setting_name, value) {
  settings[setting_name] = +value;
  push_settings();
  render();
}

function set_zero_point() {
  for (name in settings.zones) {
    settings.zones[name].zero = raw_readings[name];
  }
  push_settings();
  render();
}


// ----------------------------------------------------------------------------
// Mouse Utility
// ----------------------------------------------------------------------------

var current_mouse_x = 0;
var current_mouse_y = 0;
document.addEventListener("mousemove", function (e) {
  current_mouse_x = e.clientX;
  current_mouse_y = e.clientY;
});

function start_drag(move_callback) {
  function move(e) {
    move_callback(e.clientX, e.clientY);
    render();
  }
  function up(e) {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);
    push_settings();
  }
  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", up);  
}





