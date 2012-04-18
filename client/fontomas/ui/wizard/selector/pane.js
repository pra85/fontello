/*global window, nodeca, jQuery, Handlebars, Backbone, $, _*/

"use strict";

module.exports = Backbone.View.extend({
  next_font_id:   1,
  fonts:          null,
  glyph_size:     null,

  font_toolbar:   null,
  fontviews:      {},


  initialize: function (attributes) {
    _.bindAll(this);

    this.glyph_size   = _.last(nodeca.client.fontomas.config.preview_glyph_sizes);
    this.font_toolbar = new nodeca.client.fontomas.ui.wizard.selector.toolbar();

    this.font_toolbar.on("change:glyph-size",   this.changeGlyphSize,   this);
    this.font_toolbar.on("change:local-files",  this.loadFiles,         this);

    this.fonts = new Backbone.Collection();
    this.fonts.on("add", this.onAddFont, this);
  },


  changeGlyphSize: function (size) {
    this.glyph_size = size;

    _.each(this.fontviews, function (view) {
      view.changeGlyphSize(size);
    });
  },


  loadFiles: function (files) {
    nodeca.client.fontomas.util.notify_alert("Sorry, user-fonts are not supported yet.");
    //var self = this;
    //
    //_.each(files, function (f) {
    //  var fileinfo, reader = new FileReader();
    //
    //  fileinfo = {
    //    id:             this.myfiles.length,
    //    filename:       f.name,
    //    filesize:       f.size,
    //    filetype:       f.type,
    //    fontname:       "unknown",
    //    is_loaded:      false,
    //    is_ok:          false,
    //    is_added:       false,
    //    is_dup:         false,
    //    error_msg:      "",
    //    content:        null,
    //    font_id:        null,
    //    embedded_id:    null
    //  };
    //
    //  this.myfiles.push(fileinfo);
    //
    //  reader.onload = function (event) {
    //    nodeca.client.fontomas.util.notify_alert("Sorry, but parsing the fonts is temporary disabled.");
    //  };
    //
    //  reader.readAsBinaryString(f);
    //}, this);
  },


  // a model has been added, so we create a corresponding view for it
  onAddFont: function (font) {
    var view = new nodeca.client.fontomas.ui.wizard.selector.source_font({
      model:      font,
      glyph_size: this.glyph_size
    });

    view.on("toggleGlyph",        this.onToggleGlyph, this);
    view.on("remove",             this.removeFont,    this);

    this.fontviews[font.id] = view;
    $("#selector-fonts").append(view.render().el);
  },


  removeFont: function (font) {
    delete this.fontviews[font.id];
    this.trigger('remove:font', font);
  },


  addEmbeddedFonts: function (embedded_fonts) {
    _.each(embedded_fonts, function (f) {
      var font = new nodeca.client.fontomas.models.source_font({
        id:           this.next_font_id++,
        fontname:     f.fontname,
        fullname:     f.fullname,
        glyphs:       f.glyphs,
        is_embedded:  true,
        embedded_id:  f.id,
        config:       f
      });
      this.fonts.add(font);

      f.is_added = true;
    }, this);
  },


  onToggleGlyph: function (data) {
    this.trigger('click:glyph', data);
  }
});
