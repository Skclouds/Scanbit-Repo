import React from "react";
import ComingSoon from "@/components/ComingSoon";
import { MdCampaign } from "react-icons/md";

const Marketing = () => {
  return (
    <ComingSoon 
      title="Growth and Engagement" 
      description="Unlock powerful marketing tools to grow your brand and engage with your audience through data-driven campaigns and strategic outreach."
      icon={MdCampaign}
    />
  );
};

export default Marketing;
