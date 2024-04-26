import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import VuePasswordStrengthMeter from 'vue3-password-strength-meter';

const app = createApp(App)

app.component('VuePasswordStrengthMeter', VuePasswordStrengthMeter);
app.use(ElementPlus)
app.mount('#app')
