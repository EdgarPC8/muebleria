import { useEffect, useState } from "react";
import { checkSubscription } from "../api/subscriptionsRequest";

export const useSubscriptions = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  const fetchSub = async () => {
    try {
      const res = await checkSubscription();
      setSubscription(res.data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSub();
  }, []);

  return { isLoading, subscription };
};
