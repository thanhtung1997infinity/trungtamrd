<template>
  <div>
    <!-- Input file để người dùng chọn file PDF -->
    <label for="">Mật khẩu Show File PDF</label>
    <password class="style-password" v-model="passWord" :toggle=toggle :badge=badge />
    <!-- Input file để người dùng chọn file PDF -->
    <input type="file" @change="handleFileChange" />
    <button @click="showPDF">showPDF</button>


    <!-- Sử dụng iframe để nhúng tệp PDF -->
    <iframe :src="pdfUrl + '#toolbar=0&navpanes=0&scrollbar=0&view=FitH'" v-if="pdfUrl"
      @contextmenu.prevent="preventContextMenu"></iframe>
  </div>
</template>

<script>
import CryptoJS from 'crypto-js';
import password from 'vue3-password-strength-meter';


export default {
  data() {
    return {
      // Tạo một trạng thái để lưu trữ dữ liệu ArrayBuffer
      pdfData: null,
      passWord: '',
      toggle: true,
      badge: false,
      pdfUrl: '' // Đường dẫn URL của tệp PDF
    };
  },
  components: { password },
  beforeUnmount() {
    // Thu hồi URL khi không còn sử dụng nữa để giải phóng tài nguyên
    if (this.pdfBlob) {
      URL.revokeObjectURL(this.pdfBlob);
    }
  },
  methods: {
    preventContextMenu(event) {
      event.preventDefault();
    },

    // Hàm xử lý sự kiện change của input file
    handleFileChange(event) {
      // Lấy file đã chọn
      const file = event.target.files[0];
      // Đọc file PDF dưới dạng ArrayBuffer
      this.fileName = file.name
      this.readFileAsArrayBuffer(file);
    },
    // Hàm đọc file dưới dạng ArrayBuffer
    readFileAsArrayBuffer(file) {
      // Tạo FileReader
      const reader = new FileReader();

      // Thiết lập hàm callback để xử lý dữ liệu khi đọc xong
      reader.onload = (event) => {
        // Lưu dữ liệu ArrayBuffer vào pdfData
        this.pdfData = event.target.result;
      };

      // Đọc file dưới dạng ArrayBuffer
      reader.readAsText(file);
    },


    // Hàm để tải xuống file PDF
    async showPDF() {
      if (this.pdfData) {
        const hash = CryptoJS.SHA256(this.passWord);
        const hashString = hash.toString();

        // Phân tích chuỗi JSON thành đối tượng JSON
        const jsonData = JSON.parse(this.pdfData);

        // Lấy ciphertext, iv, và salt từ đối tượng JSON
        const { ciphertextShow, ivShow, saltShow } = jsonData;

        // Chuyển đổi Base64 sang WordArray
        const ciphertextWordArray = CryptoJS.enc.Base64.parse(ciphertextShow);
        const ivWordArray = CryptoJS.enc.Base64.parse(ivShow);
        const saltWordArray = CryptoJS.enc.Base64.parse(saltShow);

        // Giải mã dữ liệu
        const decryptData = CryptoJS.AES.decrypt({
          ciphertext: ciphertextWordArray,
          iv: ivWordArray,
          salt: saltWordArray,
        }, hashString);

        const decryptedUint8Array = new Uint8Array(decryptData.words.length * 4);
        for (let i = 0; i < decryptData.words.length; i++) {
          decryptedUint8Array.set([
            (decryptData.words[i] >>> 24) & 0xff,
            (decryptData.words[i] >>> 16) & 0xff,
            (decryptData.words[i] >>> 8) & 0xff,
            decryptData.words[i] & 0xff,
          ], i * 4);
        }


        // Tạo blob từ ArrayBuffer
        const blob = new Blob([decryptedUint8Array], { type: 'application/pdf' });

        this.pdfUrl = URL.createObjectURL(blob)

        



      } else {
        console.log('Không có dữ liệu PDF để tải xuống');
      }
    },
  },
};
</script>
<style>
iframe {
  width: 100%;
  height: 100vh !important;
}
</style>