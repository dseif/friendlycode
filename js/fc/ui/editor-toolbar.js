define(function(require) {
  var $ = require("jquery-tipsy"),
      Preferences = require("fc/prefs"),
      HistoryUI = require("fc/ui/history"),
      NavOptionsTemplate = require("template!nav-options"),
      TextUI = require("fc/ui/text");
  
  function HintsUI(options) {
    var self = {},
        hintsNavItem = options.navItem,
        hintsCheckbox = hintsNavItem.find(".checkbox");
    
    Preferences.on("change:showHints", function() {
      if (Preferences.get("showHints") === false)
        hintsCheckbox.removeClass("on").addClass("off");
      else
        hintsCheckbox.removeClass("off").addClass("on");
    });
    
    hintsNavItem.click(function() {
      var isDisabled = (Preferences.get("showHints") === false);
      Preferences.set("showHints", isDisabled);
      Preferences.save();
    });

    Preferences.trigger("change:showHints");
    return self;
  }
  
  return function Toolbar(options) {
    var self = {},
        div = options.container,
        editor = options.editor,
        startPublish = options.startPublish,
        navOptions = $(NavOptionsTemplate()).appendTo(div),
        publishButton = navOptions.find(".publish-button"),
        undoNavItem = navOptions.find(".undo-nav-item");
    
    var historyUI = HistoryUI({
      codeMirror: editor.codeMirror,
      undo: undoNavItem,
      redo: navOptions.find(".redo-nav-item")
    });
    var textUI = TextUI({
      codeMirror: editor.codeMirror,
      navItem: navOptions.find(".text-nav-item")
    });
    var hintsUI = HintsUI({
      navItem: navOptions.find(".hints-nav-item")
    });
    
    editor.preview.on("refresh", function(event) {
      var title = event.window.document.title;
      if (title.length)
        $(".preview-title", navOptions).text(title).show();
      else
        $(".preview-title", navOptions).hide();
    });
    
    // If the editor has no content, disable the publish button.
    editor.codeMirror.on("change", function() {
      var codeLength = editor.codeMirror.getValue().trim().length;
      publishButton.toggleClass("enabled", codeLength ? true : false);
    });
    publishButton.click(function(){
      if ($(this).hasClass("enabled")) startPublish(this);
    });
    
    self.refresh = function() {
      historyUI.refresh();
    };
    self.showDataRestoreHelp = function() {
      // Display a non-modal message telling the user that their
      // previous data has been restored, and that they can click 'undo'
      // to go back to the original version of the editor content.
      // This is just a temporary workaround to avoid confusion until
      // we figure out a better solution; see this issue for more
      // discussion:
      //
      // https://github.com/mozilla/webpagemaker/issues/53
      undoNavItem.tipsy({
        gravity: 'n',
        fade: true,
        trigger: 'manual',
        title: 'data-restore-help',
        className: 'friendlycode-base'
      }).tipsy("show");
      setTimeout(function() { undoNavItem.tipsy("hide"); }, 6000);
    };
    
    return self;
  };
});
