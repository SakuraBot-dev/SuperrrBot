# SuperrrBot
> 作者自己的一份SuperBot实例

## 食用方法
### Docker
构建镜像
```shell
$ docker build -t SuperrrBot:v2 .
```

启动程序
```shell
$ docker run --name SuperrrBot -e BOT_OWNER="你自己的QQ号" -e CONN_TOKEN="cqhttp的access_token" -e CONN_HOST="cqhttp的IP/域名" -e CONN_WS_PORT="WebSocket端口（可选，默认6700）" -e CONN_HTTP_PORT="HTTP端口（可选，默认5700）" -e CONN_RECONNECT="重连延迟(可选，默认3s)" -e LOG_LEVEL="日志级别（可选，默认INFO）" -e PLUGIN_RSS_TIMER="RSS订阅刷新间隔（可选，默认2分钟）" -e PLUGIN_BANGUMI_APPID="Bangumi的APPID" -d SuperrrBot:v2
```

### Linux
安装依赖
```shell
$ npm i
```

构建程序
```shell
$ npm run build
```

启动
```shell
$ node ./dist/app.js
```

## 指令
### 管理相关
#### 查看插件帮助信息
- 任何人都可以使用
```
.help 包名
```
#### 查看插件列表
- 任何人都可以使用
```
.pm list
```
#### 加载插件
- 针对全局
- 需要 `Owner` 或者 `Global Admin`
```
.pm load 包名
```
#### 卸载插件
- 针对全局
- 需要 `Owner` 或者 `Global Admin`
```
.pm unload 包名
```
#### 启用插件
- 针对群
- 需要 `Owner`、`Global Admin` 或者 `Group Admin`
```
.pm enable 包名
```
#### 停用插件
- 针对群
- 需要 `Owner`、`Global Admin` 或者 `Group Admin`
```
.pm disable 包名
```
#### 添加`Global Admin`
- 需要 `Owner`
```
.admin global add QQ号
```
#### 删除`Global Admin`
- 需要 `Owner`
```
.admin global del QQ号
```
#### 添加`Group Admin`
- 需要 `Owner` 或 `Global Admin`
```
.admin group add QQ号
```
#### 删除`Group Admin`
- 需要 `Owner` 或 `Global Admin`
```
.admin group del QQ号
```
