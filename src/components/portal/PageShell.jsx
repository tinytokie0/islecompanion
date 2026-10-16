import React from "react";
import { Image } from "@/components/ui/image";

const KEY_ART = "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/9f0ddaf0f_79baba85-cefc-4a35-8c70-bc181598d114.png";

export default function PageShell({ icon: Icon, title, sub, right, children }) {
  return (
    <section className="px-4 md:px-8 py-8 md:py-10">
      <div className="max-w-[1500px] mx-auto">
        {/* Header banner carrying the Haven key art */}
        <div className="relative rounded-xl overflow-hidden border border-border mb-7">
          <Image src={KEY_ART} alt="" className="absolute inset-0 w-full h-full" fittingType="fill" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="relative p-7 md:p-9">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  {Icon && (
                    <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 backdrop-blur-sm">
                      <Icon size={17} />
                    </span>
                  )}
                  <h1 className="font-heading text-3xl font-bold text-foreground">
                    {title}
                  </h1>
                </div>
                {sub && (
                  <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                    {sub}
                  </p>
                )}
              </div>
              {right}
            </div>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}