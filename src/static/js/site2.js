/* site initial function */
function init(group,page) {
  page = page || '';
  cookie.setCookie("group", group, 1,
  /* public action */
  // add popover
  $('[data-toggle="popover"]').popover({trigger:"click",container:"body", placement:"auto right"});
  // add tooltip
  $('[data-toggle="tooltip"]').tooltip({container:"body", placement:"auto top"});
  // nav & menu active
  $('#sidemenu-content [id^="nav-"]').removeClass('active');
  $('#nav-'+((page)?page:"index")).addClass('active');
  /* each page action */
  switch(group) {
    case "":
    case "index":
      // add modal initial input value
      $('#modalLogin').on('show.bs.modal',function(event) {
        var button = $(event.relatedTarget);
        var temp = button.data('tempid');
        $(this).find('.modal-body input#USERID').val(temp);
      });
    break;
    case "contents":
      if(page === '') {
      }
      else if(page === "table") {
        // add modal button active
        $('#modalInput').on("show.bs.modal",function(event) {
          var button = $(event.relatedTarget);
          var cmd = button.data('cmd');

          if(cmd == 'write') {
            // write new article, reset all input values
            $(this).find(':text,:password').val('');
            $(this).find(':checkbox,:radio').parent().filter('.btn').button('toggle');
            $(this).find(':checked').prop('checked',false);
          }
          else {
            var idx = button.data('idx');
            // ajax (request data)
            $.ajax({
              url: "./process/members_ajax.php",
              type: "POST",
              dataType: "json",
              data: {"idx" : idx },
              success: function(data) {
                /*  json style
                *   [{"type": input_type,"name": input_name,"value":input_value},...]
                */
                data.forEach(function(val) {
                  switch (val.type) {
                    case "text" :
                    break;
                    case "radio" :
                    break;
                    case "checkbox" :
                    break;
                    case "select" :
                    break;
                    case "textarea" :
                    break;
                  }
                })
              },
              error: function(jqXHR, textStatus, errorThrown) {
                console.log('aa');
              }
          });
        }});
      }
      else if(page === "carousel") {
        Holder.run();
        $('.carousel').carousel();
      }

    break;
  }
}

/* site function */
function show_page(group, page, sidemenu, viewtype) {
  var page = page || '';
  var sidemenu = sidemenu || false;

  var viewtype = viewtype || "main";
  show_html("main",group,page);
  show_html("modal",group,page);
  !sidemenu || show_html("sidemenu",group);
}

function show_html(type, group, page) {
  page = page || '';
  switch(type) {
    case "sidemenu":
    file = {"type": type, "group": group};
    break;
    default :
    file = {"type": type, "group": group, "page": page};
    break;
  }

  $.ajax({
    url: "/process/page_ajax.php",
    type: "POST",
    data: file,
    dataType: "html",
    success: function(result) {
      /*  json style
      *   [{"type": input_type,"name": input_name,"value":input_value},...]
      */
      console.log($(result).find('body'));
      $('#'+type+'-content').html(result);
    },
    beforeSend:function() {
      $("#loader").css("display","block");
    },
    complete: function() {
      $("#loader").css("display","none");
      if(type === "main") {
        init(group, page);
      }
    },
    error: function(e) {
      if(type ==="main") {
        $('#'+type+'-content').html("준비중!");
      }
    },
    timeout:100000
  });
}

/* common function */
function move_page(page) {
  document.location=page;
}

function alert_msg(obj, content) {
  $(obj).html(
  "<div class=\"alert alert-danger alert-dismissible fade in\" role=\"alert\">"
    +"  <span class=\"glyphicon glyphicon-exclamation-sign\"></span>"
    +"  <span class=\"sr-only\">Error:</span>"
    + content
    + " <button type=\"button\" class=\"close\" data-dismiss=\"alert\" arai-label=\"Close\">&times;</button>"
  +"</div>"
  )
}

var cookie = {
  set: function(name, value, expiredays, path, domain) {
    var cookie = name + "=" + escape(value);
    if (typeof expiredays != 'undefined') {
        var todayDate = new Date();
        todayDate.setDate(todayDate.getDate() + expiredays);
        cookie += "; expires=" + todayDate.toGMTString();
    }
    if(typeof path != 'undefined') cookie += "; path="+escape(path);
    if(typeof domain != 'undefined') cookie += "; domain="+escape(domain);

    document.cookie = cookie;
  },
  get: function(name) {
    name += "=";
    var cookie = document.cookie;
    var startIdx = cookie.indexOf(name);
    if (startIdx != -1) {
      startIdx += name.length;
      var endIdx = cookie.indexOf(";", startIdx);
      if (endIdx == -1) {
          endIdx = cookie.length;
          return unescape(cookie.substring(startIdx, endIdx));
      }
    }
    return null;
  },
  del: function(name) {
    setCookie(name, "", -1);
  }
};
