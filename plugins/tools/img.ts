import nodeHtmlToImage from 'node-html-to-image'

export default (html: string, width: string, height: string) => {
  return new Promise(r => {
    const h = `<!DOCTYPE html>
    <html lang="zh">
    <head>
      <meta charset="UTF-8">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mdui@1.0.1/dist/css/mdui.min.css"/>
      <script src="https://cdn.jsdelivr.net/npm/mdui@1.0.1/dist/js/mdui.min.js"></script>
      <style>
        body {
          padding: 12px 18px;
          max-width: ${width};
          max-height: ${height};
          background-color: '#fff'
        }
      </style>
    </head>
    <body class="mdui-typo">
      ${html}
    </body>
    </html>`;

    nodeHtmlToImage({
      html: h,
      type: 'jpeg',
      encoding: 'base64'
    }).then((e:any) => {
      r(e);
    })
  })
}