---
layout: blank
---
//Version {{ site.version_number }}
//{{ site.urllive }}

var linkProjectsDynamic = [ {% assign sorted_pages = site.pages | sort:"url" %}{% for p in sorted_pages %}{%- if p.title -%}{Name:'{{ p.title }}',URL:'{{ p.url }}'},{%- endif -%}{% endfor %} ];
var linkBase = "https://jovialbadger.co.uk"
var linkReddit = "https://www.reddit.com/u/jovialbadger";
var linkBuyMeACoffee = "https://www.buymeacoffee.com/JovialBadger";
var linkGithub = "https://github.com/JovialBadger/jovialbadger.github.io";

var testpostsJSON = "{% assign sorted_posts = site.posts | sort:"url" %}{% for x in sorted_posts %}{%- if x.title -%}{{ x.url }}:'{{ x.title }}',{%- endif -%}{% endfor %}";