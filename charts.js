// ══════════════════════════════════════════
// CHARTS MODULE
// Handles chart creation and rendering
// ══════════════════════════════════════════

function getC(){
  var dk=document.documentElement.classList.contains("theme-dark");
  return{
    text:dk?"#e8e4dc":"#1c1a16",
    sec:dk?"#8a8478":"#6b6358",
    grid:dk?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.05)",
    green:"#7d9c6e",
    gold:"#c4a96b",
    mauve:"#a07090",
    blue:"#6090a0"
  };
}

function bOpts(c){
  return{
    responsive:true,
    maintainAspectRatio:false,
    animation:false,
    plugins:{
      legend:{display:false},
      tooltip:{
        enabled:true,
        padding:10,
        cornerRadius:8,
        titleFont:{family:"Inter",size:12},
        bodyFont:{family:"Inter",size:11}
      }
    },
    scales:{
      x:{
        ticks:{color:c.sec,font:{family:"Inter",size:10},maxRotation:45,autoSkip:true},
        grid:{color:c.grid}
      },
      y:{
        ticks:{color:c.sec,font:{family:"Inter",size:10}},
        grid:{color:c.grid},
        beginAtZero:true
      }
    },
    layout:{padding:{top:6,right:6,bottom:4,left:4}}
  };
}

function sc(id,cfg){
  if(typeof Chart==="undefined")return;
  var el=document.getElementById(id);
  if(!el)return;
  if(el._ci){
    try{el._ci.destroy();}catch(e){}
  }
  el._ci=new Chart(el,cfg);
}

function activeMonths(){
  return Object.keys(SUMMARY).sort().filter(function(m){
    return m>=fromYM&&m<=toYM;
  });
}

function filteredPosts(){
  var ms=activeMonths();
  return POSTS.filter(function(p){
    return ms.indexOf(p.ym)!==-1;
  });
}

function buildAll(){
  var c=getC(),ms=activeMonths();
  var labels=ms.map(function(m){return MONTH_NAMES[m]||m;});
  var pal=[c.sec+"66",c.green+"aa",c.gold+"aa",c.mauve+"aa",c.blue+"aa"];
  var bgColors=ms.map(function(m,i){return pal[i%pal.length];});

  // Posts per month
  sc("cMonthPosts",{
    type:"bar",
    data:{
      labels:labels,
      datasets:[{
        label:"Posts",
        data:ms.map(function(m){return SUMMARY[m]?SUMMARY[m].posts:0;}),
        backgroundColor:bgColors,
        borderRadius:5,
        borderSkipped:false
      }]
    },
    options:bOpts(c)
  });

  // Views per month
  sc("cMonthViews",{
    type:"bar",
    data:{
      labels:labels,
      datasets:[{
        label:"Views",
        data:ms.map(function(m){return SUMMARY[m]?SUMMARY[m].views:0;}),
        backgroundColor:bgColors,
        borderRadius:5,
        borderSkipped:false
      }]
    },
    options:bOpts(c)
  });

  // Engagement metrics
  var mgO=JSON.parse(JSON.stringify(bOpts(c)));
  mgO.plugins.legend={
    display:true,
    position:"top",
    labels:{color:c.sec,font:{family:"Inter",size:11},boxWidth:9,padding:14}
  };
  sc("cMonthMetrics",{
    type:"bar",
    data:{
      labels:labels,
      datasets:[
        {label:"Likes",   data:ms.map(function(m){return SUMMARY[m]?SUMMARY[m].likes:0;}),   backgroundColor:c.green+"cc",borderRadius:4},
        {label:"Shared",  data:ms.map(function(m){return SUMMARY[m]?SUMMARY[m].shared:0;}),  backgroundColor:c.gold+"cc", borderRadius:4},
        {label:"Saves",   data:ms.map(function(m){return SUMMARY[m]?SUMMARY[m].saves:0;}),   backgroundColor:c.mauve+"cc",borderRadius:4},
        {label:"Comments",data:ms.map(function(m){return SUMMARY[m]?SUMMARY[m].comments:0;}),backgroundColor:c.blue+"cc", borderRadius:4}
      ]
    },
    options:mgO
  });

  // Daily data visibility
  var hasDailyMonths=ms.some(function(m){return DAILY[m]&&DAILY[m].length>0;});
  var dc=document.getElementById("daily-content"),dn=document.getElementById("daily-nodata");
  if(!hasDailyMonths){dc.style.display="none";dn.style.display="";}
  else{dc.style.display="";dn.style.display="none";}

  // Build story charts for each active month with daily data
  var dailyPalette=[c.green+"bb",c.gold+"bb",c.blue+"bb",c.mauve+"bb"];
  ms.forEach(function(ym,idx){
    if(!DAILY[ym]||!DAILY[ym].length)return;
    var dd=DAILY[ym], canvasId="cStoriesApr";
    if(ym==="2025-04")canvasId="cStoriesApr";
    else if(ym==="2025-05")canvasId="cStoriesMay";
    else return;
    
    sc(canvasId,{
      type:"bar",
      data:{
        labels:dd.map(function(d){return"D"+d.d;}),
        datasets:[{
          label:"Stories",
          data:dd.map(function(d){return d.s;}),
          backgroundColor:dailyPalette[idx%dailyPalette.length],
          borderRadius:3
        }]
      },
      options:bOpts(c)
    });
    
    // Update chart title dynamically
    var card=document.getElementById(canvasId).closest(".chart-card");
    if(card){
      var t=card.querySelector(".chart-title");
      if(t)t.textContent="Stories por día — "+(MONTH_NAMES[ym]||ym)+" 2025";
    }
    var sub=card&&card.querySelector(".chart-sub");
    if(sub&&ym==="2025-05"){
      var lastD=dd.filter(function(d){return d.s||d.f;});
      sub.textContent="Datos hasta el día "+(lastD.length?lastD[lastD.length-1].d:"—");
    }
  });

  // Followers daily chart
  var allD=[];
  ms.forEach(function(m){
    if(DAILY[m])DAILY[m].forEach(function(d){
      allD.push({l:(MONTH_NAMES[m]||m).slice(0,3)+" "+d.d,f:d.f});
    });
  });
  if(allD.length){
    sc("cFollowersDaily",{
      type:"bar",
      data:{
        labels:allD.map(function(d){return d.l;}),
        datasets:[{
          label:"Seguidores",
          data:allD.map(function(d){return d.f;}),
          backgroundColor:c.mauve+"bb",
          borderRadius:3
        }]
      },
      options:bOpts(c)
    });
  }

  buildPostCharts(curDay,c);
}

function buildPostCharts(day,c){
  if(!c)c=getC();
  var k=day.toLowerCase(),ps=filteredPosts();
  var labels=ps.map(function(p){return(p.m||"").slice(0,3)+p.date;});
  var views= ps.map(function(p){var m=p[k];return(m&&m.length&&m[0]!=null)?m[0]:0;});
  var likes= ps.map(function(p){var m=p[k];return(m&&m.length&&m[1]!=null)?m[1]:0;});
  var saves= ps.map(function(p){var m=p[k];return(m&&m.length&&m[5]!=null)?m[5]:0;});
  var bgs=  ps.map(function(p){return(p.tipo||"").toLowerCase()==="reel"?c.green+"cc":c.gold+"cc";});

  sc("cPostViews",{
    type:"bar",
    data:{
      labels:labels,
      datasets:[{
        label:"Views",
        data:views,
        backgroundColor:bgs,
        borderRadius:4
      }]
    },
    options:bOpts(c)
  });

  sc("cPostLikes",{
    type:"bar",
    data:{
      labels:labels,
      datasets:[{
        label:"Likes",
        data:likes,
        backgroundColor:c.green+"cc",
        borderRadius:4
      }]
    },
    options:bOpts(c)
  });

  sc("cPostSaves",{
    type:"bar",
    data:{
      labels:labels,
      datasets:[{
        label:"Saves",
        data:saves,
        backgroundColor:c.mauve+"cc",
        borderRadius:4
      }]
    },
    options:bOpts(c)
  });

  // Build posts table
  var tbody=document.getElementById("posts-tbody");
  tbody.innerHTML="";
  ps.forEach(function(p){
    var m=p[k],has=m&&m.length>0;
    var tr=document.createElement("tr");
    var pill="<span class='pill pill-"+(p.tipo||"post").toLowerCase()+"'>"+(p.tipo||"")+"</span>";
    var src=p.leg
      ?"<span style='font-size:10px;color:var(--warning)'>Total al mes</span>"
      :"<span style='font-size:10px;color:var(--positive)'>"+day+"</span>";
    
    function ce(v){return(v==null)?"<td><span class='nn'>—</span></td>":"<td>"+v+"</td>";}
    
    tr.innerHTML="<td>"+p.date+" "+(p.m||"")+"</td><td>"+pill+"</td><td>"+(p.tema||"")+"</td>"
      +(has?ce(m[0])+ce(m[1])+ce(m[2])+ce(m[3])+ce(m[5]):"<td colspan='5' style='color:var(--text-sec);font-size:11px'>Sin datos "+day+"</td>")
      +"<td>"+src+"</td>";
    tbody.appendChild(tr);
  });
}
