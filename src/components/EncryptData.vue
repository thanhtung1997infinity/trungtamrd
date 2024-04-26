<template>
    <div>
        <!-- Input file để người dùng chọn file PDF -->
        <label for="">Mật khẩu admin</label>
        <password class="style-password" v-model="passwordAdmin" :toggle=toggle :badge=badge />
        <label for="">Mật khẩu only show</label>
        <password class="style-password" v-model="passwordShow" :toggle=toggle :badge=badge />

        <input type="file" @change="handleFileChange" />

        <!-- Nút để người dùng tải xuống file PDF -->
        <button @click="downloadPdf">Tải xuống file PDF đã mã hóa</button>
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
            passwordAdmin: '',
            passwordShow: '',
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
            reader.readAsArrayBuffer(file);

        },
        // Hàm để tải xuống file PDF
        downloadPdf() {
            if (this.pdfData) {
                const hashadmin = CryptoJS.SHA256(this.passwordAdmin);
                const hashStringadmin = hashadmin.toString();

                const hashshow = CryptoJS.SHA256(this.passwordShow);
                const hashStringshow = hashshow.toString();

                // chyển từ ArrayBuffer thành WordArray
                const WordArray = CryptoJS.lib.WordArray.create(this.pdfData)

                // Mã hóa dữ liệu bằng WordArray
                const encryptedDataAdmin = CryptoJS.AES.encrypt(WordArray, hashStringadmin);
                const encryptedDataShow = CryptoJS.AES.encrypt(WordArray, hashStringshow);

                console.log(encryptedDataAdmin.iv.toString(CryptoJS.enc.Base64));
                console.log(encryptedDataShow.iv.toString(CryptoJS.enc.Base64));

                const jsonData = {
                    ciphertextAdmin: encryptedDataAdmin.ciphertext.toString(CryptoJS.enc.Base64),
                    ivAdmin: encryptedDataAdmin.iv.toString(CryptoJS.enc.Base64),
                    saltAdmin: encryptedDataAdmin.salt.toString(CryptoJS.enc.Base64),
                    ciphertextShow: encryptedDataShow.ciphertext.toString(CryptoJS.enc.Base64),
                    ivShow: encryptedDataShow.iv.toString(CryptoJS.enc.Base64),
                    saltShow: encryptedDataShow.salt.toString(CryptoJS.enc.Base64),
                };

                // Chuyển đổi đối tượng JSON thành chuỗi JSON
                const jsonString = JSON.stringify(jsonData);

                // Tạo blob từ dữ liệu đã giải mã với kiểu MIME là 'application/pdf'
                const blob = new Blob([jsonString], { type: 'application/pdf' });

                // Tạo URL cho blob
                const url = URL.createObjectURL(blob);

                // Tạo thẻ a để tải xuống file PDF đã giải mã
                const link = document.createElement('a');
                link.href = url;

                // Chia chuỗi ban đầu thành hai phần trước và sau ký tự thứ 4
                const splitIndex = this.fileName.length - 4;
                const before = this.fileName.slice(0, splitIndex); // Trước ký tự thứ 4
                const after = this.fileName.slice(splitIndex); // Sau ký tự thứ 4
                link.download = before + ' (đã mã hóa)' + after; // Đặt tên file mà bạn muốn tải xuống

                // Thêm thẻ a vào DOM và kích hoạt sự kiện click để tải xuống file
                document.body.appendChild(link);
                link.click();

                // Xóa thẻ a khỏi DOM và giải phóng URL
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

            } else {
                console.log('Không có dữ liệu PDF để tải xuống');
            }
        },
    },
};
</script>
<style>
.style-password {
    max-width: 240px !important;
    height: 30px !important;
    margin-left: 0 !important;
}

.Password {
    max-width: 240px !important;
    margin-left: 0 !important;
}
</style>