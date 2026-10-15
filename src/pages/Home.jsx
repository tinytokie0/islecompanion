import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LiveMap from "@/components/LiveMap";
import Garage from "@/components/Garage";
import SkinEditor from "@/components/SkinEditor";
import HealthOverview from "@/components/HealthOverview";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <LiveMap />
      <Garage />
      <SkinEditor />
      <HealthOverview />
      <Footer />
    </div>
  );
}