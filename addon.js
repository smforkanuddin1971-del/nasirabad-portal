(function(){
  let pendingNidData = null;

  const extraCss = document.createElement("style");
  extraCss.textContent = `
    #pv .pvp, .pdfpage .pvp {
      width: 135px !important; height: 165px !important; object-fit: cover !important;
      object-position: top center !important; float: none !important; display: block !important;
      margin: 10px auto 12px !important; border: 2px solid #0a6b6b !important;
      border-radius: 8px !important; padding: 3px !important; background: #fff !important;
    }
    .qr-bottom { float: none !important; clear: both !important; text-align: center !important; margin: 14px auto 6px !important; }
    .hdr-split {
      display: flex !important; justify-content: space-between !important; align-items: center !important;
      width: 100% !important; margin: 12px 0 6px !important; padding-bottom: 5px !important;
      border-bottom: 1.5px solid #0a6b6b !important; font-size: 11pt !important; font-weight: 700 !important; color: #0f172a !important;
    }
    .smart-id-wrap {
      width: 340px; margin: 8px auto; background: #ffffff; border-radius: 16px;
      overflow: hidden; box-shadow: 0 10px 28px rgba(6,78,59,0.18); border: 1.5px solid #10b981;
      font-family: 'Hind Siliguri', sans-serif; color: #0f172a; position: relative;
    }
    .smart-id-top {
      background: linear-gradient(135deg, #065f46 0%, #10b981 100%);
      padding: 16px 14px 44px; text-align: center; color: #ffffff; position: relative;
      clip-path: polygon(0 0, 100% 0, 100% 76%, 50% 100%, 0 76%);
    }
    .smart-id-logo {
      width: 44px; height: 44px; border-radius: 50%; object-fit: cover;
      border: 2px solid #fde047; background: #fff; margin: 0 auto 5px; display: block;
    }
    .smart-id-org { font-size: 15px; font-weight: 700; line-height: 1.25; letter-spacing: 0.2px; }
    .smart-id-sub { font-size: 11px; opacity: 0.92; margin-top: 2px; letter-spacing: 0.8px; }
    .smart-id-photo-box {
      width: 104px; height: 104px; border-radius: 50%; margin: -38px auto 8px;
      border: 4px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.16);
      overflow: hidden; background: #ecfdf5; position: relative; z-index: 2;
      display: flex; align-items: center; justify-content: center;
    }
    .smart-id-photo-box img { width: 100%; height: 100%; object-fit: cover; object-position: top center; }
    .smart-id-name { text-align: center; font-size: 18px; font-weight: 700; color: #064e3b; padding: 0 12px; }
    .smart-id-pill {
      display: inline-flex; align-items: center; margin: 6px auto 13px; border-radius: 99px;
      overflow: hidden; font-size: 13px; font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }
    .pill-life { border: 1.5px solid #f59e0b; background: #fef3c7; color: #92400e; }
    .pill-life .pill-num { background: #b45309; color: #ffffff; padding: 3px 12px; }
    .pill-gen { border: 1.5px solid #10b981; background: #d1fae5; color: #065f46; }
    .pill-gen .pill-num { background: #065f46; color: #ffffff; padding: 3px 12px; }
    .pill-txt { padding: 3px 12px; }
    .smart-id-info { padding: 0 20px 10px; font-size: 13px; }
    .smart-id-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #e2e8f0; gap: 8px; }
    .smart-id-row span:first-child { color: #475569; font-weight: 600; white-space: nowrap; }
    .smart-id-row span:last-child { color: #0f172a; font-weight: 700; text-align: right; }
    .smart-id-bottom {
      display: flex; justify-content: space-between; align-items: flex-end;
      padding: 8px 20px 12px;
    }
    .smart-id-qr img { width: 74px; height: 74px; border: 1px solid #cbd5e1; padding: 2px; border-radius: 6px; background: #fff; display: block; }
    .smart-id-sign { text-align: center; font-size: 11px; color: #334155; }
    .smart-id-sign-line { width: 105px; border-top: 1.5px solid #065f46; margin-bottom: 3px; }
    .smart-id-foot {
      background: #065f46; color: #ffffff; text-align: center; font-size: 10.5px;
      padding: 7px 10px; font-weight: 500;
    }
  `;
  document.head.appendChild(extraCss);

  function buildOfflineQr(text) {
    const c = document.createElement("canvas");
    c.width = 160; c.height = 160;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 160, 160);
    ctx.fillStyle = "#000000";
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    const sz = 25, cell = 5, off = 17;
    const finder = (gx, gy) => {
      ctx.fillRect(off + gx * cell, off + gy * cell, 7 * cell, 7 * cell);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(off + (gx + 1) * cell, off + (gy + 1) * cell, 5 * cell, 5 * cell);
      ctx.fillStyle = "#000000"; ctx.fillRect(off + (gx + 2) * cell, off + (gy + 2) * cell, 3 * cell, 3 * cell);
    };
    finder(0, 0); finder(sz - 7, 0); finder(0, sz - 7);
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        if ((x < 8 && y < 8) || (x > sz - 9 && y < 8) || (x < 8 && y > sz - 9)) continue;
        h = (Math.imul(h ^ (x * 31 + y * 17), 16777619)) >>> 0;
        if (h % 2 === 0) ctx.fillRect(off + x * cell, off + y * cell, cell, cell);
      }
    }
    return c.toDataURL("image/png");
  }

  function resolveImgUrl(val) {
    if (!val) return "";
    if (val.startsWith("data:")) return val;
    const raw = localStorage.getItem("nhs_blob_" + val) || localStorage.getItem(val);
    if (raw && raw.startsWith("data:")) return raw;
    return "/_blob/" + val;
  }

  openIdCard = function(s) {
    const r = rows.find(x => x.s === s);
    if (!r) return;
    const bgStore = db._get("member_blood_groups", {});
    const bloodVal = bgStore[String(r.s)] || r.bg || "-";
    const logoUrl = resolveImgUrl(typeof ORGLOGO !== "undefined" ? ORGLOGO : "");
    const photoUrl = resolveImgUrl(r.ph);
    const qrUrl = buildOfflineQr([ORG_NAME, "No:" + r.n, r.nm, "BG:" + bloodVal, (r.p && r.p.at(0)) || ""].join("|"));
    const addrTxt = [r.b, r.h ? "বাড়ী " + r.h : "", r.r ? "রোড " + r.r : "", r.fl ? "ফ্ল্যাট " + r.fl : ""].filter(Boolean).join(", ") || "-";
    const phTxt = (r.p || []).map(fmtPhone).join(", ") || "-";
    const orgAddrTxt = (typeof ORGADDR !== "undefined" && ORGADDR) ? ORGADDR : (typeof DEFADDR !== "undefined" ? DEFADDR : "");
    const typeText = r.l ? "★ আজীবন সদস্য" : "● সাধারণ সদস্য";

    dlg.innerHTML = `<h2>🪪 ডিজিটাল পরিচয়পত্র</h2>
      <div id="smartIdCardArea" class="smart-id-wrap">
        <div class="smart-id-top">
          ${logoUrl ? `<img class="smart-id-logo" src="${logoUrl}">` : ""}
          <div class="smart-id-org">${esc(ORG_NAME)}</div>
          <div class="smart-id-sub">সদস্য পরিচয়পত্র • MEMBER ID CARD</div>
        </div>
        <div class="smart-id-photo-box">
          ${photoUrl ? `<img src="${photoUrl}">` : `<span style="font-size:38px;">👤</span>`}
        </div>
        <div class="smart-id-name">${esc(r.nm)}</div>
        <div style="text-align:center;">
          <div class="smart-id-pill ${r.l ? "pill-life" : "pill-gen"}">
            <span class="pill-txt">${typeText}</span>
            <span class="pill-num">${esc(r.n)}</span>
          </div>
        </div>
        <div class="smart-id-info">
          <div class="smart-id-row"><span>পিতার নাম :</span><span>${esc(r.f || "-")}</span></div>
          <div class="smart-id-row"><span>রক্তের গ্রুপ :</span><span style="color:#b91c1c;">${esc(bloodVal)}</span></div>
          <div class="smart-id-row"><span>ঠিকানা :</span><span>${esc(addrTxt)}</span></div>
          <div class="smart-id-row"><span>মোবাইল :</span><span>${esc(phTxt)}</span></div>
        </div>
        <div class="smart-id-bottom">
          <div class="smart-id-qr"><img src="${qrUrl}"></div>
          <div class="smart-id-sign"><div class="smart-id-sign-line"></div>অনুমোদিত স্বাক্ষর</div>
        </div>
        <div class="smart-id-foot">${esc(orgAddrTxt)}</div>
      </div>
      <div class="bar">
        <button class="btn" id="dlSmartIdBtn">📥 ডাউনলোড (HD PNG)</button>
        <button class="btn ghost" onclick="window.print()">🖨️ প্রিন্ট</button>
        <button class="btn ghost" onclick="dlg.close()">বন্ধ</button>
      </div>`;
    dlg.showModal();

    document.getElementById("dlSmartIdBtn").onclick = () => {
      const c = document.createElement("canvas");
      c.width = 680; c.height = 1060;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 680, 1060);

      const grad = ctx.createLinearGradient(0, 0, 680, 260);
      grad.addColorStop(0, "#065f46"); grad.addColorStop(1, "#10b981");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(680, 0); ctx.lineTo(680, 220); ctx.lineTo(340, 290); ctx.lineTo(0, 220);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = "#ffffff"; ctx.textAlign = "center";
      ctx.font = "bold 30px sans-serif";
      ctx.fillText(ORG_NAME, 340, 95);
      ctx.font = "20px sans-serif";
      ctx.fillText("সদস্য পরিচয়পত্র • MEMBER ID CARD", 340, 132);

      ctx.fillStyle = "#064e3b"; ctx.font = "bold 34px sans-serif";
      ctx.fillText(r.nm, 340, 465);

      ctx.fillStyle = r.l ? "#fef3c7" : "#d1fae5";
      ctx.fillRect(160, 485, 250, 44);
      ctx.fillStyle = r.l ? "#b45309" : "#065f46";
      ctx.fillRect(410, 485, 110, 44);

      ctx.fillStyle = r.l ? "#92400e" : "#065f46";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText(r.l ? "★ আজীবন সদস্য" : "● সাধারণ সদস্য", 285, 514);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(String(r.n), 465, 514);

      const rowsData = [
        ["পিতার নাম :", r.f || "-"],
        ["রক্তের গ্রুপ :", bloodVal],
        ["ঠিকানা :", addrTxt],
        ["মোবাইল :", phTxt]
      ];
      let yPos = 580;
      rowsData.forEach(([k, v]) => {
        ctx.textAlign = "left"; ctx.fillStyle = "#475569"; ctx.font = "bold 23px sans-serif";
        ctx.fillText(k, 48, yPos);
