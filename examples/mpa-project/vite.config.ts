import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import mpaPlugin from "../../src/index";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    mpaPlugin(),
    reactRefresh()
  ]
});
