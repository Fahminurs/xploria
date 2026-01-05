$(document).ready(function () {
  // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
  $('.modal-trigger').leanModal();
  $('select').material_select();
  $(".button-collapse").sideNav();
  $('.tooltipped').tooltip({ delay: 120, margin: 4 });
  $(".dropdown-button").dropdown({
    belowOrigin: true,      // display dropdown below the trigger
    constrain_width: false, // allow custom width
    gutter: 0,              // no offset from edge
    alignment: 'right'      // align right edge for right-side triggers
  });

  // Override for dropdown1: show above (not below)
  $(".dropdown-button[data-activates='dropdown1']").dropdown({
    belowOrigin: false,
    constrain_width: false,
    gutter: 0,
    alignment: 'left'
  });
});
