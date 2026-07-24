/* ==============================================================================
   ASO CORE - ANODİK KIVILCIM SİMÜLASYON MOTORU (v3.0 - ASO Dinamikleri)
============================================================================== */

const AsoSimulasyon = {
    aktifGrafikUT: null,
    aktifGrafikOsiloskop: null,
    aktifGrafikTafel: null,
    aktifGrafikNyquist: null,

    substratVeri: {
        "Al1050": { kirilma: 420, plato: 460, stabiliteKatsayisi: 2, renk: "#ffd700", isim: "Al 1000 Serisi (Saf Alüminyum) -> Al1050", analiz: "Teorik temeldir. Alaşım elementi içermediği için kıvılcımlanma çok pürüzsüz ve homojendir. Ancak altlık çok yumuşak olduğu için 'Yumurta Kabuğu' (Eggshell) etkisi yaratır, endüstriyel yüklere dayanamaz." },
        "Al2024": { kirilma: 380, plato: 430, stabiliteKatsayisi: 18, renk: "#ff7b72", isim: "Al 2000 Serisi (Cu İçerikli) -> Al2024", analiz: "ASO'nun Aşil Topuğudur. İçerdiği Bakır (Cu) farklı bir potansiyelde çözündüğü için yoğun oksijen gazı çıkışı yaratır. Mikro-ark odaklanamaz, lokal yanıklar ve aşırı gözeneklilik oluşur." },
        "Al3004": { kirilma: 440, plato: 490, stabiliteKatsayisi: 4, renk: "#a1d586", isim: "Al 3000 Serisi (Mn İçerikli) -> Al3004", analiz: "Mangan (Mn) katkısı agresif bozulmalara yol açmaz. ASO işlemi sırasında nispeten kararlı ve homojen bir kıvılcım rejimine izin verir." },
        "Al5083": { kirilma: 460, plato: 510, stabiliteKatsayisi: 5, renk: "#58a6ff", isim: "Al 5000 Serisi (Mg İçerikli) -> Al5083", analiz: "Saf alüminyuma kıyasla anodik oksidasyon hızı çok dengelidir. Tungstat gibi katkılar eklendiğinde kalınlık ve sertlik dramatik olarak artar. Denizcilik uygulamaları için mükemmeldir." },
        "Al6061": { kirilma: 480, plato: 540, stabiliteKatsayisi: 3, renk: "#0ac8b9", isim: "Al 6000 Serisi (Mg-Si İçerikli) -> Al6061", analiz: "ASO işlemine en 'itaatkar' (benchmark) alaşımdır. Doğru elektrolitte termodinamik olarak kararlı anodik kıvılcım oluşumunu muazzam bir şekilde teşvik eder." },
        "Al7075": { kirilma: 410, plato: 470, stabiliteKatsayisi: 12, renk: "#d2a8ff", isim: "Al 7000 Serisi (Zn-Mg İçerikli) -> Al7075", analiz: "Mekanik olarak çok güçlü olsa da, içerdiği Çinko (Zn) oksit büyümesini bozar. Kaplama amorf ve ince kalmaya meyillidir, gelişmiş darbeli (pulsed) akımlar gerektirir." },
        "AlA356": { kirilma: 350, plato: 410, stabiliteKatsayisi: 22, renk: "#f85149", isim: "Döküm Alüminyum (Al-Si) -> AlA356", analiz: "ASO için en inatçı gruptur. Matris içindeki Silisyum (Si) plakacıkları mikro-kıvılcımlara direnir ve büyümeyi bloke eder. h-BN gibi nanopartikül mühürlemeleri şarttır." },
        "Ti6Al4V": { kirilma: 220, plato: 290, stabiliteKatsayisi: 4, renk: "#c9d1d9", isim: "Titanyum Alaşımı (Ti-6Al-4V) -> Ti6Al4V", analiz: "Termodinamik pasifleşme eğilimi devasadır. Alüminyuma kıyasla dielektrik kırılma çok daha düşük voltajlarda gerçekleşir. ASO sırasında Anataz fazından Rutil fazına geçiş yapar." },
        "MgAZ31": { kirilma: 180, plato: 240, stabiliteKatsayisi: 6, renk: "#e88245", isim: "Magnezyum Alaşımı (AZ31) -> MgAZ31", analiz: "En aktif valf metalidir. Doğal oksidi gözenekli ve suda çözünmeye meyillidir. ASO, magnezyumu korumak için bir MgO/Spinel zırhı yaratır ancak voltaj eşikleri çok düşüktür." },
        "Zr702": { kirilma: 310, plato: 380, stabiliteKatsayisi: 3, renk: "#9ea1f9", isim: "Zirkonyum (Zr 702) -> Zr702", analiz: "Çok yüksek korozyon direncine sahip yalıtkan bir dielektrik film inşa eder. Kıvılcım kırılma rejimi stabildir. Biyo-aktif ortopedi için kullanılır." },
        "TaPure": { kirilma: 550, plato: 620, stabiliteKatsayisi: 1, renk: "#ffb84d", isim: "Tantal (Saf Ta) -> TaPure", analiz: "Mükemmel valf metali. Elektriksel geçirgenliği devasa olduğu için voltaj çok yüksek seviyelere çıkar. ASO süreci çok kararlı ve gürültüsüz ilerler." }
    },

    bilimselNotasyon: function (sayi) {
        let exp = sayi.toExponential(2);
        let parcalar = exp.split('e');
        return `${parcalar[0]} &times; 10<sup>${parseInt(parcalar[1])}</sup>`;
    },

    tetikleAktifHesaplama: function () {
        if (document.getElementById('aso-ut-chart')) this.hesaplaUt();
        if (document.getElementById('aso-osiloskop-chart')) this.hesaplaOsiloskop();
        if (document.getElementById('elektro-tafel-chart')) this.hesaplaElektrokimya();
        if (document.getElementById('katman-alfa')) this.hesaplaFaz();
    },

    secimDegisti: function () {
        let selectMenu = document.getElementById('global-substrat');
        if (selectMenu) localStorage.setItem("aso-substrat", selectMenu.value);
        this.tetikleAktifHesaplama();
    },

    guncelleArayuzSecenekleri: function () {
        const selectMenu = document.getElementById('global-substrat');
        if (!selectMenu) return;

        let mevcutSecim = localStorage.getItem("aso-substrat") || "Al6061";
        selectMenu.innerHTML = "";

        for (const [key, value] of Object.entries(this.substratVeri)) {
            const option = document.createElement("option");
            option.value = key;
            option.text = value.isim.split(" -> ")[0];
            if (key === mevcutSecim) option.selected = true;
            selectMenu.appendChild(option);
        }
    },

    toggleMenu: function (menuId, btnId) {
        document.querySelectorAll('.alt-menu-kapsayici').forEach(m => m.classList.remove('acik'));
        document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('aktif'));
        document.getElementById(menuId)?.classList.add('acik');
        document.getElementById(btnId)?.classList.add('aktif');
    },

    yukle: function (btnElement, simType) {
        document.querySelectorAll('.alt-btn').forEach(btn => btn.classList.remove('aktif'));
        if (btnElement) btnElement.classList.add('aktif');

        const contentDiv = document.getElementById('app-content');
        if (!contentDiv) return;

        if (simType === 'voltaj-zaman') {
            contentDiv.innerHTML = this.cizUtEgrisiArayuzu();
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
        else if (simType === 'ekoller') {
            contentDiv.innerHTML = this.cizEkollerArayuzu();
        }
    },

    // ==========================================
    // ⚡ 1. KİNETİK ANALİZ (U-t / I-t)
    // ==========================================
    cizUtEgrisiArayuzu: function () {
        return `
        <div style="max-width: 1200px; margin: 0 auto; animation: fadein 0.3s ease;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-bottom: 20px;">
                <h1 style="color: #ffffff; margin: 0;">⚡ Kinetik Analizler: ASO Büyüme Rejimleri</h1>
                <select id="rejim-secici" class="sci-select" style="width: 300px; font-weight: bold; color: var(--plasma-blue); border-color: var(--plasma-blue);" onchange="AsoSimulasyon.degistirRejim()">
                    <option value="galvanostatik">Galvanostatik (Sabit Akım) &rarr; U-t Eğrisi</option>
                    <option value="potansiyostatik">Potansiyostatik (Sabit Voltaj) &rarr; I-t Eğrisi</option>
                </select>
            </div>
            
            <div id="substrat-analiz-kutusu" style="background: rgba(88, 166, 255, 0.05); border: 1px solid rgba(88, 166, 255, 0.2); border-radius: 8px; padding: 15px 20px; font-size: 0.95em; color: #ffffff; line-height: 1.6; margin-bottom: 20px; min-height: 80px;"></div>

            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 300px; background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px;">
                    <h3 style="color:#ffffff; margin-top:0; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">🎛️ Parametre Kontrolü</h3>
                    
                    <div style="margin-top: 20px;">
                        <div class="sim-label"><span style="font-weight:bold; color:#e6edf3;">💧 Boraks Konsantrasyonu</span><span id="val-boraks" style="color:var(--plasma-blue); font-weight:bold;">0 g/L</span></div>
                        <input type="range" id="slider-boraks" min="0" max="15" step="1" value="0" style="width: 100%; margin-top:10px; accent-color: var(--plasma-blue);" oninput="AsoSimulasyon.hesaplaUt()">
                    </div>
                    
                    <div id="kontrol-galvanostatik" style="margin-top: 30px;">
                        <div class="sim-label"><span style="font-weight:bold; color:#e6edf3;">⚡ Sabit Akım Yoğunluğu</span><span id="val-akim" style="color:var(--spark-orange); font-weight:bold;">5 A/dm²</span></div>
                        <input type="range" id="slider-akim" min="2" max="20" step="1" value="5" style="width: 100%; margin-top:10px; accent-color: var(--spark-orange);" oninput="AsoSimulasyon.hesaplaUt()">
                    </div>

                    <div id="kontrol-potansiyostatik" style="margin-top: 30px; display: none;">
                        <div class="sim-label"><span style="font-weight:bold; color:#e6edf3;">⚡ Sabit Anodik Voltaj</span><span id="val-voltaj" style="color:#d2a8ff; font-weight:bold;">250 V</span></div>
                        <input type="range" id="slider-voltaj" min="150" max="400" step="10" value="250" style="width: 100%; margin-top:10px; accent-color: #d2a8ff;" oninput="AsoSimulasyon.hesaplaUt()">
                    </div>

                    <div style="margin-top: 40px; border-top: 1px dashed var(--border-color); padding-top: 20px;">
                        <div id="dinamik-hesap-1" style="display:flex; justify-content:space-between; margin-bottom: 10px;"><span style="color:#e6edf3;">Anlık Kırılma Voltajı:</span><b id="hesap-kirilma" style="color:#ffffff;">200 V</b></div>
                        <div id="dinamik-hesap-2" style="display:flex; justify-content:space-between;"><span style="color:#e6edf3;">Kararlı Plato Voltajı:</span><b id="hesap-plato" style="color:var(--plasma-blue);">240 V</b></div>
                    </div>
                </div>
                <div style="flex: 2; min-width: 400px; background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px;">
                    <div style="position: relative; height: 350px; width: 100%;"><canvas id="aso-ut-chart"></canvas></div>
                </div>
            </div>
        </div>`;
    },

    degistirRejim: function () {
        let rejim = document.getElementById('rejim-secici').value;
        if (rejim === 'galvanostatik') {
            document.getElementById('kontrol-galvanostatik').style.display = 'block';
            document.getElementById('kontrol-potansiyostatik').style.display = 'none';
            document.getElementById('dinamik-hesap-1').innerHTML = `<span style="color:#e6edf3;">Anlık Kırılma Voltajı:</span><b id="hesap-kirilma" style="color:#ffffff;"></b>`;
            document.getElementById('dinamik-hesap-2').innerHTML = `<span style="color:#e6edf3;">Kararlı Plato Voltajı:</span><b id="hesap-plato" style="color:var(--plasma-blue);"></b>`;
            this.aktifGrafikUT.options.scales.y.title.text = 'Anodik Voltaj (V)';
            this.aktifGrafikUT.options.scales.y.max = 700;
        } else {
            document.getElementById('kontrol-galvanostatik').style.display = 'none';
            document.getElementById('kontrol-potansiyostatik').style.display = 'block';
            document.getElementById('dinamik-hesap-1').innerHTML = `<span style="color:#e6edf3;">Başlangıç Tepe (Surge) Akımı:</span><b id="hesap-kirilma" style="color:#ffffff;"></b>`;
            document.getElementById('dinamik-hesap-2').innerHTML = `<span style="color:#e6edf3;">Rezidüel Plato Akımı:</span><b id="hesap-plato" style="color:#d2a8ff;"></b>`;
            this.aktifGrafikUT.options.scales.y.title.text = 'Akım Yoğunluğu (A/dm²)';
            this.aktifGrafikUT.options.scales.y.max = 50;
        }
        this.hesaplaUt();
    },

    hesaplaUt: function () {
        let boraks = parseFloat(document.getElementById('slider-boraks').value);
        let substratElement = document.getElementById('global-substrat');
        let seciliSubstrat = substratElement ? substratElement.value : "Al6061";

        let sVeri = this.substratVeri[seciliSubstrat] || this.substratVeri["Al6061"];
        let rejim = document.getElementById('rejim-secici') ? document.getElementById('rejim-secici').value : 'galvanostatik';

        let sicaklik = parseFloat(document.getElementById('global-sicaklik')?.value || 25);
        let elektrolit = document.getElementById('global-elektrolit')?.value || 'silikat';
        let alan = parseFloat(document.getElementById('global-alan')?.value || 2.0);

        let analizKutusu = document.getElementById('substrat-analiz-kutusu');
        document.getElementById('val-boraks').innerText = boraks + " g/L";

        let termalIletkenlikCarpani = 1 + ((sicaklik - 25) * 0.015);
        let iletkenlik = (1 - (boraks * 0.015)) * termalIletkenlikCarpani;

        let elektrolitVoltFarki = 0;
        if (elektrolit === 'silikat') elektrolitVoltFarki = +40;
        if (elektrolit === 'aluminat') elektrolitVoltFarki = -20;
        if (elektrolit === 'asidik') {
            elektrolitVoltFarki = -230; // ASO rejimine çekiş
            iletkenlik *= 1.3;
        }

        let zEkseni = [], vEkseni = [];

        if (rejim === 'galvanostatik') {
            let akimYogunlugu = parseFloat(document.getElementById('slider-akim').value);
            document.getElementById('val-akim').innerText = akimYogunlugu + " A/dm²";
            let toplamAkim = akimYogunlugu * alan;

            if (analizKutusu) {
                if (elektrolit === 'asidik') {
                    analizKutusu.style.borderLeft = "4px solid #d2a8ff";
                    analizKutusu.innerHTML = `<div style="display:flex; align-items:center; gap: 10px; margin-bottom: 8px;"><b style="color: #d2a8ff; font-size:1.1em;">🧪 Seyreltik Sülfürik Asit (H₂SO₄) – ASO Rejimi</b></div><div>Seyreltik asidik ortamda yüksek iletkenlik sayesinde anodik kıvılcımlanma <b>200-250V</b> gibi düşük potansiyellerde gerçekleşir. Deşarjlar termal olarak daha yumuşaktır (soft-sparking).</div>`;
                } else {
                    analizKutusu.style.borderLeft = "4px solid var(--spark-orange)";
                    analizKutusu.innerHTML = `<div style="display:flex; align-items:center; gap: 10px; margin-bottom: 8px;"><span style="display:inline-block; width:15px; height:15px; border-radius:50%; background-color:${sVeri.renk};"></span><b style="color: ${sVeri.renk}; font-size:1.1em;">${sVeri.isim} Galvanostatik Büyüme (U-t)</b></div><div>Güç Kaynağından Çekilen Toplam Akım: <b style="color:var(--spark-orange);">${toplamAkim.toFixed(1)} Amper</b> (${alan} dm²). <b>${sVeri.analiz}</b></div>`;
                }
            }

            let anlikKirilma = Math.max(15, ((sVeri.kirilma + elektrolitVoltFarki) / iletkenlik) - (akimYogunlugu * 1.2));
            let anlikPlato = Math.max(25, ((sVeri.plato + elektrolitVoltFarki) / iletkenlik) + (akimYogunlugu * 1.5));

            document.getElementById('hesap-kirilma').innerText = Math.round(anlikKirilma) + " V";
            document.getElementById('hesap-plato').innerText = Math.round(anlikPlato) + " V";

            let faradayHizi = akimYogunlugu * 8 * (25 / sicaklik);
            for (let saniye = 0; saniye <= 600; saniye += 10) {
                zEkseni.push(saniye);
                if (saniye * faradayHizi < anlikKirilma) {
                    vEkseni.push(saniye * faradayHizi);
                } else if (saniye * faradayHizi >= anlikKirilma && saniye < 150) {
                    let yavaslayan = anlikKirilma + ((saniye - (anlikKirilma / faradayHizi)) * 0.5);
                    vEkseni.push(Math.min(yavaslayan, anlikPlato));
                } else {
                    let noise = (Math.random() - 0.5) * sVeri.stabiliteKatsayisi * (sicaklik / 20);
                    vEkseni.push(anlikPlato + noise);
                }
            }

            if (this.aktifGrafikUT) {
                this.aktifGrafikUT.data.datasets[0].label = 'Voltaj (V)';
                this.aktifGrafikUT.data.datasets[0].borderColor = (elektrolit === 'asidik') ? '#d2a8ff' : sVeri.renk;
                this.aktifGrafikUT.data.datasets[0].backgroundColor = (elektrolit === 'asidik') ? 'rgba(210, 168, 255, 0.1)' : ((seciliSubstrat.startsWith("Al") && boraks > 0) ? 'rgba(88, 166, 255, 0.1)' : 'rgba(201, 209, 217, 0.05)');
            }
        } else {
            let hedefVoltaj = parseFloat(document.getElementById('slider-voltaj').value);
            document.getElementById('val-voltaj').innerText = hedefVoltaj + " V";

            if (analizKutusu) {
                analizKutusu.style.borderLeft = "4px solid #d2a8ff";
                analizKutusu.innerHTML = `<div style="display:flex; align-items:center; gap: 10px; margin-bottom: 8px;"><span style="display:inline-block; width:15px; height:15px; border-radius:50%; background-color:#d2a8ff;"></span><b style="color: #d2a8ff; font-size:1.1em;">${sVeri.isim} Potansiyostatik Sönümlenme (I-t)</b></div><div>Sabit voltaj uygulandığında, başlangıçta devasa bir 'surge' (tepe) akımı çekilir. Dielektrik bariyer oluştukça akım yoğunluğu hiperbolik ve eksponansiyel bir düşüş sergiler.</div>`;
            }

            let baslangicAkimi = (hedefVoltaj * 0.08) * (1 / (Math.max(10, (sVeri.kirilma + elektrolitVoltFarki)) / 400)) * termalIletkenlikCarpani;
            let reziduelAkim = (hedefVoltaj / Math.max(10, (sVeri.plato + elektrolitVoltFarki))) * 2 * (boraks > 0 ? 1.5 : 1);

            document.getElementById('hesap-kirilma').innerText = baslangicAkimi.toFixed(1) + " A/dm²";
            document.getElementById('hesap-plato').innerText = reziduelAkim.toFixed(2) + " A/dm²";

            for (let saniye = 0; saniye <= 600; saniye += 10) {
                zEkseni.push(saniye);
                if (saniye === 0) {
                    vEkseni.push(baslangicAkimi);
                } else {
                    let sönümlenme = baslangicAkimi * Math.exp(-saniye / (40 * (25 / sicaklik)));
                    let noise = (Math.random() - 0.5) * 0.2;
                    vEkseni.push(Math.max(reziduelAkim + noise, sönümlenme + reziduelAkim));
                }
            }

            if (this.aktifGrafikUT) {
                this.aktifGrafikUT.data.datasets[0].label = 'Akım Yoğunluğu (A/dm²)';
                this.aktifGrafikUT.data.datasets[0].borderColor = '#d2a8ff';
                this.aktifGrafikUT.data.datasets[0].backgroundColor = 'rgba(210, 168, 255, 0.1)';
            }
        }

        if (this.aktifGrafikUT) {
            this.aktifGrafikUT.data.labels = zEkseni;
            this.aktifGrafikUT.data.datasets[0].data = vEkseni;
            this.aktifGrafikUT.update();
        }
    },

    baslatUtGrafigi: function () {
        const ctx = document.getElementById('aso-ut-chart');
        if (!ctx) return;
        if (this.aktifGrafikUT) this.aktifGrafikUT.destroy();

        this.aktifGrafikUT = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Voltaj (V)', data: [], borderColor: '#0ac8b9', borderWidth: 3, backgroundColor: 'rgba(201, 209, 217, 0.05)', fill: true, tension: 0.4, pointRadius: 0 }] },
            options: {
                responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                scales: {
                    x: { title: { display: true, text: 'İşlem Süresi (Saniye)', color: '#ffffff', font: { size: 14, weight: 'bold' } }, grid: { color: 'rgba(201, 209, 217, 0.05)' }, ticks: { color: '#e6edf3' } },
                    y: { title: { display: true, text: 'Anodik Voltaj (V)', color: '#ffffff', font: { size: 14, weight: 'bold' } }, grid: { color: 'rgba(201, 209, 217, 0.05)' }, ticks: { color: '#e6edf3' }, min: 0, max: 700 }
                },
                animation: { duration: 200 }
            }
        });
        this.hesaplaUt();
    },

    // ==========================================
    // 📡 2. DARBELİ AKIM OSİLOSKOP MODÜLÜ
    // ==========================================
    cizOsiloskopArayuzu: function () {
        return `
        <div style="max-width: 1200px; margin: 0 auto; animation: fadein 0.3s ease;">
            <h1 style="color: #ffffff; border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0;">📡 Kinetik Analizler: Darbeli Akım Osiloskopu</h1>
            <div style="background: rgba(88, 166, 255, 0.05); border: 1px solid rgba(88, 166, 255, 0.2); border-radius: 8px; padding: 15px 20px; font-size: 0.95em; color: #ffffff; line-height: 1.6; margin-bottom: 20px;">
                <b style="color: var(--plasma-blue);">ℹ️ Model: ASO Termal Şok Teorisi</b><br>
                Yüksek termal kütleli numunelerde yanıkları engellemek ve en sert <b>&alpha;-Al<sub>2</sub>O<sub>3</sub></b> fazını elde etmek için şok soğutma (quenching) şarttır. <b>Frekans</b> ve <b>Görev Döngüsü</b> ile oynayarak <b>T<sub>off</sub></b> dinlenme sürelerini optimize edebilirsiniz.
            </div>
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 300px; background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px;">
                    <h3 style="color:#ffffff; margin-top:0; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">🎛️ Güç Kaynağı Kontrolü</h3>
                    <div style="margin-top: 20px;">
                        <div class="sim-label"><span style="font-weight:bold; color:#e6edf3;">⏱️ Frekans (Hz)</span><span id="val-frekans" style="color:#ffffff; font-weight:bold;">1000 Hz</span></div>
                        <input type="range" id="slider-frekans" min="50" max="2000" step="50" value="1000" style="width: 100%; accent-color: var(--alumina-gray);" oninput="AsoSimulasyon.hesaplaOsiloskop()">
                    </div>
                    <div style="margin-top: 30px;">
                        <div class="sim-label"><span style="font-weight:bold; color:#e6edf3;">🔥 Görev Döngüsü (Duty Cycle)</span><span id="val-duty" style="color:var(--spark-orange); font-weight:bold;">20%</span></div>
                        <input type="range" id="slider-duty" min="10" max="90" step="5" value="20" style="width: 100%; accent-color: var(--spark-orange);" oninput="AsoSimulasyon.hesaplaOsiloskop()">
                    </div>
                    <div style="margin-top: 30px; border-top: 1px dashed var(--border-color); padding-top: 20px; background: rgba(0,0,0,0.2); border-radius: 6px; padding: 15px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 10px;"><span style="color:#e6edf3;">Açık Kalma (T<sub>on</sub>):</span><b id="hesap-ton" style="color:var(--spark-orange);">0.2 ms</b></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom: 10px;"><span style="color:#e6edf3;">Kapalı/Soğuma (T<sub>off</sub>):</span><b id="hesap-toff" style="color:var(--plasma-blue);">0.8 ms</b></div>
                        <div style="display:flex; justify-content:space-between; border-top: 1px solid var(--border-color); padding-top: 8px; margin-top: 5px;"><span style="color:#e6edf3;">Toplam Periyot (T):</span><b id="hesap-periyot" style="color:#ffffff;">1.0 ms</b></div>
                    </div>
                    <div id="osiloskop-analiz-kutusu" style="margin-top: 20px; background: rgba(0,0,0,0.3); border-left: 4px solid #3fb950; border-radius: 6px; padding: 15px; font-size: 0.9em; line-height: 1.5; color: #ffffff; transition: all 0.3s ease;">Analiz Yükleniyor...</div>
                </div>
                <div style="flex: 2; min-width: 400px; background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; position: relative;">
                    <div style="position: absolute; top:0; left:0; right:0; bottom:0; background-image: linear-gradient(rgba(88, 166, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 166, 255, 0.05) 1px, transparent 1px); background-size: 40px 40px; border-radius:8px; pointer-events:none;"></div>
                    <div style="position: relative; height: 350px; width: 100%;"><canvas id="aso-osiloskop-chart"></canvas></div>
                </div>
            </div>
        </div>`;
    },

    hesaplaOsiloskop: function () {
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

        let analizKutusu = document.getElementById('osiloskop-analiz-kutusu');
        if (analizKutusu) {
            if (dutyCycle > 60) {
                analizKutusu.style.borderLeftColor = "#f85149";
                analizKutusu.innerHTML = `⚠️ <b style="color:#f85149; text-transform:uppercase;">Duty Cycle > %60: Termal Yük Riski</b><br><br><b>T<sub>off</sub></b> süresi (${t_off.toFixed(2)} ms) eriyik alüminanın soğuması için çok kısa. Yüzeyde amorf ve süngerimsi <b>&gamma;-fazı</b> birikimi olacaktır.`;
            } else if (dutyCycle < 30) {
                analizKutusu.style.borderLeftColor = "#58a6ff";
                analizKutusu.innerHTML = `❄️ <b style="color:#58a6ff; text-transform:uppercase;">Duty Cycle < %30: Yüksek Soğutma (Quenching)</b><br><br>Geniş <b>T<sub>off</sub></b> süresi (${t_off.toFixed(2)} ms) sayesinde kıvılcım kanalı mükemmel soğur. Eriyik alümina yoğunluklu <b>&alpha;-Al<sub>2</sub>O<sub>3</sub></b> fazına dönüşür.`;
            } else {
                analizKutusu.style.borderLeftColor = "#3fb950";
                analizKutusu.innerHTML = `⚖️ <b style="color:#3fb950; text-transform:uppercase;">Duty Cycle %30 - %60: Dengeli Rejim</b><br><br>Kararlı bir anodik kıvılcım platosu oluşur. Optimizasyon için frekansı artırarak kıvılcımların boyutunu küçültebilirsiniz.`;
            }
        }

        let zEkseni = [], aEkseni = [];
        let gosterilecekSaykl = 3;
        let toplamGosterimSuresi = toplamPeriyot_ms * gosterilecekSaykl;
        let zamanAdimi = toplamGosterimSuresi / 1000;

        for (let t = 0; t <= toplamGosterimSuresi; t += zamanAdimi) {
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

    cizOsiloskopGrafigi: function () {
        const ctx = document.getElementById('aso-osiloskop-chart');
        if (!ctx) return;
        if (this.aktifGrafikOsiloskop) this.aktifGrafikOsiloskop.destroy();

        this.aktifGrafikOsiloskop = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Akım Genliği (%)', data: [], borderColor: '#58a6ff', borderWidth: 3, backgroundColor: 'rgba(88, 166, 255, 0.1)', fill: true, stepped: true, pointRadius: 0 }] },
            options: {
                responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                scales: {
                    x: { title: { display: true, text: 'Zaman (Milisaniye - ms)', color: '#ffffff', font: { size: 14, weight: 'bold' } }, grid: { color: 'rgba(255,255,255,0)' }, ticks: { color: '#e6edf3', maxTicksLimit: 10 } },
                    y: { title: { display: true, text: 'Akım Genliği (%)', color: '#ffffff', font: { size: 14, weight: 'bold' } }, grid: { color: 'rgba(201, 209, 217, 0.05)' }, ticks: { color: '#e6edf3' }, min: -10, max: 120 }
                },
                animation: { duration: 0 }
            }
        });
        this.hesaplaOsiloskop();
    },

    // ==========================================
    // 🧪 3. BİRLEŞİK ELEKTROKİMYA (PDP & EIS)
    // ==========================================
    cizElektrokimyaArayuzu: function () {
        return `
        <div style="max-width: 1200px; margin: 0 auto; animation: fadein 0.3s ease;">
            <h1 style="color: #ffffff; border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0;">🧪 Bütünleşik Elektrokimyasal Performans (PDP & EIS)</h1>
            <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-top:20px;">
                <div style="flex: 1; min-width: 300px; background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px;">
                    <h3 style="color:#ffffff; margin-top:0; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">🎛️ Zırh Bütünlüğü Kontrolü</h3>
                    <div style="margin-top: 20px;">
                        <div class="sim-label"><span style="font-weight:bold; color:#e6edf3;">🛡️ Nominal Kaplama Kalitesi</span><span id="val-elektro-kalite" style="color:#ffb84d; font-weight:bold;">0%</span></div>
                        <input type="range" id="slider-elektro-kalite" min="0" max="100" step="1" value="0" style="width: 100%; margin-top:10px; accent-color: #ffb84d;" oninput="AsoSimulasyon.hesaplaElektrokimya()">
                    </div>
                    <div style="margin-top: 40px; border-top: 1px dashed var(--border-color); padding-top: 20px; background: rgba(0,0,0,0.2); border-radius: 6px; padding: 15px;">
                        <div style="color:#ff7b72; font-size:0.85em; font-weight:bold; margin-bottom:10px; text-transform:uppercase;">🧪 Potansiyodinamik Veriler (Tafel)</div>
                        <div style="display:flex; justify-content:space-between; margin-bottom: 10px;"><span style="color:#e6edf3;">Korozyon Potansiyeli (E<sub>corr</sub>):</span><b id="hesap-ecorr" style="color:#ffffff;">-0.80 V</b></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom: 25px;"><span style="color:#e6edf3;">Korozyon Akımı (I<sub>corr</sub>):</span><b id="hesap-icorr" style="color:#ff7b72;">1.00e-4 A/cm²</b></div>
                        
                        <div style="color:#58a6ff; font-size:0.85em; font-weight:bold; margin-bottom:10px; text-transform:uppercase; border-top:1px solid rgba(255,255,255,0.05); padding-top:10px;">🔍 Empedans Verileri (Nyquist)</div>
                        <div style="display:flex; justify-content:space-between; margin-bottom: 10px;"><span style="color:#e6edf3;">Bariyer Direnci (R<sub>b</sub>):</span><b id="hesap-rb" style="color:#58a6ff;">1,000 &Omega;</b></div>
                        <div style="display:flex; justify-content:space-between;"><span style="color:#e6edf3;">Toplam Koruma (R<sub>por</sub> + R<sub>b</sub>):</span><b id="hesap-rtoplam" style="color:#ffffff;">1,500 &Omega;</b></div>
                    </div>
                </div>
                <div style="flex: 2; display: flex; flex-direction: column; gap: 20px; min-width: 400px;">
                    <div style="background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; position: relative;">
                        <div style="position: absolute; top: 10px; left: 15px; font-size:0.85em; color:#ff7b72; font-weight:bold;">Tafel Eğrisi (Butler-Volmer)</div>
                        <div style="position: relative; height: 320px; width: 100%; margin-top:20px;"><canvas id="elektro-tafel-chart"></canvas></div>
                    </div>
                    <div style="background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; position: relative;">
                        <div style="position: absolute; top: 10px; left: 15px; font-size:0.85em; color:#58a6ff; font-weight:bold;">Nyquist Çemberi (Randles Devresi)</div>
                        <div style="position: relative; height: 320px; width: 100%; margin-top:20px;"><canvas id="elektro-nyquist-chart"></canvas></div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    hesaplaElektrokimya: function () {
        let kaplamaKalitesi = parseFloat(document.getElementById('slider-elektro-kalite').value);
        let sicaklik = parseFloat(document.getElementById('global-sicaklik')?.value || 25);
        let elektrolit = document.getElementById('global-elektrolit')?.value || 'silikat';

        let sicaklikCezasi = (sicaklik - 25) * 0.4;
        let gercekKalite = kaplamaKalitesi - sicaklikCezasi;
        if (elektrolit === 'fosfat') gercekKalite += 15;
        if (elektrolit === 'silikat') gercekKalite -= 5;

        // Asidik ASO, alkaliye göre daha gözenekli bir yapı bırakır
        if (elektrolit === 'asidik') gercekKalite -= 25;

        gercekKalite = Math.max(1, Math.min(gercekKalite, 100));
        document.getElementById('val-elektro-kalite').innerText = kaplamaKalitesi + "% (Nominal) ➔ Etkin: %" + Math.round(gercekKalite);

        let e_corr = -0.8 + (gercekKalite / 100) * 0.5;
        let i_corr_log = -4 - (gercekKalite / 100) * 5;
        let i_corr = Math.pow(10, i_corr_log);

        document.getElementById('hesap-ecorr').innerHTML = e_corr.toFixed(2) + " V";
        document.getElementById('hesap-icorr').innerHTML = this.bilimselNotasyon(i_corr) + " A/cm&sup2;";

        let dataPointsTafel = [];
        let beta_a = 0.12, beta_c = 0.12;

        for (let e = -1.2; e <= 0.2; e += 0.02) {
            let overpotential = e - e_corr;
            let akim = i_corr * (Math.pow(10, overpotential / beta_a) + Math.pow(10, -overpotential / beta_c));
            dataPointsTafel.push({ x: Math.log10(akim), y: e });
        }

        let Rs = 50, Cpor = 1e-6, Cb = 1e-8;
        let Rpor = 500 * (25 / sicaklik);
        let Rb = 1000 * Math.pow(10, (gercekKalite / 100) * 3);

        document.getElementById('hesap-rb').innerHTML = Math.round(Rb).toLocaleString() + " &Omega;";
        document.getElementById('hesap-rtoplam').innerHTML = Math.round(Rs + Rpor + Rb).toLocaleString() + " &Omega;";

        let dataPointsNyquist = [];
        for (let f_log = 5; f_log >= -2; f_log -= 0.1) {
            let f = Math.pow(10, f_log);
            let w = 2 * Math.PI * f;
            let z_real = Rs + (Rpor / (1 + Math.pow(w * Rpor * Cpor, 2))) + (Rb / (1 + Math.pow(w * Rb * Cb, 2)));
            let z_imag = ((w * Math.pow(Rpor, 2) * Cpor) / (1 + Math.pow(w * Rpor * Cpor, 2))) + ((w * Math.pow(Rb, 2) * Cb) / (1 + Math.pow(w * Rb * Cb, 2)));
            dataPointsNyquist.push({ x: z_real, y: z_imag });
        }

        if (this.aktifGrafikTafel) {
            this.aktifGrafikTafel.data.datasets[0].data = dataPointsTafel;
            this.aktifGrafikTafel.update();
        }

        if (this.aktifGrafikNyquist) {
            this.aktifGrafikNyquist.data.datasets[0].data = dataPointsNyquist;
            let maxScale = (Rs + Rpor + Rb) * 1.1;
            this.aktifGrafikNyquist.options.scales.x.max = maxScale;
            this.aktifGrafikNyquist.options.scales.y.max = maxScale / 1.6;
            this.aktifGrafikNyquist.update();
        }
    },

    baslatElektrokimyaGrafikleri: function () {
        const ctxTafel = document.getElementById('elektro-tafel-chart');
        if (this.aktifGrafikTafel) this.aktifGrafikTafel.destroy();
        if (ctxTafel) {
            this.aktifGrafikTafel = new Chart(ctxTafel, {
                type: 'scatter',
                data: { datasets: [{ label: 'Tafel Eğrisi', data: [], borderColor: '#ff7b72', backgroundColor: 'rgba(255, 123, 114, 0.2)', borderWidth: 2, showLine: true, pointRadius: 0, tension: 0.2 }] },
                options: {
                    responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    scales: {
                        x: { title: { display: true, text: 'Log Akım Yoğunluğu (Log I)', color: '#ffffff', font: { size: 14, weight: 'bold' } }, grid: { color: 'rgba(201, 209, 217, 0.05)' }, ticks: { color: '#e6edf3' }, min: -10, max: 0 },
                        y: { title: { display: true, text: 'Potansiyel (E) [V]', color: '#ffffff', font: { size: 14, weight: 'bold' } }, grid: { color: 'rgba(201, 209, 217, 0.05)' }, ticks: { color: '#e6edf3' }, min: -1.2, max: 0.2 }
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
                    responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    scales: {
                        x: { title: { display: true, text: "Gerçek Empedans, Z' (\u03A9)", color: '#ffffff', font: { size: 14, weight: 'bold' } }, grid: { color: 'rgba(201, 209, 217, 0.05)' }, ticks: { color: '#e6edf3' }, min: 0 },
                        y: { title: { display: true, text: "-Sanal Empedans, -Z'' (\u03A9)", color: '#ffffff', font: { size: 14, weight: 'bold' } }, grid: { color: 'rgba(201, 209, 217, 0.05)' }, ticks: { color: '#e6edf3' }, min: 0 }
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
    cizFazArayuzu: function () {
        return `
        <div style="max-width: 1000px; margin: 0 auto; animation: fadein 0.3s ease;">
            <h1 style="color: #ffffff; border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0;">🔬 &alpha;-Al<sub>2</sub>O<sub>3</sub> / &gamma;-Al<sub>2</sub>O<sub>3</sub> Faz Dönüşümü</h1>
            <div style="display: flex; gap: 30px; margin-top: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 300px; background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px;">
                    <h3 style="color:#ffffff; margin-top:0; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">🎛️ Termal Döngü Kontrolü</h3>
                    <div style="margin-top: 20px;">
                        <div class="sim-label"><span style="font-weight:bold; color:#e6edf3;">⏱️ İşlem Süresi (Dk)</span><span id="val-sure" style="color:var(--spark-orange); font-weight:bold;">5 Dk</span></div>
                        <input type="range" id="slider-sure" min="5" max="60" step="5" value="5" style="width: 100%; accent-color: var(--spark-orange);" oninput="AsoSimulasyon.hesaplaFaz()">
                    </div>
                    <div style="margin-top: 30px;">
                        <div class="sim-label"><span style="font-weight:bold; color:#e6edf3;">🧪 Tungstat / Bor Katkısı</span><span id="val-katki" style="color:var(--plasma-blue); font-weight:bold;">Yok</span></div>
                        <input type="range" id="slider-katki" min="0" max="1" step="1" value="0" style="width: 100%; accent-color: var(--plasma-blue);" oninput="AsoSimulasyon.hesaplaFaz()">
                    </div>
                    <div style="margin-top: 40px; border-top: 1px dashed var(--border-color); padding-top: 20px; background: rgba(0,0,0,0.2); border-radius: 6px; padding: 15px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 10px;"><span style="color:#e6edf3;">&gamma;-Al<sub>2</sub>O<sub>3</sub> (Gözenekli):</span><b id="hesap-gama" style="color:#ff7b72;">90%</b></div>
                        <div style="display:flex; justify-content:space-between; border-top: 1px solid var(--border-color); padding-top: 10px;"><span style="color:#e6edf3;">&alpha;-Al<sub>2</sub>O<sub>3</sub> (Korindon):</span><b id="hesap-alfa" style="color:#3fb950;">10%</b></div>
                    </div>
                </div>
                <div style="flex: 1.5; min-width: 350px; background: var(--bg-dark); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; display:flex; flex-direction:column; align-items:center;">
                    <h3 style="color:#ffffff; margin-top:0; margin-bottom: 20px;">SEM Kesit Morfolojisi (Mikroyapı)</h3>
                    <div style="width: 100%; max-width: 300px; height: 350px; display: flex; flex-direction: column; border: 2px solid #30363d; border-radius: 8px; overflow: hidden; box-shadow: inset 0 0 30px rgba(0,0,0,0.9);">
                        <div style="height: 10%; background: rgba(88, 166, 255, 0.05); border-bottom: 2px dashed var(--plasma-blue); display:flex; justify-content:center; align-items:center; font-size: 0.8em; color: var(--plasma-blue); text-shadow: 0 0 5px var(--plasma-blue);">Elektrolit (ASO Arayüzü)</div>
                        <div id="katman-gama" style="height: 60%; background-color: #4a1c1a; background-image: radial-gradient(circle at 20% 30%, #1a0808 4px, transparent 5px), radial-gradient(circle at 70% 60%, #1a0808 6px, transparent 7px), radial-gradient(circle at 40% 80%, #1a0808 3px, transparent 4px), radial-gradient(circle at 85% 25%, #1a0808 5px, transparent 6px), radial-gradient(circle at 10% 70%, #1a0808 4px, transparent 5px), radial-gradient(circle at 60% 15%, #1a0808 3px, transparent 4px); display:flex; justify-content:center; align-items:center; color:#ff7b72; font-weight:bold; text-shadow: 1px 1px 2px #000; transition: height 0.5s ease-in-out, opacity 0.5s;">&gamma;-Fazı (Amorf/Gözenekli)</div>
                        <div id="katman-alfa" style="height: 10%; background-color: #1e4a28; background-image: repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(0,0,0,0.3) 12px, rgba(0,0,0,0.3) 14px); display:flex; justify-content:center; align-items:center; color:#a1d586; font-weight:bold; text-shadow: 1px 1px 2px #000; transition: height 0.5s ease-in-out; border-top: 2px solid #5c2b29; border-bottom: 3px solid #3fb950; box-shadow: 0 -5px 15px rgba(0,0,0,0.5);">&alpha;-Fazı (Sert Bariyer)</div>
                        <div style="height: 20%; background-color: #30363d; background-image: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.03) 5px, rgba(255,255,255,0.03) 6px), repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(255,255,255,0.03) 5px, rgba(255,255,255,0.03) 6px); display:flex; justify-content:center; align-items:center; color:#e6edf3; font-weight:bold; text-shadow: 1px 1px 2px #000;">Metalik Substrat</div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    hesaplaFaz: function () {
        let sure = parseFloat(document.getElementById('slider-sure').value);
        let katki = parseInt(document.getElementById('slider-katki').value);
        let sicaklik = parseFloat(document.getElementById('global-sicaklik')?.value || 25);
        let elektrolit = document.getElementById('global-elektrolit')?.value || 'silikat';

        document.getElementById('val-sure').innerText = sure + " Dk";
        document.getElementById('val-katki').innerText = katki === 1 ? "Aktif" : "Yok";

        let maxOksitKalikligi = 70;

        // ASO dinamikleri: Plazma 600V'a çıkmadığı için Korindon oluşumu PEO'ya göre çok daha kısıtlıdır (Maksimum %45).
        let alfaYuzde = (sure / 60) * 45;

        if (katki === 1) alfaYuzde = alfaYuzde * 1.5;
        if (elektrolit === 'aluminat') alfaYuzde += 10;
        alfaYuzde -= (sicaklik - 25) * 0.5;

        // Asidik ASO'da termal şok düşük olduğu için alfa fazı neredeyse hiç oluşmaz
        if (elektrolit === 'asidik') alfaYuzde = Math.max(0, alfaYuzde - 20);

        alfaYuzde = Math.max(0, Math.min(alfaYuzde, 95));
        let gamaYuzde = 100 - alfaYuzde;

        document.getElementById('hesap-alfa').innerHTML = Math.round(alfaYuzde) + "%";
        document.getElementById('hesap-gama').innerHTML = Math.round(gamaYuzde) + "%";

        let kAlfa = document.getElementById('katman-alfa');
        let kGama = document.getElementById('katman-gama');

        if (kAlfa && kGama) {
            kAlfa.style.height = (maxOksitKalikligi * (alfaYuzde / 100)) + "%";
            kGama.style.height = (maxOksitKalikligi * (gamaYuzde / 100)) + "%";

            let gamaOpaklik = 0.4 + (gamaYuzde / 100) * 0.6;
            kGama.style.opacity = gamaOpaklik;

            let yesilTon = Math.min(255, 60 + (alfaYuzde * 2));
            kAlfa.style.backgroundColor = `rgb(30, ${yesilTon}, 40)`;
        }
    },

    // ==========================================
    // 📊 5. LİTERATÜR ANALİZİ (YAYIN/ATIF GRAFİĞİ)
    // ==========================================
    cizYayinGrafikArayuzu: function () {
        return `
        <div style="max-width: 1300px; width: 95%; margin: 0 auto; animation: fadein 0.3s ease;">
            <h1 style="color: #ffffff; border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0;">📊 ASO/PEO Literatür Gelişimi (1983-2026)</h1>
            <div style="background: rgba(88, 166, 255, 0.05); border: 1px solid rgba(88, 166, 255, 0.2); border-radius: 8px; padding: 15px 20px; font-size: 0.95em; color: #ffffff; line-height: 1.6; margin-bottom: 25px;">
                Yüzey mühendisliğinde 1970'lerde Anodik Kıvılcım (ASO) ile başlayan, 80'lerde Mikro-Ark (MAO) ile evrilen ve 90'lar sonrasında Plazma Elektrolitik Oksidasyon (PEO) adını alan bu dielektrik kırılma teknolojilerinin tamamı, son 20 yılda muazzam bir eksponansiyel patlama yaşamıştır. Özellikle çevre dostu ve düşük voltajlı <b>"Yumuşak Kıvılcım" (Soft-Sparking)</b> rejimine olan endüstriyel talep, ASO modifikasyonlarını global mühendisliğin en sıcak araştırma konularından biri haline getirmiştir.
            </div>
            <div style="background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 10px; padding: 25px; box-shadow: 0 8px 25px rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; flex-direction: column;">
                <div style="width: 100%; overflow: hidden; border-radius: 8px; box-shadow: 0 0 25px rgba(0,0,0,0.8); border: 1px solid var(--border-color); background: #ffffff;">
                    <img src="aso_mao_peo_1983_2026_yayin_atif_verileri.jpg" alt="1983-2026 ASO MAO PEO Yayın ve Atıf Verileri" style="width: 100%; height: auto; display: block;">
                </div>
                <p style="font-size: 0.95em; color: #e6edf3; margin-top: 20px; font-style: italic; text-align: justify; line-height: 1.6; width: 100%; box-sizing: border-box;">
                    1983 yılından 2026 yılı ortasına kadar Anodik Kıvılcım Oksidasyonu (ASO), Mikro-Ark Oksidasyonu (MAO) ve Plazma Elektrolitik Oksidasyon (PEO) literatürüne ait yıllık yayın ve atıf istatistikleri (Toplam 6.238 Yayın | ~180.322 Atıf). Yayın ve atıf verileri aynı makale havuzunu referans aldığından, en güncel yıl olan 2026'ya ait atıf sayıları henüz yapım aşamasında olduğu için doğal olarak düşük eğimlidir. <em>(Bu veriler; Web of Science Core Collection veritabanı üzerinden polimer ve tıp alanındaki kısaltma çakışmaları elenerek, sadece yüzey mühendisliği ve elektrokimya kategorilerinde 'Anodic Spark Oxidation', 'Micro-Arc Oxidation' ve 'Plasma Electrolytic Oxidation' tam terim öbeklerini barındıran makaleler izole edilerek elde edilmiştir.)</em>
                </p>
            </div>
        </div>`;
    },

    // ==========================================
    // ⚡ 6. EKOLLER & ÇALIŞMA ARALIKLARI (YENİ MODÜL)
    // ==========================================
    cizEkollerArayuzu: function () {
        return `
        <div style="max-width: 1200px; margin: 0 auto; animation: fadein 0.3s ease;">
            <h1 style="color: #ffffff; border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0;">⚡ PEO, MAO ve ASO: Deneysel Çalışma Aralıkları ve Ekol Farkları</h1>
            <div style="background: rgba(88, 166, 255, 0.05); border: 1px solid rgba(88, 166, 255, 0.2); border-radius: 8px; padding: 15px 20px; font-size: 0.95em; color: #ffffff; line-height: 1.6; margin-bottom: 20px;">
                Yüzey mühendisliğinde temel ilke olarak her üç yöntem de valf metallerinin anodik kutuplanması ve uygulanan yüksek elektrik alanı altında yalıtkan oksit filminin dielektrik kırılmaya (breakdown) uğramasıyla başlar. Ancak sürecin hangi termodinamik enerjide, hangi voltaj aralığında ve hangi plazma fazında çalıştırıldığına göre isimlendirme, morfolojik çıktı ve endüstriyel hedef kökten değişir.
            </div>
            <div style="overflow-x: auto; background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9em;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--plasma-blue); color: #ffffff;">
                            <th style="padding: 12px; width: 18%;">Karşılaştırma Metriği</th>
                            <th style="padding: 12px; width: 27%; background: rgba(88, 166, 255, 0.1); color: var(--plasma-blue);">⚡ ASO (Anodic Spark Oxidation)<br><small style="color:#e6edf3;">Tez Hedefimiz</small></th>
                            <th style="padding: 12px; width: 27%;">🔥 MAO (Micro-Arc Oxidation)</th>
                            <th style="padding: 12px; width: 28%;">💥 PEO (Plasma Electrolytic Oxidation)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 12px; font-weight: bold; color: #ffffff;">Tarihsel Gelişim ve Ekol</td>
                            <td style="padding: 12px; background: rgba(88, 166, 255, 0.03); color: #e6edf3;">1970'ler (Brown ve çalışma arkadaşları). ABD/İlk Dönem Ekolü.</td>
                            <td style="padding: 12px; color: #e6edf3;">1980'ler - 1990'lar (Markov, Snezhko). Rus ve Çin Ekolleri.</td>
                            <td style="padding: 12px; color: #e6edf3;">1990'lar - Günümüz (Kurze, Yerokhin). Avrupa/İngiliz Ekolü.</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 12px; font-weight: bold; color: #ffffff;">Deneysel Voltaj Aralığı</td>
                            <td style="padding: 12px; background: rgba(88, 166, 255, 0.03); color: var(--plasma-blue); font-weight: bold;">200 V – 250 V<br><small style="color:#e6edf3; font-weight:normal;">Dielektrik bozulma eşiğinin hemen üzeri (Plato)</small></td>
                            <td style="padding: 12px; color: var(--spark-orange); font-weight: bold;">250 V – 450 V<br><small style="color:#e6edf3; font-weight:normal;">Dinamik geçiş ve ark büyüme bandı</small></td>
                            <td style="padding: 12px; color: #f85149; font-weight: bold;">500 V – 650 V+<br><small style="color:#e6edf3; font-weight:normal;">Yüksek enerjili plazma yıkım ve sinterleme bandı</small></td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 12px; font-weight: bold; color: #ffffff;">Deşarj / Kıvılcım Fiziği</td>
                            <td style="padding: 12px; background: rgba(88, 166, 255, 0.03); color: #e6edf3;"><b>"Yumuşak Kıvılcım" (Soft-Sparking):</b> Ayrık, incecik, mavi-beyaz ve düşük enerjili sessiz mikro-kıvılcımlar.</td>
                            <td style="padding: 12px; color: #e6edf3;"><b>Mikro-Arklar:</b> Kıvılcımların birleşerek yüzeyde hareket eden gürültülü ve daha büyük ark kaskadlarına dönüşmesi.</td>
                            <td style="padding: 12px; color: #e6edf3;"><b>Şiddetli Plazma Deşarjları:</b> Yüksek yerel sıcaklık yaratan (10<sup>4</sup> K), uzun ömürlü ve bölgesel erimelere yol açan devasa arklar.</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 12px; font-weight: bold; color: #ffffff;">Mikro-Deşarj Ömrü</td>
                            <td style="padding: 12px; background: rgba(88, 166, 255, 0.03); color: #e6edf3;"><b>~10 – 50 &micro;s</b><br><small style="color:#e6edf3;">Milisaniyeler içinde şok soğuma ile sönümlenir</small></td>
                            <td style="padding: 12px; color: #e6edf3;"><b>~50 – 200 &micro;s</b><br><small style="color:#e6edf3;">Gaz kabarcığı büyümesi ve molalar dengededir</small></td>
                            <td style="padding: 12px; color: #e6edf3;"><b>~200 – 1000 &micro;s+</b><br><small style="color:#e6edf3;">Uzun süreli plazma sütunları ısı havuzu yaratır</small></td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 12px; font-weight: bold; color: #ffffff;">Dominant Faz ve Kristalografi</td>
                            <td style="padding: 12px; background: rgba(88, 166, 255, 0.03); color: #e6edf3;">Ağırlıklı olarak <b>Amorf</b> ve yarı-kararlı <b>&gamma;-Al<sub>2</sub>O<sub>3</sub></b>. Alt katmanlarda katı-hal dönüşümlü &alpha;-fazı.</td>
                            <td style="padding: 12px; color: #e6edf3;">Amorf matris içinde sinterlenmiş <b>&gamma;-Al<sub>2</sub>O<sub>3</sub></b> ve artan oranda <b>&alpha;-Al<sub>2</sub>O<sub>3</sub></b> dengesi.</td>
                            <td style="padding: 12px; color: #e6edf3;">Termodinamik olarak en kararlı, ultra sert <b>&alpha;-Al<sub>2</sub>O<sub>3</sub></b> (Korindon / Safir fazı) baskındır.</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 12px; font-weight: bold; color: #ffffff;">Morfoloji ve Porozite</td>
                            <td style="padding: 12px; background: rgba(88, 166, 255, 0.03); color: #e6edf3;"><b>Ultra-Düşük Porozite (<%2):</b> Kompozit katkılarla (Bor, h-BN, Grafen) mühürlenmiş, mikro-çatlaksız sıkı matris.</td>
                            <td style="padding: 12px; color: #e6edf3;"><b>Orta Porozite (%5 - %10):</b> Kontrollü volkanik kraterler ve katı yağlayıcılar için mikro-rezervuarlar.</td>
                            <td style="padding: 12px; color: #e6edf3;"><b>Yüksek Porozite (%10 - %20+):</b> Şiddetli O₂ gaz evrimi ve buharlaşma nedeniyle oluşan derin volkanik kraterler ve termal çatlaklar.</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; font-weight: bold; color: #ffffff;">Endüstriyel Hedef ve Hitap Ettiği Kısım</td>
                            <td style="padding: 12px; background: rgba(88, 166, 255, 0.03); color: #ffffff;"><b>Fonksiyonel Yüzey Mühendisliği:</b> Tribolojik katı yağlama (COF: 0.18), fotokataliz, biyo-seramik emdirme ve hassas koruma.</td>
                            <td style="padding: 12px; color: #ffffff;"><b>Genel Aşınma ve Korozyon:</b> Orta ve ağır yük taşıyan makine parçaları, otomotiv motor blokları ve denizcilik alaşımları.</td>
                            <td style="padding: 12px; color: #ffffff;"><b>Ağır Sanayi Zırhı:</b> Aşırı termal ve mekanik strese maruz kalan askeri, nükleer ve havacılık bileşenleri.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; font-size: 0.85em; color: #e6edf3; text-align: right;">
                <b>Literatür Referansları:</b> Clyne & Troughton (2018); Ding vd. (2024); Bousser vd. (2023); Hakimizad vd. (2018); Korzekwa (2023); Z. Li vd. (2025).
            </div>
        </div>`;
    }
};

window.onload = () => {
    AsoSimulasyon.guncelleArayuzSecenekleri();
    const ilkButon = document.getElementById('btn-kinetik');
    if (ilkButon) AsoSimulasyon.yukle(ilkButon.nextElementSibling.querySelector('.alt-btn'), 'voltaj-zaman');
};
