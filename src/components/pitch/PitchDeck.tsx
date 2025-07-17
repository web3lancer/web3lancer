"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectFade, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Fade, Slide } from "react-awesome-reveal";
import VisionSlide from "./VisionSlide";
import FeaturesSlide from "./FeaturesSlide";
import OnChainSlide from "./OnChainSlide";
import ReputationSlide from "./ReputationSlide";
import TrustNetworkSlide from "./TrustNetworkSlide";
import LegalSlide from "./LegalSlide";
import GetStartedSlide from "./GetStartedSlide";
import DemoSlide from "./DemoSlide";

export default function PitchDeck() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-black">
      <div className="w-full max-w-6xl mx-auto px-4">
        <Swiper
          modules={[Navigation, Pagination, EffectFade, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ 
            clickable: true,
            dynamicBullets: true,
            bulletClass: "swiper-pagination-bullet !bg-white !opacity-50",
            bulletActiveClass: "swiper-pagination-bullet-active !bg-white !opacity-100"
          }}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 10000, disableOnInteraction: false }}
          className="w-full h-[90vh] rounded-2xl shadow-2xl"
        >
          <SwiperSlide>
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-800 to-purple-900 rounded-2xl">
              <Fade cascade><VisionSlide /></Fade>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-800 to-pink-900 rounded-2xl">
              <Slide direction="up"><FeaturesSlide /></Slide>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-800 to-blue-900 rounded-2xl">
              <Fade><OnChainSlide /></Fade>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-800 to-red-900 rounded-2xl">
              <Slide direction="left"><ReputationSlide /></Slide>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-800 to-cyan-900 rounded-2xl">
              <Fade><TrustNetworkSlide /></Fade>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-800 to-purple-900 rounded-2xl">
              <Slide direction="right"><LegalSlide /></Slide>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl">
              <Fade><GetStartedSlide /></Fade>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl">
              <Slide direction="up"><DemoSlide /></Slide>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}
