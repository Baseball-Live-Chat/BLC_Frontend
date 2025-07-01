// src/lib/http.js
import axios from 'axios'

const BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080'
const BASE_SOCKET_URL = process.env.VUE_APP_SOCKET_URL || 'http://localhost:8080'

// axios 인스턴스 생성
const httpClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

// Socket URL을 별도 export
export const socketURL = BASE_SOCKET_URL

export default httpClient