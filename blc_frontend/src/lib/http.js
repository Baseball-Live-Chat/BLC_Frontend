// src/lib/http.js
import axios from 'axios'

// Vue CLI 환경에서는 process.env.VUE_APP_* 로 접근
const BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080'

export default axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})
