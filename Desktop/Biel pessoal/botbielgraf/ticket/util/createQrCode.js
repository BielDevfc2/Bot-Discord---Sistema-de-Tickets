const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const { JsonDatabase } = require("wio.db");
const config = new JsonDatabase({ databasePath: "./db/config.json" });


async function generateQrCode(chave_pix) {
    const axios = require('axios');
    const fs = require('fs');
    const FormData = require("form-data");

    try {
        const fileOrigin = await config.get("archiveName");
        const file = fs.readFileSync(`${fileOrigin}`);

        const formData = new FormData();
        formData.append('file', file, `${fileOrigin}`);


        const uploadResponse = await axios.post('https://api.qrcode-monkey.com/qr/uploadimage', formData, {
            headers: {
                ...formData.getHeaders(),
            }
        });


        const fileUrl = uploadResponse.data.file;

        const qrCodeResponse = await axios.post("https://api.qrcode-monkey.com/qr/custom", {
            "data": `${chave_pix}`, "config": {
                "body": "rounded-pointed", "eye": "frame6", "eyeBall": "ball18", "erf1": ["fv"], "erf2": [], "erf3": [], "brf1": [], "brf2": [], "brf3": [], "bodyColor": "#000000", "bgColor": "#FFFFFF", "eye1Color": "#636262", "eye2Color": "#636262", "eye3Color": "#636262", "eyeBall1Color": "#6B6B6B", "eyeBall2Color": "#6B6B6B", "eyeBall3Color": "#6B6B6B", "gradientColor1": "#000000", "gradientColor2": "#8B8A8A", "gradientType": "radial", "gradientOnEyes": false, "logoMode": "clean"
                , "logo": fileUrl,
            },
            "size": 2000,
            "download": true,
            "file": "png",
        });
        const fileUrl1 = qrCodeResponse.data.imageUrl;

        return `https:${fileUrl1}`;
    } catch (error) {
        return false;
    }
}


module.exports = {
    generateQrCode
}
