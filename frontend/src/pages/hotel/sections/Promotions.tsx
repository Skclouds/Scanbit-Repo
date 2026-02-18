import React from "react";
import ComingSoon from "@/components/ComingSoon";
import { MdLocalOffer } from "react-icons/md";

export const Promotions = () => {
  return (
    <ComingSoon 
      title="Offers and Discounts" 
      description="We are building a powerful promotion engine to help you create, manage, and track discount codes and special offers for your customers."
      icon={MdLocalOffer}
    />
  );
};

export default Promotions;
