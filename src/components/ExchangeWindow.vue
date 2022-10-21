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
            width="20px"
            height="20px"
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
            width="20px"
            height="20px"
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
      <p>$ {{ formatFiatCurrency(rate?.conversion_rate_usd || 0) }}</p>
    </div>
    <div v-else class="exchange-rate">
      <span>Loading rates...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import Exchange from "../api/api.js";

const exchange = new Exchange();
const rate = ref(null);
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
const availableCurrencies = ref(["EUR", "USD", "BTC", "ETH"]);
const currencyFrom = ref({
  currency: "EUR",
  amount: 0,
});
const currencyTo = ref({
  currency: "BTC",
  amount: 0,
});

const selectHandler = (type) => {
  if (type === "from") {
    currencyFrom.value.currency = event.target.value;
  } else {
    currencyTo.value.currency = event.target.value;
  }
  // update rates before calculation
  getRateForPair();
};

const getAvailableUserAmount = (currency) => {
  return availableUserAmount.value[currency] || 0;
};
const formatFiatCurrency = (amount) => {
  return amount.toLocaleString(
    "en-US",
    { style: "currency", currency: "USD" },
    { maximumFractionDigits: 2 }
  );
};
const getImagePath = (currency) => {
  return require(`@/assets/${currency}.svg`);
};

onMounted(() => {
  getRateForPair();
});

const calculateOutcome = async () => {
  // check if we have rates
  if (rate.value) {
    const outcome =
      currencyFrom.value.amount *
      rate.value.conversion_rate *
      ((100 - ourFee) / 100);
    if (!outcome || outcome < 0) {
      currencyTo.value.amount = 0;
    } else {
      currencyTo.value.amount = outcome;
    }
  }
};

const getRateForPair = async () => {
  rate.value == null;
  const resp = await exchange.getRate(
    currencyFrom.value.currency,
    currencyTo.value.currency
  );
  if (resp && resp.success) {
    rate.value = resp.data;
  }
};

//validate amount input
watch(
  currencyFrom,
  () => {
    if (currencyFrom.value.amount < 0) {
      currencyFrom.value.amount = 0;
      return;
    }
    if (
      currencyFrom.value.amount >
      getAvailableUserAmount(currencyFrom.value.currency)
    ) {
      currencyFrom.value.amount = getAvailableUserAmount(
        currencyFrom.value.currency
      );
      return;
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
    .description{
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
