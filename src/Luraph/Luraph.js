const axios = require("axios");
const base64 = require("./base64.js");

module.exports = class {
    constructor(options) {
        this.apiKey = options.apiKey
        this.client = axios.create({
            baseURL: "https://api.lura.ph/v1/",
            headers: {
                "Luraph-API-Key": this.apiKey
            }
        })
    };

    obfuscate(options) {
        return new Promise((resolve, reject) => {
            this.client.post("obfuscate/new", {
                fileName: options.fileName,
                node: options.node || "main",
                script: base64.encode(options.script),
                options: {
                    "ENABLE_DEBUG_LIBRARY": false,
                    "INTENSE_VM_STRUCTURE": false,
                    "TARGET_VERSION": "Luau",
                    "USE_EXPERIMENTAL_COMPILER": true,
                    "VM_COMPRESSION": false
                }
            }).then((response) => {
                if (response.status != 200) {
                    reject(`Error while obfuscating: ${response.status}`);
                }
                const { jobId } = response.data;

                this.client.get(`/obfuscate/status/${jobId}`).then(() => {
                    this.client.get(`/obfuscate/download/${jobId}`).then((resp) => {
                        resolve(resp.data);
                    })
                })
            })
        })
    }
}