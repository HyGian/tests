const crypto = require('crypto');

const zalopayConfig = {
    app_id: process.env.ZALOPAY_APP_ID,
    key1: process.env.ZALOPAY_KEY1,
    key2: process.env.ZALOPAY_KEY2,
    
    endpoint: process.env.NODE_ENV === 'production' 
        ? 'https://openapi.zalopay.vn/v2'
        : 'https://sb-openapi.zalopay.vn/v2',

    generateMAC: function(data, useKey = 1) {
        const key = useKey === 1 ? this.key1 : this.key2;
        return crypto.createHmac('sha256', key)
                     .update(data)
                     .digest('hex');
    },
    
    verifyCallback: function(data, receivedMAC) {
        const computedMAC = this.generateMAC(data, 2);
        return computedMAC === receivedMAC;
    }
};

if (process.env.NODE_ENV === 'production') {
    const required = ['app_id', 'key1', 'key2'];
    const missing = required.filter(key => !zalopayConfig[key]);
    
    if (missing.length > 0) {
        console.error('ZaloPay config missing:', missing);
        process.exit(1);
    }
}

module.exports = zalopayConfig;