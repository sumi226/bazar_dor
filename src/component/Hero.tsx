import Image from "next/image";

import hero from "@/assets/bazar-hero.png";

const Hero = () => {
  return (
    <section className="bg-base-300">
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:py-16">
        <div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-base-100 p-6 shadow-xl sm:p-10 lg:grid-cols-2 lg:p-12">
          {/* =========================
              LEFT CONTENT
          ========================== */}

          <div className="space-y-5">
            {/* Date */}
            <p className="inline-block rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-success sm:text-base">
              মঙ্গলবার, ৬ অক্টোবর, ২০২৬
            </p>

            {/* Heading */}
            <h1 className="text-xl font-extrabold leading-tight text-base-content sm:text-3xl lg:text-4xl">
              আজকের বাজারের দাম এক নজরে
            </h1>

            {/* Description */}
            <p className="max-w-xl text-base leading-7 text-base-content/70 sm:text-lg">
              চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম — বাজারভিত্তিক
              বিস্তারিত, গড়, সর্বনিম্ন-সর্বাধিক এবং দামের পরিবর্তন এক জায়গায়।
            </p>

            {/* CTA */}
            <div className="pt-2">
              <a
                href=""
                className="btn btn-success rounded-full px-7 text-base shadow-lg"
              >
                🛒 সব পণ্য দেখুন
              </a>
            </div>
          </div>

          {/* =========================
              RIGHT IMAGE
          ========================== */}

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-success/10 p-4 sm:p-6">
              {/* Decorative Circle */}
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-success/20" />

              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-success/20" />

              <div className="relative flex min-h-[280px] items-center justify-center sm:min-h-[360px]">
                <Image
                  src={hero}
                  alt="বাজার দর"
                  width={600}
                  height={450}
                  priority
                  className="h-auto w-full object-contain drop-shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
