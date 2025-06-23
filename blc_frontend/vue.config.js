// vue.config.js
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,

  // 여기에 devServer 설정 추가
  devServer: {
    port: 5173, // 원하는 포트
    open: true, // 서버 시작 시 자동으로 브라우저 열기
    // strictPort: true // Vue CLI에는 strictPort가 없지만, openOnlyOnSuccess 같은 옵션을 쓸 수도 있습니다.
  },
})
