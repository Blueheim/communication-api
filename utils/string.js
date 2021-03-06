const convertUrlToLink = text => {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
  var text1 = text.replace(exp, '<a target="_blank" href="$1">$1</a>');
  var exp2 = /(^|[^/])(www\.[\S]+(\b|$))/gim;
  return text1.replace(exp2, '$1<a target="_blank" href="http://$2">$2</a>');
};

exports.convertUrlToLink = convertUrlToLink;
