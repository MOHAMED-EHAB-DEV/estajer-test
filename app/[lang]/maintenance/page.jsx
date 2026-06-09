import React from "react";

export const metadata = {
  title: "الموقع قيد التحديث | Site Under Maintenance",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MaintenancePage({ params }) {
  const { lang } = await params;
  const isAr = lang === "ar";

  return (
    <div dir={isAr ? "rtl" : "ltr"} className={isAr ? "font-cairo" : ""}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        
        .font-cairo { font-family: 'Cairo', sans-serif; }
        
        /* ── animated blobs ── */
        @keyframes blobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-15px, 25px) scale(0.97); }
        }
        .blob { position: absolute; border-radius: 9999px; filter: blur(60px); opacity: .18; animation: blobFloat 12s ease-in-out infinite; }

        /* ── gear spin ── */
        @keyframes gearSpin { to { transform: rotate(360deg); } }
        @keyframes gearSpinReverse { to { transform: rotate(-360deg); } }
        .gear-a { animation: gearSpin 6s linear infinite; }
        .gear-b { animation: gearSpinReverse 4s linear infinite; }

        /* ── dots pulse ── */
        @keyframes dotPulse {
          0%, 100% { opacity: .3; transform: scale(.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        .dot-1 { animation: dotPulse 1.4s ease-in-out infinite; }
        .dot-2 { animation: dotPulse 1.4s ease-in-out .22s infinite; }
        .dot-3 { animation: dotPulse 1.4s ease-in-out .44s infinite; }

        /* ── card fade-up ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .7s ease-out forwards; }
        .fade-up-2 { animation: fadeUp .7s .15s ease-out both; }
        .fade-up-3 { animation: fadeUp .7s .3s ease-out both; }
        
        .contact-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
          filter: brightness(0.98);
        }
        .contact-link:active {
          transform: translateY(0);
        }
      `,
        }}
      />

      <section
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #ffffff 0%, #f7f9fc 50%, #eff2f7 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          padding: "24px",
        }}
      >
        {/* ── Animated background blobs ── */}
        <div
          className="blob"
          style={{
            width: 450,
            height: 450,
            background: "linear-gradient(135deg,#f48a42,#ff6b6b)",
            top: -120,
            right: -100,
            animationDuration: "14s",
          }}
        />
        <div
          className="blob"
          style={{
            width: 320,
            height: 320,
            background: "linear-gradient(135deg,#f48a42,#ffd93d)",
            bottom: -60,
            left: -60,
            animationDuration: "18s",
            animationDelay: "-6s",
          }}
        />
        <div
          className="blob"
          style={{
            width: 200,
            height: 200,
            background: "linear-gradient(135deg,#ff6b6b,#f48a42)",
            top: "45%",
            left: "8%",
            animationDuration: "10s",
            animationDelay: "-10s",
          }}
        />
        <div
          className="blob"
          style={{
            width: 150,
            height: 150,
            background: "linear-gradient(135deg,#f48a42,#38bdf8)",
            top: "18%",
            right: "14%",
            animationDuration: "16s",
            animationDelay: "-4s",
          }}
        />

        {/* ── Main card ── */}
        <div
          style={{
            zIndex: 10,
            width: "100%",
            maxWidth: 560,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}
        >
          {/* Gear illustration */}
          <div className="fade-up" style={{ marginBottom: 32 }}>
            <svg
              width="110"
              height="110"
              viewBox="0 0 110 110"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g className="gear-a" style={{ transformOrigin: "42px 42px" }}>
                <circle
                  cx="42"
                  cy="42"
                  r="18"
                  fill="#fff7ed"
                  stroke="#f48a42"
                  strokeWidth="4"
                />
                <circle cx="42" cy="42" r="7" fill="#f48a42" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180;
                  return (
                    <line
                      key={i}
                      x1={42 + 22 * Math.cos(rad)}
                      y1={42 + 22 * Math.sin(rad)}
                      x2={42 + 30 * Math.cos(rad)}
                      y2={42 + 30 * Math.sin(rad)}
                      stroke="#f48a42"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>
              <g className="gear-b" style={{ transformOrigin: "78px 72px" }}>
                <circle
                  cx="78"
                  cy="72"
                  r="12"
                  fill="#fff7ed"
                  stroke="#ff7d2d"
                  strokeWidth="3"
                />
                <circle cx="78" cy="72" r="5" fill="#ff7d2d" />
                {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180;
                  return (
                    <line
                      key={i}
                      x1={78 + 15 * Math.cos(rad)}
                      y1={72 + 15 * Math.sin(rad)}
                      x2={78 + 21 * Math.cos(rad)}
                      y2={72 + 21 * Math.sin(rad)}
                      stroke="#ff7d2d"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Glass card */}
          <div
            className="fade-up-2"
            style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderRadius: 32,
              border: "1px solid rgba(255,255,255,0.85)",
              padding: "48px 44px 44px",
              boxShadow:
                "0 24px 48px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)",
              width: "100%",
              textAlign: "center",
            }}
          >
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "linear-gradient(90deg,#fff7ed,#ffedd5)",
                border: "1px solid #fdba74",
                borderRadius: 999,
                padding: "6px 18px",
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#f48a42",
                  display: "inline-block",
                  boxShadow: "0 0 0 3px rgba(244,138,66,0.25)",
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#c2440e",
                  letterSpacing: "0.04em",
                }}
              >
                {isAr ? "صيانة مجدولة" : "Scheduled Maintenance"}
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: "clamp(1.8rem,5vw,2.5rem)",
                fontWeight: 900,
                color: "#1e293b",
                marginBottom: 16,
                lineHeight: 1.3,
              }}
            >
              {isAr ? "الموقع قيد التحديث" : "Site Under Maintenance"}
            </h1>

            {/* Sub-text */}
            <p
              style={{
                fontSize: "clamp(1rem,2.5vw,1.1rem)",
                color: "#64748b",
                lineHeight: 1.8,
                maxWidth: 420,
                margin: "0 auto 36px",
              }}
            >
              {isAr
                ? "نعمل على تحسين تجربتك وإضافة ميزات جديدة. سنعود قريباً بشكل أفضل! 🚀"
                : "We are working on improving your experience and adding new features. We will be back soon! 🚀"}
            </p>

            {/* Divider */}
            <div
              style={{
                height: 1,
                background:
                  "linear-gradient(90deg,transparent,#e2e8f0,transparent)",
                marginBottom: 28,
              }}
            />

            {/* Status dots */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>
                {isAr ? "جارٍ التحديث" : "Updating"}
              </span>
              <span
                className="dot-1"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#f48a42",
                  display: "inline-block",
                }}
              />
              <span
                className="dot-2"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#f48a42",
                  display: "inline-block",
                }}
              />
              <span
                className="dot-3"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#f48a42",
                  display: "inline-block",
                }}
              />
            </div>

            {/* Contact Links */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginTop: 32,
              }}
            >
              <a
                href="https://wa.me/966530636879"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "14px",
                  borderRadius: 16,
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  color: "#166534",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 700,
                  transition: "all 0.3s ease",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.284l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.768-5.764-5.768zm3.391 8.221c-.144.405-.837.774-1.218.824-.343.045-.788.082-1.272-.072-.313-.101-.715-.226-1.226-.437-2.176-.901-3.585-3.111-3.694-3.256-.11-.144-.891-1.185-.891-2.26 0-1.075.563-1.604.763-1.815.201-.211.439-.264.585-.264.148 0 .294.002.423.007.135.006.315-.052.493.376.182.439.624 1.52.678 1.632.054.113.09.244.015.394-.075.15-.113.244-.226.375-.113.132-.236.294-.338.394-.113.112-.231.236-.1.458.131.222.582.96 1.248 1.554.858.766 1.579 1.002 1.804 1.114.225.112.358.093.492-.061.135-.154.582-.676.737-.905.154-.229.308-.192.518-.113.21.079 1.332.628 1.562.743.23.115.384.172.441.267.057.094.057.545-.087.95z" />
                </svg>
                {isAr ? "تواصل عبر واتساب" : "WhatsApp"} - 0530636879
              </a>

              <a
                href="mailto:service@estajer.com"
                className="contact-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "14px",
                  borderRadius: 16,
                  background: "#fff7ed",
                  border: "1px solid #fdba74",
                  color: "#c2440e",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 700,
                  transition: "all 0.3s ease",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                service@estajer.com
              </a>
            </div>
          </div>

          {/* Footer note */}
          <p
            className="fade-up-3"
            style={{
              marginTop: 28,
              fontSize: 13,
              color: "#94a3b8",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            {isAr
              ? "نحن هنا لمساعدتكم على مدار الساعة"
              : "We are here to help you 24/7"}
          </p>
        </div>
      </section>
    </div>
  );
}
