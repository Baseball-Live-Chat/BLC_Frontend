const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 3000, // 프론트엔드를 3000번 포트로 변경
    open: true, // 자동으로 브라우저 열기
    host: 'localhost'
  }
})
