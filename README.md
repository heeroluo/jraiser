# JRaiser - 模块化JavaScript基础库


## 简介

JRaiser 包含 Web 前端开发过程中常用的基础功能，通用性强。它基于 **CommonJS** 模块化规范编写，可应用于浏览器端（需构建为 **CMD** 模块，并引入加载器）和 Node.js 端。

JRaiser 的绝大部分功能模块兼容 PC 端主流浏览器（IE 6+）和移动端主流浏览器（iOS 8.0+、Android 4.0+）；小部分模块在 IE 6/7 下不可用。


## 目录结构

### dev-server
开发和测试服务器，通过 Express 搭建。

### dist
构建后的代码，包含源代码（\*-debug.js）和使用 [Bowljs CLI](//github.com/heeroluo/bowljs-cli)  构建后的版本（\*.js）。可通过 [Bowl.js](//github.com/heeroluo/bowljs) 加载。

### doc-template
文档模板，用于生成 API 文档。

### docs
生成的 API 文档。

### src
功能模块源代码。

### 构建相关文件
- document.settings : Bowljs CLI 文档生成配置。
- package.setings & lib.settings : Bowljs CLI 构建配置。
- gulpfile.js : 构建逻辑。


## 使用方法

### 通过 npm 安装

``` bash
npm install jraiser
```

这种方法一般用在基于 Vue.js 等 MVVM 框架开发的项目或 Node.js 项目。

### 使用 dist 代码

拷贝 dist 目录下的代码到项目中使用，一般用于传统 Web 项目，也是 2.x 版本的用法。

### 使用 src 代码

拷贝 src 目录下的代码到项目中使用，自行编写构建逻辑。


## 相关链接
* [API 文档](//heeroluo.github.io/jraiser/api/index.html)
* [Bowl.js 加载器](//github.com/heeroluo/bowljs) 
* [Bowljs CLI](//github.com/heeroluo/bowljs-cli) 