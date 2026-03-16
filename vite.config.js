import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/performance/', // 👈 본인의 GitHub 리포지토리 이름으로 양옆에 슬래시(/)를 넣어 추가하세요.
})
