"use client";

import Link from "next/link";

const footerLinks = {
  "Get Started": [
    { label: "REQUEST A DEMO", href: "#" },
    { label: "PRICING", href: "#" },
    { label: "ENTERPRISE", href: "#" },
  ],
  Company: [
    { label: "ABOUT", href: "#" },
    { label: "CAREERS", href: "#" },
    { label: "TRUST", href: "#" },
    { label: "TERMS", href: "#" },
    { label: "PRIVACY", href: "#" },
  ],
  Connect: [
    { label: "COLLECTIVE", href: "#" },
  ],
  Resources: [
    { label: "KNOWLEDGE CENTER", href: "#" },
  ],
};

const socialIcons = [
  {
    label: "LinkedIn",
    href: "#",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "Instagram",
    href: "#",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "Discord",
    href: "#",
    path: "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z",
  },
];

export default function Footer() {
  return (
    <footer className="relative w-full bg-[#2b2d2a]">
      {/* Main CTA block */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-20 md:pt-32">
        <div className="bg-[#565955] rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 text-center">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-tight mb-6">
            Artificial Intelligence
            <br />
            <span className="text-white/70">+ Human Creativity</span>
          </h2>
          <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto mb-10">
            Weavy is a new way to create. We&apos;re bridging the gap between AI capabilities and human creativity, to continue the tradition of craft in artistic expression. We call it Artistic Intelligence.
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-10 py-4 bg-[#f7ff9e] text-[#252525] rounded-full text-lg font-semibold hover:bg-[#eaeada] transition-colors shadow-lg hover:shadow-xl"
          >
            Start Now — it&apos;s free
          </Link>
        </div>
      </div>

      {/* Links & info section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Logo column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex flex-col gap-[3px]">
                <div className="w-5 h-[2.5px] bg-white rounded-full" />
                <div className="w-5 h-[2.5px] bg-white rounded-full" />
                <div className="w-5 h-[2.5px] bg-white rounded-full" />
              </div>
              <span className="text-white text-lg font-semibold tracking-tight">
                weavy
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed mb-6">
              AI Creative Suite for
              <br />
              visual professionals.
            </p>
            <div className="flex gap-4">
              {socialIcons.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label={social.label}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30 uppercase tracking-widest">
            WEAVY &copy; {new Date().getFullYear()}.&nbsp;&nbsp;&nbsp;&nbsp;ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
