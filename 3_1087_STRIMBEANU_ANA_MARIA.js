// Life expectancy by age and sex

const getUrlSVbyGeo = (geo) => `https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/demo_mlexpec?precision=1&sex=T&age=Y1&geo=${geo}`;

// Population on 1 January by age and sex
const getUrlPOPbyGeo = (geo) => `https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/demo_pjan?precision=1&sex=T&age=TOTAL&geo=${geo}`;

// Real GDP per capita
const getUrlPIBbyGeo = (geo) => `https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/sdg_08_10?na_item=B1GQ&precision=1&unit=CLV10_EUR_HAB&geo=${geo}`

let indici = {
    SV: 'SV',
    POP: 'POP',
    PIB: 'PIB'
};

let tari = ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'HR', 'IT', 'CY', 'LV', 'LT', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE'];

// Voi obtine un vector de obiecte similar cu JSON-ul de la dvs.
// Pentru rezolvarea cerintelor, m-am folosit de 3 vectori de obiecte, filtrati in functie de indicator.
let rezultateSV = [];
let rezultatePOP = [];
let rezultatePIB = [];

// Declar global min si max pentru ca aplic colorarea in functie de distanta fata de medie de mai multe ori.
let minMaxSV = { min: 0, max: 0 }, minMaxPOP = { min: 0, max: 0 }, minMaxPIB = { min: 0, max: 0 };
let mediaSV = 0, mediaPOP = 0, mediaPIB = 0;

async function prelucrareDateRequestIndicatori(rezultateRequesturi, numeIndice) {
    let rezultatePrelucrate = [];

    // Trec prin fiecare response si salvez in rezultatePrelucrate in formatul cerut
    for (let rez of rezultateRequesturi) {
        let data = await rez.json(); // avem fix datele de genul asta http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/demo_mlexpec?precision=1&sex=T&age=Y1&geo=BG

        // Preiau tara din date
        let tara = Object.keys(data.dimension.geo.category.label)[0]; // Object.keys => array cu toate key-le objectului; aici am o singura tara, deci iau prima keye

        // Vreau datele pentru anii 2005-2019, pentru asta mai intai trebuie sa iau indecsii anilor din data.dimension.time.category.index
        let indecsiAniDoriti = [];
        for (let an in data.dimension.time.category.index) {
            // key-ul este anul, iar valoarea este indexul
            if (parseInt(an) >= 2005 && parseInt(an) <= 2019)
                indecsiAniDoriti.push(data.dimension.time.category.index[an]);
        }

        // Creez obiectul final 
        let an = 2005;
        for (let i = 0; i < indecsiAniDoriti.length; i++) {
            let indexAnCurent = indecsiAniDoriti[i];
            let valoareAnCurent = data.value[indexAnCurent];

            let rezultatAnCurent = {
                tara: tara,
                an: an++,
                indicator: numeIndice,
                valoare: valoareAnCurent || '-'
            };

            rezultatePrelucrate.push(rezultatAnCurent);
        }
    }

    return rezultatePrelucrate;
}

function populareSelectTari(id, changeEventHandler) {
    let selectTari = document.querySelector(id);

    for (let tara of tari) {
        let valoare = document.createElement('option');
        valoare.innerText = tara;  // intre tag-urile elementului option
        valoare.value = tara; //atribut
        selectTari.append(valoare);
    }

    //selectTari.addEventListener('change', changeEventHandler);
    selectTari.onchange = changeEventHandler;
}

function populareSelectAni(id, changeEventHandler) {
    let selectAni = document.querySelector(id);

     for (let an = 2019; an > 2004; an--) {
         let valoare = document.createElement('option');
         valoare.innerText = an;  // intre tag-urile elementului option
         valoare.value = an; //atribut
         selectAni.append(valoare);
    }

    //selectAni.addEventListener('change', changeEventHandler);
    selectAni.onchange = changeEventHandler;
}

function populareTabel() {
    let anSelectat = document.querySelector('#selectAnTabelIndicatori').value;
    let tbody = document.querySelector('#tbodyIndicatori');
    tbody.innerText = '';
    minMaxSV = { min: 0, max: 0 };
    minMaxPOP = { min: 0, max: 0 };
    minMaxPIB = { min: 0, max: 0 };

    // Adaugare rand cu rand a valorilor (pentru o tara o data):
    for (let tara of tari) {
        let randTara = document.createElement('tr');
        tbody.append(randTara);

        let adaugaCelula = valoareCelula => { 
            let celula = document.createElement('td');
            celula.innerText = valoareCelula;
            randTara.append(celula);
        };

        adaugaCelula(tara); //adCel('BE'); 
        
        // Filtrez lista de rezultate cu filter() si primesc un array cu rezultatele care respecta conditia filtrului
        let filtruAnTaraCurente_SV = rezultateSV.filter(rezSv => rezSv.tara == tara && rezSv.an == anSelectat);
        let filtruAnTaraCurente_POP = rezultatePOP.filter(rezPop => rezPop.tara == tara && rezPop.an == anSelectat);
        let filtruAnTaraCurente_PIB = rezultatePIB.filter(rezPib => rezPib.tara == tara && rezPib.an == anSelectat);

        // alternativa la .filter() ar fi cu for:
        //for (let rezSVTara of rezultateSV) {
        //    if (rezSVTara.tara == tara && rezSVTara.an == anSelectat) {
        //        valoareAnTaraCurente_SV = rezSVTara.valoare;
        //        break; // dupa ce am gasit valoarea cautata nu ma mai uit la tarile de dupa
        //    }
        //}

        // Preiau datele din filtrele obtinute
        let valoareAnTaraCurente_SV = filtruAnTaraCurente_SV.length ? filtruAnTaraCurente_SV[0].valoare : '-';
        let valoareAnTaraCurente_POP = filtruAnTaraCurente_POP.length ? filtruAnTaraCurente_POP[0].valoare : '-';
        let valoareAnTaraCurente_PIB = filtruAnTaraCurente_PIB.length ? filtruAnTaraCurente_PIB[0].valoare : '-';
        
        // Adaug valorile in celula
        adaugaCelula(valoareAnTaraCurente_SV);
        adaugaCelula(valoareAnTaraCurente_POP);
        adaugaCelula(valoareAnTaraCurente_PIB);

        // Salvez minMax pentru fiecare indice
        if (minMaxSV.min == 0 && valoareAnTaraCurente_SV != '-') minMaxSV.min = valoareAnTaraCurente_SV;
        else minMaxSV.min = valoareAnTaraCurente_SV < minMaxSV.min ? valoareAnTaraCurente_SV : minMaxSV.min;
        minMaxSV.max = valoareAnTaraCurente_SV > minMaxSV.max ? valoareAnTaraCurente_SV : minMaxSV.max;

        if (minMaxPOP.min == 0 && valoareAnTaraCurente_POP != '-') minMaxPOP.min = valoareAnTaraCurente_POP;
        else minMaxPOP.min = valoareAnTaraCurente_POP < minMaxPOP.min ? valoareAnTaraCurente_POP : minMaxPOP.min;
        minMaxPOP.max = valoareAnTaraCurente_POP > minMaxPOP.max ? valoareAnTaraCurente_POP : minMaxPOP.max;

        if (minMaxPIB.min == 0 && valoareAnTaraCurente_PIB != '-') minMaxPIB.min = valoareAnTaraCurente_PIB;
        else minMaxPIB.min = valoareAnTaraCurente_PIB < minMaxPIB.min ? valoareAnTaraCurente_PIB : minMaxPIB.min;
        minMaxPIB.max = valoareAnTaraCurente_PIB > minMaxPIB.max ? valoareAnTaraCurente_PIB : minMaxPIB.max;
    }

    populareFooter();
    colorareTabel();
}

// Pentru medie
function populareFooter() {
    let tfootRow = document.querySelector('tfoot tr');
    let rows = document.querySelectorAll('tbody tr');
    let sumSV = 0, sumPOP = 0, sumPIB = 0;
    let valoriNuleSV = 0, valoriNulePOP = 0, valoriNulePIB = 0;

    for (let row of rows) {
        let valCelulaSV = parseFloat(row.querySelector("td:nth-child(2)").innerText);
        let valCelulaPOP = parseFloat(row.querySelector("td:nth-child(3)").innerText);
        let valCelulaPIB = parseFloat(row.querySelector("td:nth-child(4)").innerText);

        if (!valCelulaSV) valoriNuleSV++;
        if (!valCelulaPOP) valoriNulePOP++;
        if (!valCelulaPIB) valoriNulePIB++;

        sumSV += valCelulaSV || 0; // adauga la suma daca td-ul nu contine un falsy 
        sumPOP += valCelulaPOP || 0;
        sumPIB += valCelulaPIB || 0;
    }
    
    mediaSV = sumSV / (tari.length - valoriNuleSV) || 0;
    mediaPOP = sumPOP / (tari.length - valoriNulePOP) || 0;
    mediaPIB = sumPIB / (tari.length - valoriNulePIB) || 0;

    tfootRow.querySelector("td:nth-child(2)").innerText = mediaSV.toFixed(3);
    tfootRow.querySelector("td:nth-child(3)").innerText = mediaPOP.toFixed(3);
    tfootRow.querySelector("td:nth-child(4)").innerText = mediaPIB.toFixed(3);
}

// Modalitate de a calcula culoarea pentru fiecare valoare
function calculareRGBACelula(minMax, media, valCelula, alpha) {
    let red = 255, green = 255; // aici e culoarea mediei

    if (valCelula > media) {
        let deltaValoare = ((valCelula - media) * 255) / (minMax.max - media);
        red -= deltaValoare;
    } else {
        let deltaValoare = ((media - valCelula) * 255) / (media - minMax.min);
        green -= deltaValoare;
    }

    return `rgba(${red},${green},0, ${alpha ? alpha : 1})`;
}

function colorareTabel() {
    let rows = document.querySelectorAll('tbody tr');   

    for (let row of rows) {
        let celulaSV = row.querySelector("td:nth-child(2)");
        let celulaPOP = row.querySelector("td:nth-child(3)");
        let celulaPIB = row.querySelector("td:nth-child(4)");

        let valCelulaSV = parseFloat(celulaSV.innerText);
        let valCelulaPOP = parseFloat(celulaPOP.innerText);
        let valCelulaPIB = parseFloat(celulaPIB.innerText);

        if (valCelulaSV) {
            celulaSV.style.backgroundColor = calculareRGBACelula(minMaxSV, mediaSV, valCelulaSV);
        }

        if (valCelulaPOP) {
            celulaPOP.style.backgroundColor = calculareRGBACelula(minMaxPOP, mediaPOP, valCelulaPOP);
        }

        if (valCelulaPIB) {
            celulaPIB.style.backgroundColor = calculareRGBACelula(minMaxPIB, mediaPIB, valCelulaPIB);
        }
    }

}


function generareGraficLinie() {
    let taraSelectata = document.querySelector('#selectTaraGrafic').value;
    let indicatorSelectat = document.querySelector('#selectIndicatorGrafic').value;

    let graficSvg = document.querySelector('svg');
    let graficSvgText = document.querySelector('svg text');
    let latimeGrafic = graficSvg.getAttribute('width');
    let inaltimeGrafic = graficSvg.getAttribute('height');

    // pe baza indicatorului selectat trebuie sa iterez prin rezultatele corespunzatoare
    let rezultate;
    if (indicatorSelectat == indici.SV) rezultate = rezultateSV;
    else if (indicatorSelectat == indici.POP) rezultate = rezultatePOP;
    else rezultate = rezultatePIB;

    // din rezultate aleg doar datele corespunzatoare tarii
    // si cele care au valoare valida (cazul tarilor cu valoarea == '-')
    let dateGrafic = rezultate.filter(rez => rez.tara == taraSelectata && rez.valoare);

    // iau toate valorile si le pun intr-un array pt a genera x,y
    let valoriGrafic = [];
    for (let date of dateGrafic) valoriGrafic.push(date.valoare);

    // curat graficul curent
    document.querySelectorAll('svg polyline').forEach(e => e.parentNode.removeChild(e));

    // desenez noul grafic
    let xAnterior = 0, yAnterior = inaltimeGrafic;
    let latimeSegment = latimeGrafic / (dateGrafic.length - 1);
    for (let i = 0; i < valoriGrafic.length; i++) {
        let x = i * latimeSegment;
        let y = (inaltimeGrafic * (Math.max(...valoriGrafic) - valoriGrafic[i])) / (Math.max(...valoriGrafic) - Math.min(...valoriGrafic))

        // puncte linie curenta
        let puncte = xAnterior.toString() + ',' + yAnterior.toString() + ' ' + x.toString() + ',' + y.toString();

        // punctele curente devin anterioare pt urmatoarea linie
        xAnterior = x;
        yAnterior = y;

        // desenez linia curenta
        let linie = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        linie.setAttribute('points', puncte);

        // colorare linie cu aceeasi culoare ca in tabel
        let minMax = { min: Math.min(...valoriGrafic), max: Math.max(...valoriGrafic) };

        let sum = 0;
        for (let v of valoriGrafic) sum += v;
        let media = sum / valoriGrafic.length;

        linie.style.stroke = calculareRGBACelula(minMax, media, valoriGrafic[i]);

        //Pentru tooltip: afisare on mouse over
        linie.onmouseover = () => {
            graficSvgText.setAttribute('x', x);
            graficSvgText.setAttribute('y', y);
            graficSvgText.innerHTML = `${dateGrafic[i].valoare} (${dateGrafic[i].an})`;
        };

        linie.onmouseout = () => {
            graficSvgText.innerHTML = '';
        };

        // adaug linia inainte de text (ca sa vina textul peste linie)
        graficSvg.insertBefore(linie, graficSvgText);
    }
}

function generareBubbleChart() {
    let anSelectat = document.getElementById("selectAnBubbleChart").value;
    let canvas = document.getElementById("canvasBubbleChart");
    let context = canvas.getContext("2d");
    let cvW = canvas.width; let cvH = canvas.height;

    context.clearRect(0, 0, cvW, cvH); // curatare bitmap in caz de schimbare ani din select
    context.fillStyle = 'rgba(242, 179, 102, 0.8)';
    context.fillRect(0, 0, cvW, cvH);

    let valoriSV = [], valoriPIB = [], valoriPOP = [];
    for (let tara of tari) {
        let dateSVTara = rezultateSV.filter(rez => rez.an == anSelectat && rez.tara == tara);
        let datePIBTara = rezultatePIB.filter(rez => rez.an == anSelectat && rez.tara == tara);
        let datePOPTara = rezultatePOP.filter(rez => rez.an == anSelectat && rez.tara == tara);

        // pentru cazul in care nu am valoare pentru anul si tara curenta, folosesc ca valoare
        // jumatate din inaltimea canvasului ca totusi sa afisez si tara respectiva (ex: 2019 nu are SV deloc)
        let valoareSVAnTara = dateSVTara.length ? dateSVTara[0].valoare : cvH / 2;
        let valoarePIBAnTara = datePIBTara.length ? datePIBTara[0].valoare : cvH / 2;
        let valoarePOPAnTara = datePOPTara.length ? datePOPTara[0].valoare : cvH / 2;

        valoriSV.push(valoareSVAnTara);
        valoriPIB.push(valoarePIBAnTara);
        valoriPOP.push(valoarePOPAnTara);
    }

    let minSV = Math.min(...valoriSV);
    let maxSV = Math.max(...valoriSV);
    let minPIB = Math.min(...valoriPIB);
    let maxPIB = Math.max(...valoriPIB);

    // pe baza pop o sa desenez cercuri, iar aria unui cerc e determinata de valorile pop
    let arieMax = 10000, arieMin = 1000;
    let minPOP = Math.min(...valoriPOP);
    let maxPOP = Math.max(...valoriPOP);
    let sumPOP = 0;
    for (let val of valoriPOP) sumPOP += val;
    let mediePOP = sumPOP / valoriPOP.length;

    for (let i = 0; i < tari.length; i++) {
        let tara = tari[i];
        let taraSV = valoriSV[i];
        let taraPIB = valoriPIB[i];
        let taraPOP = valoriPOP[i];

        let raza = Math.sqrt((arieMax - (((arieMax - arieMin) * (maxPOP - taraPOP)) / (maxPOP - minPOP))) / Math.PI);
        let x = ((taraPIB - minPIB) * cvW) / (maxPIB - minPIB);
        let y = ((maxSV - taraSV) * cvH) / (maxSV - minSV);

        context.beginPath();
        context.arc(x, y, raza, 0, 2 * Math.PI);
        context.strokeStyle = "black";
        context.lineWidth = 1;
        context.fillStyle = calculareRGBACelula({ min: minPOP, max: maxPOP }, mediaPOP, taraPOP, 0.6);
        context.fill();
        context.stroke();
    }
}
async function aplicatie() {
    // fiecare vector va avea cate 27 elemente (tarile)
    let svRequests = [];
    let popRequests = [];
    let pibRequests = [];

    for (let tara of tari) {
        // obtin url pentru fiecare indice per tara
        let urlTaraCurentaSV = getUrlSVbyGeo(tara);
        let urlTaraCurentaPOP = getUrlPOPbyGeo(tara);
        let urlTaraCurentaPIB = getUrlPIBbyGeo(tara);

        // fac request la url-urile obtinute
        let requestUrlTaraCurentaSV = fetch(urlTaraCurentaSV);
        let requestUrlTaraCurentaPOP = fetch(urlTaraCurentaPOP);
        let requestUrlTaraCurentaPIB = fetch(urlTaraCurentaPIB);

        // salvez request-urile create in lista de requesturi pentru fiecare indice
        svRequests.push(requestUrlTaraCurentaSV);
        popRequests.push(requestUrlTaraCurentaPOP);
        pibRequests.push(requestUrlTaraCurentaPIB);
    }

    // astept (await) pana cand am promisiunea ca toate request-urile facute in for-ul de mai sus s-au executat cu success (au returnat un Response)
    let rezultateRequesturiSV = await Promise.all(svRequests);
    let rezultateRequesturiPOP = await Promise.all(popRequests);
    let rezultateRequesturiPIB = await Promise.all(pibRequests);

    // prelucrez raspunsurile obtinute pentru fiecare indice (din forma de json() ca sa le aduc la forma dorita in cerinta temei)
    rezultateSV = await prelucrareDateRequestIndicatori(rezultateRequesturiSV, indici.SV);
    rezultatePOP = await prelucrareDateRequestIndicatori(rezultateRequesturiPOP, indici.POP);
    rezultatePIB = await prelucrareDateRequestIndicatori(rezultateRequesturiPIB, indici.PIB);

    // CERINTA EUROSTAT: vector cu toti indicii, per tara, cu date intre 2005 si 2019
    let cerinta1_rezolvare = [...rezultateSV, ...rezultatePOP, ...rezultatePIB];
    console.log('Cerinta 1 - rezultat citire date din requesturi', cerinta1_rezolvare);


    // CERINTA GRAFIC
    populareSelectTari('#selectTaraGrafic', generareGraficLinie);
    document.querySelector("#selectIndicatorGrafic").onchange = generareGraficLinie;
    generareGraficLinie();

    
    // CERINTA TABEL
    populareSelectAni('#selectAnTabelIndicatori', populareTabel);
    populareTabel(); // pentru tabelul corespunzator valorii default din select *(prima data dupa randare)

    // CERINTA BUBBLE CHART
    populareSelectAni('#selectAnBubbleChart', generareBubbleChart);
    document.querySelector("#selectAnBubbleChart").value = '2018'; // preselectez 2018 pt ca 2019 nu are date SV
    generareBubbleChart();
}

document.addEventListener('DOMContentLoaded', aplicatie);