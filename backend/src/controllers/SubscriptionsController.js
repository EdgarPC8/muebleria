import { subscription } from "../config/subscription-api.js";

export const check = async (_, res) => {
  try {
    const response = await fetch(`${subscription.api}/subscriptions/check`, {
      headers: {
        Authorization: `Bearer ${subscription.apikey}`,
      },
    });
    if (!response.ok) {
      return res.status(500).json({
        message: "Error backend central",
      });
    }

    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "No se pudo conectar con el servidor central",
    });
  }
};

export const activate = async (req, res) => {
  try {
    const { license: licenseKey } = req.body;

    const response = await fetch(`${subscription.api}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${subscription.apikey}`,
      },
      body: JSON.stringify({
        license_key: licenseKey,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "No se pudo conectar con el servidor central",
    });
  }
};
