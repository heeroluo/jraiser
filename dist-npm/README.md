# JRaiser - 模块化JavaScript基础库


## 简介

JRaiser 包含 Web 前端开发中常用的基础功能。它基于 **CommonJS** 模块化规范编写，可应用于浏览器端（需构建为 **CMD** 模块并配合加载器使用）和 Node.js 端。

JRaiser 的绝大部分模块兼容 PC 端主流浏览器（IE 6+）和移动端主流浏览器（iOS 9.1+、Android 4.1+）；小部分模块在 IE 6/7 下不可用。


## 使用方法

### 通过 npm 安装

``` bash
npm install jraiser
```

这种方法一般用于：

- Node.js 项目。
- 能调用 node_modules 模块的前端项目，如通过「Vue CLI」、「Create React App」等工具创建的项目。

### 使用 CMD 代码

拷贝 dist-cmd 目录下的代码到项目中使用（需搭配 [Bowl.js](//github.com/heeroluo/bowljs) 加载器），一般用于传统 Web 项目，也是 2.x 版本的用法。

### 使用 src 代码

拷贝 src 目录下的代码到项目中使用，自行选择加载器、编写构建逻辑。


## 模块版本号

JRaiser 的模块文件都是按「**模块名/版本号/**」存放的，这意味着你可以在项目中同时使用模块的新旧版本。得益于模块化机制，这不会产生版本冲突。

在 3.0.0 之前，模块版本号采用的是类似「1.0.x」的规则（第三段表示兼容修改，不新建版本号），其中最后的「.x」意义不大。因此，从 3.0.0 开始，模块版本号简化到两段，如「1.0」。

为了控制文件数量，类库进行大版本升级时，会删除所有模块的旧版本。


## 项目文件

### dev-server
开发和测试服务器，通过 Express 搭建，可以通过 `npm start` 启动。

### dist-cmd
构建为 CMD 模块的代码，包含源代码（\*-debug.js）以及通过 [Bowljs CLI](//github.com/heeroluo/bowljs-cli) 构建的代码（\*.js），需搭配 [Bowl.js](//github.com/heeroluo/bowljs) 进行加载。

### dist-npm
构建为 npm 包的代码，用于发布到 npm 平台。

### doc-template
文档模板，用于生成 API 文档。

### docs
生成的 API 文档。

### src
模块源代码。

### 构建相关文件
- **document.settings** : Bowljs CLI 文档配置。
- **package.setings** & **lib.settings** : Bowljs CLI 构建配置。
- **gulpfile.js** : 构建逻辑。


## 相关链接
* [API 文档](//heeroluo.github.io/jraiser/api/index.html)
* [Bowl.js 加载器](//github.com/heeroluo/bowljs) 
* [Bowljs CLI](//github.com/heeroluo/bowljs-cli) 