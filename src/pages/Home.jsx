import React from "react";
import PluginHero from "@/components/plugin/PluginHero";
import FeatureGrid from "@/components/plugin/FeatureGrid";
import PanelLink from "@/components/plugin/PanelLink";

export default function Home() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 pb-16">
      <PluginHero />
      <PanelLink />
      <FeatureGrid />
    </div>
  );
}