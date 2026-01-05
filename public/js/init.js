/**
 * List of tab names.
 * @private
 */

'use strict';

var TABS_ = ['blocks', 'arduino'];

var selected = 'blocks';

/**
 * Switch the visible pane when a tab is clicked.
 * @param {string} clickedName Name of tab clicked.
 */
function tabClick(clickedName) {
  // For the new layout, we don't need to hide/show tabs
  // Just update the selected state and render content
  selected = clickedName;
  renderContent();
  
  // Trigger Blockly resize
  if (Blockly && Blockly.mainWorkspace) {
    Blockly.svgResize(Blockly.mainWorkspace);
  }
}

/**
 * Populate the currently selected pane with content generated from the blocks.
 */
function renderContent() {
  var button = document.getElementById('copy-button');
  
  // Always render both panels in the new layout
  if (Blockly && Blockly.mainWorkspace) {
    Blockly.mainWorkspace.render();
  }
  
  // Update Arduino code
  var arduinoTextarea = document.getElementById('content_arduino');
  if (arduinoTextarea && Blockly && Blockly.Arduino && Blockly.mainWorkspace) {
    try {
      arduinoTextarea.value = Blockly.Arduino.workspaceToCode(Blockly.mainWorkspace);
    } catch (e) {
      console.log('Error generating Arduino code:', e);
      arduinoTextarea.value = '// Error generating code';
    }
  }
  
  // Show copy button
  if (button) {
    button.style.display = "";
  }
}

/**
 * Compute the absolute coordinates and dimensions of an HTML element.
 * @param {!Element} element Element to match.
 * @return {!Object} Contains height, width, x, and y properties.
 * @private
 */
function getBBox_(element) {
  var height = element.offsetHeight;
  var width = element.offsetWidth;
  var x = 0;
  var y = 0;
  do {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  } while (element);
  return {
    height: height,
    width: width,
    x: x,
    y: y
  };
}

// Line numbers helpers
function updateLineNumbers() {
  try {
    var codeArea = document.getElementById('content_arduino');
    var gutter = document.getElementById('code_line_numbers');
    if (!codeArea || !gutter) return;
    var text = codeArea.value || '';
    var lines = text.split('\n').length;
    var out = '';
    for (var i = 1; i <= lines; i++) {
      out += i + '\n';
    }
    gutter.textContent = out;
    // Keep gutter scroll aligned
    gutter.scrollTop = codeArea.scrollTop;
  } catch (e) {
    // noop
  }
}

function attachCodeScrollSync() {
  var codeArea = document.getElementById('content_arduino');
  var gutter = document.getElementById('code_line_numbers');
  if (!codeArea || !gutter) return;
  codeArea.addEventListener('scroll', function() {
    gutter.scrollTop = codeArea.scrollTop;
  });
}

/**
 * Initialize Blockly.  Called on page load.
 */
function init() {
  //window.onbeforeunload = function() {
  //  return 'Leaving this page will result in the loss of your work.';
  //};
  
  // New layout doesn't need complex positioning - use flexbox
  var onresize = function (e) {
    // Trigger Blockly resize for the new layout
    if (Blockly && Blockly.mainWorkspace) {
      Blockly.svgResize(Blockly.mainWorkspace);
    }
  };
  window.addEventListener('resize', onresize, false);
  // Perform initial layout immediately
  onresize();

//var toolbox = document.getElementById('toolbox');
  var toolbox = buildtoolBox();
  var contentEl = document.getElementById('content_blocks');
  if (!contentEl) {
    console.warn('Blockly content element #content_blocks not found yet. Retrying init in 200ms...');
    setTimeout(init, 200);
    return;
  }
  var workspace = Blockly.inject(contentEl, {
    grid: {
      spacing: 25,
      length: 3,
      colour: '#ccc',
      snap: true
    },
    //media: 'media/',
    media: filepath.media,
    toolbox: toolbox
  });
  
  // Disable Blockly sounds to avoid autoplay NotAllowedError
  try {
    if (Blockly && Blockly.mainWorkspace && Blockly.mainWorkspace.getAudioManager) {
      var am = Blockly.mainWorkspace.getAudioManager();
      if (am && typeof am.preload === 'function') {
        am.preload = function(){};
      }
      if (am && am.SOUNDS_) {
        am.SOUNDS_ = [];
      }
    }
  } catch(e) {
    // noop
  }
  
  // Ensure workspace is properly set
  if (workspace && typeof workspace === 'object') {
    Blockly.mainWorkspace = workspace;
    console.log('Blockly workspace initialized successfully');
  } else {
    console.log('Warning: Blockly workspace initialization failed');
  }

  auto_save_and_restore_blocks();
  setCheckbox();

  // Hide the old tab row since we're using the new layout
  var tabRow = document.getElementById('tabRow');
  if (tabRow) { tabRow.style.display = 'none'; }

  // Keep code updated in real-time
  var updateCode = function() {
    var arduinoTextarea = document.getElementById('content_arduino');
    if (!arduinoTextarea || !Blockly || !Blockly.mainWorkspace) return;
    var code = '';
    try {
      if (Blockly.Arduino && typeof Blockly.Arduino.workspaceToCode === 'function') {
        code = Blockly.Arduino.workspaceToCode(Blockly.mainWorkspace);
      } else if (Blockly.Generator && typeof Blockly.Generator.workspaceToCode === 'function') {
        code = Blockly.Generator.workspaceToCode('Arduino');
      }
    } catch (e) {
      console.log('Error generating code:', e);
      code = '// Error generating code';
    }
    arduinoTextarea.value = code || '// Add blocks to generate code';
    updateLineNumbers();
  };
  
  // Attach listener to workspace; retry until available
  (function attachCodeUpdater() {
    var ws = (Blockly && typeof Blockly.getMainWorkspace === 'function')
      ? Blockly.getMainWorkspace()
      : (Blockly ? Blockly.mainWorkspace : null);
    if (!ws) { 
      window.setTimeout(attachCodeUpdater, 100); 
      return; 
    }
    if (ws && typeof ws.addChangeListener === 'function') {
      ws.addChangeListener(function() { 
        updateCode(); 
      });
    } else if (Blockly && typeof Blockly.addChangeListener === 'function') {
      Blockly.addChangeListener(function() {
        updateCode();
      });
    }
  })();
  
  // Initialize once
  updateCode();

  // Also update on window resize which can follow inject/render
  window.setTimeout(updateCode, 100);
  window.addEventListener('load', updateCode, false);
  // Fallback: periodic refresh for environments where change events are missed
  window.setInterval(updateCode, 2000);

  // Style the code pane for readability
  (function() {
    var codeEl = document.getElementById('content_arduino');
    if (!codeEl) return;
    codeEl.style.backgroundColor = 'transparent';
    codeEl.style.color = '#e6e6e6';
    codeEl.style.fontFamily = 'Fira Code, JetBrains Mono, Consolas, monospace';
    codeEl.style.fontSize = '14px';
    codeEl.style.lineHeight = '1.6';
    codeEl.style.padding = '20px';
    codeEl.style.boxSizing = 'border-box';
    codeEl.style.border = 'none';
    codeEl.style.outline = 'none';
    codeEl.style.resize = 'none';
    codeEl.setAttribute('spellcheck', 'false');
    // Attach scroll sync
    attachCodeScrollSync();
    // First render line numbers
    updateLineNumbers();
  })();
  
  // Force Blockly to render after a short delay
  setTimeout(function() {
    if (Blockly && Blockly.mainWorkspace) {
      Blockly.mainWorkspace.render();
      Blockly.svgResize(Blockly.mainWorkspace);
    }
  }, 500);

  //load from url parameter (single param)
  //http://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
  var dest = unescape(location.search.replace(/^.*\=/, '')).replace(/\+/g, " ");
  if (dest) {
    //load_by_url(dest);
  }
}

// buildtoolBox() moved to public/js/toolbox.js

function setCheckbox() {
  var option = window.localStorage.toolboxids;
  if (option) {
    var options = option.split(',');
    for (var i = 0; i < options.length; i++) {
      $('#chbox_' + options[i]).prop('checked', true);
    }
  }
}

function loadxml() {
  var url = getParam()["url"];
  if (typeof url === "undefined") {
    var id = getParam()["id"];
    if (typeof id === "undefined") return;
    id = id.replace("#", "");
    url = 'https://raw.githubusercontent.com/makewitharduino/ArduinoSample/master/' + id + '/' + id + '.xml';
    if (!sendChrome(url)) {
      setXmlContent(url);
    }
  }
  setXmlContent(url);
}

function setXmlContent(url) {
  $.ajax({
    url: url,
    type: "GET",
    dataType: 'text',
    success: function (res) {
      var xml = res.responseText;
      if (xml.length > 0) {
        Blockly.mainWorkspace.clear();
        xml = xml.replace("<html><head/><body><xml>", '');
        xml = xml.replace("</body></html>", '');
        xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' + xml;
        var xmlDoc = Blockly.Xml.textToDom(xml);
        Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xmlDoc);
      }
    }
  });
}

function sendChrome(url) {
  var userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('chrome') != -1) {
    // 確認ボタン付きのダイアログボックスを表示する
    var result = confirm("Send XML for ChromeApp.");
    if (result) {
      var extId = "ohncgafccgdbigbbikgkfbkiebahihmb";
      chrome.runtime.sendMessage(extId, {
        url: url
      });
      return true;
    }
  }
  return false;
}

function clipboard() {
  var clipboard = new Clipboard('#copy-button');
  clipboard.on('success', function (e) {
    Materialize.toast(Blockly.Msg.COPY_DONE, 4000);
  });
}

function getParam() {
  var url = location.href;
  var parameters = url.split('?');
  var paramsArray = [];
  if (parameters.length > 1) {
    var params = parameters[1].split('&');
    var paramsArray = [];
    for (var i = 0; i < params.length; i++) {
      var neet = params[i].split('=');
      paramsArray.push(neet[0]);
      paramsArray[neet[0]] = neet[1];
    }
  }
  return paramsArray;
}

function setScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.id = 'msg';
  var c = $.cookie("lang");
  var param;
  if (c) param = c;
  else {
    param = getParam()["lang"];
    if (typeof param === "undefined") param = "en";
    param = param.replace("#", "");
  }
  script.src = filepath["msg_" + param];
  var str = "#select-lang-" + param;
  $(str).prop('checked', true);

  var firstScript = document.getElementsByTagName('head')[0].appendChild(script);
  firstScript.parentNode.insertBefore(script, firstScript);
  script.onload = function (e) {
    setCharacter();
    clipboard();
    init();
    loadxml();
  };
}

function setCharacter() {
  if (typeof setCategoryCharacter === 'function') {
    setCategoryCharacter();
  }

  // Update text for new layout
  if ($("#tab_blocks").length) $("#tab_blocks").text(Blockly.Msg.BLOCKS || 'Blocks');
  if ($("#tab_arduino").length) $("#tab_arduino").text(Blockly.Msg.ARDUINO || 'Show Code');

  if ($("#get-app").length) $("#get-app").attr("data-tooltip", Blockly.Msg.DOWNLOAD_CHROME_APP || 'Download Chrome App');
  if ($("#go-to-sample").length) $("#go-to-sample").attr("data-tooltip", Blockly.Msg.GO_TO_SAMPLE || 'Go to Sample');
  if ($("#change-lang").length) $("#change-lang").attr("data-tooltip", Blockly.Msg.CHANGE_LANG || 'Change Language');
  if ($("#dialog-lang-title").length) $("#dialog-lang-title").text(Blockly.Msg.DIALOG_LANG_TITLE || 'Language Setting');
  if ($("#dialog-block-title").length) $("#dialog-block-title").text(Blockly.Msg.DIALOG_BLOCK_TITLE || 'Option Blocks');

  if ($("#button_import").length) $("#button_import").text(Blockly.Msg.BUTTON_IMPORT || 'Import');
  if ($("#button_export").length) $("#button_export").text(Blockly.Msg.BUTTON_EXPORT || 'Export');
  if ($('#textarea_import_label').length) $('#textarea_import_label').text(Blockly.Msg.TEXTAREA_IMPORT_LABEL || 'Import XML');
  if ($('#textarea_export_label').length) $('#textarea_export_label').text(Blockly.Msg.TEXTAREA_EXPORT_LABEL || 'Export XML');
  if ($('#dialog_import_ok').length) $('#dialog_import_ok').text(Blockly.Msg.DIALOG_IMPORT_OK || 'OK');
  if ($('#dialog_import_cancel').length) $('#dialog_import_cancel').text(Blockly.Msg.DIALOG_IMPORT_CANCEL || 'CANCEL');
  if ($('#dialog_export_ok').length) $('#dialog_export_ok').text(Blockly.Msg.DIALOG_EXPORT_OK || 'OK');

  if ($("#copy-button").length) $("#copy-button").attr("data-tooltip", Blockly.Msg.COPY_BUTTON || 'Copy Code');
  if ($("#discard").length) $("#discard").attr("data-tooltip", Blockly.Msg.DISCARD || 'Clear Workspace');
  if ($("#save").length) $("#save").attr("data-tooltip", Blockly.Msg.SAVE_XML || 'Save Project');
  if ($("#fakeload").length) $("#fakeload").attr("data-tooltip", Blockly.Msg.LOAD_XML || 'Load Project');
}

function getFiles() {
  // return {"sketch.ino": Blockly.Generator.workspaceToCode('Arduino') }
  //$('textarea#textarea_arduino').val() //&lt; et &lt;
  var code = $('textarea#content_arduino').val();

  code = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  //code=code.replace(">","&gt;");
  //code = "<![CDATA[" + code + "]]>";
  //document.write (code);
  return {
    "sketch.ino": code
  };
}

// Add missing functions
function discard() {
  if (Blockly && Blockly.mainWorkspace) {
    Blockly.mainWorkspace.clear();
    renderContent();
  }
}

function save() {
  if (Blockly && Blockly.mainWorkspace) {
    var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    var data = Blockly.Xml.domToText(xml);
    data = data.replace(/\r?\n/g, '');
    $('#textarea_export').val(data);
    $('#textarea_export').trigger('autoresize');
    $('#modal_export').openModal();
  }
}

function auto_save_and_restore_blocks() {
  // Auto-save functionality
  if (typeof(Storage) !== "undefined") {
    // Helper: save current workspace to localStorage
    function saveWorkspaceToLocalStorage() {
      try {
        if (!Blockly || !Blockly.mainWorkspace) return;
        var blocks = Blockly.mainWorkspace.getAllBlocks(false);
        if (!blocks || blocks.length === 0) {
          localStorage.removeItem('blockly_workspace');
          console.log('[Blockly] Workspace empty → removed blockly_workspace');
          return;
        }
        var wxml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
        var data = Blockly.Xml.domToText(wxml);
        localStorage.setItem('blockly_workspace', data);
        console.log('[Blockly] Saved workspace to localStorage (blocks:', blocks.length, ')');
      } catch (e) {
        console.log('Error saving blocks:', e);
      }
    }

    // Debounce wrapper to avoid excessive writes
    var saveDebounceTimer = null;
    function debouncedSave() {
      if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
      saveDebounceTimer = setTimeout(saveWorkspaceToLocalStorage, 200);
    }

    // Restore blocks on page load
    var xml = localStorage.getItem('blockly_workspace');
    if (xml && Blockly && Blockly.mainWorkspace) {
      try {
        var xmlDoc = Blockly.Xml.textToDom(xml);
        Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xmlDoc);
        console.log('[Blockly] Restored workspace from localStorage');
      } catch (e) {
        console.log('Error restoring blocks:', e);
      }
    } else if (Blockly && Blockly.mainWorkspace) {
      // If no saved workspace, seed with setup and loop blocks once
      try {
        var defaultXmlText = '<xml xmlns="http://www.w3.org/1999/xhtml">\n'
          + '  <block type="initializes_setup" x="20" y="20"></block>\n'
          + '  <block type="initializes_loop" x="20" y="140"></block>\n'
          + '</xml>';
        var defaultXml = Blockly.Xml.textToDom(defaultXmlText);
        Blockly.mainWorkspace.clear();
        Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, defaultXml);
        console.log('[Blockly] Seeded workspace with default setup/loop blocks');
        // Persist the seeded workspace
        saveWorkspaceToLocalStorage();
      } catch (e) {
        console.log('Error seeding default blocks:', e);
      }
    }
    
    // Save blocks on change
    if (Blockly && (Blockly.mainWorkspace || (typeof Blockly.getMainWorkspace === 'function' && Blockly.getMainWorkspace()))) {
      var wsForSave = Blockly.mainWorkspace || Blockly.getMainWorkspace();
      if (wsForSave && typeof wsForSave.addChangeListener === 'function') {
        wsForSave.addChangeListener(function(event) {
          try {
            if (window.Blockly && Blockly.Events && event && event.type === Blockly.Events.UI) {
              return;
            }
          } catch (e) { /* noop */ }
          debouncedSave();
        });
      } else if (Blockly && typeof Blockly.addChangeListener === 'function') {
        Blockly.addChangeListener(function() { debouncedSave(); });
      }
    }

    // Also hook into explicit actions
    if (typeof window.import_xml === 'function') {
      var originalImport = window.import_xml;
      window.import_xml = function() {
        originalImport.apply(this, arguments);
        setTimeout(saveWorkspaceToLocalStorage, 0);
      };
    }
    if (typeof window.discard === 'function') {
      var originalDiscard = window.discard;
      window.discard = function() {
        originalDiscard.apply(this, arguments);
        setTimeout(saveWorkspaceToLocalStorage, 0);
      };
    }
  }
}

function change_lang() {
  var checkbox = $('.filled-in:checked').map(function () {
    return $(this).val();
  }).get();
  var str = checkbox.join(',');
  window.localStorage.toolboxids = str;

  var val = $('.with-gap:checked').map(function () {
    //$(this)でjQueryオブジェクトが取得できる。val()で値をvalue値を取得。
    return $(this).val();
  }).get();
  //mapの結果がjQueryオブジェクトの配列で返ってくるので、get()で生配列を取得する。
  $.cookie("lang", val, {
    expires: 7
  });
  var loc = window.location;
  window.location = loc.protocol + '//' + loc.host + loc.pathname + '?lang=' + val;
}

function set_variable() {
  var input = document.getElementById('dialog_var_name');
  var newVar = input.value;
  if (newVar) {
    newVar = newVar.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
    if (newVar == Blockly.Msg.RENAME_VARIABLE ||
      newVar == Blockly.Msg.NEW_VARIABLE) {
      // Ok, not ALL names are legal...
    } else {
      Blockly.Variables.renameVariable(Blockly.Msg.Valiable_text, newVar, Blockly.FieldVariable_workspace);
    }
  }
}

function upload() {
  var arduinoTextarea = document.getElementById('textarea_arduino');
  arduinoTextarea.value = Blockly.Generator.workspaceToCode('Arduino');
}

function export_xml() {
  var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  var data = Blockly.Xml.domToText(xml);
  data = data.replace(/\r?\n/g, '');
  $('#textarea_export').val(data);
  $('#textarea_export').trigger('autoresize');
  $('#modal_export').openModal();
}

function import_xml() {
  var xml = $('#textarea_import').val();
  $('#textarea_import').val("");
  var xmlDoc = Blockly.Xml.textToDom(xml);
  // Blockly.mainWorkspace.clear();
  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xmlDoc);
}

window.onload = function () {
  setScript();
};

$(document).ready(function () {
  $('#textarea_export').focus(function () {
    $(this).select();
  });
  $('#textarea_import').val("");
  
  // Initialize UI components
  initializeUI();
});

// Sidebar and UI Management
function initializeUI() {
  // Dummy data for history and starred
  const dummyHistory = [
    {
      id: 1,
      title: "LED Blink Project",
      time: "2 hours ago",
      preview: "void setup() { pinMode(13, OUTPUT); } void loop() { digitalWrite(13, HIGH); delay(1000); }",
      code: "void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}"
    },
    {
      id: 2,
      title: "Sensor Reading",
      time: "1 day ago",
      preview: "int sensorValue = analogRead(A0); float voltage = sensorValue * (5.0 / 1023.0);",
      code: "int sensorValue = analogRead(A0);\nfloat voltage = sensorValue * (5.0 / 1023.0);\nSerial.println(voltage);"
    },
    {
      id: 3,
      title: "Motor Control",
      time: "3 days ago",
      preview: "void setup() { pinMode(9, OUTPUT); } void loop() { analogWrite(9, 255); }",
      code: "void setup() {\n  pinMode(9, OUTPUT);\n}\n\nvoid loop() {\n  analogWrite(9, 255);\n  delay(1000);\n  analogWrite(9, 0);\n  delay(1000);\n}"
    },
    {
      id: 4,
      title: "WiFi Connection",
      time: "1 week ago",
      preview: "#include <WiFi.h> void setup() { WiFi.begin(\"SSID\", \"password\"); }",
      code: "#include <WiFi.h>\n\nvoid setup() {\n  WiFi.begin(\"SSID\", \"password\");\n  while (WiFi.status() != WL_CONNECTED) {\n    delay(1000);\n  }\n}"
    },
    {
      id: 4,
      title: "WiFi Connection 1",
      time: "1 week ago",
      preview: "#include <WiFi.h> void setup() { WiFi.begin(\"SSID\", \"password\"); }",
      code: "#include <WiFi.h>\n\nvoid setup() {\n  WiFi.begin(\"SSID\", \"password\");\n  while (WiFi.status() != WL_CONNECTED) {\n    delay(1000);\n  }\n}"
    }
  ];

  const dummyStarred = [
    {
      id: 1,
      title: "My Favorite LED Pattern",
      time: "2 days ago",
      preview: "void setup() { for(int i=2; i<=7; i++) pinMode(i, OUTPUT); }",
      code: "void setup() {\n  for(int i=2; i<=7; i++) {\n    pinMode(i, OUTPUT);\n  }\n}\n\nvoid loop() {\n  for(int i=2; i<=7; i++) {\n    digitalWrite(i, HIGH);\n    delay(200);\n    digitalWrite(i, LOW);\n  }\n}"
    },
    {
      id: 2,
      title: "Temperature Monitor",
      time: "1 week ago",
      preview: "float temp = analogRead(A0) * 0.48828125; if(temp > 30) digitalWrite(13, HIGH);",
      code: "float temp = analogRead(A0) * 0.48828125;\nif(temp > 30) {\n  digitalWrite(13, HIGH);\n} else {\n  digitalWrite(13, LOW);\n}"
    }
  ];

  // Populate history list
  function populateHistoryList() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    historyList.innerHTML = '';
    dummyHistory.forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.innerHTML = `
        <div class="history-item-title">${item.title}</div>
        <div class="history-item-time">${item.time}</div>
        <div class="history-item-preview">${item.preview}</div>
        <div class="history-item-actions">
          <button class="action-btn-small" onclick="loadHistoryItem(${item.id})">Load</button>
          <button class="action-btn-small" onclick="starHistoryItem(${item.id})">Star</button>
          <button class="action-btn-small" onclick="deleteHistoryItem(${item.id})">Delete</button>
        </div>
      `;
      historyList.appendChild(historyItem);
    });
  }

  // Populate starred list
  function populateStarredList() {
    const starredList = document.getElementById('starred-list');
    if (!starredList) return;
    
    starredList.innerHTML = '';
    dummyStarred.forEach(item => {
      const starredItem = document.createElement('div');
      starredItem.className = 'starred-item';
      starredItem.innerHTML = `
        <div class="starred-item-title">${item.title}</div>
        <div class="starred-item-time">${item.time}</div>
        <div class="starred-item-preview">${item.preview}</div>
        <div class="starred-item-actions">
          <button class="action-btn-small" onclick="loadStarredItem(${item.id})">Load</button>
          <button class="action-btn-small" onclick="unstarItem(${item.id})">Unstar</button>
        </div>
      `;
      starredList.appendChild(starredItem);
    });
  }

  // Sidebar toggle functionality
  const sidebar = document.getElementById('sidebar');
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const mainContainer = document.querySelector('.main-container');

  function toggleSidebar() {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('show');
    mainContainer.classList.toggle('sidebar-open');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
    mainContainer.classList.remove('sidebar-open');
  }

  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', toggleSidebar);
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', closeSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      document.getElementById(targetTab + '-tab').classList.add('active');
    });
  });

  // Device dropdown functionality
  const deviceDropdown = document.querySelector('.device-dropdown');
  const deviceBtn = document.querySelector('.device-btn');
  const deviceName = document.querySelector('.device-name');

  if (deviceDropdown && deviceBtn) {
    deviceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deviceDropdown.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      deviceDropdown.classList.remove('open');
    });

    // Device selection
    const deviceOptions = document.querySelectorAll('.device-dropdown-content a');
    deviceOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        const device = option.getAttribute('data-device');
        const deviceText = option.textContent.trim();
        deviceName.textContent = deviceText;
        deviceDropdown.classList.remove('open');
        console.log('Selected device:', device);
      });
    });
  }

  // Upload functionality with progress bar
  const uploadBtn = document.getElementById('upload-btn');
  const uploadProgress = document.getElementById('upload-progress');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');

  if (uploadBtn && uploadProgress && progressFill && progressText) {
    uploadBtn.addEventListener('click', () => {
      // Simulate upload process
      uploadBtn.disabled = true;
      uploadProgress.classList.add('show');
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
        
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            uploadBtn.disabled = false;
            uploadProgress.classList.remove('show');
            progressFill.style.width = '0%';
            progressText.textContent = '0%';
            console.log('Upload completed!');
          }, 1000);
        }
      }, 200);
    });
  }

  // Initialize lists
  populateHistoryList();
  populateStarredList();
  
  // Initialize device dropdown
  initDeviceDropdown();

  // Initialize Serial Monitor UI
  initSerialMonitor();
  
  // Initialize resizable divider
  initResizableDivider();
  
  // Initialize filename functionality
  initFilenameField();
}

// History and Starred item functions
function loadHistoryItem(id) {
  console.log('Loading history item:', id);
  // Here you would load the actual code into the editor
}

function starHistoryItem(id) {
  console.log('Starring history item:', id);
  // Here you would add the item to starred list
}

function deleteHistoryItem(id) {
  console.log('Deleting history item:', id);
  // Here you would remove the item from history
}

function loadStarredItem(id) {
  console.log('Loading starred item:', id);
  // Here you would load the actual code into the editor
}

function unstarItem(id) {
  console.log('Unstarring item:', id);
  // Here you would remove the item from starred list
}

// Open Serial Monitor in New Window
function openSerialMonitor() {
  var serialWindow = window.open(
    '/serial-monitor',
    'SerialMonitor',
    'width=1000,height=700,resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no'
  );
  
  if (serialWindow) {
    serialWindow.focus();
  } else {
    alert('Please allow popups for this site to open the Serial Monitor.');
  }
}

// Device Dropdown Functionality
function initDeviceDropdown() {
  const deviceDropdown = document.getElementById('deviceDropdown');
  if (!deviceDropdown) return;
  
  const trigger = deviceDropdown.querySelector('.device-dropdown-trigger');
  const menu = deviceDropdown.querySelector('.device-dropdown-menu');
  const selectedText = deviceDropdown.querySelector('.device-selected-text');
  const statusIndicator = deviceDropdown.querySelector('.device-status-indicator');
  const resetBtn = document.getElementById('device-reset-btn');
  
  let selectedDevice = 'none'; // Default to no device
  let detectedPorts = []; // Array to store detected COM ports
  
  // Function to request port access
  async function requestPortAccess() {
    try {
      if (!('serial' in navigator)) {
        console.log('Web Serial API not supported');
        return null;
      }
      
      const port = await navigator.serial.requestPort();
      return port;
    } catch (error) {
      console.log('User cancelled port selection or error:', error);
      return null;
    }
  }
  
  // Function to detect COM ports
  async function detectCOMPorts() {
    try {
      if (!('serial' in navigator)) {
        console.log('Web Serial API not supported');
        return [];
      }
      
      // Get already granted ports
      const ports = await navigator.serial.getPorts();
      const portList = [];
      
      for (const port of ports) {
        const portInfo = {
          id: port.id,
          name: port.getInfo().productName || 'Unknown Device',
          vendorId: port.getInfo().vendorId,
          productId: port.getInfo().productId,
          serialNumber: port.getInfo().serialNumber || 'Unknown'
        };
        
        // Determine device type based on vendor/product IDs or name
        let deviceType = 'other';
        if (portInfo.name.toLowerCase().includes('arduino') || 
            portInfo.vendorId === '0x2341' || // Arduino LLC
            portInfo.vendorId === '0x1A86') { // CH340 (common Arduino clone chip)
          deviceType = 'arduino';
        } else if (portInfo.name.toLowerCase().includes('esp32') ||
                   portInfo.vendorId === '0x10C4' || // Silicon Labs (ESP32)
                   portInfo.vendorId === '0x1A86') { // CH340 (ESP32)
          deviceType = 'esp32';
        }
        
        portList.push({
          ...portInfo,
          deviceType: deviceType,
          displayName: `${portInfo.name} (${portInfo.serialNumber})`
        });
      }
      
      return portList;
    } catch (error) {
      console.error('Error detecting COM ports:', error);
      return [];
    }
  }
  
  // Function to populate dropdown menu
  function populateDropdownMenu() {
    menu.innerHTML = '';
    
    // Add "Connect New Device" option
    const connectItem = document.createElement('div');
    connectItem.className = 'device-dropdown-item connect-device';
    connectItem.style.background = 'rgba(76, 175, 80, 0.2)';
    connectItem.style.borderLeft = '3px solid #4caf50';
    
    const connectIcon = document.createElement('i');
    connectIcon.className = 'material-icons';
    connectIcon.textContent = 'add';
    connectIcon.style.color = '#4caf50';
    
    const connectSpan = document.createElement('span');
    connectSpan.textContent = 'Connect New Device';
    connectSpan.style.color = '#4caf50';
    connectSpan.style.fontWeight = '600';
    
    connectItem.appendChild(connectIcon);
    connectItem.appendChild(connectSpan);
    
    connectItem.addEventListener('click', async function(e) {
      e.stopPropagation();
      const newPort = await requestPortAccess();
      if (newPort) {
        // Refresh the list after adding new port
        await refreshDeviceDetection();
      }
    });
    
    menu.appendChild(connectItem);
    
    // Add separator
    const separator1 = document.createElement('div');
    separator1.style.height = '1px';
    separator1.style.background = 'rgba(255, 255, 255, 0.1)';
    separator1.style.margin = '8px 0';
    menu.appendChild(separator1);
    
    // Add detected COM ports
    detectedPorts.forEach(port => {
      const item = document.createElement('div');
      item.className = 'device-dropdown-item';
      item.setAttribute('data-device', port.deviceType);
      item.setAttribute('data-port-id', port.id);
      
      const indicator = document.createElement('div');
      indicator.className = `device-status-indicator ${port.deviceType}`;
      
      const span = document.createElement('span');
      span.textContent = port.displayName;
      
      const checkIcon = document.createElement('i');
      checkIcon.className = 'material-icons check-icon';
      checkIcon.textContent = 'check';
      
      item.appendChild(indicator);
      item.appendChild(span);
      item.appendChild(checkIcon);
      
      menu.appendChild(item);
    });
    
    // Add separator if there are ports
    if (detectedPorts.length > 0) {
      const separator2 = document.createElement('div');
      separator2.style.height = '1px';
      separator2.style.background = 'rgba(255, 255, 255, 0.1)';
      separator2.style.margin = '8px 0';
      menu.appendChild(separator2);
    }
    
    // Add "No Device" option
    const noDeviceItem = document.createElement('div');
    noDeviceItem.className = 'device-dropdown-item';
    noDeviceItem.setAttribute('data-device', 'none');
    
    const noIndicator = document.createElement('div');
    noIndicator.className = 'device-status-indicator none';
    
    const noSpan = document.createElement('span');
    noSpan.textContent = 'No Device';
    
    const noCheckIcon = document.createElement('i');
    noCheckIcon.className = 'material-icons check-icon';
    noCheckIcon.textContent = 'check';
    
    noDeviceItem.appendChild(noIndicator);
    noDeviceItem.appendChild(noSpan);
    noDeviceItem.appendChild(noCheckIcon);
    
    menu.appendChild(noDeviceItem);
    
    // Re-attach event listeners
    attachItemListeners();
  }
  
  // Function to attach event listeners to dropdown items
  function attachItemListeners() {
    const items = menu.querySelectorAll('.device-dropdown-item');
    
    items.forEach(item => {
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const deviceType = item.getAttribute('data-device');
        const portId = item.getAttribute('data-port-id');
        const deviceName = item.querySelector('span').textContent;
        
        // Update selected device
        selectedDevice = deviceType;
        selectedText.textContent = deviceName;
        
        // Update status indicator
        statusIndicator.className = 'device-status-indicator';
        if (deviceType === 'esp32') {
          statusIndicator.classList.add('esp32');
        } else if (deviceType === 'arduino') {
          statusIndicator.classList.add('arduino');
        } else if (deviceType === 'other') {
          statusIndicator.classList.add('com');
        } else {
          statusIndicator.classList.add('none');
        }
        
        // Update selected state
        items.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        
        // Close dropdown
        deviceDropdown.classList.remove('open');
        
        // Trigger device change event
        console.log('Device changed to:', deviceType, deviceName, portId);
        
        // Dynamically toggle ESP32 toolbox and refresh
        try {
          var xmlString = buildtoolBox();
          var parser = new DOMParser();
          var xmlDoc = parser.parseFromString(xmlString, 'text/xml');
          var toolboxNode = xmlDoc.getElementById('toolbox') || xmlDoc.documentElement;

          // Determine if ESP32 category exists
          var hasEsp32 = false;
          Array.prototype.slice.call(toolboxNode.children).forEach(function(child){
            if (child.getAttribute && child.getAttribute('id') === 'category_esp32') { hasEsp32 = true; }
          });

          if ((deviceType === 'esp32' || deviceType === 'arduino') && !hasEsp32) {
            var tpl = document.getElementById('toolbox');
            if (tpl) {
              var esp = Array.prototype.find.call(tpl.children, function(c){ return c.id === 'category_esp32'; });
              if (esp) { toolboxNode.appendChild(esp.cloneNode(true)); }
            }
          }
          if (deviceType !== 'esp32' && deviceType !== 'arduino' && hasEsp32) {
            var removeList = [];
            Array.prototype.slice.call(toolboxNode.children).forEach(function(child){
              if (child.getAttribute && child.getAttribute('id') === 'category_esp32') { removeList.push(child); }
            });
            removeList.forEach(function(n){ if (n.parentNode) n.parentNode.removeChild(n); });
          }

          if (Blockly && Blockly.mainWorkspace) {
            Blockly.mainWorkspace.updateToolbox(new XMLSerializer().serializeToString(toolboxNode));
          }
        } catch (err) {
          console.warn('ESP32 toolbox toggle error:', err);
        }
      });
    });
  }
  
  // Function to refresh device detection
  async function refreshDeviceDetection() {
    if (resetBtn) {
      resetBtn.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        resetBtn.style.transform = '';
      }, 500);
    }
    
    console.log('Refreshing device detection...');
    detectedPorts = await detectCOMPorts();
    populateDropdownMenu();
    
    // Update display text
    if (detectedPorts.length > 0) {
      selectedText.textContent = `${detectedPorts.length} Device(s) Detected`;
      statusIndicator.className = 'device-status-indicator com';
    } else {
      selectedText.textContent = 'No Device Detected';
      statusIndicator.className = 'device-status-indicator none';
    }
    
    console.log('Detected ports:', detectedPorts);
  }
  
  // Toggle dropdown
  trigger.addEventListener('click', function(e) {
    e.stopPropagation();
    deviceDropdown.classList.toggle('open');
  });
  
  // Reset button event listener
  if (resetBtn) {
    resetBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      refreshDeviceDetection();
    });
  }
  
  // Initialize device detection on page load
  refreshDeviceDetection();
  
  // Set default to "No Device" if no ports detected
  setTimeout(() => {
    if (detectedPorts.length === 0) {
      selectedText.textContent = 'No Device Detected';
      statusIndicator.className = 'device-status-indicator none';
    }
  }, 100);
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!deviceDropdown.contains(e.target)) {
      deviceDropdown.classList.remove('open');
    }
  });
  
  // Close dropdown on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      deviceDropdown.classList.remove('open');
    }
  });
}

// Serial Monitor (Web Serial API)
var __serial = { port: null, reader: null, writer: null, textDecoder: null, textEncoder: null, isReading: false };

function appendSerial(text) {
  var out = document.getElementById('serial_output');
  if (!out) return;
  
  // Get current timestamp if enabled
  var timestamp = '';
  var showTimestamp = document.getElementById('show_timestamp');
  if (showTimestamp && showTimestamp.checked) {
    var now = new Date();
    timestamp = '[' + now.toLocaleTimeString() + '] ';
  }
  
  // Create new line element
  var line = document.createElement('div');
  line.className = 'serial-line';
  line.textContent = timestamp + text;
  
  out.appendChild(line);
  
  // Auto scroll if enabled
  var autoScroll = document.getElementById('auto_scroll');
  if (!autoScroll || autoScroll.checked) {
    out.scrollTop = out.scrollHeight;
  }
  
  // Limit number of lines to prevent memory issues
  var lines = out.children;
  if (lines.length > 1000) {
    out.removeChild(lines[0]);
  }
}

function setSerialStatus(text) {
  var el = document.getElementById('serial_status');
  var dot = document.getElementById('status_dot');
  var info = document.getElementById('serial_info');
  
  if (el) el.textContent = text;
  
  if (dot) {
    dot.className = 'status-dot';
    if (text.includes('Connected')) {
      dot.classList.add('connected');
      if (info) info.textContent = 'Serial communication active';
    } else if (text.includes('Connecting')) {
      dot.classList.add('connecting');
      if (info) info.textContent = 'Establishing connection...';
    } else {
      if (info) info.textContent = 'Ready to connect';
    }
  }
}

function initSerialMonitor() {
  var baudSelect = document.getElementById('serial_baud');
  try { if (window.$ && typeof $('select').material_select === 'function') $('select').material_select(); } catch(e) {}
  setSerialStatus('Disconnected');
  
  // Add Enter key listener for input
  var input = document.getElementById('serial_input');
  if (input) {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        serialSend();
        e.preventDefault();
      }
    });
  }
}

function serialClear() {
  var out = document.getElementById('serial_output');
  if (out) {
    out.innerHTML = '';
    appendSerial('Serial output cleared.\n');
  }
}

function serialSave() {
  var out = document.getElementById('serial_output');
  if (!out) return;
  
  var content = '';
  var lines = out.children;
  for (var i = 0; i < lines.length; i++) {
    content += lines[i].textContent + '\n';
  }
  
  if (content.trim()) {
    var blob = new Blob([content], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'serial_output_' + new Date().toISOString().replace(/[:.]/g, '-') + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    appendSerial('Serial output saved to file.\n');
  } else {
    appendSerial('No data to save.\n');
  }
}

async function serialConnect() {
  try {
    if (!('serial' in navigator)) { 
      appendSerial('Web Serial is not supported in this browser.\n'); 
      return; 
    }
    
    setSerialStatus('Connecting...');
    appendSerial('Requesting port access...\n');
    
    __serial.port = await navigator.serial.requestPort();
    var baudEl = document.getElementById('serial_baud');
    var baud = baudEl ? parseInt(baudEl.value || '115200', 10) : 115200;
    await __serial.port.open({ baudRate: baud });
    __serial.textDecoder = new TextDecoderStream();
    __serial.textEncoder = new TextEncoderStream();
    const readableStreamClosed = __serial.port.readable.pipeTo(__serial.textDecoder.writable);
    __serial.reader = __serial.textDecoder.readable.getReader();
    const writableStreamClosed = __serial.textEncoder.readable.pipeTo(__serial.port.writable);
    __serial.writer = __serial.textEncoder.writable.getWriter();
    
    setSerialStatus('Connected @ ' + baud + ' baud');
    appendSerial('Connected to serial port at ' + baud + ' baud\n');
    appendSerial('Ready to receive data...\n');
    appendSerial('\n[Connected]\n');
    __serial.isReading = true;
    ;(async function readLoop(){
      try {
        while (__serial.reader && __serial.isReading) {
          const { value, done } = await __serial.reader.read();
          if (done) break;
          if (value) appendSerial(value);
        }
      } catch(err) {
        appendSerial('\n[Read error] ' + err + '\n');
      }
    })();
  } catch(err) {
    appendSerial('\n[Connect error] ' + err + '\n');
  }
}

async function serialDisconnect() {
  try {
    __serial.isReading = false;
    if (__serial.reader) { try { await __serial.reader.cancel(); } catch(e) {} try { __serial.reader.releaseLock(); } catch(e) {} __serial.reader = null; }
    if (__serial.writer) { try { await __serial.writer.close(); } catch(e) {} try { __serial.writer.releaseLock(); } catch(e) {} __serial.writer = null; }
    if (__serial.port) { try { await __serial.port.close(); } catch(e) {} }
    setSerialStatus('Disconnected');
    appendSerial('Disconnected from serial port\n');
    appendSerial('[Disconnected]\n');
  } catch(err) {
    appendSerial('Disconnect error: ' + err + '\n');
  }
}

async function serialSend() {
  try {
    var input = document.getElementById('serial_input');
    if (!input) return;
    var text = input.value || '';
    if (!text) return;
    if (__serial.writer) {
      await __serial.writer.write(text + '\n');
      appendSerial('> ' + text + '\n');
      input.value = '';
    } else {
      appendSerial('[Not connected]\n');
    }
  } catch(err) {
    appendSerial('Send error: ' + err + '\n');
  }
}

// Show Code Function - Generate and display Arduino code
function showCode(evt) {
  if (evt && typeof evt.preventDefault === 'function') {
    evt.preventDefault();
  }
  if (evt && typeof evt.stopPropagation === 'function') {
    evt.stopPropagation();
  }
  console.log('showCode function called');
  
  var arduinoTextarea = document.getElementById('content_arduino');
  if (!arduinoTextarea) {
    console.log('Error: content_arduino textarea not found');
    return;
  }
  
  if (!Blockly) {
    console.log('Error: Blockly not loaded');
    arduinoTextarea.value = '// Error: Blockly not loaded';
    return;
  }
  
  // Try different ways to get the workspace
  var workspace = null;
  if (Blockly.mainWorkspace) {
    workspace = Blockly.mainWorkspace;
    console.log('Using Blockly.mainWorkspace');
  } else if (typeof Blockly.getMainWorkspace === 'function') {
    workspace = Blockly.getMainWorkspace();
    console.log('Using Blockly.getMainWorkspace()');
  } else {
    console.log('Error: No workspace found');
    arduinoTextarea.value = '// Error: No Blockly workspace found';
    return;
  }
  
  if (!workspace) {
    console.log('Error: Workspace is null');
    arduinoTextarea.value = '// Error: Workspace is null';
    return;
  }
  
  // Check if workspace has blocks
  var blocks = workspace.getAllBlocks();
  console.log('Number of blocks in workspace:', blocks.length);
  
  var code = '';
  try {
    if (Blockly.Arduino && typeof Blockly.Arduino.workspaceToCode === 'function') {
      code = Blockly.Arduino.workspaceToCode(workspace);
      console.log('Generated code using Blockly.Arduino.workspaceToCode');
    } else if (Blockly.Generator && typeof Blockly.Generator.workspaceToCode === 'function') {
      code = Blockly.Generator.workspaceToCode('Arduino');
      console.log('Generated code using Blockly.Generator.workspaceToCode');
    } else {
      console.log('Error: No code generator found');
      code = '// Error: No code generator available';
    }
  } catch (e) {
    console.log('Error generating code:', e);
    code = '// Error generating code: ' + e.message;
  }
  
  // Display the generated code
  if (blocks.length === 0) {
    arduinoTextarea.value = '// No blocks found. Add some blocks to generate code.';
  } else {
    arduinoTextarea.value = code || '// Add blocks to generate code';
  }
  
  // Do not auto-scroll the page; keep layout position stable
  
  console.log('Code generated successfully, length:', code.length);
  
  // Also trigger a visual feedback
  arduinoTextarea.style.backgroundColor = 'rgba(100, 181, 246, 0.1)';
  setTimeout(function() {
    arduinoTextarea.style.backgroundColor = 'transparent';
  }, 1000);
}

// Resizable Divider Functionality
function initResizableDivider() {
  const divider = document.getElementById('resizableDivider');
  const leftPanel = document.querySelector('.left-panel');
  const rightPanel = document.querySelector('.right-panel');
  const mainContainer = document.querySelector('.main-container');
  
  if (!divider || !leftPanel || !rightPanel || !mainContainer) {
    console.log('Resizable divider elements not found');
    return;
  }
  
  let isDragging = false;
  let startX = 0;
  let startLeftWidth = 0;
  let startRightWidth = 0;
  
  // Get current flex-basis values
  function getFlexBasis(element) {
    const flexBasis = window.getComputedStyle(element).flexBasis;
    return parseFloat(flexBasis) || 0;
  }
  
  // Set flex-basis values
  function setFlexBasis(element, value) {
    element.style.flexBasis = value + '%';
  }
  
  // Initialize with default values
  const leftWidth = getFlexBasis(leftPanel) || 60;
  const rightWidth = getFlexBasis(rightPanel) || 40;
  
  setFlexBasis(leftPanel, leftWidth);
  setFlexBasis(rightPanel, rightWidth);
  
  // Mouse down event
  divider.addEventListener('mousedown', function(e) {
    isDragging = true;
    startX = e.clientX;
    startLeftWidth = getFlexBasis(leftPanel);
    startRightWidth = getFlexBasis(rightPanel);
    
    divider.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    e.preventDefault();
  });
  
  // Mouse move event
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    const containerWidth = mainContainer.offsetWidth;
    const deltaPercent = (deltaX / containerWidth) * 100;
    
    let newLeftWidth = startLeftWidth + deltaPercent;
    let newRightWidth = startRightWidth - deltaPercent;
    
    // Set minimum and maximum widths
    const minWidth = 20; // 20% minimum
    const maxWidth = 80; // 80% maximum
    
    if (newLeftWidth < minWidth) {
      newLeftWidth = minWidth;
      newRightWidth = 100 - minWidth;
    } else if (newLeftWidth > maxWidth) {
      newLeftWidth = maxWidth;
      newRightWidth = 100 - maxWidth;
    } else if (newRightWidth < minWidth) {
      newRightWidth = minWidth;
      newLeftWidth = 100 - minWidth;
    }
    
    setFlexBasis(leftPanel, newLeftWidth);
    setFlexBasis(rightPanel, newRightWidth);
    
    // Trigger Blockly resize if available
    if (Blockly && Blockly.mainWorkspace) {
      setTimeout(() => {
        Blockly.svgResize(Blockly.mainWorkspace);
      }, 10);
    }
  });
  
  // Mouse up event
  document.addEventListener('mouseup', function() {
    if (isDragging) {
      isDragging = false;
      divider.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
  
  // Touch events for mobile
  divider.addEventListener('touchstart', function(e) {
    isDragging = true;
    startX = e.touches[0].clientX;
    startLeftWidth = getFlexBasis(leftPanel);
    startRightWidth = getFlexBasis(rightPanel);
    
    divider.classList.add('dragging');
    document.body.style.userSelect = 'none';
    
    e.preventDefault();
  });
  
  document.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - startX;
    const containerWidth = mainContainer.offsetWidth;
    const deltaPercent = (deltaX / containerWidth) * 100;
    
    let newLeftWidth = startLeftWidth + deltaPercent;
    let newRightWidth = startRightWidth - deltaPercent;
    
    // Set minimum and maximum widths
    const minWidth = 20;
    const maxWidth = 80;
    
    if (newLeftWidth < minWidth) {
      newLeftWidth = minWidth;
      newRightWidth = 100 - minWidth;
    } else if (newLeftWidth > maxWidth) {
      newLeftWidth = maxWidth;
      newRightWidth = 100 - maxWidth;
    } else if (newRightWidth < minWidth) {
      newRightWidth = minWidth;
      newLeftWidth = 100 - minWidth;
    }
    
    setFlexBasis(leftPanel, newLeftWidth);
    setFlexBasis(rightPanel, newRightWidth);
    
    // Trigger Blockly resize if available
    if (Blockly && Blockly.mainWorkspace) {
      setTimeout(() => {
        Blockly.svgResize(Blockly.mainWorkspace);
      }, 10);
    }
    
    e.preventDefault();
  });
  
  document.addEventListener('touchend', function() {
    if (isDragging) {
      isDragging = false;
      divider.classList.remove('dragging');
      document.body.style.userSelect = '';
    }
  });
  
  // Handle window resize
  window.addEventListener('resize', function() {
    if (Blockly && Blockly.mainWorkspace) {
      setTimeout(() => {
        Blockly.svgResize(Blockly.mainWorkspace);
      }, 100);
    }
  });
  
  console.log('Resizable divider initialized');
}

// Filename Field Functionality
function initFilenameField() {
  const filenameInput = document.getElementById('project-filename');
  const filenameIcon = document.querySelector('.filename-icon');
  
  if (!filenameInput || !filenameIcon) {
    console.log('Filename elements not found');
    return;
  }
  
  // Load saved filename from localStorage
  const savedFilename = localStorage.getItem('project_filename');
  if (savedFilename) {
    filenameInput.value = savedFilename;
  }
  
  // Character counter and validation
  function updateCharacterCount() {
    const currentLength = filenameInput.value.length;
    const maxLength = 15;
    
    // Update input styling based on character count
    if (currentLength >= maxLength - 2) {
      filenameInput.style.color = '#FFFFFFFF'; // Orange for warning
      filenameInput.style.fontWeight = '700'; // Keep bold
    } else if (currentLength >= maxLength) {
      filenameInput.style.color = '#f44336'; // Red for limit reached
      filenameInput.style.fontWeight = '700'; // Keep bold
    } else {
      filenameInput.style.color = 'white'; // Normal color
      filenameInput.style.fontWeight = '700'; // Keep bold
    }
  }
  
  // Input event handlers
  filenameInput.addEventListener('input', function(e) {
    const value = e.target.value;
    
    // Enforce 15 character limit
    if (value.length > 15) {
      e.target.value = value.substring(0, 15);
    }
    
    // Update character count styling
    updateCharacterCount();
    
    // Save to localStorage
    localStorage.setItem('project_filename', e.target.value);
    
    // Update page title
    updatePageTitle(e.target.value);
  });
  
  // Focus and blur handlers
  filenameInput.addEventListener('focus', function() {
    this.select(); // Select all text when focused
    filenameIcon.style.color = 'rgba(100, 181, 246, 0.8)';
  });
  
  filenameInput.addEventListener('blur', function() {
    // If empty, set default name
    if (!this.value.trim()) {
      this.value = 'My Project';
      localStorage.setItem('project_filename', this.value);
      updatePageTitle(this.value);
    }
    filenameIcon.style.color = 'rgba(255, 255, 255, 0.7)';
    updateCharacterCount();
  });
  
  // Icon click handler
  filenameIcon.addEventListener('click', function() {
    filenameInput.focus();
    filenameInput.select();
  });
  
  // Enter key handler
  filenameInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      this.blur();
    }
  });
  
  // Update page title function
  function updatePageTitle(filename) {
    const baseTitle = 'IROSchool - Visual Programming';
    if (filename && filename.trim() && filename.trim() !== 'My Project') {
      document.title = `${filename.trim()} - ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }
  
  // Initialize page title
  updatePageTitle(filenameInput.value);
  updateCharacterCount();
  
  // Add visual feedback for character limit
  filenameInput.addEventListener('keydown', function(e) {
    if (this.value.length >= 15 && e.key !== 'Backspace' && e.key !== 'Delete' && 
        !e.ctrlKey && !e.metaKey && e.key.length === 1) {
      // Show brief visual feedback when limit is reached
      this.style.backgroundColor = 'rgba(244, 67, 54, 0.2)';
      setTimeout(() => {
        this.style.backgroundColor = 'transparent';
      }, 200);
    }
  });
  
  console.log('Filename field initialized');
}

// Force refresh code generation - useful for debugging
function refreshCode() {
  console.log('Force refreshing code...');
  
  // First try to get the workspace
  var workspace = null;
  if (Blockly && Blockly.mainWorkspace) {
    workspace = Blockly.mainWorkspace;
  } else if (Blockly && typeof Blockly.getMainWorkspace === 'function') {
    workspace = Blockly.getMainWorkspace();
  }
  
  if (workspace) {
    console.log('Workspace found, triggering change event...');
    // Trigger a change event to force code update
    workspace.fireChangeListener();
  } else {
    console.log('No workspace found, calling showCode directly...');
    showCode();
  }
}