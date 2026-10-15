import React from "react";

export default function PageShell({ kicker, title, sub, right, children }) {
  return (
    <section className="px-6 md:px-10 py-12 md:py-16">
      <div className="max-w-[1500px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            {kicker && (
              <span className="font-mono text-[10px] tracking-[0.3em] text-primary mb-3 block">
                {kicker}
              </span>
            )}
            <h1 className="font-heading text-3xl md:text-4xl tracking-[0.08em] text-foreground">
              {title}
            </h1>
            {sub && (
              <p className="font-mono text-xs text-muted-foreground mt-2 max-w-xl tracking-wide leading-relaxed">
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