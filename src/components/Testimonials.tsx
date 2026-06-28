import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronRight, ChevronLeft, Quote } from "lucide-react";

interface Testimonial {
    id: number;
    name: string;
    role: string;
    company: string;
    initials: string;
    quote: string;
    highlight: string;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Nirmal Fibres Pvt Ltd.",
        role: "Factory Client",
        company: "Moradabad",
        initials: "NF",
        quote: "Pleasant and professional services, quality & dedication of security guards is well up to the mark. Highly recommend Eagle Eye for factory security.",
        highlight: "Factory Security",
    },
    {
        id: 2,
        name: "SDM Inter College",
        role: "Educational Institute",
        company: "Moradabad",
        initials: "SD",
        quote: "Eagle Eye has completely transformed the safety protocols on our campus. The guards are vigilant, polite to students, and extremely reliable.",
        highlight: "Campus Safety",
    },
    {
        id: 3,
        name: "G.K. Hospital",
        role: "Medical Director",
        company: "Moradabad",
        initials: "GK",
        quote: "Punctual, well-behaved guards. Crucial for our round-the-clock hospital operations. Their swift response during emergencies is commendable.",
        highlight: "24/7 Operations",
    },
    {
        id: 4,
        name: "Tata Motors CNG",
        role: "Plant Manager",
        company: "Industrial Sector",
        initials: "TM",
        quote: "Their smart QR patrol system gives us total peace of mind during night shifts. Excellent deployment and complete transparency.",
        highlight: "Night Patrols",
    },
];

const SLIDE_DURATION = 4500;
const TRANSITION_MS = 400;

export default function TestimonialsCarousel() {
    const [active, setActive] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    const [paused, setPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const goTo = useCallback(
        (index: number) => {
            if (transitioning) return;
            setTransitioning(true);
            setTimeout(() => {
                setActive(index);
                setTransitioning(false);
            }, TRANSITION_MS);
        },
        [transitioning]
    );

    const next = useCallback(() => {
        goTo((active + 1) % testimonials.length);
    }, [active, goTo]);

    const prev = useCallback(() => {
        goTo((active - 1 + testimonials.length) % testimonials.length);
    }, [active, goTo]);

    useEffect(() => {
        if (paused) return;
        timerRef.current = setTimeout(next, SLIDE_DURATION);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [active, paused, next]);

    const t = testimonials[active];

    return (
        <section
            id="testimonials-carousel"
            className="py-20 lg:py-32 bg-gray-100 relative overflow-hidden"
            aria-label="Customer testimonials"
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-sm font-semibold tracking-widest text-ees-red uppercase mb-3">
                        What Our Clients Say
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold text-ees-navy mb-4">
                        Trusted By The Best
                    </h2>
                    <div className="w-20 h-1.5 bg-ees-red mx-auto"></div>
                </div>

                {/* Card */}
                <div
                    className={`bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-100 relative overflow-hidden transition-all duration-[400ms] ease-in-out ${
                        transitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                    }`}
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                >
                    {/* Accent stripe */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-ees-red transition-colors duration-[400ms]"></div>
                    
                    <Quote className="absolute -top-4 -left-4 h-24 w-24 text-gray-100/60 -z-10 rotate-180" />

                    {/* Quote */}
                    <div className="mt-2 relative z-10">
                        <p className="text-xl md:text-2xl text-gray-700 font-medium italic leading-relaxed">
                            "{t.quote}"
                        </p>
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center justify-between mt-10 flex-wrap gap-4 relative z-10">
                        {/* Avatar + name */}
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-ees-light border-2 border-ees-red flex items-center justify-center font-bold text-lg text-ees-navy flex-shrink-0 transition-colors duration-[400ms]">
                                {t.initials}
                            </div>
                            <div>
                                <p className="m-0 font-bold text-lg text-ees-navy">
                                    {t.name}
                                </p>
                                <p className="m-0 text-sm text-gray-500 mt-0.5">
                                    {t.role} · {t.company}
                                </p>
                            </div>
                        </div>

                        {/* Savings badge */}
                        <span className="bg-ees-red/10 text-ees-red text-sm font-semibold px-4 py-1.5 rounded-full whitespace-nowrap transition-colors duration-[400ms]">
                            {t.highlight}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mt-8">
                    {/* Dots */}
                    <div className="flex gap-2">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                aria-label={`Go to testimonial ${i + 1}`}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    i === active ? "w-8 bg-ees-red" : "w-2 bg-gray-300 hover:bg-gray-400"
                                }`}
                            />
                        ))}
                    </div>

                    {/* Prev / Next */}
                    <div className="flex gap-3">
                        <button
                            onClick={prev}
                            aria-label="Previous testimonial"
                            className="w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-600 hover:border-ees-red hover:text-ees-red transition-colors duration-200 focus:outline-none"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={next}
                            aria-label="Next testimonial"
                            className="w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-600 hover:border-ees-red hover:text-ees-red transition-colors duration-200 focus:outline-none"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-6 h-1 bg-gray-200 rounded-full overflow-hidden" aria-hidden="true">
                    <div
                        key={`${active}-${paused}`}
                        className="h-full bg-ees-red rounded-full"
                        style={{
                            animation: paused ? "none" : `progress ${SLIDE_DURATION}ms linear forwards`,
                        }}
                    />
                </div>
            </div>

            <style>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </section>
    );
}
