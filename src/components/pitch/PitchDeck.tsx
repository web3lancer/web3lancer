"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Fade } from "react-awesome-reveal";
import VisionSlide from "./VisionSlide";
import FeaturesSlide from "./FeaturesSlide";
import OnChainSlide from "./OnChainSlide";
import ReputationSlide from "./ReputationSlide";
import TrustNetworkSlide from "./TrustNetworkSlide";
import LegalSlide from "./LegalSlide";
import GetStartedSlide from "./GetStartedSlide";
import DemoSlide from "./DemoSlide";

// This component should be rendered without any page layout, sidebar, or header.
export default function PitchDeck() {
  return (
    <div className="w-full max-w-3xl mx-auto py-10 bg-white">
      <Swiper spaceBetween={50} slidesPerView={1} pagination={{ clickable: true }}>
        <SwiperSlide>
          <Fade><VisionSlide /></Fade>
        </SwiperSlide>
        <SwiperSlide>
          <Fade><FeaturesSlide /></Fade>
        </SwiperSlide>
        <SwiperSlide>
          <Fade><OnChainSlide /></Fade>
        </SwiperSlide>
        <SwiperSlide>
          <Fade><ReputationSlide /></Fade>
        </SwiperSlide>
        <SwiperSlide>
          <Fade><TrustNetworkSlide /></Fade>
        </SwiperSlide>
        <SwiperSlide>
          <Fade><LegalSlide /></Fade>
        </SwiperSlide>
        <SwiperSlide>
          <Fade><GetStartedSlide /></Fade>
        </SwiperSlide>
        <SwiperSlide>
          <Fade><DemoSlide /></Fade>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
