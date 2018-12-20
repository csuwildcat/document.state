(function(){

  const states = {};
  const insertRule = CSSStyleSheet.prototype.insertRule;
  const deleteRule = CSSStyleSheet.prototype.deleteRule;
  const regexpConditionMatch = /\s*state\s*:\s*(\w+)/;

  function parseRule(node, rule, remove){
    if (rule instanceof CSSSupportsRule) {
      var match = rule.conditionText.match(regexpConditionMatch);
      if (match) {
        var state = states[match[1]];
        var entries = (state || (state = states[match[1]] = { active: false, entries: [] })).entries;
        var entry = rule.__CSSStateRule__ = {
          sheet: node.sheet,
          rule: rule,
          text: '@media all {' + Array.prototype.reduce.call(rule.cssRules, function(str, z){
            return str + ' ' + z.cssText;
          }, '') + '}'
        };
        entries.push(entry);
        if (state.active) activateEntry(entry)
      }
    }
  }

  function activate (name) {
    var state = states[name] || (states[name] = { entries: [] });
    state.active = true;
    state.entries.forEach(activateEntry);
  }

    function activateEntry (entry){
      var index = Array.prototype.indexOf.call(entry.sheet.cssRules, entry.rule) + 1;
      entry.sheet.insertRule(entry.text, index);
      entry.active = entry.sheet.cssRules[index];
    }

  function deactivate (name) {
    var state = states[name];
    if (state && state.active) {
      state.active = false;
      state.entries.forEach(function(entry){
        var index = Array.prototype.indexOf.call(entry.sheet.cssRules, entry.active);
        entry.sheet.deleteRule(index);
        delete entry.active;
      });
    }
  }

  document.addEventListener('load', function(e){
    var node = e.target;
    if ((node.nodeName === 'LINK' || node.nodeName === 'STYLE') && node.sheet) {
      Array.prototype.forEach.call(node.sheet.cssRules, function(rule){
        parseRule(node, rule);
      });
    }
  }, true);

  CSSStyleSheet.prototype.insertRule = function(rule){  
    insertRule.apply(this, arguments);
    if (document.contains(this.ownerNode)) parseRule(this, rule);
  }

  CSSStyleSheet.prototype.deleteRule = function(index){
    var rule = this.cssRules[index];
    deleteRule.call(this, index);
    if (document.contains(this.ownerNode) && rule && rule.__CSSStateRule__) {
      var entry = rule.__CSSStateRule__;
      if (entry.active) deleteRule.call(this, Array.prototype.indexOf.call(this.cssRules, entry.active));
    }
  }

  Object.defineProperty(HTMLDocument.prototype, 'state', {
    value: {
      activate: activate,
      deactivate: deactivate,
      get active (){
        var active = [];
        for (let state in states) {
          if (states[state].active) active.push(state)
        }
        return active;
      }
    }
  });

})();