'use strict';

/* global Blockly */

(function() {
  if (!Blockly || !Blockly.Arduino) return;

  var ORDER = Blockly.Arduino.ORDER_ATOMIC;

  // Helpers
  function ensureIncludes() {
    if (typeof Blockly.Arduino.addInclude === 'function') {
      Blockly.Arduino.addInclude('wifi', '#include <WiFi.h>');
      Blockly.Arduino.addInclude('http', '#include <HTTPClient.h>');
      Blockly.Arduino.addInclude('neopixel', '#include <Adafruit_NeoPixel.h>');
    } else {
      Blockly.Arduino.includes_ = Blockly.Arduino.includes_ || {};
      Blockly.Arduino.includes_.wifi = '#include <WiFi.h>';
      Blockly.Arduino.includes_.http = '#include <HTTPClient.h>';
      Blockly.Arduino.includes_.neopixel = '#include <Adafruit_NeoPixel.h>';
    }
  }

  function addSetup(key, code) {
    if (typeof Blockly.Arduino.addSetup === 'function') {
      Blockly.Arduino.addSetup(key, code, true);
    } else {
      Blockly.Arduino.setups_ = Blockly.Arduino.setups_ || {};
      Blockly.Arduino.setups_[key] = code;
    }
  }

  // GPIO
  Blockly.Arduino['esp32_pin_mode'] = function(block) {
    var pin = Blockly.Arduino.valueToCode(block, 'PIN', ORDER);
    if (!pin) { pin = block.getFieldValue('PINSEL') || '2'; }
    var mode = block.getFieldValue('MODE');
    var modeMap = {OUTPUT:'OUTPUT', INPUT:'INPUT', INPUT_PULLUP:'INPUT_PULLUP', INPUT_PULLDOWN:'INPUT_PULLDOWN'};
    addSetup('pinmode_' + pin, 'pinMode(' + pin + ', ' + (modeMap[mode] || 'OUTPUT') + ');');
    return '';
  };

  // Variant with free text pin (e.g., LED_BUILTIN)
  Blockly.Arduino['esp32_pin_mode_input'] = function(block) {
    var pin = block.getFieldValue('PINTEXT') || 'LED_BUILTIN';
    var mode = block.getFieldValue('MODE');
    var modeMap = {OUTPUT:'OUTPUT', INPUT:'INPUT', INPUT_PULLUP:'INPUT_PULLUP', INPUT_PULLDOWN:'INPUT_PULLDOWN'};
    addSetup('pinmode_' + pin, 'pinMode(' + pin + ', ' + (modeMap[mode] || 'OUTPUT') + ');');
    return '';
  };

  Blockly.Arduino['esp32_digital_write'] = function(block) {
    var pin = Blockly.Arduino.valueToCode(block, 'PIN', ORDER);
    if (!pin) { pin = block.getFieldValue('PINSEL') || '2'; }
    var level = block.getFieldValue('LEVEL') || 'LOW';
    return 'digitalWrite(' + pin + ', ' + level + ');\n';
  };

  // Variant using numeric field for pin input
  Blockly.Arduino['esp32_digital_write_input'] = function(block) {
    var pin = block.getFieldValue('PINNUM') || '2';
    // Allow variables or constants in the field: if it looks numeric, leave as-is; else treat as identifier
    var trimmed = (pin + '').trim();
    if (/^\d+$/.test(trimmed)) {
      pin = trimmed;
    } else {
      // Pass through unquoted so identifiers like LED_BUILTIN or variables like makanan work
      pin = trimmed;
    }
    var level = block.getFieldValue('LEVEL') || 'LOW';
    return 'digitalWrite(' + pin + ', ' + level + ');\n';
  };

  Blockly.Arduino['esp32_digital_read'] = function(block) {
    var pin = Blockly.Arduino.valueToCode(block, 'PIN', ORDER);
    if (!pin) { pin = block.getFieldValue('PINSEL') || '2'; }
    var code = 'digitalRead(' + pin + ')';
    return [code, ORDER];
  };

  // Analog
  Blockly.Arduino['esp32_analog_read'] = function(block) {
    var pin = Blockly.Arduino.valueToCode(block, 'PIN', ORDER);
    if (!pin) { pin = block.getFieldValue('PINSEL') || '34'; }
    var code = 'analogRead(' + pin + ')';
    return [code, ORDER];
  };

  Blockly.Arduino['esp32_pwm_write'] = function(block) {
    var pin = Blockly.Arduino.valueToCode(block, 'PIN', ORDER);
    if (!pin) { pin = block.getFieldValue('PINSEL') || '2'; }
    var duty = Blockly.Arduino.valueToCode(block, 'DUTY', ORDER) || '128';
    // Simple analogWrite compatibility layer on some cores
    return 'analogWrite(' + pin + ', ' + duty + ');\n';
  };

  // I2C (Wire)
  Blockly.Arduino['esp32_i2c_begin'] = function(block) {
    var sda = Blockly.Arduino.valueToCode(block, 'SDA', ORDER);
    if (!sda) { sda = block.getFieldValue('SDASEL') || '21'; }
    var scl = Blockly.Arduino.valueToCode(block, 'SCL', ORDER);
    if (!scl) { scl = block.getFieldValue('SCLSEL') || '22'; }
    if (typeof Blockly.Arduino.addInclude === 'function') {
      Blockly.Arduino.addInclude('wire', '#include <Wire.h>');
    } else {
      Blockly.Arduino.includes_ = Blockly.Arduino.includes_ || {};
      Blockly.Arduino.includes_.wire = '#include <Wire.h>';
    }
    addSetup('wire_begin', 'Wire.begin(' + sda + ', ' + scl + ');');
    return '';
  };

  // UART
  Blockly.Arduino['esp32_serial_begin'] = function(block) {
    var baud = block.getFieldValue('BAUD') || 115200;
    addSetup('serial_begin', 'Serial.begin(' + baud + ');');
    return '';
  };

  // WiFi
  Blockly.Arduino['esp32_wifi_begin'] = function(block) {
    ensureIncludes();
    var ssid = Blockly.Arduino.valueToCode(block, 'SSID', ORDER) || '""';
    var pass = Blockly.Arduino.valueToCode(block, 'PASS', ORDER) || '""';
    var code = '';
    code += 'WiFi.begin(' + ssid + ', ' + pass + ');\n';
    code += 'while (WiFi.status() != WL_CONNECTED) { delay(500); }\n';
    return code;
  };

  // HTTP GET
  Blockly.Arduino['esp32_http_get'] = function(block) {
    ensureIncludes();
    var url = Blockly.Arduino.valueToCode(block, 'URL', ORDER) || '""';
    var func = [];
    func.push('String __esp32_http_get(String url) {');
    func.push('  HTTPClient http;');
    func.push('  http.begin(url);');
    func.push('  int httpCode = http.GET();');
    func.push('  String payload = "";');
    func.push('  if (httpCode > 0) { payload = http.getString(); }');
    func.push('  http.end();');
    func.push('  return payload;');
    func.push('}');
    var body = func.join('\n');
    if (typeof Blockly.Arduino.addDeclaration === 'function') {
      Blockly.Arduino.addDeclaration('esp32_http_get_fn', body);
    } else {
      Blockly.Arduino.definitions_ = Blockly.Arduino.definitions_ || {};
      Blockly.Arduino.definitions_.esp32_http_get_fn = body;
    }
    var code = '__esp32_http_get(' + url + ')';
    return [code, ORDER];
  };

  // MQTT (stub using PubSubClient typical API - user must add client setup)
  Blockly.Arduino['esp32_mqtt_publish'] = function(block) {
    var topic = Blockly.Arduino.valueToCode(block, 'TOPIC', ORDER) || '"topic"';
    var payload = Blockly.Arduino.valueToCode(block, 'PAYLOAD', ORDER) || '""';
    var code = 'client.publish(' + topic + ', String(' + payload + ').c_str());\n';
    return code;
  };

  // Delay
  Blockly.Arduino['esp32_delay_ms'] = function(block) {
    var ms = Blockly.Arduino.valueToCode(block, 'MS', ORDER) || '1000';
    return 'delay(' + ms + ');\n';
  };

  // Delay using text input (numbers or identifiers)
  Blockly.Arduino['esp32_delay_input'] = function(block) {
    var ms = block.getFieldValue('MS_TEXT') || '1000';
    var trimmed = (ms + '').trim();
    return 'delay(' + trimmed + ');\n';
  };

  // Touch (uses touchRead)
  Blockly.Arduino['esp32_touch_read'] = function(block) {
    var pin = Blockly.Arduino.valueToCode(block, 'PIN', ORDER);
    if (!pin) { pin = block.getFieldValue('PINSEL') || 'T0'; }
    var code = 'touchRead(' + pin + ')';
    return [code, ORDER];
  };

  // NeoPixel simple global
  Blockly.Arduino['esp32_neopixel_begin'] = function(block) {
    ensureIncludes();
    var pin = Blockly.Arduino.valueToCode(block, 'PIN', ORDER);
    if (!pin) { pin = block.getFieldValue('PINSEL') || '15'; }
    var num = Blockly.Arduino.valueToCode(block, 'NUM', ORDER) || '8';
    if (typeof Blockly.Arduino.addDeclaration === 'function') {
      Blockly.Arduino.addDeclaration('neostrip', 'Adafruit_NeoPixel neostrip(' + num + ', ' + pin + ', NEO_GRB + NEO_KHZ800);');
    } else {
      Blockly.Arduino.definitions_ = Blockly.Arduino.definitions_ || {};
      Blockly.Arduino.definitions_.neostrip = 'Adafruit_NeoPixel neostrip(' + num + ', ' + pin + ', NEO_GRB + NEO_KHZ800);';
    }
    addSetup('neostrip_begin', 'neostrip.begin();\n  neostrip.show();');
    return '';
  };

  Blockly.Arduino['esp32_neopixel_set'] = function(block) {
    var idx = Blockly.Arduino.valueToCode(block, 'INDEX', ORDER) || '0';
    var r = Blockly.Arduino.valueToCode(block, 'R', ORDER) || '0';
    var g = Blockly.Arduino.valueToCode(block, 'G', ORDER) || '0';
    var b = Blockly.Arduino.valueToCode(block, 'B', ORDER) || '0';
    var code = 'neostrip.setPixelColor(' + idx + ', neostrip.Color(' + r + ', ' + g + ', ' + b + '));\n';
    return code;
  };

  Blockly.Arduino['esp32_neopixel_show'] = function() {
    return 'neostrip.show();\n';
  };
})();


