/* ==============================================================================
   PEO CORE - BİLİMSEL SİMÜLASYON MOTORU (v1.6.5 - Genişletilmiş Elektrokimya & Substrat)
============================================================================== */

const PeoSimulasyon = {
    aktifGrafikUT: null,
    aktifGrafikOsiloskop: null,
    aktifGrafikTafel: null,
    aktifGrafikNyquist: null,

    // 🔬 Kaan'ın Güncellenmiş Substrat Kütüphanesi
    substratVeri: {
        "Al1050": { kirilma: 420, plato: 460, stabiliteKatsayisi: 2, renk: "#ffd700", isim: "Al 1000 Serisi (Saf Alüminyum) -> Al1050", analiz: "Teorik temeldir. Alaşım elementi içermediği için plazma çok pürüzsüz ve homojendir. Ancak altlık çok yumuşak olduğu için 'Yumurta Kabuğu' (Eggshell) etkisi yaratır, endüstriyel yüklere dayanamaz." },
        
        "Al2024": { kirilma: 380, plato: 430, stabiliteKatsayisi: 18, renk: "#ff7b72", isim: "Al 2000 Serisi (Cu İçerikli) -> Al2024", analiz: "PEO'nun Aşil Topuğudur. İçerdiği Bakır (Cu) farklı bir potansiyelde çözündüğü için yoğun oksijen gazı çıkışı (gaz evrimi) yaratır. Plazma odaklanamaz, sürekli lokal yanıklar (burn-out) ve aşırı gözeneklilik oluşur." },
        
        "Al3004": { kirilma: 440, plato: 490, stabiliteKatsayisi: 4, renk: "#a1d586", isim: "Al 3000 Serisi (Mn İçerikli) -> Al3004", analiz: "Mangan (Mn) katkısı agresif bozulmalara yol açmaz. PEO işlemi sırasında nispeten kararlı ve homojen bir oksit tabakası oluşumuna izin verir (Korzekwa, 2023)." },
        
        "Al5083": { kirilma: 460, plato: 510, stabiliteKatsayisi: 5, renk: "#58a6ff", isim: "Al 5000 Serisi (Mg İçerikli) -> Al5083", analiz: "Saf alüminyuma kıyasla anodik oksidasyon hızı çok dengelidir. Tungstat gibi katkılar eklendiğinde kalınlık ve sertlik dramatik olarak artar. Denizcilik uygulamaları için mükemmeldir." },
        
        "Al6061": { kirilma: 480, plato: 540, stabiliteKatsayisi: 3, renk: "#0ac8b9", isim: "Al 6000 Serisi (Mg-Si İçerikli) -> Al6061", analiz: "PEO işlemine en 'itaatkar' (benchmark) alaşımdır. Hakimizad (2018) çalışmasına göre, tungstat/boraks varlığında termodinamik olarak en kararlı &alpha;-Al<sub>2</sub>O<sub>3</sub> (Korindon) fazına geçişi muazzam bir şekilde teşvik eder." },
        
        "Al7075": { kirilma: 410, plato: 470, stabiliteKatsayisi: 12, renk: "#d2a8ff", isim: "Al 7000 Serisi (Zn-Mg İçerikli) -> Al7075", analiz: "Mekanik olarak çok güçlü olsa da, içerdiği Çinko (Zn) oksit büyümesini bozar ve Alfa-Alümina oluşumunu engeller. Kaplama amorf ve ince kalmaya meyillidir, gelişmiş darbeli (pulsed) akımlar gerektirir." },
        
        "AlA356": { kirilma: 350, plato: 410, stabiliteKatsayisi: 22, renk: "#f85149", isim: "Döküm Alüminyum (Al-Si) -> AlA356", analiz: "ASO/PEO için en inatçı gruptur. Matris içindeki Silisyum (Si) plakacıkları plazmaya direnir ve büyümeyi bloke eder (Clyne & Troughton, 2018). h-BN gibi nanopartikül mühürlemeleri şarttır." },

        "Ti6Al4V": { kirilma: 220, plato: 290, stabiliteKatsayisi: 4, renk: "#c9d1d9", isim: "Titanyum Alaşımı (Ti-6Al-4V) -> Ti6Al4V", analiz: "Termodinamik pasifleşme eğilimi devasadır. Alüminyuma kıyasla dielektrik kırılma çok daha düşük voltajlarda gerçekleşir. PEO sırasında Anataz fazından Rutil fazına geçiş yapar (Biyomedikal implantlar)." },
        
        "MgAZ31": { kirilma: 180, plato: 240, stabiliteKatsayisi: 6, renk: "#e88245", isim: "Magnezyum Alaşımı (AZ31) -> MgAZ31", analiz: "En aktif valf metalidir. Doğal oksidi çok gözenekli ve suda çözünmeye meyillidir (Korozyona aşırı duyarlı). PEO, magnezyumu korumak için kalın bir MgO/Spinel zırhı yaratır ancak voltaj eşikleri çok düşüktür." },
        
        "Zr702":   { kirilma: 310, plato: 380, stabiliteKatsayisi: 3, renk: "#9ea1f9", isim: "Zirkonyum (Zr 702) -> Zr702", analiz: "Çok yüksek korozyon direncine sahip yalıtkan bir dielektrik film inşa eder. Plazma kırılma rejimi stabildir. Nükleer reaktör kılıfları ve biyo-aktif ortopedi için kullanılır." },
        
        "TaPure":  { kirilma: 550, plato: 620, stabiliteKatsayisi: 1, renk: "#ffb84d", isim: "Tantal (Saf Ta) -> TaPure", analiz: "Mükemmel valf (kapasitif) metali. Elektriksel geçirgenliği (dielektrik sabiti) devasa olduğu için voltaj çok yüksek seviyelere çıkar. PEO süreci çok kararlı ve gürültüsüz (noise-free) ilerler." }
    },

    toggleMenu: function(menuId, btnId) {
        document.querySelectorAll('.alt-menu-kapsayici').forEach(m => m.classList.remove('acik'));
        document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('aktif'));
        document.getElementById(menuId)?.classList.add('acik');
        document.getElementById(btnId)?.classList.add('aktif');
    },

    yukle: function(btnElement, simType) {
        document.querySelectorAll('.alt-btn').forEach(btn => btn.classList.remove('aktif'));
        if(btnElement) btnElement.classList.add('aktif');

        const contentDiv = document.getElementById('app-content');
        if (!contentDiv) return;

        if (simType === 'voltaj-zaman') {
            contentDiv.innerHTML = this.cizUtEgrisiArayuzu();
            this.guncelleArayuzSecenekleri();
            this.baslatUtGrafigi();
        } 
        else if (simType === 'osiloskop') {
            contentDiv.innerHTML = this.cizOsiloskopArayuzu();
            this.cizOsiloskopGrafigi();
        }
        else if (simType === 'elektrokimya') {
            contentDiv.innerHTML = this.cizElektrokimyaArayuzu();
            this.baslatElektrokimyaGrafikleri();
        }
        else if (simType === 'faz') {
            contentDiv.innerHTML = this.cizFazArayuzu();
            this.hesaplaFaz();
        }
        else if (simType === 'yayin-grafigi') {
            contentDiv.innerHTML = this.cizYayinGrafikArayuzu();
        }
    },

    guncelleArayuzSecenekleri: function() {
        const selectMenu = document.getElementById('global-substrat');
        if (!selectMenu) return;
        
        let mevcutSecim = localStorage.getItem("peo-substrat") || "Al6061";
        selectMenu.innerHTML = "";
        
        for (const [key, value] of Object.entries(this.substratVeri)) {
            const option = document.createElement("option");
            option.value = key;
            option.text = value.isim;
            if(key === mevcutSecim) option.selected = true;
            selectMenu.appendChild(option);
        }
        
        selectMenu.onchange = () => {
            localStorage.setItem("peo-substrat", selectMenu.value);
            if(document.getElementById('peo-ut-chart')) this.hesaplaUt();
        };
    },

    // ==========================================
    // ⚡ 1. VOLTAJ-ZAMAN (U-t) MODÜLÜ
    // ==========================================
    cizUtEgrisiArayuzu: function() {
        return `
        <div style="max-width: 1200px; margin: 0 auto; animation: fadein 0.3s ease;">
            <h1 style="color: var(--text-light); border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0;">⚡ Kinetik Analizler: Voltaj-Zaman (U-t) Eğrisi</h1>
            
            <div id="substrat-analiz-kutusu" style="background: rgba(88, 166, 255, 0.05); border: 1px solid rgba(88, 166, 255, 0.2); border-radius: 8px; padding: 15px 20px; font-size: 0.9em; color: var(--alumina-gray); line-height: 1.6; margin-bottom: 20px; min-height: 80px;">
            </div>

            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 300px; background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <h3 style="color:var(--text-light); margin-top:0; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">🎛️ Parametre Kontrolü</h3>
                    <div style="margin-top: 20px;">
                        <div class="sim-label"><span style="font-weight:bold; color:var(--text-main);">💧 Boraks Konsantrasyonu</span><span id="val-boraks" style="color:var(--plasma-blue); font-weight:bold;">0 g/L</span></div>
                        <input type="range" id="slider-boraks" min="0" max="15" step="1" value="0" style="width: 100%; margin-top:10px; accent-color: var(--plasma-blue);" oninput="PeoSimulasyon.hesaplaUt()">
                    </div>
                    <div style="margin-top: 30px;">
                        <div class="sim-label"><span style="font-weight:bold; color:var(--text-main);">⚡ Akım Yoğunluğu</span><span id="val-akim" style="color:var(--spark-orange); font-weight:bold;">5 A/dm²</span></div>
                        <input type="range" id="slider-akim" min="2" max="20" step="1" value="5" style="width: 100%; margin-top:10px; accent-color: var(--spark-orange);" oninput="PeoSimulasyon.hesaplaUt()">
                    </div>
                    <div style="margin-top: 40px; border-top: 1px dashed var(--border-color); padding-top: 20px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 10px;"><span style="color:var(--text-main);">Anlık Kırılma Voltajı:</span><b id="hesap-kirilma" style="color:var(--alumina-gray);">450 V</b></div>
                        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-main);">Kararlı Plato Voltajı:</span><b id="hesap-plato" style="color:var(--plasma-blue);">500 V</b></div>
                    </div>
                </div>
                <div style="flex: 2; min-width: 400px; background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px;">
                    <div style="position: relative; height: 350px; width: 100%;"><canvas id="peo-ut-chart"></canvas></div>
                </div>
            </div>
        </div>`;
    },

    hesaplaUt: function() {
        let boraks = parseFloat(document.getElementById('slider-boraks').value);
        let akim = parseFloat(document.getElementById('slider-akim').value);
        let substratElement = document.getElementById('global-substrat');
        let seciliSubstrat = substratElement ? substratElement.value : "Al6061";
        
        let sVeri = this.substratVeri[seciliSubstrat];

        let analizKutusu = document.getElementById('substrat-analiz-kutusu');
        if(analizKutusu) {
            analizKutusu.innerHTML = `
                <div style="display:flex; align-items:center; gap: 10px; margin-bottom: 8px;">
                    <span style="display:inline-block; width:15px; height:15px; border-radius:50%; background-color:${sVeri.renk}; box-shadow: 0 0 10px ${sVeri.renk};"></span>
                    <b style="color: ${sVeri.renk}; font-size:1.1em;">${sVeri.isim} Davranış Modeli</b>
                </div>
                <div>${sVeri.analiz}</div>
                <div style="margin-top:8px; font-size:0.9em;">
                    <b style="color:var(--plasma-blue);">İletkenlik Etkisi:</b> Elektrolite Boraks eklendikçe iyonik iletkenlik artar, bu durum dielektrik bariyer direncini düşürerek kırılma ve plato voltajlarını aşağı çeker.
                </div>`;
        }

        document.getElementById('val-boraks').innerText = boraks + " g/L";
        document.getElementById('val-akim').innerText = akim + " A/dm²";

        let iletkenlik = 1 - (boraks * 0.015);
        let anlikKirilma = (sVeri.kirilma * iletkenlik) - (akim * 1.2);
        let anlikPlato = (sVeri.plato * iletkenlik) + (akim * 1.5);

        document.getElementById('hesap-kirilma').innerText = Math.round(anlikKirilma) + " V";
        document.getElementById('hesap-plato').innerText = Math.round(anlikPlato) + " V";

        let zEkseni = [], vEkseni = [];
        let faradayHizi = akim * 8; 

        for(let saniye = 0; saniye <= 600; saniye += 10) {
            zEkseni.push(saniye);
            if (saniye * faradayHizi < anlikKirilma) {
                vEkseni.push(saniye * faradayHizi);
            } else if (saniye * faradayHizi >= anlikKirilma && saniye < 150) {
                let yavaslayan = anlikKirilma + ((saniye - (anlikKirilma / faradayHizi)) * 0.5);
                vEkseni.push(Math.min(yavaslayan, anlikPlato));
            } else {
                let noise = (Math.random() - 0.5) * sVeri.stabiliteKatsayisi * 2; 
                vEkseni.push(anlikPlato + noise); 
            }
        }

        if (this.aktifGrafikUT) {
            this.aktifGrafikUT.data.labels = zEkseni;
            this.aktifGrafikUT.data.datasets[0].data = vEkseni;
            this.aktifGrafikUT.data.datasets[0].borderColor = sVeri.renk; 
            
            if (seciliSubstrat.startsWith("Al") && boraks > 0) {
                this.aktifGrafikUT.data.datasets[0].borderColor = '#58a6ff'; 
                this.aktifGrafikUT.data.datasets[0].backgroundColor = 'rgba(88, 166, 255, 0.1)';
            } else {
                this.aktifGrafikUT.data.datasets[0].backgroundColor = 'rgba(201, 209, 217, 0.05)';
            }
            this.aktifGrafikUT.update();
        }
    },

    baslatUtGrafigi: function() {
        const ctx = document.getElementById('peo-ut-chart');
        if (!ctx) return;
        if (this.aktifGrafikUT) this.aktifGrafikUT.destroy();

        this.aktifGrafikUT = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Voltaj (V)', data: [], borderColor: '#0ac8b9', borderWidth: 3, backgroundColor: 'rgba(201, 209, 217, 0.05)', fill: true, tension: 0.4, pointRadius: 0 }] },
            options: {
                responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                scales: { 
                    x: { 
                        title: { display: true, text: 'İşlem Süresi (Saniye)', color: '#c9d1d9', font: { size: 14, weight: 'bold' } }, 
                        grid: { color: 'rgba(201, 209, 217, 0.05)' }, 
                        ticks: { color: '#8b949e' } 
                    }, 
                    y: { 
                        title: { display: true, text: 'Anodik Voltaj (V)', color: '#c9d1d9', font: { size: 14, weight: 'bold' } }, 
                        grid: { color: 'rgba(201, 209, 217, 0.05)' }, 
                        ticks: { color: '#8b949e' }, 
                        min: 0, max: 700 
                    } 
                },
                animation: { duration: 200 }
            }
        });
        this.hesaplaUt();
    },

    // ==========================================
    // 📡 2. DARBELİ AKIM OSİLOSKOP MODÜLÜ
    // ==========================================
    cizOsiloskopArayuzu: function() {
        return `
        <div style="max-width: 1200px; margin: 0 auto; animation: fadein 0.3s ease;">
            <h1 style="color: var(--text-light); border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0;">📡 Kinetik Analizler: Darbeli Akım Osiloskopu</h1>
            
            <div style="background: rgba(88, 166, 255, 0.05); border: 1px solid rgba(88, 166, 255, 0.2); border-radius: 8px; padding: 15px 20px; font-size: 0.9em; color: var(--alumina-gray); line-height: 1.6; margin-bottom: 20px;">
                <b style="color: var(--plasma-blue);">ℹ️ Model: Clyne & Troughton (2018) Termal Şok Teorisi</b><br>
                Yüksek termal kütleli numunelerde yanıkları (burn-out) engellemek ve en sert <b>&alpha;-Al<sub>2</sub>O<sub>3</sub></b> fazını elde etmek için şok soğutma (quenching) şarttır. <b>Frekans</b> ve <b>Görev Döngüsü</b> ile oynayarak <b>T<sub>off</sub></b> dinlenme sürelerini optimize edebilirsiniz.
            </div>

            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 300px; background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <h3 style="color:var(--text-light); margin-top:0; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">🎛️ Güç Kaynağı Kontrolü</h3>
                    <div style="margin-top: 20px;">
                        <div class="sim-label"><span style="font-weight:bold; color:var(--text-main);">⏱️ Frekans (Hz)</span><span id="val-frekans" style="color:var(--alumina-gray); font-weight:bold;">1000 Hz</span></div>
                        <input type="range" id="slider-frekans" min="50" max="2000" step="50" value="1000" style="width: 100%; margin-top:10px; accent-color: var(--alumina-gray);" oninput="PeoSimulasyon.hesaplaOsiloskop()">
                    </div>
                    <div style="margin-top: 30px;">
                        <div class="sim-label"><span style="font-weight:bold; color:var(--text-main);">🔥 Görev Döngüsü (Duty Cycle)</span><span id="val-duty" style="color:var(--spark-orange); font-weight:bold;">20%</span></div>
                        <input type="range" id="slider-duty" min="10" max="90" step="5" value="20" style="width: 100%; margin-top:10px; accent-color: var(--spark-orange);" oninput="PeoSimulasyon.hesaplaOsiloskop()">
                    </div>
                    <div style="margin-top: 30px; border-top: 1px dashed var(--border-color); padding-top: 20px; background: rgba(0,0,0,0.2); border-radius: 6px; padding: 15px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 10px;"><span style="color:var(--text-main);">Açık Kalma (T<sub>on</sub>):</span><b id="hesap-ton" style="color:var(--spark-orange);">0.2 ms</b></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom: 10px;"><span style="color:var(--text-main);">Kapalı/Soğuma (T<sub>off</sub>):</span><b id="hesap-toff" style="color:var(--plasma-blue);">0.8 ms</b></div>
                        <div style="display:flex; justify-content:space-between; border-top: 1px solid var(--border-color); padding-top: 8px; margin-top: 5px;"><span style="color:var(--text-main);">Toplam Periyot (T):</span><b id="hesap-periyot" style="color:var(--alumina-gray);">1.0 ms</b></div>
                    </div>

                    <div id="osiloskop-analiz-kutusu" style="margin-top: 20px; background: rgba(0,0,0,0.3); border-left: 4px solid #3fb950; border-radius: 6px; padding: 15px; font-size: 0.85em; line-height: 1.5; color: var(--text-light); transition: all 0.3s ease;">
                        Analiz Yükleniyor...
                    </div>

                </div>
                <div style="flex: 2; min-width: 400px; background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; position: relative;">
                    <div style="position: absolute; top:0; left:0; right:0; bottom:0; background-image: linear-gradient(rgba(88, 166, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 166, 255, 0.05) 1px, transparent 1px); background-size: 40px 40px; border-radius:8px; pointer-events:none;"></div>
                    <div style="position: relative; height: 350px; width: 100%;"><canvas id="peo-osiloskop-chart"></canvas></div>
                </div>
            </div>
        </div>`;
    },

    hesaplaOsiloskop: function() {
        let frekans = parseFloat(document.getElementById('slider-frekans').value);
        let dutyCycle = parseFloat(document.getElementById('slider-duty').value);

        document.getElementById('val-frekans').innerText = frekans + " Hz";
        document.getElementById('val-duty').innerText = dutyCycle + "%";

        let toplamPeriyot_sn = 1 / frekans;
        let toplamPeriyot_ms = toplamPeriyot_sn * 1000;
        let t_on = toplamPeriyot_ms * (dutyCycle / 100);
        let t_off = toplamPeriyot_ms - t_on;

        document.getElementById('hesap-ton').innerHTML = t_on.toFixed(2) + " ms";
        document.getElementById('hesap-toff').innerHTML = t_off.toFixed(2) + " ms";
        document.getElementById('hesap-periyot').innerHTML = toplamPeriyot_ms.toFixed(2) + " ms";

        // 🎯 TERMAL STRES VE FAZ KİNETİĞİ ANALİZİ
        let analizKutusu = document.getElementById('osiloskop-analiz-kutusu');
        if (analizKutusu) {
            if (dutyCycle > 60) {
                analizKutusu.style.borderLeftColor = "#f85149";
                analizKutusu.innerHTML = `⚠️ <b style="color:#f85149; text-transform:uppercase;">Duty Cycle > %60: "Termal Yük Riski (Burn-out)</b><br><br><b>T<sub>off</sub></b> süresi (${t_off.toFixed(2)} ms), deşarj kanalındaki eriyik alüminanın soğuması için çok kısa. Kaplamada 'burn-out' (lokal ergime) riski maksimumda. Yüzeyde amorf ve süngerimsi <b>&gamma;-fazı</b> birikimi olacaktır.`;
            } else if (dutyCycle < 30) {
                analizKutusu.style.borderLeftColor = "#58a6ff";
                analizKutusu.innerHTML = `❄️ <b style="color:#58a6ff; text-transform:uppercase;">Duty Cycle < %30: "Yüksek Soğutma (Quenching)</b><br><br>Geniş <b>T<sub>off</sub></b> süresi (${t_off.toFixed(2)} ms) sayesinde plazma kanalı mükemmel soğur. Eriyik alümina yüksek yoğunluklu ve ultra-sert <b>&alpha;-Al<sub>2</sub>O<sub>3</sub></b> fazına dönüşür. Ancak genel kaplama kalınlığı büyüme hızı yavaşlar.`;
            } else {
                analizKutusu.style.borderLeftColor = "#3fb950";
                analizKutusu.innerHTML = `⚖️ <b style="color:#3fb950; text-transform:uppercase;">Duty Cycle %30 - %60: "Dengeli Rejim</b><br><br>Isı girişi ve soğuma süresi termodinamik dengede. Kararlı bir mikro-ark platosu oluşur. Optimizasyon için frekansı artırarak plazma kıvılcımlarının boyutunu ve poroziteyi (gözenekliliği) küçültebilirsiniz.`;
            }
        }

        let zEkseni = [], aEkseni = [];
        let gosterilecekSaykl = 3; 
        let adimSayisi = 1000; 
        let toplamGosterimSuresi = toplamPeriyot_ms * gosterilecekSaykl;
        let zamanAdimi = toplamGosterimSuresi / adimSayisi;

        for(let t = 0; t <= toplamGosterimSuresi; t += zamanAdimi) {
            zEkseni.push(t.toFixed(2));
            let anlikFaz = t % toplamPeriyot_ms;
            aEkseni.push(anlikFaz <= t_on ? 100 : 0);
        }

        if (this.aktifGrafikOsiloskop) {
            this.aktifGrafikOsiloskop.data.labels = zEkseni;
            this.aktifGrafikOsiloskop.data.datasets[0].data = aEkseni;
            this.aktifGrafikOsiloskop.update();
        }
    },

    cizOsiloskopGrafigi: function() {
        const ctx = document.getElementById('peo-osiloskop-chart');
        if (!ctx) return;
        if (this.aktifGrafikOsiloskop) this.aktifGrafikOsiloskop.destroy();

        this.aktifGrafikOsiloskop = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Akım Genliği (%)', data: [], borderColor: '#58a6ff', borderWidth: 3, backgroundColor: 'rgba(88, 166, 255, 0.1)', fill: true, stepped: true, pointRadius: 0 }] },
            options: {
                responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: {enabled: false} },
                scales: { 
                    x: { 
                        title: { display: true, text: 'Zaman (Milisaniye - ms)', color: '#c9d1d9', font: { size: 14, weight: 'bold' } }, 
                        grid: { color: 'rgba(255,255,255,0)' }, 
                        ticks: { color: '#8b949e', maxTicksLimit: 10 } 
                    }, 
                    y: { 
                        title: { display: true, text: 'Akım Genliği (%)', color: '#c9d1d9', font: { size: 14, weight: 'bold' } }, 
                        grid: { color: 'rgba(201, 209, 217, 0.05)' }, 
                        ticks: { color: '#8b949e' }, 
                        min: -10, max: 120 
                    } 
                },
                animation: { duration: 0 }
            }
        });
        this.hesaplaOsiloskop();
    },

    // ==========================================
    // 🧪 3. BİRLEŞİK ELEKTROKİMYA (PDP & EIS) MODÜLÜ
    // ==========================================
    cizElektrokimyaArayuzu: function() {
        return `
        <div style="max-width: 1200px; margin: 0 auto; animation: fadein 0.3s ease;">
            <h1 style="color: var(--text-light); border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0;">🧪 Bütünleşik Elektrokimyasal Performans (PDP & EIS)</h1>
            
            <div style="background: rgba(161, 213, 134, 0.05); border: 1px solid rgba(161, 213, 134, 0.2); border-radius: 8px; padding: 15px 20px; font-size: 0.9em; color: var(--alumina-gray); line-height: 1.6; margin-bottom: 20px;">
                <b style="color: #3fb950;">ℹ️ Bütüncül Koruma Kinetiği</b><br>
                PEO zırhının kalitesi arttığında, kaplamanın korozyona karşı kinetik direnci (<b>I<sub>corr</sub> düşüşü - Tafel Eğrisi</b>) ve bariyer tabakasının elektriksel yalıtkanlığı (<b>R<sub>b</sub> artışı - Nyquist Çemberi</b>) eşzamanlı olarak gelişir. Aşağıdaki tek bir kaydırıcı ile bu iki fenomenin senkronize gelişimini inceleyebilirsiniz.
            </div>

            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 300px; background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px;">
                    <h3 style="color:var(--text-light); margin-top:0; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">🎛️ Zırh Bütünlüğü Kontrolü</h3>
                    
                    <div style="margin-top: 20px;">
                        <div class="sim-label"><span style="font-weight:bold; color:var(--text-main);">🛡️ PEO Kaplama Kalitesi</span><span id="val-elektro-kalite" style="color:#ffb84d; font-weight:bold;">0%</span></div>
                        <input type="range" id="slider-elektro-kalite" min="0" max="100" step="1" value="0" style="width: 100%; margin-top:10px; accent-color: #ffb84d;" oninput="PeoSimulasyon.hesaplaElektrokimya()">
                        <div style="font-size: 0.75em; color: #8b949e; margin-top: 5px;">Çıplak Valf Metali | %100 Kusursuz &alpha;-Fazı Bariyeri</div>
                    </div>

                    <div style="margin-top: 40px; border-top: 1px dashed var(--border-color); padding-top: 20px; background: rgba(0,0,0,0.2); border-radius: 6px; padding: 15px;">
                        <div style="color:#ff7b72; font-size:0.8em; font-weight:bold; margin-bottom:10px; text-transform:uppercase;">🧪 Potansiyodinamik Veriler (Tafel)</div>
                        <div style="display:flex; justify-content:space-between; margin-bottom: 10px;"><span style="color:var(--text-main);">Korozyon Potansiyeli (E<sub>corr</sub>):</span><b id="hesap-ecorr" style="color:var(--alumina-gray);">-0.80 V</b></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom: 25px;"><span style="color:var(--text-main);">Korozyon Akımı (I<sub>corr</sub>):</span><b id="hesap-icorr" style="color:#ff7b72;">1.00e-4 A/cm²</b></div>
                        
                        <div style="color:#58a6ff; font-size:0.8em; font-weight:bold; margin-bottom:10px; text-transform:uppercase; border-top:1px solid rgba(255,255,255,0.05); padding-top:10px;">🔍 Empedans Verileri (Nyquist)</div>
                        <div style="display:flex; justify-content:space-between; margin-bottom: 10px;"><span style="color:var(--text-main);">Bariyer Direnci (R<sub>b</sub>):</span><b id="hesap-rb" style="color:#58a6ff;">1,000 &Omega;</b></div>
                        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-main);">Toplam Koruma (R<sub>por</sub> + R<sub>b</sub>):</span><b id="hesap-rtoplam" style="color:var(--alumina-gray);">1,500 &Omega;</b></div>
                    </div>
                </div>

                <div style="flex: 2; display: flex; flex-direction: column; gap: 20px; min-width: 400px;">
                    <div style="background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; position: relative;">
                        <div style="position: absolute; top: 10px; left: 15px; font-size:0.8em; color:#ff7b72; font-weight:bold;">Tafel Eğrisi (Butler-Volmer)</div>
                        <div style="position: relative; height: 320px; width: 100%; margin-top:20px;">
                            <canvas id="elektro-tafel-chart"></canvas>
                        </div>
                    </div>

                    <div style="background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; position: relative;">
                        <div style="position: absolute; top: 10px; left: 15px; font-size:0.8em; color:#58a6ff; font-weight:bold;">Nyquist Çemberi (Randles Devresi)</div>
                        <div style="position: relative; height: 320px; width: 100%; margin-top:20px;">
                            <canvas id="elektro-nyquist-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    hesaplaElektrokimya: function() {
        let kalite = parseFloat(document.getElementById('slider-elektro-kalite').value);
        document.getElementById('val-elektro-kalite').innerText = kalite === 0 ? "0% (Çıplak)" : (kalite === 100 ? "100% (Zırh)" : kalite + "%");

        // --- TAFEL HESAPLAMASI ---
        let e_corr = -0.8 + (kalite / 100) * 0.5;
        let i_corr_log = -4 - (kalite / 100) * 5; 
        let i_corr = Math.pow(10, i_corr_log);

        document.getElementById('hesap-ecorr').innerHTML = e_corr.toFixed(2) + " V";
        
        // 🎯 BİLİMSEL NOTASYON MOTORU: "1.00e-4" formatını "1.00 x 10^-4" formatına çevirir
        let taban = i_corr.toExponential(2).split('e')[0];
        let us = parseInt(i_corr.toExponential(2).split('e')[1]);
        document.getElementById('hesap-icorr').innerHTML = `${taban} &times; 10<sup>${us}</sup> A/cm&sup2;`;

        let dataPointsTafel = [];
        let beta_a = 0.12, beta_c = 0.12; 

        for(let e = -1.2; e <= 0.2; e += 0.02) {
            let overpotential = e - e_corr;
            let akim = i_corr * (Math.pow(10, overpotential / beta_a) + Math.pow(10, -overpotential / beta_c));
            dataPointsTafel.push({ x: Math.log10(akim), y: e });
        }

        // --- NYQUIST HESAPLAMASI (RANDLES DEVRESİ) ---
        let Rs = 50, Rpor = 500, Cpor = 1e-6; 
        let Rb = 1000 * Math.pow(10, (kalite/100) * 3); // 10^3 -> 10^6
        let Cb = 1e-8; 

        document.getElementById('hesap-rb').innerHTML = Math.round(Rb).toLocaleString() + " &Omega;";
        document.getElementById('hesap-rtoplam').innerHTML = Math.round(Rs + Rpor + Rb).toLocaleString() + " &Omega;";

        let dataPointsNyquist = [];
        for(let f_log = 5; f_log >= -2; f_log -= 0.1) {
            let f = Math.pow(10, f_log);
            let w = 2 * Math.PI * f; 
            let z_real = Rs + (Rpor / (1 + Math.pow(w * Rpor * Cpor, 2))) + (Rb / (1 + Math.pow(w * Rb * Cb, 2)));
            let z_imag = ((w * Math.pow(Rpor, 2) * Cpor) / (1 + Math.pow(w * Rpor * Cpor, 2))) + ((w * Math.pow(Rb, 2) * Cb) / (1 + Math.pow(w * Rb * Cb, 2)));
            dataPointsNyquist.push({ x: z_real, y: z_imag });
        }

        // --- GRAFİKLERİ GÜNCELLE ---
        if (this.aktifGrafikTafel) {
            this.aktifGrafikTafel.data.datasets[0].data = dataPointsTafel;
            this.aktifGrafikTafel.update();
        }

        if (this.aktifGrafikNyquist) {
            this.aktifGrafikNyquist.data.datasets[0].data = dataPointsNyquist;
            // 🎯 X ve Y eksenlerini Nyquist'in ekrandan taşmayacağı şekilde oranla
            let maxScale = (Rs + Rpor + Rb) * 1.1; 
            this.aktifGrafikNyquist.options.scales.x.max = maxScale;
            this.aktifGrafikNyquist.options.scales.y.max = maxScale / 1.6; 
            this.aktifGrafikNyquist.update();
        }
    },

    baslatElektrokimyaGrafikleri: function() {
        const ctxTafel = document.getElementById('elektro-tafel-chart');
        if (this.aktifGrafikTafel) this.aktifGrafikTafel.destroy();
        if (ctxTafel) {
            this.aktifGrafikTafel = new Chart(ctxTafel, {
                type: 'scatter',
                data: { datasets: [{ label: 'Tafel Eğrisi', data: [], borderColor: '#ff7b72', backgroundColor: 'rgba(255, 123, 114, 0.2)', borderWidth: 2, showLine: true, pointRadius: 0, tension: 0.2 }] },
                options: {
                    responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: {enabled: false} },
                    scales: { 
                        x: { title: { display: true, text: 'Log Akım Yoğunluğu (Log I)', color: '#8b949e' }, grid: { color: 'rgba(201, 209, 217, 0.05)' }, ticks: { color: '#8b949e' }, min: -10, max: 0 }, 
                        y: { title: { display: true, text: 'Potansiyel (E) [V]', color: '#8b949e' }, grid: { color: 'rgba(201, 209, 217, 0.05)' }, ticks: { color: '#8b949e' }, min: -1.2, max: 0.2 } 
                    },
                    animation: { duration: 0 } 
                }
            });
        }

        const ctxNyquist = document.getElementById('elektro-nyquist-chart');
        if (this.aktifGrafikNyquist) this.aktifGrafikNyquist.destroy();
        if (ctxNyquist) {
            this.aktifGrafikNyquist = new Chart(ctxNyquist, {
                type: 'scatter',
                data: { datasets: [{ label: 'Nyquist Çemberi', data: [], borderColor: '#58a6ff', backgroundColor: 'rgba(88, 166, 255, 0.2)', borderWidth: 2, showLine: true, pointRadius: 0, tension: 0.3 }] },
                options: {
                    responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: {enabled: false} },
                    scales: { 
                        x: { title: { display: true, text: "Z' (\u03A9)", color: '#8b949e' }, grid: { color: 'rgba(201, 209, 217, 0.05)' }, ticks: { color: '#8b949e' }, min: 0 }, 
                        y: { title: { display: true, text: "-Z'' (\u03A9)", color: '#8b949e' }, grid: { color: 'rgba(201, 209, 217, 0.05)' }, ticks: { color: '#8b949e' }, min: 0 } 
                    },
                    animation: { duration: 0 }
                }
            });
        }

        this.hesaplaElektrokimya();
    },

    // ==========================================
    // 🔬 4. FAZ DÖNÜŞÜMÜ (ALFA/GAMA) DİNAMİK KESİT MODÜLÜ
    // ==========================================
    cizFazArayuzu: function() {
        return `
        <div style="max-width: 1000px; margin: 0 auto; animation: fadein 0.3s ease;">
            <h1 style="color: var(--text-light); border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0;">🔬 &alpha;-Al<sub>2</sub>O<sub>3</sub> / &gamma;-Al<sub>2</sub>O<sub>3</sub> Faz Dönüşümü ve Kesit Morfolojisi</h1>
            
            <div style="display: flex; gap: 30px; margin-top: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 300px; background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <h3 style="color:var(--text-light); margin-top:0; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">🎛️ Termal Döngü Kontrolü</h3>
                    
                    <div style="margin-top: 20px;">
                        <div class="sim-label">
                            <span style="font-weight:bold; color:var(--text-main);">⏱️ İşlem Süresi (Dk)</span>
                            <span id="val-sure" style="color:var(--spark-orange); font-weight:bold;">5 Dk</span>
                        </div>
                        <input type="range" id="slider-sure" min="5" max="60" step="5" value="5" style="width: 100%; margin-top:10px; accent-color: var(--spark-orange);" oninput="PeoSimulasyon.hesaplaFaz()">
                        <div style="font-size: 0.75em; color: #8b949e; margin-top: 5px;">Süre arttıkça tekrarlı plazma ısısı artar, gözenekler mühürlenir ve faz dönüşümü tetiklenir.</div>
                    </div>

                    <div style="margin-top: 30px;">
                        <div class="sim-label">
                            <span style="font-weight:bold; color:var(--text-main);">🧪 Tungstat / Bor Katkısı</span>
                            <span id="val-katki" style="color:var(--plasma-blue); font-weight:bold;">Yok</span>
                        </div>
                        <input type="range" id="slider-katki" min="0" max="1" step="1" value="0" style="width: 100%; margin-top:10px; accent-color: var(--plasma-blue);" oninput="PeoSimulasyon.hesaplaFaz()">
                        <div style="font-size: 0.75em; color: #8b949e; margin-top: 5px;">Elektrolit katkıları <b>&gamma; &rarr; &alpha;</b> geçişini termodinamik olarak hızlandırır.</div>
                    </div>

                    <div style="margin-top: 40px; border-top: 1px dashed var(--border-color); padding-top: 20px; background: rgba(0,0,0,0.2); border-radius: 6px; padding: 15px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 10px;">
                            <span style="color:var(--text-main);">&gamma;-Al<sub>2</sub>O<sub>3</sub> (Dış Tabaka):</span>
                            <b id="hesap-gama" style="color:#ff7b72;">90%</b>
                        </div>
                        <div style="display:flex; justify-content:space-between; border-top: 1px solid var(--border-color); padding-top: 10px;">
                            <span style="color:var(--text-main);">&alpha;-Al<sub>2</sub>O<sub>3</sub> (İç Bariyer):</span>
                            <b id="hesap-alfa" style="color:#3fb950;">10%</b>
                        </div>
                    </div>
                </div>

                <div style="flex: 1.5; min-width: 350px; background: var(--bg-dark); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; display:flex; flex-direction:column; align-items:center;">
                    <h3 style="color:var(--alumina-gray); margin-top:0; margin-bottom: 20px;">SEM Kesit Morfolojisi (Mikroyapı)</h3>
                    
                    <div style="width: 100%; max-width: 300px; height: 350px; display: flex; flex-direction: column; border: 2px solid #30363d; border-radius: 8px; overflow: hidden; box-shadow: inset 0 0 30px rgba(0,0,0,0.9);">
                        
                        <div style="height: 10%; background: rgba(88, 166, 255, 0.05); border-bottom: 2px dashed var(--plasma-blue); display:flex; justify-content:center; align-items:center; font-size: 0.8em; color: var(--plasma-blue); text-shadow: 0 0 5px var(--plasma-blue);">
                            Elektrolit (Plazma Deşarj Arayüzü)
                        </div>
                        
                        <div id="katman-gama" style="height: 60%; 
                            background-color: #4a1c1a; 
                            background-image: 
                                radial-gradient(circle at 20% 30%, #1a0808 4px, transparent 5px),
                                radial-gradient(circle at 70% 60%, #1a0808 6px, transparent 7px),
                                radial-gradient(circle at 40% 80%, #1a0808 3px, transparent 4px),
                                radial-gradient(circle at 85% 25%, #1a0808 5px, transparent 6px),
                                radial-gradient(circle at 10% 70%, #1a0808 4px, transparent 5px),
                                radial-gradient(circle at 60% 15%, #1a0808 3px, transparent 4px);
                            display:flex; justify-content:center; align-items:center; color:#ff7b72; font-weight:bold; text-shadow: 1px 1px 2px #000; transition: height 0.5s ease-in-out, opacity 0.5s;">
                            &gamma;-Fazı (Gözenekli)
                        </div>
                        
                        <div id="katman-alfa" style="height: 10%; 
                            background-color: #1e4a28;
                            background-image: repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(0,0,0,0.3) 12px, rgba(0,0,0,0.3) 14px);
                            display:flex; justify-content:center; align-items:center; color:#a1d586; font-weight:bold; text-shadow: 1px 1px 2px #000; transition: height 0.5s ease-in-out; border-top: 2px solid #5c2b29; border-bottom: 3px solid #3fb950; box-shadow: 0 -5px 15px rgba(0,0,0,0.5);">
                            &alpha;-Fazı (Sütunsal Bariyer)
                        </div>
                        
                        <div style="height: 20%; 
                            background-color: #30363d;
                            background-image: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.03) 5px, rgba(255,255,255,0.03) 6px), repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(255,255,255,0.03) 5px, rgba(255,255,255,0.03) 6px);
                            display:flex; justify-content:center; align-items:center; color:var(--text-main); font-weight:bold; text-shadow: 1px 1px 2px #000;">
                            Metalik Substrat
                        </div>

                    </div>
                </div>
            </div>
        </div>`;
    },

    hesaplaFaz: function() {
        let sure = parseFloat(document.getElementById('slider-sure').value);
        let katki = parseInt(document.getElementById('slider-katki').value);
        
        document.getElementById('val-sure').innerText = sure + " Dk";
        document.getElementById('val-katki').innerText = katki === 1 ? "Aktif" : "Yok";

        let maxOksitKalikligi = 70; // Toplam yükseklik %70 (Kalan %30 elektrolit ve substrat)
        
        // Temel termodinamik dönüşüm kinetiği
        let alfaYuzde = (sure / 60) * 100; 
        if (katki === 1) alfaYuzde = alfaYuzde * 1.6; // Tungstat/Boraks sinerjisi

        // Görselin bozulmaması için alt/üst limitler
        alfaYuzde = Math.max(5, Math.min(alfaYuzde, 95));
        let gamaYuzde = 100 - alfaYuzde;

        document.getElementById('hesap-alfa').innerHTML = Math.round(alfaYuzde) + "%";
        document.getElementById('hesap-gama').innerHTML = Math.round(gamaYuzde) + "%";

        // Yükseklikleri güncelle
        let alfaCSSHeight = maxOksitKalikligi * (alfaYuzde / 100);
        let gamaCSSHeight = maxOksitKalikligi * (gamaYuzde / 100);

        let kAlfa = document.getElementById('katman-alfa');
        let kGama = document.getElementById('katman-gama');

        if(kAlfa && kGama) {
            kAlfa.style.height = alfaCSSHeight + "%";
            kGama.style.height = gamaCSSHeight + "%";
            
            // Gama fazı eriyip alfa'ya dönüştükçe gözenekli yapı kararıp sıkılaşıyormuş hissi (Opacity değişimi)
            let gamaOpaklik = 0.4 + (gamaYuzde / 100) * 0.6;
            kGama.style.opacity = gamaOpaklik;

            // Alfa tabakası kalınlaştıkça rengi daha canlı, korindon yeşiline dönsün
            let yesilTon = Math.min(255, 60 + (alfaYuzde * 2));
            kAlfa.style.backgroundColor = `rgb(30, ${yesilTon}, 40)`;
        }
    },
// ==========================================
    // 📊 5. LİTERATÜR ANALİZİ (YAYIN/ATIF GRAFİĞİ)
    // ==========================================
    cizYayinGrafikArayuzu: function() {
        return `
        <div style="max-width: 1000px; margin: 0 auto; animation: fadein 0.3s ease;">
            <h1 style="color: var(--text-light); border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0;">📊 PEO/ASO Literatür Gelişimi (2003-2026)</h1>
            
            <div style="background: rgba(88, 166, 255, 0.05); border: 1px solid rgba(88, 166, 255, 0.2); border-radius: 8px; padding: 15px 20px; font-size: 0.95em; color: var(--alumina-gray); line-height: 1.6; margin-bottom: 20px;">
                <b style="color: var(--plasma-blue);">İleri Görüşlü Analiz:</b> Grafikte görüldüğü üzere, Plazma Elektrolitik Oksidasyon (PEO) alanındaki akademik yayınlar ve bu yayınlara yapılan atıflar son 10 yılda eksponansiyel bir patlama yaşamıştır. Bu durum, teknolojinin laboratuvar ölçeğinden çıkıp havacılık, biyomedikal ve otomotiv gibi kritik endüstrilerde standart bir yüzey mühendisliği çözümü haline geldiğinin tartışmasız kanıtıdır.
            </div>

            <div style="background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); display: flex; justify-content: center; align-items: center; flex-direction: column;">
                <img src="aso-yayın-atıf (2).png" alt="ASO Yayın ve Atıf Grafiği" style="max-width: 100%; border-radius: 6px; box-shadow: 0 0 20px rgba(0,0,0,0.6); border: 1px solid var(--border-color);">
                <div style="margin-top: 15px; font-size: 0.8em; color: var(--text-main); width: 100%; text-align: right;">
                    *Veriler Scopus/Web of Science tabanlı akademik yayın indekslerinden derlenmiştir.
                </div>
            </div>
        </div>`;
    }
};

window.onload = () => {
    const selectMenu = document.getElementById('global-substrat');
    if(selectMenu) {
        selectMenu.onchange = () => {
            localStorage.setItem("peo-substrat", selectMenu.value);
            if(document.getElementById('peo-ut-chart')) PeoSimulasyon.hesaplaUt();
        };
    }
    const ilkButon = document.getElementById('btn-kinetik');
    if(ilkButon) PeoSimulasyon.yukle(ilkButon.nextElementSibling.querySelector('.alt-btn'), 'voltaj-zaman');
};
