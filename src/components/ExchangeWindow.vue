<template>
  <div class="exchange">
    <div class="exchange-form">
      <div class="exchange-form-available">
        <p class="description">Amount i have</p>
        <p class="amount">
          {{ getAvailableUserAmount(currencyFrom.currency) }}
          {{ currencyFrom.currency }}
        </p>
      </div>
      <div class="exchange-form__input">
        <div class="pair-name">
          <img
            width="15"
            height="15"
            :src="getImagePath(currencyFrom.currency)"
          />
          <select
            class="currency-select"
            :value="currencyFrom.currency"
            @input="selectHandler('from')"
          >
            <option
              v-for="currency in availableCurrencies"
              :value="currency"
              :key="currency"
            >
              {{ currency }}
            </option>
          </select>
        </div>
        <div class="amount">
          <input
            type="number"
            v-model.number="currencyFrom.amount"
            @change.prevent="calculateOutcome"
          />
        </div>
      </div>
      <div class="exchange-form-available">
        <p class="description">I need</p>
      </div>
      <div class="exchange-form__input">
        <div class="pair-name">
          <img
            width="20"
            height="20"
            :src="getImagePath(currencyTo.currency)"
          />
          <select
            class="currency-select"
            :value="currencyTo.currency"
            @input="selectHandler('to')"
          >
            <option
              v-for="currency in availableCurrencies.filter(
                (currency) => currency !== currencyFrom.currency
              )"
              :value="currency"
              :key="currency"
            >
              {{ currency }}
            </option>
          </select>
        </div>
        <div class="amount">
          <input type="number" disabled v-model.number="currencyTo.amount" />
        </div>
      </div>
    </div>
    <div v-if="rate" class="exchange-rate">
      <h3>Rate:</h3>
      <p>{{ pairUSDRate }}</p>
    </div>
    <div v-else class="exchange-rate">
      <span>Loading rates...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from "vue";
import Exchange from "../api/api.js";

const exchange = new Exchange();
const rate = ref(null);
const timeout = ref(null);
// our fee is 1%
const ourFee = 1;
// MOCK Available user amount
const availableUserAmount = computed(() => {
  return {
    EUR: 35495.023,
    USD: 18023.012,
    BTC: 1.23432,
    ETH: 17.2334,
  };
});
// currency available to exchange
const availableCurrencies = ref(["EUR", "USD", "BTC", "ETH"]);
const currencyFrom = reactive({
  currency: "EUR",
  amount: 0,
});
const currencyTo = reactive({
  currency: "BTC",
  amount: 0,
});

const selectHandler = async (type) => {
  rate.value = null;
  if (type === "from") {
    currencyFrom.currency = event.target.value;
  } else {
    currencyTo.currency = event.target.value;
  }
  // update rates before calculation
  await getRateForPair();
};

const getAvailableUserAmount = (currency) => {
  return availableUserAmount.value[currency] || 0;
};

// get image path for currency
const getImagePath = (currency) => {
  return require(`@/assets/${currency}.svg`);
};
// get rates when mounted
onMounted(() => {
  getRateForPair();
});

// calculate outcome amount
const calculateOutcome = async () => {
  // check if we have rates
  if (rate.value) {
    const outcome =
      currencyFrom.amount * (rate.value.conversion_rate * ((100 - ourFee) / 100));
    if (!outcome || outcome < 0) {
      currencyTo.amount = 0;
    } else {
      currencyTo.amount = outcome;
    }
  }
};

// request for get pair rates
const getRateForPair = async () => {
  // delay 1 sec to prevent multiple requests
  clearTimeout(timeout.value);
  timeout.value = setTimeout(async () => {
    const resp  = await exchange.getRate(
    currencyFrom.currency,
    currencyTo.currency
  );
  if (resp && resp.success) {
    rate.value = resp.data;
    calculateOutcome();
  }
  }, 1000);
};

// round to first 2 valued decimal
function twoDecimals(n) {
  var log10 = n ? Math.floor(Math.log10(n)) : 0,
      div = log10 < 0 ? Math.pow(10, 1 - log10) : 100;

  return Math.round(n * div) / div;
}

// show pair rate in USD 
const pairUSDRate = computed(() => {
  if (rate.value) {
    const rateWithFee = rate.value.conversion_rate * ((100 - ourFee) / 100);
    return `1 ${currencyFrom.currency} ~ ${twoDecimals(rateWithFee)} ${currencyTo.currency}`;
  }
  return 0;
});

//validate amount input
watch(
  () => ({ ...currencyFrom }),
  (newVal, oldVal) => {
    if (newVal.currency == currencyTo.currency) {
      currencyTo.currency = oldVal.currency;
    }
    if (currencyFrom.amount < 0) {
      currencyFrom.amount = 0;
    } else if (
      currencyFrom.amount > getAvailableUserAmount(currencyFrom.currency)
    ) {
      currencyFrom.amount = getAvailableUserAmount(currencyFrom.currency);
    }
  },
  { deep: true }
);
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.exchange {
  padding: 50px;
  border-top: 3px solid blue;
  min-width: 350px;
  min-height: 300px;
  box-shadow: 0 0 5px 1px grey;
  background-color: white;
  &-form {
    &-available {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .description {
        font-size: 20px;
        color: black;
      }
      .amount {
        font-size: 16px;
        color: gray;
      }
    }
    &__input {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      .pair-name {
        display: flex;
        flex-grow: 1;
        align-items: center;
        border-bottom: 1px rgb(215, 213, 213) solid;
        margin-right: 10px;
        &-icon {
          width: 20px;
          height: 20px;
          background-color: blue;
          border-radius: 50%;
          margin-right: 10px;
        }
        &-select {
          width: 100px;
          height: 30px;
          border: 1px solid rgb(215, 213, 213);
          border-radius: 5px;
          padding: 5px;
        }
      }
      .amount {
        input {
          background: rgb(247, 245, 245);
          width: 70px;
          text-align: center;
          height: 30px;
          border: 1px solid rgb(215, 213, 213);
          border-radius: 5px;
          padding: 2px 5px !important;
        }
      }
    }
  }
  &-rate {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 30px;
    background-image: linear-gradient(
      180deg,
      rgba(144, 203, 255, 0.561),
      white
    );
    padding: 5px 15px;
    h3 {
      font-size: 1.2rem;
      font-weight: 500;
    }
    p {
      font-size: 18px;
      font-weight: 600;
      color: rgb(90, 149, 251);
    }
  }
}
.currency-select {
  padding: 5px;
  border: none;
  border-radius: none;
}
</style>
