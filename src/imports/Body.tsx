import svgPaths from "./svg-vxc24fmowr";

function ProgressIndicatorPagination() {
  return (
    <div className="absolute bottom-[48px] content-stretch flex gap-[16px] items-start justify-center left-0 right-0 z-[5]" data-name="Progress Indicator / Pagination">
      <div className="bg-[#11b4d4] h-[8px] rounded-[9999px] shrink-0 w-[48px]" data-name="Background" />
      <div className="bg-[#cbd5e1] rounded-[9999px] shrink-0 size-[8px]" data-name="Background" />
      <div className="bg-[#cbd5e1] rounded-[9999px] shrink-0 size-[8px]" data-name="Background" />
      <div className="bg-[#cbd5e1] rounded-[9999px] shrink-0 size-[8px]" data-name="Background" />
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[24px] relative shrink-0 w-[30px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 24">
        <g id="Container">
          <path d={svgPaths.p33f74e10} fill="var(--fill-0, #11B4D4)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 2">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#0d191b] text-[20px] tracking-[-0.5px] uppercase w-[159.61px]">
        <p className="leading-[28px] whitespace-pre-wrap">Bauhaus Tattoo</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex gap-[12px] items-center left-[40px] top-[calc(50%-0.5px)]" data-name="Container">
      <Container1 />
      <Heading1 />
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Space_Grotesk:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] relative shrink-0 text-[#475569] text-[14px] tracking-[1.4px] uppercase w-[68.23px]">
        <p className="leading-[20px] whitespace-pre-wrap">Gallery</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Space_Grotesk:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] relative shrink-0 text-[#475569] text-[14px] tracking-[1.4px] uppercase w-[63.84px]">
        <p className="leading-[20px] whitespace-pre-wrap">Artists</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Space_Grotesk:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] relative shrink-0 text-[#475569] text-[14px] tracking-[1.4px] uppercase w-[52.16px]">
        <p className="leading-[20px] whitespace-pre-wrap">About</p>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex gap-[32px] items-center left-[556.94px] top-[calc(50%-0.5px)]" data-name="Nav">
      <Link />
      <Link1 />
      <Link2 />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-center relative" data-name="Container">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white tracking-[0.7px] uppercase w-[77.48px]">
        <p className="leading-[20px] whitespace-pre-wrap">Book Now</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#11b4d4] content-stretch flex flex-col items-start pl-[22.241px] pr-[22.233px] py-[8px] relative" data-name="Button">
      <div className="flex items-center justify-center relative shrink-0 w-[81.007px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.140625" } as React.CSSProperties}>
        <div className="flex-none skew-x-10">
          <Container2 />
        </div>
      </div>
    </div>
  );
}

function NavigationHeader() {
  return (
    <div className="backdrop-blur-[2px] bg-[rgba(248,251,252,0.9)] h-[73px] relative shrink-0 w-full z-[4]" data-name="Navigation Header">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-b border-solid inset-0 pointer-events-none" />
      <Container />
      <Nav />
      <div className="-translate-y-1/2 absolute flex items-center justify-center left-[1111.32px] top-[calc(50%-0.5px)] w-[131.828px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.140625" } as React.CSSProperties}>
        <div className="-skew-x-10 flex-none">
          <Button />
        </div>
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col items-center left-1/2 top-[calc(50%+64px)]" data-name="Heading 3">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#1e293b] text-[18px] text-center tracking-[1.8px] uppercase w-[151.244px]">
        <p className="leading-[28px] whitespace-pre-wrap">Artist Portal</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[61.58px] pt-[8.889px] top-[237.11px]" data-name="Margin">
      <div className="flex flex-col font-['Space_Grotesk:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[12px] tracking-[0.6px] uppercase w-[132.833px]">
        <p className="leading-[16px] whitespace-pre-wrap">Portal de tatuador</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0 size-[128px]" data-name="Container">
      <div className="absolute bg-[#d92525] inset-0 opacity-20 rounded-[9999px]" data-name="Geometric Icon: Portal de tatuador" />
      <div className="absolute border-4 border-[#d92525] border-solid inset-[8px_-8px_-8px_8px] rounded-[9999px]" data-name="Border" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex items-center justify-center left-1/2 size-[90.511px] top-1/2" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-45">
          <div className="bg-[#11b4d4] size-[64.001px]" data-name="Background" />
        </div>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[154.667px] items-start left-[64px] pb-[24px] top-[58px] w-[128px]" data-name="Margin">
      <Container3 />
    </div>
  );
}

function InactiveItemLeft() {
  return (
    <div className="bg-white blur-[0.5px] h-[320px] opacity-40 relative w-[256px]" data-name="Inactive Item Left">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none" />
      <Heading2 />
      <Margin />
      <Margin1 />
    </div>
  );
}

function InactiveItemLeftCssTransform() {
  return (
    <div className="content-stretch flex flex-col h-[550px] items-center justify-center py-[131px] relative shrink-0" data-name="Inactive Item Left:css-transform">
      <div className="flex h-[288px] items-center justify-center relative shrink-0 w-[230.4px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "42.28125" } as React.CSSProperties}>
        <div className="flex-none scale-x-90 scale-y-90">
          <InactiveItemLeft />
        </div>
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Heading 1">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold h-[40px] justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[36px] text-center tracking-[-0.9px] uppercase w-[207.19px]">
        <p className="leading-[40px] whitespace-pre-wrap">Get a Quote</p>
      </div>
    </div>
  );
}

function Heading1Margin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[33.76px] pb-[8px] top-[264px]" data-name="Heading 1:margin">
      <Heading />
    </div>
  );
}

function Margin2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] pb-[32px] top-[312px]" data-name="Margin">
      <div className="flex flex-col font-['Space_Grotesk:Medium',sans-serif] font-medium h-[28px] justify-center leading-[0] relative shrink-0 text-[#11b4d4] text-[18px] tracking-[1.8px] uppercase w-[210.73px]">
        <p className="leading-[28px] whitespace-pre-wrap">Cotizar un tatuaje</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Container">
          <path d={svgPaths.p304eaa0} fill="var(--fill-0, #0F172A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center pb-[6px] relative shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#11b4d4] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[14px] text-center tracking-[1.4px] uppercase w-[124.52px]">
        <p className="leading-[20px] whitespace-pre-wrap">Start Journey</p>
      </div>
      <Container5 />
    </div>
  );
}

function ButtonMargin() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col h-[142px] items-start justify-center left-[62.1px] min-h-[34px] pt-[108px] top-[calc(50%+170px)]" data-name="Button:margin">
      <Button1 />
    </div>
  );
}

function GeometricIconCotizarUnTatuaje() {
  return (
    <div className="relative shrink-0 size-[192px]" data-name="Geometric Icon: Cotizar un tatuaje">
      <div className="absolute border-[#11b4d4] border-b-100 border-l-60 border-r-60 border-solid bottom-0 h-[100px] left-0 opacity-90 w-[120px]" data-name="Triangle" />
      <div className="absolute bg-[#f2c029] mix-blend-multiply opacity-90 right-[16px] rounded-[9999px] size-[96px] top-0" data-name="Circle" />
      <div className="absolute flex h-[131.856px] items-center justify-center left-[3.05px] mix-blend-multiply top-[38.08px] w-[57.913px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="-rotate-12 flex-none">
          <div className="bg-[#d92525] h-[128px] opacity-90 w-[32px]" data-name="Rectangle" />
        </div>
      </div>
      <div className="absolute bottom-[-28.09px] flex items-center justify-center right-[-16.09px] size-[96.167px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-45">
          <div className="bg-[#1e293b] h-[8px] w-[128px]" data-name="Line" />
        </div>
      </div>
    </div>
  );
}

function GeometricIconCotizarUnTatuajeMargin() {
  return (
    <div className="absolute content-stretch flex flex-col h-[232px] items-start left-[41.35px] pb-[40px] top-[32px] w-[192px]" data-name="Geometric Icon: Cotizar un tatuaje:margin">
      <GeometricIconCotizarUnTatuaje />
    </div>
  );
}

function Container4() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[274.73px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Heading1Margin />
        <Margin2 />
        <ButtonMargin />
        <GeometricIconCotizarUnTatuajeMargin />
      </div>
    </div>
  );
}

function ActiveItemCenter() {
  return (
    <div className="bg-white h-[560px] max-w-[448px] relative shrink-0 w-[448px]" data-name="Active Item (Center)">
      <div className="content-stretch flex flex-col items-center justify-center max-w-[inherit] overflow-clip p-[2px] relative rounded-[inherit] size-full">
        <div className="absolute bg-[#f8fafc] bottom-[2px] right-[2px] rounded-tl-[9999px] size-[128px]" data-name="Background" />
        <div className="absolute bg-gradient-to-r from-[#d92525] h-[8px] left-[2px] right-[2px] to-[#11b4d4] top-[2px] via-1/2 via-[#f2c029]" data-name="Geometric Decoration Lines" />
        <Container4 />
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#11b4d4] border-solid inset-0 pointer-events-none shadow-[15px_15px_0px_0px_rgba(17,180,212,0.2)]" />
    </div>
  );
}

function Heading3() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col items-center left-[calc(50%-0.01px)] top-[calc(50%+64px)]" data-name="Heading 3">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#1e293b] text-[18px] text-center tracking-[1.8px] uppercase w-[116.167px]">
        <p className="leading-[28px] whitespace-pre-wrap">Voice Chat</p>
      </div>
    </div>
  );
}

function Margin3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[88.84px] pt-[8.889px] top-[237.11px]" data-name="Margin">
      <div className="flex flex-col font-['Space_Grotesk:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[12px] tracking-[0.6px] uppercase w-[78.311px]">
        <p className="leading-[16px] whitespace-pre-wrap">Chat de voz</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="relative shrink-0 size-[128px]" data-name="Container">
      <div className="absolute border-4 border-[#f2c029] border-solid inset-0 rounded-[9999px]" data-name="Geometric Icon: Chat de voz" />
      <div className="absolute border-4 border-[#11b4d4] border-solid inset-[16px] opacity-60 rounded-[9999px]" data-name="Border" />
      <div className="absolute bg-[#d92525] inset-[32px] rounded-[9999px]" data-name="Background" />
    </div>
  );
}

function Margin4() {
  return (
    <div className="absolute content-stretch flex flex-col h-[154.667px] items-start left-[64px] pb-[24px] top-[58px] w-[128px]" data-name="Margin">
      <Container6 />
    </div>
  );
}

function InactiveItemRight() {
  return (
    <div className="bg-white blur-[0.5px] h-[320px] opacity-40 relative w-[256px]" data-name="Inactive Item Right">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none" />
      <Heading3 />
      <Margin3 />
      <Margin4 />
    </div>
  );
}

function InactiveItemRightCssTransform() {
  return (
    <div className="content-stretch flex flex-col h-[550px] items-center justify-center py-[131px] relative shrink-0" data-name="Inactive Item Right:css-transform">
      <div className="flex h-[288px] items-center justify-center relative shrink-0 w-[230.4px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "42.28125" } as React.CSSProperties}>
        <div className="flex-none scale-x-90 scale-y-90">
          <InactiveItemRight />
        </div>
      </div>
    </div>
  );
}

function CarouselContainer() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[44.8px] items-center justify-center max-w-[1280px] min-h-px min-w-px relative" data-name="Carousel Container">
      <InactiveItemLeftCssTransform />
      <ActiveItemCenter />
      <InactiveItemRightCssTransform />
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[30px] relative shrink-0 w-[17.663px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.6625 30">
        <g id="Container">
          <path d={svgPaths.p2e30e7b0} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ButtonNavigationLeft() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center left-[32px] p-[16px] rounded-[9999px] top-[439.5px]" data-name="Button - Navigation Left">
      <Container7 />
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[30px] relative shrink-0 w-[17.663px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.6625 30">
        <g id="Container">
          <path d={svgPaths.p1c1e7c40} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ButtonNavigationRight() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center p-[16px] right-[32px] rounded-[9999px] top-[439.5px]" data-name="Button - Navigation Right">
      <Container8 />
    </div>
  );
}

function MainCarouselArea() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full z-[3]" data-name="Main Carousel Area">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[48px] relative size-full">
          <CarouselContainer />
          <ButtonNavigationLeft />
          <ButtonNavigationRight />
        </div>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Space_Grotesk:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[12px] tracking-[1.2px] uppercase w-[220.83px]">
          <p className="leading-[16px] whitespace-pre-wrap">\u00a9 2024 Bauhaus Tattoo Studio</p>
        </div>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Space_Grotesk:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[12px] tracking-[1.2px] uppercase w-[75.73px]">
        <p className="leading-[16px] whitespace-pre-wrap">Instagram</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Space_Grotesk:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[12px] tracking-[1.2px] uppercase w-[57.33px]">
        <p className="leading-[16px] whitespace-pre-wrap">Twitter</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-start relative">
        <Container11 />
        <Container12 />
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Space_Grotesk:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[12px] tracking-[1.2px] uppercase w-[172.75px]">
          <p className="leading-[16px] whitespace-pre-wrap">Form Follows Function</p>
        </div>
      </div>
    </div>
  );
}

function MinimalistFooter() {
  return (
    <div className="absolute bg-[#f8fbfc] bottom-0 content-stretch flex items-center justify-between left-0 pb-[16px] pl-[40px] pr-[40.02px] pt-[17px] right-0 z-[2]" data-name="Minimalist Footer">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-solid border-t inset-0 pointer-events-none" />
      <Container9 />
      <Container10 />
      <Container13 />
    </div>
  );
}

export default function Body() {
  return (
    <div className="bg-[#f8fbfc] content-stretch flex flex-col isolate items-start relative size-full" data-name="Body">
      <ProgressIndicatorPagination />
      <NavigationHeader />
      <MainCarouselArea />
      <MinimalistFooter />
      <div className="absolute inset-0 opacity-30 z-[1]" data-name="Subtle Bauhaus Background Pattern" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 1280 1024\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(90.51 0 0 72.408 640 512)\\'><stop stop-color=\\'rgba(17,180,212,1)\\' offset=\\'0.017678\\'/><stop stop-color=\\'rgba(17,180,212,0)\\' offset=\\'0.017678\\'/></radialGradient></defs></svg>'), url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 1280 1024\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(90.51 0 0 72.408 640 512)\\'><stop stop-color=\\'rgba(17,180,212,1)\\' offset=\\'0.017678\\'/><stop stop-color=\\'rgba(248,251,252,1)\\' offset=\\'0.017678\\'/></radialGradient></defs></svg>')" }} />
    </div>
  );
}
