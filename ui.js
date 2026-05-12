// ══════════════════════════════════════════
// UI MODULE
// Handles theme, tabs, menus, filtering, and KPI updates
// ══════════════════════════════════════════

// THEME MANAGEMENT
var curTheme=localStorage.getItem("vt")||(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");

function applyTheme(t){
  document.documentElement.className="theme-"+t;
  document.getElementById("themeIco").textContent=t==="dark"?"🌙":"☀️";
  document.getElementById("themeLbl").textContent=t==="dark"?"Dark":"Light";
  localStorage.setItem("vt",t);
  curTheme=t;
  setTimeout(buildAll,80);
}

function cycleTheme(){
  applyTheme(curTheme==="dark"?"light":"dark");
}

// VIZ MENU
function toggleMenu(){
  document.getElementById("vmDrop").classList.toggle("open");
}

document.addEventListener("click",function(e){
  if(!e.target.closest(".viz-menu"))document.getElementById("vmDrop").classList.remove("open");
});

document.addEventListener("keydown",function(e){
  if(e.key==="Escape")document.getElementById("vmDrop").classList.remove("open");
});

// IMAGE DOWNLOAD
async function dlImage(){
  var m=document.querySelector(".viz-menu");
  m.style.display="none";
  try{
    var u=await htmlToImage.toPng(document.body,{quality:1,pixelRatio:2});
    var a=document.createElement("a");
    a.href=u;
    a.download="barbarenas-dashboard.png";
    a.click();
  }catch(err){
    console.error(err);
  }
  m.style.display="";
}

// TAB MANAGEMENT
function showTab(name,btn){
  document.querySelectorAll(".tab-section").forEach(function(s){s.classList.remove("active");});
  document.querySelectorAll("[role='tab']").forEach(function(b){b.setAttribute("aria-selected","false");});
  document.getElementById("tab-"+name).classList.add("active");
  if(btn){
    btn.classList.add("active");
    btn.setAttribute("aria-selected","true");
  }
  setTimeout(function(){
    document.querySelectorAll("#tab-"+name+" .rev").forEach(function(el){
      el.classList.add("vis");
    });
  },60);
}

// DATE FILTERING
function updatePeriodPill(){
  var fl=(MONTH_NAMES[fromYM]||fromYM).slice(0,3),tl=(MONTH_NAMES[toYM]||toYM).slice(0,3);
  document.getElementById("periodLbl").textContent=fl===tl?fl:fl+" → "+tl;
}

function applyFilter(){
  var f=document.getElementById("selFrom").value,t=document.getElementById("selTo").value;
  if(f>t)t=f;
  fromYM=f;
  toYM=t;
  document.getElementById("selTo").value=t;
  updatePeriodPill();
  updateKPIs();
  buildMonthlyTable();
  buildAll();
}

// KPI UPDATES
function updateKPIs(){
  var ms=activeMonths();
  var tp=ms.reduce(function(a,m){return a+(SUMMARY[m]?SUMMARY[m].posts:0);},0);
  var tv=ms.reduce(function(a,m){return a+(SUMMARY[m]?SUMMARY[m].views:0);},0);
  var tl=ms.reduce(function(a,m){return a+(SUMMARY[m]?SUMMARY[m].likes:0);},0);
  var ts=ms.reduce(function(a,m){return a+(SUMMARY[m]?SUMMARY[m].saves:0);},0);
  var tst=ms.reduce(function(a,m){return a+(SUMMARY[m]?SUMMARY[m].stories:0);},0);
  var tf=ms.reduce(function(a,m){return a+(SUMMARY[m]?SUMMARY[m].followers:0);},0);
  
  document.getElementById("kv-posts").textContent=tp;
  document.getElementById("kv-views").textContent=tv.toLocaleString("es-MX");
  document.getElementById("kv-likes").textContent=tl.toLocaleString("es-MX");
  document.getElementById("kv-saves").textContent=ts;
  document.getElementById("kv-stories").textContent=tst||"—";
  document.getElementById("kv-followers").textContent=tf>0?"+"+tf:"—";
  document.getElementById("ks-posts").textContent=ms.map(function(m){return MONTH_NAMES[m]||m;}).join(" + ");
}

// MONTHLY TABLE
function buildMonthlyTable(){
  var ms=activeMonths(),tbody=document.getElementById("monthly-tbody");
  tbody.innerHTML="";
  ms.forEach(function(ym){
    var s=SUMMARY[ym];if(!s)return;
    var tr=document.createElement("tr");
    tr.innerHTML="<td><strong>"+(MONTH_NAMES[ym]||ym)+"</strong></td>"
      +"<td>"+s.posts+"</td><td>"+(s.stories||"—")+"</td><td>"+(s.followers?"+"+s.followers:"—")+"</td>"
      +"<td>"+s.views.toLocaleString("es-MX")+"</td><td>"+s.likes+"</td><td>"+s.saves+"</td>"
      +"<td><span class='mn'>"+(s.note||"")+"</span></td>";
    tbody.appendChild(tr);
  });
}

// DAY TOGGLE (D1, D3, D7)
function setDay(day,btn){
  curDay=day;
  document.querySelectorAll(".day-btn").forEach(function(b){b.classList.remove("active");});
  if(btn)btn.classList.add("active");
  var s=day==="D1"?"D1 / Total al mes":day;
  document.getElementById("ct-views").textContent="Views por post — "+s;
  document.getElementById("ct-likes").textContent="Likes por post — "+s;
  document.getElementById("ct-saves").textContent="Saves por post — "+s;
  document.getElementById("tt-posts").textContent="Todos los posts — "+s;
  buildPostCharts(day);
}

// INTERSECTION OBSERVER FOR ANIMATIONS
var rObs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){
      e.target.classList.add("vis");
      rObs.unobserve(e.target);
    }
  });
},{threshold:0.1});

document.querySelectorAll(".rev").forEach(function(el){
  rObs.observe(el);
});

// INITIALIZATION
window.addEventListener("load",function(){
  updateKPIs();
  buildMonthlyTable();
  setTimeout(function(){
    buildAll();
    window.dispatchEvent(new Event("resize"));
    setTimeout(function(){
      document.querySelectorAll("#tab-resumen .rev").forEach(function(el){
        el.classList.add("vis");
      });
    },300);
  },200);
});

// Apply initial theme
applyTheme(curTheme);
