var utils = require('./utils');
var constrain_font_size = require('./constrain_font_size');

module.exports = function(params, trans_x, trans_y, zoom_x, zoom_y) {
  var d3_scale = zoom_x;

  // y - rules
  ///////////////////////////////////////////////////
  // available panning room in the y direction
  // multiple extra room (zoom - 1) by the width
  // always defined in the same way
  var pan_room_y = (d3_scale - 1) * params.viz.clust.dim.height;

  // do not translate if translate in y direction is positive
  if (trans_y >= 0) {
    // restrict transformation parameters
    // no panning in either direction
    trans_y = 0;
  }
  // restrict y pan to pan_room_y if necessary
  else if (trans_y <= -pan_room_y) {
    trans_y = -pan_room_y;
  }

  // x - rules
  ///////////////////////////////////////////////////
  // zoom in y direction only - translate in y only
  if (d3_scale < params.viz.zoom_switch) {
    // no x translate or zoom
    trans_x = 0;
    zoom_x = 1;
  }
  // zoom in both directions
  // scale is greater than params.viz.zoom_switch
  else {
    // available panning room in the x direction
    // multiple extra room (zoom - 1) by the width
    var pan_room_x = (d3_scale / params.viz.zoom_switch - 1) * params.viz.clust.dim.width;

    // no panning in the positive direction
    if (trans_x > 0) {
      // restrict transformation parameters
      // no panning in the x direction
      trans_x = 0;
      // set zoom_x
      zoom_x = d3_scale / params.viz.zoom_switch;
    }
    // restrict panning to pan_room_x
    else if (trans_x <= -pan_room_x) {
      // restrict transformation parameters
      // no panning in the x direction
      trans_x = -pan_room_x;
      // set zoom_x
      zoom_x = d3_scale / params.viz.zoom_switch;
    }
    // allow two dimensional panning
    else {
      // restrict transformation parameters
      // set zoom_x
      zoom_x = d3_scale / params.viz.zoom_switch;
    }
  }

  // apply transformation and reset translate vector
  // the zoom vector (zoom.scale) never gets reset
  ///////////////////////////////////////////////////
  // translate clustergram
  // viz.get_clust_group()
  d3.select(params.root+' .clust_group')
    .attr('transform', 'translate(' + [trans_x, trans_y] + ') scale(' +
    zoom_x + ',' + zoom_y + ')');

  // transform row labels
  d3.select(params.root+' .row_label_zoom_container')
    .attr('transform', 'translate(' + [0, trans_y] + ') scale(' + zoom_y +
    ')');

  // transform row_zoom_container
  // use the offset saved in params, only zoom in the y direction
  d3.select(params.root+' .row_zoom_container')
    .attr('transform', 'translate(' + [0, trans_y] + ') scale( 1,' +
    zoom_y + ')');

  // transform col labels
  // move down col labels as zooming occurs, subtract trans_x - 20 almost works
  d3.select(params.root+' .col_zoom_container')
    .attr('transform', 'translate(' + [trans_x, 0] + ') scale(' + zoom_x +
    ')');

  // transform col_class
  d3.select('.col_viz_zoom_container')
    .attr('transform', 'translate(' + [trans_x, 0] + ') scale(' + zoom_x +
    ',1)');

  // reset translate vector - add back margins to trans_x and trans_y
  params.zoom_behavior
    .translate([trans_x + params.viz.clust.margin.left, trans_y + params.viz.clust.margin.top
    ]);

  var trans = false;
  constrain_font_size(params, trans);


  // resize label bars if necessary
  ////////////////////////////////////

  if (utils.has(params.network_data.row_nodes[0], 'value')) {
    d3.selectAll('.row_bars')
    .attr('width', function(d) {
      var inst_value = 0;
      inst_value = params.labels.bar_scale_row(Math.abs(d.value))/zoom_y;
      return inst_value;
    })
    .attr('x', function(d) {
      var inst_value = 0;
      inst_value = -params.labels.bar_scale_row(Math.abs(d.value))/zoom_y;
      return inst_value;
    });
  }

  if (utils.has(params.network_data.col_nodes[0], 'value')) {
    d3.selectAll('.col_bars')
      .attr('width', function(d) {
        var inst_value = 0;
        if (d.value > 0){
          inst_value = params.labels.bar_scale_col(d.value)/zoom_x;
        }
        return inst_value;
      });
    }
};