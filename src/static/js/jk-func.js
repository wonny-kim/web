/* common function */
function move_page(page) {
  document.location=page;
}

function do_active(obj, name) {
  console.log($(obj));
  console.log($(obj).hasClass("active"));
  ($(obj).hasClass("active"))?$(obj).removeClass("active"):$(obj).addClass("active");
}

function alert_msg(obj, state, title, content, content2) {
  var content = content || '';
  var state = state || 'danger';
  var content2 = content2 || '';
  var str = "<div class=\"alert alert-"+state+" alert-dismissible fade show\" role=\"alert\">"
    +"<h4 class=\"alert-heading\"><i class=\"fa fa-exclamation-circle\"></i> "
    +"<span class=\"sr-only\">"+state+":</span>"
    + title
    +"</strong></h4> <button type=\"button\" class=\"close\" data-dismiss=\"alert\" arai-label=\"Close\">&times;</button>";

  str+= (content !== "")?"<p class=\"lead small\">"+content+"</p>":"";

  str+= (content2 !== "")?"<hr><p class=\"mb-0\">"+content2+"</p></div>"
        :"</div>";

  $(obj).html(str);
}
/*
  Cookie
  */
function Cookie() {
  this.cookie_arr = [];
}

Cookie.prototype.setCookie = function(name, value, options)
{
  options = options || {};
  value = value || '';
  if(typeof name === 'undefined') return null;

  this.cookie_arr = [escape(name) + "=" + escape(value)];

  //-- expires
  if (options.expires)
  {
    if(typeof options.expires === 'object' && options.expires instanceof Date)
    {
      var date = options.expires;
      var expires = "expires=" + date.toUTCString();
      this.cookie_arr.push(expires);
    }
  }
  else if (options.expires_day)
  {
    this.set_expires_date(options.expires_day, 24*60*60);
  }
  else if (options.expires_hour)
  {
    this.set_expires_date(options.expires_hour, 60*60);
  }

  //-- domain
  if (options.domain)
  {
    var domain = "domain=" + options.domain;
    this.cookie_arr.push(domain);
  }

  //-- path
  if (options.path)
  {
    var path = 'path=' + options.path;
    this.cookie_arr.push(path);
  }

  //-- secure
  if(options.secure === true)
  {
    var secure = 'secure';
    this.cookie_arr.push(secure);
  }
  document.cookie = this.cookie_arr.join('; ');
};

Cookie.prototype.getCookie = function(name)
{
  var nameEQ = escape(name) + "=";
  var ca = document.cookie.split(';');

  for(var i = 0; i < ca.length; i++)
  {
    var c = ca[i];
    while(c.charAt(0)==' ') c = c.substring(1, c.length);
    if(c.indexOf(nameEQ) == 0) return unescape(c.substring(nameEQ.length, c.length));
  }
  return null;
};

Cookie.prototype.delCookie = function(name, options)
{
  options = options || {};
  options.expires_day = -1;
  this.set(name, '', options);
};

Cookie.prototype.set_expires_date = function(expires, time)
{
  var date = new Date();
  date.setTime(date.getTime()+(expires*time*1000));
  var expires = "expires=" + date.toUTCString();
  this.cookie_arr.push(expires);
};
