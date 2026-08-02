"use client";

import * as React from "react";
import GravityLines from "./GravityLines";

const STAGE_WIDTH = 755;
const STAGE_HEIGHT = 312;

const ROPE_ANCHORS: [string, string] = ["rope-anchor-a", "rope-anchor-b"];

const NAV_ITEMS = ["Preview", "Play", "Chat", "Join"] as const;

function HumanFace(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 319 360"
      fill="none"
      overflow="visible"
      aria-hidden
      {...props}
    >
      <g filter="url(#filter0_ddddd_678_599)">
        <path
          d="M306.563 123.999L275.709 53.0673C264.136 26.4613 237.863 9.25 208.822 9.25H168.022C128.863 9.25 97.1191 40.959 97.1191 80.0741V82.0977C97.1191 112.272 121.607 136.733 151.815 136.733V168.604C151.815 183.692 164.059 195.922 179.163 195.922L243.21 196.328C258.314 196.328 270.324 183.692 270.324 168.604V136.733H298.202C304.766 136.733 309.179 130.012 306.563 123.999Z"
          fill="#454545"
        />
        <path
          d="M306.563 123.999L275.709 53.0673C264.136 26.4613 237.863 9.25 208.822 9.25H168.022C128.863 9.25 97.1191 40.959 97.1191 80.0741V82.0977C97.1191 112.272 121.607 136.733 151.815 136.733V168.604C151.815 183.692 164.059 195.922 179.163 195.922L243.21 196.328C258.314 196.328 270.324 183.692 270.324 168.604V136.733H298.202C304.766 136.733 309.179 130.012 306.563 123.999Z"
          stroke="url(#paint0_linear_678_599)"
          strokeWidth="0.5"
        />
      </g>
      <defs>
        <filter
          id="filter0_ddddd_678_599"
          x="-36.1309"
          y="0"
          width="354.709"
          height="364.578"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-4" dy="5" />
          <feGaussianBlur stdDeviation="7" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_678_599"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-14" dy="20" />
          <feGaussianBlur stdDeviation="12.5" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.22 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_678_599"
            result="effect2_dropShadow_678_599"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-32" dy="45" />
          <feGaussianBlur stdDeviation="16.5" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_dropShadow_678_599"
            result="effect3_dropShadow_678_599"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-57" dy="80" />
          <feGaussianBlur stdDeviation="19.5" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0"
          />
          <feBlend
            mode="normal"
            in2="effect3_dropShadow_678_599"
            result="effect4_dropShadow_678_599"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-90" dy="125" />
          <feGaussianBlur stdDeviation="21.5" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.01 0"
          />
          <feBlend
            mode="normal"
            in2="effect4_dropShadow_678_599"
            result="effect5_dropShadow_678_599"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect5_dropShadow_678_599"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_678_599"
          x1="172.194"
          y1="167.11"
          x2="281.765"
          y2="31.7662"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2B2B2B" />
          <stop offset="1" stopColor="#7D7D7D" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function RobotFace(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 286 360"
      fill="none"
      overflow="visible"
      aria-hidden
      {...props}
    >
      <g filter="url(#filter0_ddddd_678_600)">
        <mask id="path-1-inside-1_678_600" fill="white">
          <path d="M188.029 121.809H113.49V196.899H11V10H188.029V121.809Z" />
        </mask>
        <path
          d="M188.029 121.809H113.49V196.899H11V10H188.029V121.809Z"
          fill="#454545"
        />
        <path
          d="M188.029 121.809V122.309H188.529V121.809H188.029ZM113.49 121.809V121.309H112.99V121.809H113.49ZM113.49 196.899V197.399H113.99V196.899H113.49ZM11 196.899H10.5V197.399H11V196.899ZM11 10V9.5H10.5V10H11ZM188.029 10H188.529V9.5H188.029V10ZM188.029 121.809V121.309H113.49V121.809V122.309H188.029V121.809ZM113.49 121.809H112.99V196.899H113.49H113.99V121.809H113.49ZM113.49 196.899V196.399H11V196.899V197.399H113.49V196.899ZM11 196.899H11.5V10H11H10.5V196.899H11ZM11 10V10.5H188.029V10V9.5H11V10ZM188.029 10H187.529V121.809H188.029H188.529V10H188.029Z"
          fill="url(#paint0_linear_678_600)"
          mask="url(#path-1-inside-1_678_600)"
        />
      </g>
      <defs>
        {/* Same five shadows as the human face, mirrored to fall right. */}
        <filter
          id="filter0_ddddd_678_600"
          x="-20"
          y="-20"
          width="400"
          height="400"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="4" dy="5" />
          <feGaussianBlur stdDeviation="7" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_678_600"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="14" dy="20" />
          <feGaussianBlur stdDeviation="12.5" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.22 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_678_600"
            result="effect2_dropShadow_678_600"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="32" dy="45" />
          <feGaussianBlur stdDeviation="16.5" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_dropShadow_678_600"
            result="effect3_dropShadow_678_600"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="57" dy="80" />
          <feGaussianBlur stdDeviation="19.5" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0"
          />
          <feBlend
            mode="normal"
            in2="effect3_dropShadow_678_600"
            result="effect4_dropShadow_678_600"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="90" dy="125" />
          <feGaussianBlur stdDeviation="21.5" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.01 0"
          />
          <feBlend
            mode="normal"
            in2="effect4_dropShadow_678_600"
            result="effect5_dropShadow_678_600"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect5_dropShadow_678_600"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_678_600"
          x1="143.699"
          y1="190.991"
          x2="37.377"
          y2="10.0004"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2B2B2B" />
          <stop offset="1" stopColor="#7D7D7D" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Ampersand(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 173 187"
      fill="none"
      overflow="visible"
      aria-hidden
      {...props}
    >
      <g filter="url(#filter0_i_678_597)">
        <path
          d="M52.0225 64.5452C54.5124 67.7591 56.9135 70.7051 59.2256 73.3833C67.5847 67.6698 74.3432 61.6884 79.501 55.4392C84.8366 49.19 87.5045 42.2267 87.5045 34.5491C87.5045 26.693 85.2813 20.533 80.8349 16.0693C76.3885 11.6056 70.8751 9.37378 64.2944 9.37378C57.536 9.37378 51.7557 11.7842 46.9536 16.605C42.3294 21.2472 40.0173 27.1393 40.0173 34.2813C40.0173 39.1021 40.7287 43.8336 42.1515 48.4758C43.7522 52.9396 47.0425 58.296 52.0225 64.5452ZM171.541 183.994C167.628 184.887 164.16 185.512 161.136 185.869C158.113 186.404 154.822 186.672 151.265 186.672C144.151 186.672 138.282 185.69 133.658 183.726C129.034 181.941 124.498 178.816 120.052 174.352C118.451 172.388 116.85 170.603 115.25 168.996C113.649 167.389 112.137 165.693 110.714 163.907C104.845 170.335 97.4643 175.781 88.5716 180.244C79.8567 184.53 69.0965 186.672 56.291 186.672C45.264 186.672 35.482 184.53 26.945 180.244C18.408 175.781 11.7384 169.889 6.93633 162.568C2.31211 155.069 0 146.856 0 137.929C0 125.787 3.37924 115.164 10.1377 106.058C16.8962 96.9517 26.945 89.0956 40.2841 82.4893C40.1062 82.1322 39.9284 81.8644 39.7505 81.6858C39.5726 81.5073 39.3948 81.3287 39.2169 81.1502C32.6363 73.4726 27.9232 66.1521 25.0775 59.1887C22.2318 52.2254 20.809 45.1727 20.809 38.0308C20.809 26.2466 24.9886 16.9621 33.3477 10.1772C41.7069 3.39241 52.1114 0 64.5612 0C77.7225 0 87.7712 3.21387 94.7076 9.6416C101.644 16.0693 105.112 24.2826 105.112 34.2813C105.112 43.5658 101.911 51.779 95.5079 58.9209C89.283 66.0628 79.3232 73.2941 65.6283 80.6145C68.474 83.8284 71.5865 87.3101 74.9657 91.0596C78.345 94.8091 82.3467 99.2728 86.9709 104.451C92.3065 110.343 97.4643 115.967 102.444 121.324C107.424 126.501 112.493 131.947 117.651 137.661C122.631 129.269 126.988 120.609 130.723 111.682C134.458 102.755 137.482 93.0236 139.794 82.4893L118.718 79.0076V68.2947H172.875V79.0076L152.599 82.7571C149.576 94.8984 145.752 106.058 141.128 116.235C136.503 126.412 131.079 136.143 124.854 145.428C128.233 148.82 131.701 152.48 135.258 156.408C138.816 160.336 142.639 164.443 146.73 168.728L171.541 170.846V183.994ZM75.7661 124.537C69.719 117.217 64.4723 110.878 60.0259 105.522C55.5796 100.166 51.1332 94.9877 46.6868 89.9883C37.4384 95.5233 31.2135 102.04 28.0121 109.539C24.8107 116.86 23.21 123.912 23.21 130.697C23.21 137.125 24.7218 143.374 27.7453 149.445C30.9467 155.337 35.5709 160.158 41.618 163.907C47.665 167.657 54.9571 169.532 63.4941 169.532C70.964 169.532 78.1671 168.282 85.1034 165.782C92.0397 163.282 97.9979 159.801 102.978 155.337C97.9979 149.981 93.2847 144.803 88.8384 139.803C84.5699 134.625 80.2124 129.537 75.7661 124.537Z"
          fill="#171717"
        />
      </g>
      <defs>
        <filter
          id="filter0_i_678_597"
          x="0"
          y="0"
          width="172.875"
          height="187.672"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.24 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_678_597"
          />
        </filter>
      </defs>
    </svg>
  );
}

export default function Hero() {
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const update = () =>
      setScale(Math.min(1, (window.innerWidth - 32) / STAGE_WIDTH));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <section className="relative flex h-dvh min-h-[560px] flex-col overflow-hidden">
      {/* Artwork stage */}
      <div className="flex min-h-0 flex-1 items-center justify-center pt-16">
        <div
          className="relative shrink-0"
          style={{
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          <Ampersand
            className="pointer-events-none absolute left-1/2 -translate-x-1/2"
            style={{ top: 2, width: 287, height: 310 }}
          />
          {/*
            The face SVGs are Figma exports whose viewBoxes include room for
            drop shadows. They're rendered at 1.4x their native units and
            offset so the face itself starts at the stage origin.
          */}
          <HumanFace
            className="pointer-events-none absolute"
            style={{ left: -136, top: -13, width: 446.6, height: 504 }}
          />
          <RobotFace
            className="pointer-events-none absolute"
            style={{ left: 492, top: -14, width: 400.4, height: 504 }}
          />
          {/* Rope attachment points (measured by GravityLines) */}
          <div
            id={ROPE_ANCHORS[0]}
            className="absolute size-px"
            style={{ left: 118, top: 85 }}
          />
          <div
            id={ROPE_ANCHORS[1]}
            className="absolute size-px"
            style={{ left: 638, top: 92 }}
          />
        </div>
      </div>

      {/* Text + nav */}
      <div className="pointer-events-none relative z-20 flex flex-col items-center px-6 pb-10">
        <h1 className="text-sm font-medium text-[#EDEAE6]">
          Designers and Machines
        </h1>
        <p className="mt-1.5 max-w-[290px] text-center text-sm leading-snug text-[#8B8885]">
          Monthly demo dinners in SF for designers who explore how we create
          with machines.
        </p>
        <nav className="pointer-events-auto mt-6 flex items-center rounded-full border border-white/[0.06] bg-[#2A2725]/90 px-2 py-1.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-full px-5 py-1.5 text-[13px] text-[#A29E9A] transition-colors hover:text-[#EDEAE6]"
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      {/* Interactive rope layer (above artwork, below text/nav) */}
      <GravityLines
        className="absolute inset-0 z-10 cursor-crosshair"
        anchorIds={ROPE_ANCHORS}
        lineColor="#FF4433"
        lineWidth={3}
        gravity={5}
        friction={10}
        slack={10}
        holeSize={12}
        holeColor="#111111"
        interactionRadius={100}
        pushStrength={15}
      />
    </section>
  );
}
