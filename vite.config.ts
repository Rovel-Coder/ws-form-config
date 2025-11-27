import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const gristScriptPlugin = () => {
  return {
    name: 'inject-grist-plugin-api',
    transformIndexHtml(html: string) {
      // Insère le script juste après <title> pour qu'il soit avant le bundle Vite
      return html.replace(
        '</title>',
        '</title>\n    <script src="https://docs.getgrist.com/grist-plugin-api.js"></script>',
      )
    },
  }
}

export default defineConfig({
  base: '/ws-form-config/', // important pour GitHub Pages
  build: {
    outDir: 'docs',
  },
  plugins: [vue(), gristScriptPlugin()],
})
