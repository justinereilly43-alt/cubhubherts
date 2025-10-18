const SCHEMA = {"childcare": {"label": "Childcare", "color": "#f6b7b4", "subs": ["Nanny", "Childminder", "Babysitter", "Nursery", "Preschool", "Out of school club", "Holiday club"], "flags": ["DBS", "Insured", "First Aid Qualified", "Qualifications", "Ofsted registered", "SEN experience"]}, "petcare": {"label": "Pet Care", "color": "#a7d4f5", "subs": ["Pet visits", "Pet sitting", "Dog walking", "Dog boarding", "Cat boarding", "Equine services", "Dog grooming", "Pet health care services"], "flags": ["DBS", "Insured", "First Aid Qualified", "Qualifications", "Licenced"]}, "homehelp": {"label": "Home Help", "color": "#f5b97a", "subs": ["Domestic cleaning", "Oven cleaning", "Garden services", "Handyman services"], "flags": ["DBS", "Insured", "Licenced"]}};
const TOWNS = ["Abbots Langley", "Aldenham", "Ashwell", "Baldock", "Berkhamsted", "Bishops Stortford", "Borehamwood", "Broxbourne", "Buntingford", "Bushey", "Cheshunt", "Chorleywood", "Croxley Green", "Elstree", "Essendon", "Goffs Oak", "Great Amwell", "Harpenden", "Hatfield", "Hemel Hempstead", "Hertford", "Hitchin", "Hoddesdon", "Knebworth", "Lea Valley", "Letchworth Garden City", "London Colney", "Markyate", "Northchurch", "Potters Bar", "Radlett", "Redbourn", "Rickmansworth", "Royston", "Sawbridgeworth", "Shenley", "South Oxhey", "St Albans", "Stevenage", "Tring", "Waltham Cross", "Ware", "Watford", "Welwyn", "Welwyn Garden City", "Wheathampstead", "Caddington", "Luton", "Dunstable", "Kensworth", "Markyate"];

function qs(sel, root=document){return root.querySelector(sel)}
function qsa(sel, root=document){return [...root.querySelectorAll(sel)]}

function populateTownSelect(select){
  if(!select) return;
  select.innerHTML = `<option value="">Select town...</option>` + TOWNS.map(t=>`<option value="${t}">${t}</option>`).join("");
}
function populateSubsFor(mainSel, subSel){
  const def = SCHEMA[mainSel?.value];
  subSel.innerHTML = `<option value="">All sub categories...</option>` + (def?def.subs.map(s=>`<option>${s}</option>`).join(""):"");
}

function buildAvailabilityGrid(container){
  if(!container) return;
  const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const times=["Morning","Afternoon","Evening","Overnight"];
  const table=document.createElement("table");
  const thead=document.createElement("thead"); const trh=document.createElement("tr"); trh.appendChild(document.createElement("th"));
  times.forEach(t=>{ const th=document.createElement("th"); th.textContent=t; trh.appendChild(th); });
  thead.appendChild(trh); table.appendChild(thead);
  const tbody=document.createElement("tbody");
  days.forEach(d=>{
    const tr=document.createElement("tr");
    const th=document.createElement("th"); th.textContent=d; tr.appendChild(th);
    times.forEach(t=>{
      const td=document.createElement("td");
      td.innerHTML = `<label style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" name="availability" value="${d}:${t}" /></label>`;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody); container.appendChild(table);
}

function availabilityToHTML(av){
  if(!av) return "";
  const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const times=["Morning","Afternoon","Evening","Overnight"];
  let h=`<div class="availability-grid"><table><thead><tr><th></th>${times.map(t=>`<th>${t}</th>`).join("")}</tr></thead><tbody>`;
  days.forEach(d=>{ h+=`<tr><th>${d}</th>`+times.map(t=>`<td>${av?.[d]?.[t]?"✓":""}</td>`).join("")+`</tr>`; });
  return h+`</tbody></table></div>`;
}

async function fetchListings(category){
  const res = await fetch(`/api/listings?cat=${encodeURIComponent(category)}`, { headers: { 'Cache-Control':'no-cache' } });
  if(!res.ok) return [];
  return await res.json();
}

async function renderCards(category, container, filter={}){
  const list = await fetchListings(category);
  const filtered = list.filter(it => {
    if(filter.sub && !(it.services||[]).includes(filter.sub)) return false;
    if(filter.town && it.town !== filter.town) return false;
    return true;
  });
  container.innerHTML = "";
  if(!filtered.length){
    container.innerHTML = `<p class="site-tagline">No listings yet. Be the first to add one!</p>`;
    return;
  }
  const borderClass = category === 'childcare' ? 'pink' : category === 'petcare' ? 'blue' : 'orange';
  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = `card ${borderClass}`;
    const img = item.photo ? `<img alt="" src="${item.photo}" style="width:100%;max-height:160px;object-fit:cover;border-radius:12px">` : "";
    card.innerHTML = `${img}
      <h3>${item.name||"Unnamed"}</h3>
      <p><strong>Email:</strong> ${item.email||"-"}</p>
      <p><strong>Town:</strong> ${item.town||"-"}</p>
      <p><strong>Services:</strong> ${(item.services||[]).join(", ")||"-"}</p>
      <a class="btn" href="listing.html?type=${category}&id=${encodeURIComponent(item.id)}">View more</a>`;
    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  const main = qs('[data-role="search-main"]'); const sub = qs('[data-role="search-sub"]'); const town = qs('[data-role="search-town"]'); const go = qs('[data-role="search-go"]');
  if(main&&sub&&town&&go){
    populateTownSelect(town);
    main.addEventListener("change", ()=>populateSubsFor(main, sub));
    populateSubsFor(main, sub);
    go.addEventListener("click", ()=>{
      const m=main.value||"childcare"; const s=sub.value?`&sub=${encodeURIComponent(sub.value)}`:""; const t=town.value?`&town=${encodeURIComponent(town.value)}`:"";
      window.location.href = `category.html?cat=${m}${s}${t}`;
    });
  }

  document.querySelectorAll('div[data-role="services"]').forEach(box=>{ const c=box.dataset.cat; box.innerHTML = SCHEMA[c].subs.map(s=>`<label><input type="checkbox" name="services" value="${s}"> ${s}</label>`).join(""); });
  document.querySelectorAll('div[data-role="flags"]').forEach(box=>{ const c=box.dataset.cat; box.innerHTML = SCHEMA[c].flags.map(s=>`<label><input type="checkbox" name="flags" value="${s}"> ${s}</label>`).join(""); });
  document.querySelectorAll('select[data-role="town"]').forEach(populateTownSelect);
  document.querySelectorAll('[data-role="availability"]').forEach(buildAvailabilityGrid);

  const cards = qs('[data-role="cards"]');
  const cat = document.body.dataset.pageCat;
  if(cards && cat){
    const p = new URLSearchParams(location.search);
    const filter = { sub: document.body.dataset.pageSub || p.get("sub") || "", town: p.get("town") || "" };
    renderCards(cat, cards, filter);
  }

  if(document.body.id === "listing-detail"){
    const p = new URLSearchParams(location.search); const type = p.get("type"); const id = p.get("id"); const root = qs('#detail');
    (async()=>{
      const list = await fetchListings(type||'childcare');
      const item = (list||[]).find(x=>x.id===id);
      if(!item){ root.innerHTML = `<p>Listing not found.</p>`; return; }
      root.innerHTML = `
        ${item.photo?`<img alt="" src="${item.photo}" style="width:100%;max-height:280px;object-fit:cover;border-radius:16px">`:""}
        <h2>${item.name||"Unnamed"}</h2>
        <p><strong>Email:</strong> ${item.email||"-"} &nbsp; ${item.phone?`<strong>Phone:</strong> ${item.phone}`:""}</p>
        <p><strong>Town:</strong> ${item.town||"-"}</p>
        <p><strong>Services:</strong> ${(item.services||[]).join(", ")||"-"}</p>
        ${item.availability?availabilityToHTML(item.availability):""}
        <h3>About</h3>
        <p>${item.about||"-"}</p>
        ${item.website?`<p><strong>Website:</strong> <a href="${item.website}" target="_blank" rel="noopener">${item.website}</a></p>`:""}
        ${(item.flags||[]).length?`<p><strong>Listed:</strong> ${item.flags.join(", ")}</p>`:""}
      `;
    })();
  }
});
