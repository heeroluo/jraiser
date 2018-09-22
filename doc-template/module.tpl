<!DOCTYPE HTML>
<html>
<head>
<meta charset="utf-8" />
<title><%=current.$name%> | JRaiser 2 Javascript Library</title>
<meta name="Keywords" content="jraiser,bowljs,modular,javascript,library,api,document,前端,模块化,类库,文档" />
<link href="../../css/basic.css" rel="stylesheet" type="text/css" />
<link href="../../css/module.css" rel="stylesheet" type="text/css" />
<script src='../../js/bowl.js'></script>
<script>
bowljs.config({
	libPath: '../../js/lib',
	appPath: '../../js/app'
});
</script>
</head>

<body>
<nav class="nav">
	<div class="nav__logo"><a href="../../index.html"><img src="../../image/logo.png" alt="JRaiser" /></a></div>
	<% data.forEach(function(byCategory) { %>
	<section class="nav__section">
		<h2 class="nav__section__title"><%=byCategory.$category%></h2>
		<% if (byCategory.$modules) { %>
		<ol class="nav__section__list">
			<% byCategory.$modules.forEach(function(module) { %>
			<li class="nav__section__list__item<% if (current.$name === module.$name || parent.$name === module.$name) { %> nav__section__list__item--current<% } %>">
				<% if (module.$see) { %>
				<a href="<%-module.$see%>" target="_blank"><%=module.$name%></a>
				<% } else { %>
				<a href="../<%-module.$savePath%>/index.html"><%=module.$name%></a>
				<% } %>
			</li>
			<% }); %>
		</ol>
		<% } %>
	</section>
	<% }); %>
</nav>

<div class="main">
	<section class="member member-top">
		<header class="member__header">
			<h2 class="member__header__title"><span class="member__header__title__name"><%=current.$name%></span></h2>
			<% if (current.$features) { %>
			<ul class="member__header__tag-list">
				<% current.$features.forEach(function(feature) { %>
				<li class="member__header__tag-list__item member__header__tag-list__item-<%=feature%>"><%=feature%></li>
				<% }); %>
			</ul>
			<% } %>
		</header>
		<div class="member__body">
			<p class="member__body__intro"><%=current.$description%></p>
		</div>
	</section>

	<div id="module-body" class="module-body">
		<nav class="module-body__nav">
			<ul>
				<% if (current.$constructors) { %><li><a href="#module-body-constructors">构造</a></li><% } %>
				<% if (current.$properties) { %><li><a href="#module-body-properties">属性</a></li><% } %>
				<% if (current.$methods) { %><li><a href="#module-body-methods">方法</a></li><% } %>
				<% if (current.$events) { %><li><a href="#module-body-events">事件</a></li><% } %>
				<% if (current.$classes) { %><li><a href="#module-body-classes">类型</a></li><% } %>
				<li><a href="#">回到顶部</a></li>
			</ul>
		</nav>

		<% if (current.$constructors) { %>
		<div class="module-body__container">
			<div id="module-body-constructors" class="module-body__container__panel">
				<% current.$constructors.forEach(function(construct) { %>
					<% var impl = construct.$implements[0]; %>
				<section class="member">
					<header class="member__header">
						<h2 class="member__header__title">
							<span class="member__header__title__name"><%=current.$name%></span>
							<span class="member__header__title__param-list">(
							<% if (impl.$params) { %>
								<% impl.$params.forEach(function(param, i) { %>
									<% if (i) { %>, <% } %><span class="member__header__title__param-list__item"><%=param.$wholeName%></span>
								<% }); %>
							<% } %>
							)</span>
							<% if (current.$constructors.length > 1) { %>
							<sup class="member__header__title__overload">+<%=(current.$constructors.length - 1)%></sup>
							<% } %>
						</h2>
						<% if (impl.$features) { %>
						<ul class="member__header__tag-list">
							<% impl.$features.forEach(function(feature) { %>
							<li class="member__header__tag-list__item member__header__tag-list__item-<%=feature%>"><%=feature%></li>
							<% }); %>
						</ul>
						<% } %>
					</header>
					<div class="member__body">
						<% if (impl.$description) { %><p><%=impl.$description%></p><% } %>
						<% if (impl.$params) { %>
						<h3>参数：</h3>
						<dl class="member__body__param-list">
							<% impl.$params.forEach(function(param) { %>
							<dt><%=param.$wholeName%><span class="var-type"><%=param.$type%></span></dt>
							<dd>
								<%=param.$description%>
								<% if (param.$params) { %>
								<dl class="member__body__param-list">
									<% param.$params.forEach(function(subParam) { %>
									<dt><%=subParam.$wholeName%><span class="var-type"><%=subParam.$type%></span></dt>
									<dd><%=subParam.$description%></dd>
									<% }); %>
								</dl>
								<% } %>
							</dd>
							<% }); %>
						</dl>
						<% } %>
					</div>
				</section>
				<% }); %>
			</div>
			<% } %>

			<% if (current.$properties) { %>
			<div id="module-body-properties" class="module-body__container__panel">
				<% current.$properties.forEach(function(prop) { %>
				<section class="member">
					<header class="member__header">
						<h2 class="member__header__title"><span class="member__header__title__name"><%=prop.$name%></span></h2>
						<% if (prop.$features) { %>
						<ul class="member__header__tag-list">
							<% prop.$features.forEach(function(feature) { %>
							<li class="member__header__tag-list__item member__header__tag-list__item-<%=feature%>"><%=feature%></li>
							<% }); %>
						</ul>
						<% } %>
					</header>
					<div class="member__body">
						<p><span class="var-type"><%=prop.$type%></span> <%=prop.$description%></p>
					</div>
				</section>
				<% }); %>	
			</div>
			<% } %>

			<% if (current.$methods) { %>
			<div id="module-body-methods" class="module-body__container__panel">
				<% current.$methods.forEach(function(method) { %>
					<% method.$implements.forEach(function(impl) { %>
				<section class="member">
					<header class="member__header">
						<h2 class="member__header__title">
							<span class="member__header__title__name"><%=method.$name%></span> <span class="member__header__title__param-list">(
							<% if (impl.$params) { %>
								<% impl.$params.forEach(function(param, i) { %>
											<% if (i) { %>, <% } %><span class="member__header__title__param-list__item"><%=param.$wholeName%></span>
								<% }); %>
							<% } %>
							)</span>
							<% if (method.$implements.length > 1) { %>
							<sup class="member__header__title__overload">+<%=(method.$implements.length - 1)%></sup>
							<% } %>
						</h2>
						<% if (impl.$features) { %>
						<ul class="member__header__tag-list">
							<% impl.$features.forEach(function(feature) { %>
							<li class="member__header__tag-list__item member__header__tag-list__item-<%=feature%>"><%=feature%></li>
							<% }); %>
						</ul>
						<% } %>
					</header>
					<div class="member__body">
						<p><%=impl.$description%></p>
						<% if (impl.$params) { %>
						<h3>参数：</h3>
						<dl class="member__body__param-list">
							<% impl.$params.forEach(function(param) { %>
							<dt><%=param.$wholeName%><span class="var-type"><%=param.$type%></span></dt>
							<dd>
								<%=param.$description%>
								<% if (param.$params) { %>
								<dl class="member__body__param-list">
									<% param.$params.forEach(function(subParam) { %>
									<dt><%=subParam.$wholeName%><span class="var-type"><%=subParam.$type%></span></dt>
									<dd><%=subParam.$description%></dd>
									<% }); %>
								</dl>
								<% } %>
							</dd>
							<% }); %>
						</dl>
						<% } %>
						<% if (impl.$return) { %>
						<h3>返回值：</h3>
						<p class="member__body__return"><span class="var-type"><%=impl.$return.$type%></span><span class="member__body__return__des"><%=impl.$return.$description%></span></p>
						<% } %>
					</div>
				</section>
					<% }); %>
				<% }); %>
			</div>
			<% } %>

			<% if (current.$events) { %>
			<div id="module-body-events" class="module-body__container__panel">
				<% current.$events.forEach(function(event) { %>
				<section class="member">
					<header class="member__header">
						<h2 class="member__header__title">
							<span class="member__header__title__name"><%=event.$name%></span>
							<span class="member__header__title__param-list">(
							<% if (event.$params) { %>
								<% event.$params.forEach(function(param, i) { %>
									<% if (i) { %>, <% } %><span class="member__header__title__param-list__item"><%=param.$name%></span>
								<% }); %>
							<% } %>
							)</span>
						</h2>
					</header>
					<div class="member__body">
						<p><%=event.$description%></p>
						<% if (event.$params) { %>
						<h3>参数：</h3>
						<dl class="member__body__param-list">
							<% event.$params.forEach(function(param) { %>
							<dt><%=param.$name%><span class="var-type"><%=param.$type%></span></dt>
							<dd>
								<%=param.$description%>
								<% if (param.$params) { %>
								<dl class="member__body__param-list">
									<% param.$params.forEach(function(subParam) { %>
									<dt><%=subParam.$name%><span class="var-type"><%=subParam.$type%></span></dt>
									<dd><%=subParam.$description%></dd>
									<% }); %>
								</dl>
								<% } %>
							</dd>
							<% }); %>
						</dl>
						<% } %>
					</div>
				</section>
				<% }); %>
			</div>
			<% } %>

			<% if (current.$classes) { %>
			<div id="module-body-classes" class="module-body__container__panel">
				<% current.$classes.forEach(function(cls) { %>
				<section class="member">
					<header class="member__header">
						<h2 class="member__header__title">
							<span class="member__header__title__name"><%=cls.$name%></span>
						</h2>
						<% if (cls.$extends) { %>
						<span class="member__header__title__extends"><span>extends</span><span class="member__header__title__extends__name"><%=cls.$extends%></span></span>
						<% } %>
						<% if (cls.$features) { %>
						<ul class="member__header__tag-list">
							<% cls.$features.forEach(function(feature) { %>
							<li class="member__header__tag-list__item member__header__tag-list__item-<%=feature%>"><%=feature%></li>
							<% }); %>
						</ul>
						<% } %>
						<a href="<%=cls.$name%>.html" class="member__header__link">详见此页 &raquo;</a>
					</header>
					<div class="member__body">
						<p><%=cls.$description%></p>
					</div>
				</section>
				<% }); %>
			</div>
			<% } %>
		</div>

		<footer class="footer">
			<div class="footer__logo">
				<a href="/"><img src="../../image/logo.png" alt="JRaiser" /></a>
			</div>
			<div class="footer__content">
				Copyright &copy; 2012-2018 <a href="https://mrluo.life/" target="_blank">Mr.Luo</a><br />Released under the <a href="https://opensource.org/licenses/MIT" target="_blank">MIT license</a>
			</div>
		</footer>
	</div>
</div>

<script>require('/module-detail@1.0.x');</script>
<div style="display: none;">
	<script src="http://s4.cnzz.com/stat.php?id=4794499&amp;web_id=4794499"></script>
</div>
</body>
</html>