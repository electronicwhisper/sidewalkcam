var image_url = "/thresholded";
var settings_url = "/settings";
var raw_readings_url = "/raw_readings";

var image_width = 1280;
var image_height = 720;

var settings = false;
var raw_readings = {};
var raw_readings_history = {};

var selected_zone_name = false;



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
    for (name in raw_readings) {
      raw_readings_history[name] = raw_readings_history[name] || [];
      raw_readings_history[name].push(raw_readings[name]);
      if (raw_readings_history[name].length > 200) {
        raw_readings_history[name].shift();
      }
    }
    render();
    setTimeout(load_raw_readings, 50);
  });
}
load_raw_readings();

// ----------------------------------------------------------------------------
// Rendering
// ----------------------------------------------------------------------------

function now_image_refresh() {
  return Math.floor(Date.now()/500);
}

function lerp(dmin, dmax, rmin, rmax, value) {
  return ((value - dmin) / (dmax - dmin)) * (rmax - rmin) + rmin;
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

  var graph_html = "";
  if (selected_zone_name) {
    var history = raw_readings_history[selected_zone_name];
    if (history.length > 0) {
      var zero = settings.zones[selected_zone_name].zero;
      var max_value = zero;
      for (var i = 0; i < history.length; i++) {
        max_value = Math.max(max_value, history[i]);
      }
      var path_d = "M-1,0 "
      for (var i = 0; i < history.length; i++) {
        path_d += "L" + i + "," + lerp(0, max_value, 200, 0, history[i]);
      }
      var zero_line = lerp(0, max_value, 200, 0, zero);
      graph_html += `
        <svg width="200" height="200" onclick="set_zero_point(${max_value})">
          <path d="${path_d}" stroke="red" fill="none" />
          <text x="200" y="0" text-anchor="end" alignment-baseline="hanging">${max_value}</text>
          <line x1="0" y1="${zero_line}" x2="200" y2="${zero_line}" stroke="green" />
        </svg>
      `;
    }
  }

  var html = `
    <div id="container">
      <div id="main">
        <img id="camera_image" src="${image_url}?${now_image_refresh()}">
        <svg id="overlay" width="${image_width}" height="${image_height}">
          ${overlay_html}
        </svg>
      </div>
      <div id="graph">
        ${graph_html}
      </div>
      <div id="settings">
        <div><button onclick="new_zone()">New Zone</button></div>
        <div>
          Color Value Threshold
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

setInterval(render, 500);


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
  render();
}

function new_zone() {
  var name = window.prompt("Zone name:");
  if (name) {
    settings.zones[name] = {x: 100, y:100, width: 100, height: 100, zero: 50};
    push_settings();
  }
  render();
}

function start_zone_drag(name) {
  selected_zone_name = name;
  var zone = settings.zones[name];
  var offset_x = current_mouse_x - zone.x;
  var offset_y = current_mouse_y - zone.y;
  start_drag(function (x, y) {
    zone.x = x - offset_x;
    zone.y = y - offset_y;
  });
}

function start_zone_resize(name) {
  selected_zone_name = name;
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

function set_zero_point(max_value) {
  var graph_offset_y = document.querySelector("#graph svg").getBoundingClientRect().top;
  var y = current_mouse_y - graph_offset_y;
  var zero = lerp(200, 0, 0, max_value, y);
  settings.zones[selected_zone_name].zero = zero;
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





