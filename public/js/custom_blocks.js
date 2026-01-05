;(function() {
  if (typeof Blockly === 'undefined') {
    console.error('Blockly not loaded before custom_blocks.js');
    return;
  }

  Blockly.Blocks['blink_led'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Blink LED on pin')
        .appendField(new Blockly.FieldDropdown([
          ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'],
          ['7', '7'], ['8', '8'], ['9', '9'], ['10', '10'], ['11', '11'],
          ['12', '12'], ['13', '13']
        ]), 'PIN');
      this.appendValueInput('DELAY_MS')
        .setCheck('Number')
        .appendField('delay (ms)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip('Blink an LED on a pin with the specified delay');
      this.setHelpUrl('');
    }
  };

  if (!Blockly.Arduino) {
    Blockly.Arduino = {};
  }

  Blockly.Arduino['blink_led'] = function(block) {
    var pin = block.getFieldValue('PIN');
    var delayMs = Blockly.Arduino.valueToCode(block, 'DELAY_MS', Blockly.Arduino.ORDER_ATOMIC) || '500';

    // Register setup for pinMode depending on environment
    if (typeof Blockly.Arduino.addSetup === 'function') {
      Blockly.Arduino.addSetup('setup_output_' + pin, 'pinMode(' + pin + ', OUTPUT);', true);
    } else {
      Blockly.Arduino.setups_ = Blockly.Arduino.setups_ || {};
      Blockly.Arduino.setups_['setup_output_' + pin] = 'pinMode(' + pin + ', OUTPUT);';
    }

    var code = '';
    code += 'digitalWrite(' + pin + ', HIGH);\n';
    code += 'delay(' + delayMs + ');\n';
    code += 'digitalWrite(' + pin + ', LOW);\n';
    code += 'delay(' + delayMs + ');\n';
    return code;
  };

  // I2C Scanner block (Scanning LCD)
  Blockly.Blocks['i2c_scanner'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('I2C Scanner (Serial 115200)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip('Scan all I2C addresses and print results to Serial');
      this.setHelpUrl('');
    }
  };

  Blockly.Arduino['i2c_scanner'] = function(block) {
    // Includes
    if (typeof Blockly.Arduino.addInclude === 'function') {
      Blockly.Arduino.addInclude('wire_include', '#include <Wire.h>');
    } else {
      Blockly.Arduino.includes_ = Blockly.Arduino.includes_ || {};
      Blockly.Arduino.includes_.wire_include = '#include <Wire.h>';
    }

    // Setup: Wire and Serial
    if (typeof Blockly.Arduino.addSetup === 'function') {
      Blockly.Arduino.addSetup('wire_begin', 'Wire.begin();', true);
      Blockly.Arduino.addSetup('serial_begin_115200', 'Serial.begin(115200);', true);
      Blockly.Arduino.addSetup('serial_banner', 'Serial.println("\\nI2C Scanner");', true);
    } else {
      Blockly.Arduino.setups_ = Blockly.Arduino.setups_ || {};
      Blockly.Arduino.setups_.wire_begin = 'Wire.begin();';
      Blockly.Arduino.setups_.serial_begin_115200 = 'Serial.begin(115200);';
      Blockly.Arduino.setups_.serial_banner = 'Serial.println("\\nI2C Scanner");';
    }

    // Loop body scanning code (runs each time this block is executed)
    var code = '';
    code += 'byte error, address;\n';
    code += 'int nDevices;\n';
    code += 'Serial.println("Scanning...");\n';
    code += 'nDevices = 0;\n';
    code += 'for (address = 1; address < 127; address++) {\n';
    code += '  Wire.beginTransmission(address);\n';
    code += '  error = Wire.endTransmission();\n';
    code += '  if (error == 0) {\n';
    code += '    Serial.print("I2C device found at address 0x");\n';
    code += '    if (address < 16) { Serial.print("0"); }\n';
    code += '    Serial.println(address, HEX);\n';
    code += '    nDevices++;\n';
    code += '  } else if (error == 4) {\n';
    code += '    Serial.print("Unknow error at address 0x");\n';
    code += '    if (address < 16) { Serial.print("0"); }\n';
    code += '    Serial.println(address, HEX);\n';
    code += '  }\n';
    code += '}\n';
    code += 'if (nDevices == 0) {\n';
    code += '  Serial.println("No I2C devices found\\n");\n';
    code += '} else {\n';
    code += '  Serial.println("done\\n");\n';
    code += '}\n';
    code += 'delay(5000);\n';
    return code;
  };
  Blockly.Blocks['esp32_i2c_begin'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('ESP32 I2C begin SDA')
        .appendField(new Blockly.FieldDropdown([
          ['21','21'], ['4','4'], ['16','16'], ['17','17'], ['32','32'], ['33','33']
        ]), 'SDA')
        .appendField('SCL')
        .appendField(new Blockly.FieldDropdown([
          ['22','22'], ['5','5'], ['18','18'], ['19','19'], ['25','25'], ['26','26']
        ]), 'SCL');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
      this.setTooltip('Initialize ESP32 I2C bus with chosen SDA and SCL pins');
      this.setHelpUrl('');
    }
  };

  Blockly.Arduino['esp32_i2c_begin'] = function(block) {
    var sda = block.getFieldValue('SDA');
    var scl = block.getFieldValue('SCL');

    // Include Wire library
    Blockly.Arduino.definitions_ = Blockly.Arduino.definitions_ || {};
    Blockly.Arduino.definitions_['include_wire'] = '#include <Wire.h>';

    // Setup Wire.begin with selected pins (ESP32)
    if (typeof Blockly.Arduino.addSetup === 'function') {
      Blockly.Arduino.addSetup('wire_begin', 'Wire.begin(' + sda + ', ' + scl + ');', true);
    } else {
      Blockly.Arduino.setups_ = Blockly.Arduino.setups_ || {};
      Blockly.Arduino.setups_['wire_begin'] = 'Wire.begin(' + sda + ', ' + scl + ');';
    }

    return '';
  };

  // Loop block to represent Arduino void loop() {}
  Blockly.Blocks['initializes_loop'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Add loop()');
      this.appendStatementInput('LOOP_STACK');
      this.setColour(120);
      this.setTooltip('Code inside will run repeatedly. Generates the body of void loop().');
      this.setHelpUrl('');
    }
  };

  Blockly.Arduino['initializes_loop'] = function(block) {
    var statements = Blockly.Arduino.statementToCode(block, 'LOOP_STACK');
    // Do not wrap with void loop() here; global finish() already does that.
    return statements;
  };

  // Serial begin block with selectable baud rates
  Blockly.Blocks['serial_begin'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Serial begin')
        .appendField(new Blockly.FieldDropdown([
          ['9600', '9600'],
          ['19200', '19200'],
          ['38400', '38400'],
          ['57600', '57600'],
          ['74880', '74880'],
          ['115200', '115200'],
          ['230400', '230400'],
          ['250000', '250000']
        ]), 'BAUD');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(Blockly.Blocks && Blockly.Blocks.serial && Blockly.Blocks.serial.HUE ? Blockly.Blocks.serial.HUE : 200);
      this.setTooltip('Initialize Serial with selected baud rate');
      this.setHelpUrl('');
    }
  };

  Blockly.Arduino['serial_begin'] = function(block) {
    var baud = block.getFieldValue('BAUD') || '9600';
    // Register setup line for Serial.begin
    if (typeof Blockly.Arduino.addSetup === 'function') {
      Blockly.Arduino.addSetup('setup_serial_' + baud, 'Serial.begin(' + baud + ');', true);
    } else {
      Blockly.Arduino.setups_ = Blockly.Arduino.setups_ || {};
      Blockly.Arduino.setups_['setup_serial_' + baud] = 'Serial.begin(' + baud + ');\n';
    }
    return '';
  };

  // Declarations: #include and #define
  Blockly.Blocks['declaration_include'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('#include')
        .appendField(new Blockly.FieldTextInput('<WiFi.h>'), 'HEADER');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(210);
      this.setTooltip('Add a C/C++ include directive, e.g., <WiFi.h> or "MyLib.h"');
      this.setHelpUrl('');
    }
  };

  Blockly.Arduino['declaration_include'] = function(block) {
    var header = block.getFieldValue('HEADER') || '<WiFi.h>';
    // Ensure header is wrapped with <> or ""
    var trimmed = header.trim();
    if (!(trimmed.startsWith('<') || trimmed.startsWith('"'))) {
      if (trimmed.indexOf('.') >= 0) {
        trimmed = '<' + trimmed + '>';
      } else {
        trimmed = '"' + trimmed + '"';
      }
    }
    var key = 'inc_' + (block && block.id ? block.id : ('' + Math.random()).replace(/[^A-Za-z0-9_]/g, '_'));
    if (typeof Blockly.Arduino.addInclude === 'function') {
      Blockly.Arduino.addInclude(key, '#include ' + trimmed);
    } else {
      Blockly.Arduino.definitions_ = Blockly.Arduino.definitions_ || {};
      Blockly.Arduino.definitions_[key] = '#include ' + trimmed;
    }
    return '';
  };

  Blockly.Blocks['declaration_define'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('#define')
        .appendField(new Blockly.FieldTextInput('LED_BUILTIN'), 'KEY')
        .appendField(new Blockly.FieldTextInput('2'), 'VALUE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(210);
      this.setTooltip('Add a C/C++ macro definition');
      this.setHelpUrl('');
    }
  };

  Blockly.Arduino['declaration_define'] = function(block) {
    var key = (block.getFieldValue('KEY') || 'MACRO').trim();
    var value = (block.getFieldValue('VALUE') || '1').trim();
    var safeKey = key.replace(/[^A-Za-z0-9_]/g, '_');
    var decl = '#define ' + key + ' ' + value;
    if (typeof Blockly.Arduino.addDeclaration === 'function') {
      var uniqueKey = 'def_' + (block && block.id ? block.id : (safeKey + '_' + ('' + Math.random()).replace(/[^A-Za-z0-9_]/g, '_')));
      Blockly.Arduino.addDeclaration(uniqueKey, decl);
    } else {
      Blockly.Arduino.definitions_ = Blockly.Arduino.definitions_ || {};
      var uniqueKey2 = 'def_' + (block && block.id ? block.id : (safeKey + '_' + ('' + Math.random()).replace(/[^A-Za-z0-9_]/g, '_')));
      Blockly.Arduino.definitions_[uniqueKey2] = decl;
    }
    return '';
  };

  // Override default Serial generators to NOT auto-insert Serial.begin
  // This ensures Serial.begin is only added when using the explicit serial_begin block
  if (Blockly.Arduino) {
    Blockly.Arduino['serial_print'] = function(block) {
      var content = Blockly.Arduino.valueToCode(block, 'CONTENT', Blockly.Arduino.ORDER_ATOMIC) || '""';
      return 'Serial.print(' + content + ');\n';
    };

    Blockly.Arduino['serial_println'] = function(block) {
      var content = Blockly.Arduino.valueToCode(block, 'CONTENT', Blockly.Arduino.ORDER_ATOMIC) || '""';
      return 'Serial.println(' + content + ');\n';
    };

    Blockly.Arduino['serial_available'] = function(block) {
      return ['Serial.available()', Blockly.Arduino.ORDER_ATOMIC];
    };
  }
})();
