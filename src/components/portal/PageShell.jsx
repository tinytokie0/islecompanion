import React from "react";

export default function PageShell({ icon: Icon, title, sub, right, children }) {
  return (
    <section className="px-4 md:px-8 py-8 md:py-10">
      <div className="max-w-[1500px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              {Icon && (
                <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
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
        {children}
      </div>
    </section>
  );
}