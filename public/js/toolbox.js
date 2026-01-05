'use strict';

function buildtoolBox() {
  var loadIds;
  var base = "category_logic,category_loops,category_array,category_math,category_text,category_variables,category_functions,category_initializes,category_inout,category_time,category_serial,category_interrupts,category_custom,category_esp32,category_digital_write_parent,category_pin_mode_parent,category_declaration,category_delay_parent";

  var option = window.localStorage.toolboxids;

  if (option === undefined || option === "") {
    loadIds = base;
  } else {
    loadIds = base + ',' + option;
  }

  if (loadIds.indexOf('category_custom') === -1) {
    loadIds += ',category_custom';
  }

  // Build sorted list of category ids (A-Z), skipping separators
  var xmlValue = '<xml id="toolbox">';
  var xmlids = loadIds.split(",")
    .filter(function(id){ return id && id.indexOf('category_') === 0; })
    .filter(function(value, index, self){ return self.indexOf(value) === index; })
    .sort(function(a,b){ return a.localeCompare(b); });

  for (var i = 0; i < xmlids.length; i++) {
    if ($('#' + xmlids[i]).length) {
      xmlValue += $('#' + xmlids[i])[0].outerHTML;
    }
  }
  xmlValue += '</xml>';

  return xmlValue;
};


