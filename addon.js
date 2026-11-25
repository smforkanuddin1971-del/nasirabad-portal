(function(){
  const toEn = s => String(s || "").replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d));
  const esc = v => String(v == null ? "" : v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const qp = new URLSearchParams(location.search);
  const isMemberView = Boolean(qp.get("member"));
  const isVoterView = qp.get("voter") === "1";

  // ১. পুরোনো সব সংঘর্ষকারী CSS ও অযাচিত বক্স সম্পূর্ণ পরিষ্কার করা
  function purgeOldConflicts() {
    document.querySelectorAll("style").forEach(st => {
      const t = st.textContent || "";
      if (
        t.includes("nhsMoreDrawer") ||
        t.includes("nhsSmartThemeStyle") ||
        t.includes("nhsCleanThStyle") ||
        t.includes("nhsOptThStyle") ||
        t.includes("nhsRealBrandLogo") ||
        t.includes("nhsLogoUploadBox")
      ) {
        st.remove();
      }
    });
    [
      "nhsMoreDrawer", "nhsMoreMenuBtn", "nhsCleanToolsBox", "nhsCleanToolsBtn",
      "nhsCompactMenuBtn", "nhsCompactMenuBox", "nhsNeatToggleBtn", "nhsLogoUploadBox",
      "nhsOrgCustomBox", "nhsCleanThBox", "nhsSettingsThemeBox", "nhsThemeBar",
      "nhsTopLogoImg", "nhsRealBrandLogo", "nhsCenterFinalLogo", "nhsDynamicBrandHeader",
      "nhsSingleMenuBtn", "nhsSingleMenuPanel"
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
  }
  purgeOldConflicts();

  // ২. পর্দা খোলার স্মার্ট ওয়েলকাম স্ক্রিন (২ সেকেন্ড পর মসৃণভাবে খুলবে)
  if (!isMemberView && !isVoterView && !document.getElementById("nhsMasterSplash")) {
    const savedLogo = localStorage.getItem("nhs_master_logo") || "";
    const orgTitle = document.querySelector("header h1, .topbar h1")?.textContent?.trim() || "নাসিরাবাদ হাউজিং সোসাইটি কল্যাণ পরিষদ";
    const sp = document.createElement("div");
    sp.id = "nhsMasterSplash";
    sp.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:linear-gradient(135deg,#064e3b 0%,#0a6b6b 60%,#042f2e 100%);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;transition:opacity .55s ease;font-family:sans-serif;";
    sp.innerHTML = `
      ${savedLogo.startsWith("data:image/") ? `<img src="${savedLogo}" style="width:130px;height:130px;object-fit:contain;border-radius:50%;background:#fff;padding:7px;margin-bottom:14px;border:3px solid #fde047;box-shadow:0 8px 24px rgba(0,0,0,.35);">` : `<div style="font-size:3.2rem;margin-bottom:12px;">🏛️</div>`}
      <div style="font-size:1.32rem;font-weight:800;line-height:1.4;max-width:420px;">${esc(orgTitle)}</div>
      <div style="font-size:.86rem;color:#a7f3d0;margin-top:6px;">ডিজিটাল সদস্য ও তথ্য ব্যবস্থাপনা পোর্টাল</div>
      <div style="position:absolute;bottom:22px;font-size:.82rem;color:#fde047;font-weight:700;">Developed & Powered by S. M. Forkan Uddin</div>
    `;
    document.body.appendChild(sp);
    sp.onclick = () => sp.remove();
    setTimeout(() => { sp.style.opacity = "0"; setTimeout(() => sp.remove(), 550); }, 2000);
  }

  // ৩. ভোটার লিংক (?voter=1) পাসওয়ার্ড ছাড়াই সরাসরি খোলা ও তালিকা প্রদর্শন
  if (isVoterView) {
    const vt = setInterval(function() {
      document.querySelectorAll("div, dialog, section").forEach(el => {
        if ((el.textContent || "").includes("পাসওয়ার্ড") && el.querySelector("input[type='password']")) {
          el.remove();
        }
      });
      if (document.body) {
        document.body.style.overflow = "auto";
        document.body.style.visibility = "visible";
      }
      const vBtn = Array.from(document.querySelectorAll("button")).find(b => {
        const tx = (b.textContent || "").trim();
        return tx.startsWith("ভোটার") && !tx.includes("বাদ") && !tx.includes("লিংক");
      });
      if (vBtn && !vBtn.dataset.voterOpened) {
        vBtn.dataset.voterOpened = "1";
        vBtn.click();
        clearInterval(vt);
      }
    }, 250);
    setTimeout(() => clearInterval(vt), 5000);
  }

  // ৪. বড় লোগো প্রদর্শন ও পরিচ্ছন্ন ড্যাশবোর্ড মেনুবার (ভেতরে "লোগো ও ঠিকানা" বাটন ছাড়া)
  function applyCleanHeaderAndMenu() {
    purgeOldConflicts();
    const savedLogo = localStorage.getItem("nhs_master_logo") || "";
    const hdr = document.querySelector("header, .topbar, .hdr");
    if (hdr && savedLogo.startsWith("data:image/")) {
      let topLogo = document.getElementById("nhsMasterHeaderLogo");
      if (!topLogo) {
        const h1 = hdr.querySelector("h1");
        if (h1) {
          topLogo = document.createElement("img");
          topLogo.id = "nhsMasterHeaderLogo";
          h1.insertAdjacentElement("beforebegin", topLogo);
        }
      }
      if (topLogo) {
        topLogo.src = savedLogo;
        topLogo.style.cssText = "display:block !important;width:84px !important;height:84px !important;object-fit:contain !important;border-radius:50% !important;background:#fff !important;padding:4px !important;margin:0 auto 6px !important;border:2px solid #fde047 !important;box-shadow:0 3px 10px rgba(0,0,0,.22) !important;";
      }
    }

    if (!hdr || isMemberView || isVoterView || document.getElementById("nhsCleanMenuBtn")) return;
    const sInp = Array.from(hdr.querySelectorAll("input")).find(i => (i.placeholder || "").includes("খুঁজুন") || (i.placeholder || "").includes("নাম"));
    if (!sInp) return;

    let sRow = sInp;
    while (sRow.parentElement && sRow.parentElement !== hdr) sRow = sRow.parentElement;

    const belowItems = [];
    let nx = sRow.nextElementSibling;
    while (nx) {
      if (nx.id !== "nhsCleanMenuBtn" && nx.id !== "nhsCleanMenuBox") belowItems.push(nx);
      nx = nx.nextElementSibling;
    }

    if (belowItems.length > 0) {
      const mBtn = document.createElement("button");
      mBtn.id = "nhsCleanMenuBtn";
      mBtn.type = "button";
      mBtn.style.cssText = "display:block;width:100%;margin-top:8px;padding:7px 12px;background:#065f46;color:#fff;border:1px solid rgba(255,255,255,.45);border-radius:8px;font-weight:700;font-size:.86rem;cursor:pointer;text-align:center;";
      mBtn.textContent = "☰ মেনু ও ফিল্টার দেখুন ▾";

      const mBox = document.createElement("div");
      mBox.id = "nhsCleanMenuBox";
      mBox.style.cssText = "display:none;margin-top:8px;";

      belowItems.forEach(el => {
        Array.from(el.querySelectorAll("button")).forEach(b => {
          if ((b.textContent || "").includes("লোগো ও ঠিকানা")) b.remove();
        });
        mBox.appendChild(el);
      });

      sRow.insertAdjacentElement("afterend", mBtn);
      mBtn.insertAdjacentElement("afterend", mBox);

      mBtn.onclick = function(e) {
        e.preventDefault();
        const open = mBox.style.display === "block";
        mBox.style.display = open ? "none" : "block";
        mBtn.textContent = open ? "☰ মেনু ও ফিল্টার দেখুন ▾" : "✕ মেনু বন্ধ করুন ▴";
      };
    }
  }
  setTimeout(applyCleanHeaderAndMenu, 250);

  // ৫. সেটিংস পপআপের একদম নিচে ("বন্ধ" বাটনের ওপরে) লোগো আপলোড ও পরিবর্তনের ঘর
  document.addEventListener("click", function(e) {
    if ((e.target.textContent || "").includes("সেটিংস")) {
      setTimeout(function() {
        if (document.getElementById("nhsMasterLogoPicker")) return;
        const closeBtn = Array.from(document.querySelectorAll("button")).find(b => (b.textContent || "").trim() === "বন্ধ");
        if (!closeBtn) return;

        const box = document.createElement("div");
        box.id = "nhsMasterLogoPicker";
        box.style.cssText = "margin:10px 0;padding:10px;background:#ecfdf5;border:1.5px solid #065f46;border-radius:8px;text-align:left;color:#0f172a;font-size:.86rem;";
        box.innerHTML = `
          <div style="font-weight:700;color:#064e3b;margin-bottom:6px;">🖼️ প্রতিষ্ঠানের লোগো আপলোড / পরিবর্তন:</div>
          <input id="nhsMasterLogoFile" type="file" accept="image/*" style="width:100%;">
        `;
        closeBtn.insertAdjacentElement("beforebegin", box);

        document.getElementById("nhsMasterLogoFile").onchange = function(ev) {
          const f = ev.target.files && ev.target.files.at(0);
          if (!f) return;
          const rd = new FileReader();
          rd.onload = rEv => {
            const img = new Image();
            img.onload = () => {
              const cv = document.createElement("canvas");
              cv.width = 240; cv.height = 240;
              cv.getContext("2d").drawImage(img, 0, 0, 240, 240);
              localStorage.setItem("nhs_master_logo", cv.toDataURL("image/png", 0.92));
              applyCleanHeaderAndMenu();
              alert("প্রতিষ্ঠানের লোগো সফলভাবে আপলোড হয়েছে!");
            };
            img.src = rEv.target.result;
          };
          rd.readAsDataURL(f);
        };
      }, 250);
    }
  });

  // ৬. ছবিসহ লিংক, ফিরতি WhatsApp/Email বার্তা ও নির্বাচন কমিশন (EC) স্টাইল ডাউনলোড কপি
  setInterval(function() {
    const msgTa = document.getElementById("mWaMsg");
    if (msgTa && msgTa.value.includes("member=") && !msgTa.value.includes("&photo=")) {
      const mMatch = msgTa.value.match(/member=([০-৯\d]+)/);
      if (mMatch && typeof rows !== "undefined" && Array.isArray(rows)) {
        const mNo = toEn(mMatch.at(1));
        const mem = rows.find(r => toEn(r.n) === mNo);
        const pUrl = mem ? (mem.p || mem.img || mem.photo || "") : "";
        if (pUrl.startsWith("http")) {
          msgTa.value = msgTa.value.replace(/(https?:\/\/[^\s]+)/, "$1&photo=" + encodeURIComponent(pUrl));
          msgTa.dispatchEvent(new Event("input"));
        }
      }
    }

    const subBtn = document.getElementById("uf_sub");
    if (subBtn && window.__nhsUploadedPhotoUrl && subBtn.href) {
      const pLine = encodeURIComponent("\nছবির লিংক: " + window.__nhsUploadedPhotoUrl);
      if (!subBtn.href.includes(encodeURIComponent(window.__nhsUploadedPhotoUrl))) subBtn.href += pLine;
      const emBtn = document.getElementById("retEmBtn");
      if (emBtn && emBtn.href && !emBtn.href.includes(encodeURIComponent(window.__nhsUploadedPhotoUrl))) emBtn.href += pLine;
    }



