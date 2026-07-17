import React from "react";
import Hero from "../components/landing/Hero";
import About from "../components/landing/About";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import Subjects from "../components/landing/Subjects";
import Testimonials from "../components/landing/Testimonials";
import FAQ from "../components/landing/FAQ";
import CTA from "../components/landing/CTA";

export default function Landing() {
  return (
    <div>
      <Hero />
      <About />
      <Features />
      <HowItWorks />
      <Subjects />
      <Testimonials />
      <FAQ />
      <CTA />
    </div>
  );
}
