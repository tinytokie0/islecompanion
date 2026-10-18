import React from "react";
import CommunityBox from "@/components/home/CommunityBox";
import FeatureGrid from "@/components/home/FeatureGrid";
import { Image } from "@/components/ui/image";

const KEY_ART = "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/9f0ddaf0f_79baba85-cefc-4a35-8c70-bc181598d114.png";

export default function Home() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1500px] mx-auto">
      {/* Home backdrop: The Haven key art */}
      <div className="fixed inset-0 -z-10">
        <Image src={KEY_ART} alt="" className="w-full h-full" fittingType="fill" />
        <div className="absolute inset-0 bg-background/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-background" />
      </div>

      {/* Connect box: Steam, Discord and Arkanis */}
      <div className="mb-8">
        <CommunityBox />
      </div>

      {/* Feature grid */}
      <FeatureGrid />
    </div>
  );
}