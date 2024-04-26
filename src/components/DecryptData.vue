<template>
    <div>
        <!-- Input file để người dùng chọn file PDF -->
        <label for="">Mật khẩu mở tệp PDF</label>
        <password class="style-password" v-model="passWord" :toggle=toggle :badge=badge />
        <!-- Input file để người dùng chọn file PDF -->
        <input type="file" @change="handleFileChange" />

        <!-- Nút để người dùng tải xuống file PDF -->
        <button @click="downloadPdf">Tải xuống file PDF đã giải mã dữ liệu</button>
    </div>
</template>

<script>
import CryptoJS from 'crypto-js';
import password from 'vue3-password-strength-meter'


export default {
    data() {
        return {
            // Tạo một trạng thái để lưu trữ dữ liệu ArrayBuffer
            pdfData: null,
            passWord: '',
            toggle: true,
            badge: false
        };
    },
    components: { password },
    methods: {
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
        downloadPdf() {
            if (this.pdfData) {
                const hash = CryptoJS.SHA256(this.passWord);
                const hashString = hash.toString();

                // Phân tích chuỗi JSON thành đối tượng JSON
                const jsonData = JSON.parse(this.pdfData);

                // Lấy ciphertext, iv, và salt từ đối tượng JSON
                if (jsonData.ciphertextAdmin) {
                    const { ciphertextAdmin, ivAdmin, saltAdmin } = jsonData;

                    // Chuyển đổi Base64 sang WordArray
                    const ciphertextWordArray = CryptoJS.enc.Base64.parse(ciphertextAdmin);
                    const ivWordArray = CryptoJS.enc.Base64.parse(ivAdmin);
                    const saltWordArray = CryptoJS.enc.Base64.parse(saltAdmin);

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
                    const decryptedArrayBuffer = decryptedUint8Array.buffer;

                    // Tạo blob từ ArrayBuffer
                    const blob = new Blob([decryptedArrayBuffer], { type: 'application/pdf' });

                    // Tạo URL cho blob
                    const url = URL.createObjectURL(blob);

                    // Tạo thẻ a để tải xuống file
                    const link = document.createElement('a');
                    link.href = url;

                    // Chia chuỗi ban đầu thành hai phần trước và sau ký tự thứ 4
                    const splitIndex = this.fileName.length - 16;
                    const before = this.fileName.slice(0, splitIndex); // Trước ký tự thứ 4
                    link.download = before + ' (đã giải mã).pdf'; // Đặt tên file mà bạn muốn tải xuống

                    // Thêm link vào DOM, kích hoạt click, sau đó loại bỏ
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Giải phóng URL
                    URL.revokeObjectURL(url);
                }

            } else {
                console.log('Không có dữ liệu PDF để tải xuống');
            }
        },
    },
};
</script>