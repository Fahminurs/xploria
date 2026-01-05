/* global Blockly */

(function init() {
  // Inject Blockly
  const blocklyArea = document.getElementById('blocklyArea');
  const blocklyDiv = document.getElementById('blocklyDiv');
  const workspace = Blockly.inject(blocklyDiv, {
    toolbox: document.getElementById('toolbox'),
    scrollbars: true,
    trashcan: true,
    renderer: 'geras'
  });

  // Resize logic to make Blockly fill the area
  const onResize = () => {
    const element = blocklyArea;
    let x = 0;
    let y = 0;
    let w = element.offsetWidth;
    let h = element.offsetHeight;
    blocklyDiv.style.left = x + 'px';
    blocklyDiv.style.top = y + 'px';
    blocklyDiv.style.width = w + 'px';
    blocklyDiv.style.height = h + 'px';
    Blockly.svgResize(workspace);
  };
  window.addEventListener('resize', onResize, false);
  onResize();

  // Custom ESP32 blocks (minimal)
  Blockly.Blocks.esp32_setup = {
    init: function () {
      this.appendDummyInput().appendField('setup MicroPython');
      this.setNextStatement(true);
      this.setColour(15);
    },
  };

  Blockly.Blocks.esp32_pin_mode = {
    init: function () {
      this.appendValueInput('PIN').setCheck('Number').appendField('set pin');
      this.appendDummyInput().appendField('as').appendField(new Blockly.FieldDropdown([
        ['OUT', 'OUT'],
        ['IN', 'IN'],
      ]), 'MODE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(15);
    },
  };

  Blockly.Blocks.esp32_digital_write = {
    init: function () {
      this.appendValueInput('PIN').setCheck('Number').appendField('digital write pin');
      this.appendDummyInput().appendField('to').appendField(new Blockly.FieldDropdown([
        ['HIGH', '1'],
        ['LOW', '0'],
      ]), 'LEVEL');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(15);
    },
  };

  Blockly.Blocks.esp32_digital_read = {
    init: function () {
      this.appendValueInput('PIN').setCheck('Number').appendField('digital read pin');
      this.setOutput(true, 'Number');
      this.setColour(15);
    },
  };

  Blockly.Blocks.esp32_sleep_ms = {
    init: function () {
      this.appendValueInput('MS').setCheck('Number').appendField('sleep ms');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(15);
    },
  };

  // Generators for MicroPython
  const py = Blockly.Python;

  py.esp32_setup = function () {
    py.definitions_['import_machine'] = 'from machine import Pin';
    py.definitions_['import_time'] = 'import time';
    return '';
  };

  py.esp32_pin_mode = function (block) {
    const pin = py.valueToCode(block, 'PIN', py.ORDER_NONE) || '2';
    const mode = block.getFieldValue('MODE');
    const varName = `pin_${pin}`;
    const pinMode = mode === 'OUT' ? 'Pin.OUT' : 'Pin.IN';
    return `${varName} = Pin(${pin}, ${pinMode})\n`;
  };

  py.esp32_digital_write = function (block) {
    const pin = py.valueToCode(block, 'PIN', py.ORDER_NONE) || '2';
    const level = block.getFieldValue('LEVEL');
    const varName = `pin_${pin}`;
    return `${varName}.value(${level})\n`;
  };

  py.esp32_digital_read = function (block) {
    const pin = py.valueToCode(block, 'PIN', py.ORDER_NONE) || '2';
    const varName = `pin_${pin}`;
    const code = `${varName}.value()`;
    return [code, py.ORDER_FUNCTION_CALL];
  };

  py.esp32_sleep_ms = function (block) {
    const ms = py.valueToCode(block, 'MS', py.ORDER_NONE) || '1000';
    return `time.sleep_ms(${ms})\n`;
  };

  // UI actions
  const codePre = document.getElementById('code');
  const btnGenerate = document.getElementById('btn-generate');
  const btnDownload = document.getElementById('btn-download');
  const btnClear = document.getElementById('btn-clear');

  function updateCode() {
    const code = py.workspaceToCode(workspace);
    codePre.textContent = code || '# Add blocks to generate code';
  }

  btnGenerate.addEventListener('click', updateCode);

  btnDownload.addEventListener('click', () => {
    const code = py.workspaceToCode(workspace);
    const blob = new Blob([code], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'main.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  btnClear.addEventListener('click', () => {
    workspace.clear();
    updateCode();
  });

  // Initial
  updateCode();
})();


