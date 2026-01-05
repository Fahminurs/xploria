'use strict';

/* global Blockly */

// Namespace color for ESP32 blocks
var ESP32_HUE = 15;

(function() {
  if (typeof Blockly === 'undefined') return;

  // Common pin dropdowns
  var ESP32_ALL_PINS = (
    ['0','2','4','5','12','13','14','15','16','17','18','19','21','22','23','25','26','27','32','33','34','35','36','39']
  ).map(function(p){ return [p, p]; });
  var ESP32_OUTPUT_PINS = (
    ['0','2','4','5','12','13','14','15','16','17','18','19','21','22','23','25','26','27','32','33']
  ).map(function(p){ return [p, p]; });
  var ESP32_ANALOG_PINS = (
    ['32','33','34','35','36','39']
  ).map(function(p){ return [p, p]; });
  var ESP32_TOUCH_PINS = (
    ['0','2','4','12','13','14','15','27','32','33']
  ).map(function(p){ return [p, p]; });

  // GPIO
  Blockly.Blocks['esp32_pin_mode'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('ESP32 set pin')
        .appendField(new Blockly.FieldDropdown(ESP32_ALL_PINS), 'PINSEL')
        .appendField('or');
      this.appendValueInput('PIN').setCheck('Number');
      this.appendDummyInput().appendField('as').appendField(new Blockly.FieldDropdown([
        ['OUTPUT','OUTPUT'],
        ['INPUT','INPUT'],
        ['INPUT_PULLUP','INPUT_PULLUP'],
        ['INPUT_PULLDOWN','INPUT_PULLDOWN']
      ]), 'MODE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ESP32_HUE);
    }
  };

  // Pin Mode with free text pin input (e.g., LED_BUILTIN)
  Blockly.Blocks['esp32_pin_mode_input'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('ESP32 set pin')
        .appendField(new Blockly.FieldTextInput('LED_BUILTIN'), 'PINTEXT')
        .appendField('as')
        .appendField(new Blockly.FieldDropdown([
          ['OUTPUT','OUTPUT'],
          ['INPUT','INPUT'],
          ['INPUT_PULLUP','INPUT_PULLUP'],
          ['INPUT_PULLDOWN','INPUT_PULLDOWN']
        ]), 'MODE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ESP32_HUE);
    }
  };

  Blockly.Blocks['esp32_digital_write'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('ESP32 digital write pin')
        .appendField(new Blockly.FieldDropdown(ESP32_OUTPUT_PINS), 'PINSEL')
        .appendField('or');
      this.appendValueInput('PIN').setCheck('Number');
      this.appendDummyInput().appendField('to').appendField(new Blockly.FieldDropdown([
        ['HIGH','HIGH'],
        ['LOW','LOW']
      ]), 'LEVEL');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ESP32_HUE);
    }
  };

  // Digital write with numeric input field for pin (no dropdown)
  Blockly.Blocks['esp32_digital_write_input'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('ESP32 digital write pin')
        .appendField(new Blockly.FieldTextInput('2'), 'PINNUM')
        .appendField('to')
        .appendField(new Blockly.FieldDropdown([
          ['HIGH','HIGH'],
          ['LOW','LOW']
        ]), 'LEVEL');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ESP32_HUE);
    }
  };

  Blockly.Blocks['esp32_digital_read'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('ESP32 digital read pin')
        .appendField(new Blockly.FieldDropdown(ESP32_ALL_PINS), 'PINSEL')
        .appendField('or');
      this.appendValueInput('PIN').setCheck('Number');
      this.setOutput(true, 'Number');
      this.setColour(ESP32_HUE);
    }
  };

  // Analog
  Blockly.Blocks['esp32_analog_read'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('ESP32 analog read pin')
        .appendField(new Blockly.FieldDropdown(ESP32_ANALOG_PINS), 'PINSEL')
        .appendField('or');
      this.appendValueInput('PIN').setCheck('Number');
      this.setOutput(true, 'Number');
      this.setColour(ESP32_HUE);
    }
  };

  Blockly.Blocks['esp32_pwm_write'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('ESP32 PWM write pin')
        .appendField(new Blockly.FieldDropdown(ESP32_OUTPUT_PINS), 'PINSEL')
        .appendField('or');
      this.appendValueInput('PIN').setCheck('Number');
      this.appendValueInput('DUTY').setCheck('Number').appendField('duty (0-255)');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ESP32_HUE);
    }
  };

  // I2C
  Blockly.Blocks['esp32_i2c_begin'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('ESP32 I2C begin SDA')
        .appendField(new Blockly.FieldDropdown(ESP32_ALL_PINS), 'SDASEL')
        .appendField('or');
      this.appendValueInput('SDA').setCheck('Number');
      this.appendDummyInput()
        .appendField('SCL')
        .appendField(new Blockly.FieldDropdown(ESP32_ALL_PINS), 'SCLSEL')
        .appendField('or');
      this.appendValueInput('SCL').setCheck('Number');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ESP32_HUE);
    }
  };

  // UART
  Blockly.Blocks['esp32_serial_begin'] = {
    init: function() {
      this.appendDummyInput().appendField('ESP32 Serial begin baud').appendField(new Blockly.FieldNumber(115200, 1200, 2000000, 1), 'BAUD');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ESP32_HUE);
    }
  };

  // WiFi
  Blockly.Blocks['esp32_wifi_begin'] = {
    init: function() {
      this.appendValueInput('SSID').setCheck('String').appendField('ESP32 WiFi SSID');
      this.appendValueInput('PASS').setCheck('String').appendField('password');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ESP32_HUE);
    }
  };

  // HTTP GET
  Blockly.Blocks['esp32_http_get'] = {
    init: function() {
      this.appendValueInput('URL').setCheck('String').appendField('ESP32 HTTP GET url');
      this.setOutput(true, 'String');
      this.setColour(ESP32_HUE);
    }
  };

  // MQTT basic publish
  Blockly.Blocks['esp32_mqtt_publish'] = {
    init: function() {
      this.appendValueInput('TOPIC').setCheck('String').appendField('ESP32 MQTT publish topic');
      this.appendValueInput('PAYLOAD').setCheck(['String','Number']).appendField('payload');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ESP32_HUE);
    }
  };

  // Sleep
  Blockly.Blocks['esp32_delay_ms'] = {
    init: function() {
      this.appendValueInput('MS').setCheck('Number').appendField('ESP32 delay ms');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ESP32_HUE);
    }
  };

  // Delay with free text input (supports numbers or variables)
  Blockly.Blocks['esp32_delay_input'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('delay')
        .appendField(new Blockly.FieldTextInput('1000'), 'MS_TEXT');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ESP32_HUE);
    }
  };

  // Touch
  Blockly.Blocks['esp32_touch_read'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('ESP32 touch read pin')
        .appendField(new Blockly.FieldDropdown(ESP32_TOUCH_PINS), 'PINSEL')
        .appendField('or');
      this.appendValueInput('PIN').setCheck('Number');
      this.setOutput(true, 'Number');
      this.setColour(ESP32_HUE);
    }
  };

  // NeoPixel (declarative, minimal)
  Blockly.Blocks['esp32_neopixel_begin'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('ESP32 NeoPixel begin pin')
        .appendField(new Blockly.FieldDropdown(ESP32_OUTPUT_PINS), 'PINSEL')
        .appendField('or');
      this.appendValueInput('PIN').setCheck('Number');
      this.appendValueInput('NUM').setCheck('Number').appendField('num leds');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ESP32_HUE);
    }
  };

  Blockly.Blocks['esp32_neopixel_set'] = {
    init: function() {
      this.appendValueInput('INDEX').setCheck('Number').appendField('ESP32 NeoPixel set index');
      this.appendValueInput('R').setCheck('Number').appendField('R');
      this.appendValueInput('G').setCheck('Number').appendField('G');
      this.appendValueInput('B').setCheck('Number').appendField('B');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ESP32_HUE);
    }
  };

  Blockly.Blocks['esp32_neopixel_show'] = {
    init: function() {
      this.appendDummyInput().appendField('ESP32 NeoPixel show');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ESP32_HUE);
    }
  };
})();


