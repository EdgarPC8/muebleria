import axios, { authHeaders, jwt } from "./axios.js";
const auth = () => authHeaders();

export const checkSubscription = async () =>
  await axios.get("/subscriptions/check", auth());

export const activateSubscription = async (licenseKey) =>
  await axios.post("/subscriptions/activate", { license: licenseKey }, auth());
