// src/Merch.js
import React, { useEffect } from "react";
import "./Merch.css";

const Merch = () => {
  useEffect(() => {
    // Ensure Stripe’s buy-button script is loaded
    const existingScript = document.querySelector(
      'script[src="https://js.stripe.com/v3/buy-button.js"]'
    );
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/buy-button.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="merch-page">
      <div className="product-card">
        {/* New single Stripe buy button */}
        <stripe-buy-button
          buy-button-id="buy_btn_1RSb9oJrLBeT2yh0f4hgKoHj"
          publishable-key="pk_live_51LNfK8JrLBeT2yh0M9LkMQzvHpAWiU3sdjmRRm9nWH4nVJ3x8FIglwwOnPgfuoc2F4ZWBZulOJl5FiBillt4cTWG00Te1NEnt2"
        ></stripe-buy-button>
      </div>
    </div>
  );
};

export default Merch;
