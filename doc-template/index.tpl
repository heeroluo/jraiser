<!DOCTYPE HTML>
<html>
<head>
<meta charset="utf-8" />
<title>JRaiser 3 API文档</title>
<meta name="Keywords" content="jraiser,bowljs,modular,javascript,library,api,document,前端,模块化,类库,文档" />
<link href="css/basic.css" rel="stylesheet" type="text/css" />
<link href="css/home.css" rel="stylesheet" type="text/css" />
</head>

<body>
<header class="header">
	<div class="boundary clearfix">
		<h1 class="header__logo">
			<img src="image/logo.png" alt="JRaiser" class="header__logo__name" />
			<img src="image/api.png" alt="API" class="header__logo__api" />
			<img src="image/description.png" alt="modular javascript foundation library" class="header__logo__des" />
		</h1>
	</div>
</header>

<% data.forEach(function(byCategory) { %>
<section class="section boundary">
	<h2 class="section__title"><%=byCategory.$category%></h2>
	<% if (byCategory.$modules) { %>
	<ul class="section__list">
		<% byCategory.$modules.forEach(function(module) { %>
		<li class="section__list__item clearfix">
			<a class="section__list__item__name" href="<%-(module.$see ? module.$see : 'modules/' + module.$savePath + '/index.html') %>"<% if (module.$see) { %> target="_blank"<% } %>><%=module.$name%></a>
			<span class="section__list__item__des"><%=module.$description%></span>
		</li>
		<% }); %>
	</ul>
	<% } %>
</section>
<% }); %>

<footer class="footer boundary">
	<div class="footer__logo">
		<a href="/"><img src="image/logo.png" alt="JRaiser" /></a>
	</div>
	<div class="footer__content">
		Copyright &copy; 2012-<%=currentYear%> <a href="//mrluo.life/" target="_blank">Mr.Luo</a><br />Released under the <a href="https://opensource.org/licenses/MIT" target="_blank">MIT license</a>
	</div>
</footer>

<div style="display: none;">
	<script src="//s4.cnzz.com/stat.php?id=4794499&amp;web_id=4794499"></script>
</div>
</body>
</html>