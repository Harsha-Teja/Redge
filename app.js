// ---------- format helpers ----------
const fmtEUR = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const fmt = (n) => new Intl.NumberFormat("en-IE").format(Math.round(n));

// ---------- county defaults ----------
const COUNTY = {
    cork: { name: "Cork", elecEURkWh: 0.163, pueOn: 1.40, pueColo: 1.35, buildEURperMW: 9_300_000, landLeaseEURmo: 2500, coloEURkWmo: 450 },
    wexford: { name: "Wexford", elecEURkWh: 0.163, pueOn: 1.40, pueColo: 1.35, buildEURperMW: 9_000_000, landLeaseEURmo: 1500, coloEURkWmo: 430 },
    sligo: { name: "Sligo", elecEURkWh: 0.163, pueOn: 1.42, pueColo: 1.36, buildEURperMW: 8_700_000, landLeaseEURmo: 1000, coloEURkWmo: 420 }
};

// ---------- constants ----------
const C = {
    serverWatts: 300, rackDensityKW: 8, headroom: 1.5,
    fteOn: 2, fteCo: 1, salary: 60_000,
    serverEUR: 8_000, serverYears: 5,
    diaEURmoPerGbps: 510, diaLinks: 2,
    crossConnectEURmo: 200, crossConnectCount: 2,
    toolsEURmo: 1000, complianceEURmo: 500, insuranceRatesEURmo: 1500,
    cloudEURh: 0.63, cloudBlockEURGBmo: 0.095, cloudObjectEURGBmo: 0.020, cloudEgressEURGB: 0.083, cloudSupportPct: 0.10
};

// ---------- helpers ----------
const energyAnnual = (itkW, pue, price) => itkW * pue * 8760 * price;
const hotRatio = (speed) => speed === "sub10" ? 0.8 : speed === "sub20" ? 0.6 : 0.5;
const slaUplift = (uptime) => uptime === "99.99" ? { onprem: 1.10, colo: 1.10, cloud: 1.15 } : { onprem: 1.00, colo: 1.00, cloud: 1.00 };

// ---------- main estimator ----------
function runEstimate()
{
    const countyKey = document.getElementById("county").value;
    const county = COUNTY[countyKey];

    const servers = Number(document.getElementById("servers").value);
    const storageTB = Number(document.getElementById("storageTB").value);
    const speed = document.getElementById("speed").value;
    const uptime = document.getElementById("uptime").value;
    const irelandOnly = document.getElementById("irelandOnly").checked;

    // base sizing
    const IT_kW = (servers * C.serverWatts) / 1000;
    const racks = Math.max(1, Math.ceil(IT_kW / C.rackDensityKW));
    const siteCapacityKW = Math.max(IT_kW * C.headroom, racks * C.rackDensityKW);

    const uplift = slaUplift(uptime);
    const elec = county.elecEURkWh;

    // ON-PREM
    const facilityCapex = (siteCapacityKW / 1000) * county.buildEURperMW;
    const amortEURyr = (facilityCapex / 10) * uplift.onprem;
    const maintEURyr = (facilityCapex * 0.03) * uplift.onprem;
    const energyOnEURyr = energyAnnual(IT_kW, county.pueOn, elec);
    const peopleOnEURyr = C.fteOn * C.salary;
    const hwEURyr = (servers * C.serverEUR) / C.serverYears;
    const connectivityEURyr = C.diaEURmoPerGbps * C.diaLinks * 12;
    const landEURyr = county.landLeaseEURmo * 12;
    const toolsEURyr = C.toolsEURmo * 12;
    const compEURyr = C.complianceEURmo * 12;
    const insEURyr = C.insuranceRatesEURmo * 12;

    const onPremAnnual = energyOnEURyr + amortEURyr + maintEURyr + peopleOnEURyr +
        hwEURyr + connectivityEURyr + landEURyr + toolsEURyr + compEURyr + insEURyr;
    const onPremTCO5 = onPremAnnual * 5;

    // COLO
    const commitKW = Math.max(IT_kW, 30);
    const baseFacilityEURyr = county.coloEURkWmo * commitKW * 12 * uplift.colo;
    const energyCoEURyr = energyAnnual(commitKW, county.pueColo, elec);
    const peopleCoEURyr = C.fteCo * C.salary;
    const crossEURyr = C.crossConnectEURmo * C.crossConnectCount * 12;
    const coloAnnual = baseFacilityEURyr + energyCoEURyr + hwEURyr + peopleCoEURyr +
        connectivityEURyr + crossEURyr + compEURyr;
    const coloTCO5 = coloAnnual * 5;

    // CLOUD
    const computeEURyr = servers * C.cloudEURh * 24 * 365 * uplift.cloud;
    const hotGB = Math.max(0, storageTB * hotRatio(speed) * 1024);
    const objGB = Math.max(0, storageTB * (1 - hotRatio(speed)) * 1024);
    const blockEURyr = hotGB * C.cloudBlockEURGBmo * 12;
    const objectEURyr = objGB * C.cloudObjectEURGBmo * 12;
    const egressGBpm = 2000; // baseline to keep simple
    const egressEURyr = egressGBpm * C.cloudEgressEURGB * 12 * uplift.cloud;
    const cloudBase = computeEURyr + blockEURyr + objectEURyr + egressEURyr;
    const supportEURyr = cloudBase * C.cloudSupportPct;
    const cloudAnnual = cloudBase + supportEURyr + connectivityEURyr;
    const cloudTCO5 = cloudAnnual * 5;

    // SHOW RESULTS (only after submit)
    const res = document.getElementById("results");
    res.hidden = false;
    res.scrollIntoView({ behavior: "smooth", block: "start" });

    // Summary KPIs
    document.getElementById("kpiOnPrem").textContent = fmtEUR.format(onPremTCO5);
    document.getElementById("kpiColo").textContent = fmtEUR.format(coloTCO5);
    document.getElementById("kpiCloud").textContent = fmtEUR.format(cloudTCO5);

    // On-prem breakdown
    document.getElementById("on_itkw").textContent = fmt(IT_kW);
    document.getElementById("on_pue").textContent = county.pueOn.toFixed(2);
    document.getElementById("on_energy").textContent = fmtEUR.format(energyOnEURyr);
    document.getElementById("on_amort").textContent = fmtEUR.format(amortEURyr);
    document.getElementById("on_maint").textContent = fmtEUR.format(maintEURyr);
    document.getElementById("on_people").textContent = fmtEUR.format(peopleOnEURyr);
    document.getElementById("on_hw").textContent = fmtEUR.format(hwEURyr);
    document.getElementById("on_net").textContent = fmtEUR.format(connectivityEURyr);
    document.getElementById("on_land").textContent = fmtEUR.format(landEURyr);
    document.getElementById("on_compliance").textContent = fmtEUR.format(toolsEURyr + compEURyr + insEURyr);
    document.getElementById("on_ann").textContent = fmtEUR.format(onPremAnnual);
    document.getElementById("on_mrr").textContent = fmtEUR.format(onPremAnnual / 12);
    document.getElementById("on_tco").textContent = fmtEUR.format(onPremTCO5);

    // Colocation breakdown
    document.getElementById("co_commit").textContent = fmt(commitKW);
    document.getElementById("co_pue").textContent = county.pueColo.toFixed(2);
    document.getElementById("co_base").textContent = fmtEUR.format(baseFacilityEURyr);
    document.getElementById("co_energy").textContent = fmtEUR.format(energyCoEURyr);
    document.getElementById("co_hw").textContent = fmtEUR.format(hwEURyr);
    document.getElementById("co_people").textContent = fmtEUR.format(peopleCoEURyr);
    document.getElementById("co_net").textContent = fmtEUR.format(connectivityEURyr + crossEURyr);
    document.getElementById("co_compliance").textContent = fmtEUR.format(compEURyr);
    document.getElementById("co_ann").textContent = fmtEUR.format(coloAnnual);
    document.getElementById("co_mrr").textContent = fmtEUR.format(coloAnnual / 12);
    document.getElementById("co_tco").textContent = fmtEUR.format(coloTCO5);

    // Cloud breakdown
    document.getElementById("cl_compute").textContent = fmtEUR.format(computeEURyr);
    document.getElementById("cl_block").textContent = fmtEUR.format(blockEURyr);
    document.getElementById("cl_object").textContent = fmtEUR.format(objectEURyr);
    document.getElementById("cl_egress").textContent = fmtEUR.format(egressEURyr);
    document.getElementById("cl_support").textContent = fmtEUR.format(supportEURyr);
    document.getElementById("cl_net").textContent = fmtEUR.format(connectivityEURyr);
    document.getElementById("cl_ann").textContent = fmtEUR.format(cloudAnnual);
    document.getElementById("cl_mrr").textContent = fmtEUR.format(cloudAnnual / 12);
    document.getElementById("cl_tco").textContent = fmtEUR.format(cloudTCO5);

    // local save (no backend)
    localStorage.setItem("discovery:last", JSON.stringify({
        ts: new Date().toISOString(), county: county.name,
        servers, storageTB, speed, uptime, irelandOnly,
        results: { onPremTCO5, coloTCO5, cloudTCO5 }
    }));
}

// ---------- attach handlers + footer year ----------
window.addEventListener("DOMContentLoaded", () =>
{
    document.getElementById("yr").textContent = new Date().getFullYear();

    const frm = document.getElementById("frm");
    frm.addEventListener("submit", (e) =>
    {
        e.preventDefault();
        runEstimate();
    });
});
