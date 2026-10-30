import { InquiryForm } from "./inquiry-form";

const addressLines = ["Malabar Starts Food Stuff", "Sharjah", "United Arab Emirates"];
const mapQuery = "Sharjah, United Arab Emirates";
const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=12&output=embed`;

export function Inquiry() {
  return (
    <section id="contact" className="scroll-mt-28 border-t border-ink/10 bg-[#f8ebe3] text-ink">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 md:py-14">
        <p className="text-xs uppercase tracking-[0.22em] text-saffron">Contact us</p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl leading-[1.02] tracking-tight sm:text-6xl">
          Reach the Sharjah counter.
        </h2>
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
          <div className="grid gap-6">
            <div className="rounded-[1.5rem] bg-paper p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.18em] text-wine">Address</p>
              <address className="mt-4 font-display text-3xl leading-tight tracking-tight not-italic sm:text-4xl">
                {addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
            <div className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-paper">
              <iframe
                title="Map of Sharjah, United Arab Emirates"
                src={mapSrc}
                className="h-80 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          <InquiryForm />
        </div>
      </div>
    </section>
  );
}
