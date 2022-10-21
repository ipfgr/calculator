import axios from 'axios'

export default class Exchange{
    constructor(){
        this.axios = axios.create({
            baseURL: 'https://dev-api.finteria.com/api',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    }
    // get rates
    async getRate(currencyFrom, currencyTo){
        // prevent same currency from and to
        if (currencyFrom === currencyTo) return null
        if (!currencyFrom || !currencyTo) return null
        const res = await this.axios.post('/calculator/exchange/calculate', {
            "currency_from": currencyFrom,
            "currency_to": currencyTo,
            
        });
        if (res && res.status === 200) {
            return res.data
        }return null
    }   
}