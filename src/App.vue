<template>
  <el-tabs type="border-card">
    <el-tab-pane label="Tạo mật khẩu 2 lớp"><EncryptData /></el-tab-pane>
    <el-tab-pane label="Xuất File toàn quyền"><DecryptData /></el-tab-pane>
    <el-tab-pane label="Xem File PDF"><ShowPdf /></el-tab-pane>
  </el-tabs>
</template>

<script >
import EncryptData from './components/EncryptData.vue';
import DecryptData from './components/DecryptData.vue';
import ShowPdf from './components/ShowPdf.vue';





export default {
  components: {
    EncryptData,
    DecryptData,
    ShowPdf
  }
}


</script>

<style>

</style>