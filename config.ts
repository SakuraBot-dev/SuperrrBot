const plugins:any = {
  "xyz.imoe.rss": {
    timer: process.env.PLUGIN_RSS_TIMER || 1.2e5
  },
  "xyz.imoe.bangumi": {
    app_id: process.env.PLUGIN_BANGUMI_APPID
  }
}

export default {
  bot: {
    owner: Number(process.env.BOT_OWNER)
  },
  connect: {
    token: process.env.CONN_TOKEN,
    host: process.env.CONN_HOST,
    ws_port: process.env.CONN_WS_PORT || 6700,
    http_port: process.env.CONN_HTTP_PORT || 5700,
    reconnect: process.env.CONN_RECONNECT || 3e3
  },
  logger: {
    level: process.env.LOG_LEVEL || "INFO"
  },
  plugins
}