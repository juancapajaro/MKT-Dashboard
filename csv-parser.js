// ══════════════════════════════════════════
// CSV PARSER MODULE
// Handles CSV file upload, parsing, and data application
// ⚠️ ALL ORIGINAL PARAMETERS PRESERVED
// ══════════════════════════════════════════

function handleDrop(e){
  e.preventDefault();
  document.getElementById("csvDropZone").classList.remove("drag-over");
  var file=e.dataTransfer.files[0];
  if(file&&file.name.endsWith(".csv"))handleCSV(file);
}

function handleCSV(file){
  if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    try{
      parseAndApplyCSV(e.target.result);
      setStatus("✓ "+file.name+" cargado correctamente — datos actualizados","ok");
    }catch(err){
      setStatus("⚠ Error al leer el CSV: "+err.message,"err");
      console.error(err);
    }
  };
  reader.readAsText(file,"UTF-8");
}

function setStatus(msg,cls){
  var el=document.getElementById("csvStatus");
  el.textContent=msg;
  el.className="csv-status "+(cls||"");
}

function parseAndApplyCSV(text){
  var lines=text.split(/\r?\n/);

  // ── 1. Find separator
  var sep=",";
  for(var si=0;si<Math.min(lines.length,5);si++){
    if(lines[si].includes(";")){ sep=";"; break; }
  }

  // ── 2. Find real header row (skip title/blank rows)
  var headerIdx=-1;
  for(var hi=0;hi<Math.min(lines.length,8);hi++){
    var low=lines[hi].toLowerCase();
    if(low.includes("date")||low.includes("fecha")||low.includes("month")||low.includes("mes")){
      headerIdx=hi; break;
    }
  }
  if(headerIdx===-1) throw new Error("No encontré fila de encabezados (Date/Fecha/Month/Mes)");

  // ── 3. Parse headers — normalize to lowercase, strip special chars
  var rawHeaders=lines[headerIdx].split(sep).map(function(h){ return h.trim(); });
  var headers=rawHeaders.map(function(h){ return h.toLowerCase().replace(/[^a-z0-9]/g,""); });

  var dataLines=lines.slice(headerIdx+1).filter(function(l){ return l.trim(); });
  if(dataLines.length===0) throw new Error("Sin filas de datos debajo del encabezado");

  function idx(names){
    for(var ni=0;ni<names.length;ni++){
      var n=names[ni].toLowerCase().replace(/[^a-z0-9]/g,"");
      var i=headers.indexOf(n); if(i!==-1) return i;
    }
    return -1;
  }
  function get(row,names){ var i=idx(names); return i===-1?"":(row[i]||"").trim(); }
  function num(v){ var n=parseFloat((v||"").replace(",",".")); return isNaN(n)?null:n; }

  // Column index helpers — support Spanish + English names
  var iDate    = idx(["date","fecha"]);
  var iMonth   = idx(["month","mes"]);
  var iType    = idx(["tipo","type","kind"]);
  var iDetail  = idx(["detalle","tema","detail","description"]);
  var iStories = idx(["stories","historias","nstories"]);
  var iFoll    = idx(["followers","seguidores","nuevosseguidores","newfollowers","newfollow"]);
  var iV1=idx(["viewsd1","vistsd1","views","visualizaciones"]);
  var iL1=idx(["likesd1","megustd1","likes","megusta"]);
  var iC1=idx(["commentsd1","comentariosd1","comments","comentarios"]);
  var iSh1=idx(["sharedd1","compartidosd1","shared","compartidos"]);
  var iRp1=idx(["repostd1","repost"]);
  var iSv1=idx(["savesd1","guardadosd1","saves","guardados"]);
  var iV3=idx(["viewsd3"]),iL3=idx(["likesd3"]),iC3=idx(["commentsd3"]),iSh3=idx(["sharedd3"]),iRp3=idx(["repostd3"]),iSv3=idx(["savesd3"]);
  var iV7=idx(["viewsd7"]),iL7=idx(["likesd7"]),iC7=idx(["commentsd7"]),iSh7=idx(["sharedd7"]),iRp7=idx(["repostd7"]),iSv7=idx(["savesd7"]);

  // Month name → YM key (Spanish + English)
  var MMAP={
    "enero":"01","febrero":"02","marzo":"03","abril":"04","mayo":"05","junio":"06",
    "julio":"07","agosto":"08","septiembre":"09","octubre":"10","noviembre":"11","diciembre":"12",
    "january":"01","february":"02","march":"03","april":"04","may":"05","june":"06",
    "july":"07","august":"08","september":"09","october":"10","november":"11","december":"12"
  };
  var MNAME_ES={"01":"Enero","02":"Febrero","03":"Marzo","04":"Abril","05":"Mayo","06":"Junio",
    "07":"Julio","08":"Agosto","09":"Septiembre","10":"Octubre","11":"Noviembre","12":"Diciembre"};

  function monthToYM(mStr){
    var k=mStr.toLowerCase().replace(/[^a-z]/g,"");
    if(MMAP[k]) return "2025-"+MMAP[k];
    return null;
  }

  var D1_START="2025-05-05";
  var newPosts=[], newDailyMap={}, newSummaryMap={};

  for(var ri=0;ri<dataLines.length;ri++){
    var row=dataLines[ri].split(sep);

    var dateStr = iDate!==-1?(row[iDate]||"").trim():"";
    var monthStr= iMonth!==-1?(row[iMonth]||"").trim():"";
    if(!dateStr&&!monthStr) continue;

    // Resolve YM
    var ym=monthToYM(monthStr);
    if(!ym) continue;

    var dayNum=parseInt(dateStr)||0;
    var fullDate=ym+"-"+(dayNum<10?"0":"")+dayNum;
    var isLeg=fullDate<D1_START;

    var tipo    = iType!==-1?(row[iType]||"").trim():"";
    var tema    = iDetail!==-1?(row[iDetail]||"").trim():"";
    var stories = iStories!==-1?num(row[iStories]):null;
    var folls   = iFoll!==-1?num(row[iFoll]):null;

    var v1=iV1!==-1?num(row[iV1]):null,  l1=iL1!==-1?num(row[iL1]):null;
    var c1=iC1!==-1?num(row[iC1]):null,  sh1=iSh1!==-1?num(row[iSh1]):null;
    var rp1=iRp1!==-1?num(row[iRp1]):null,sv1=iSv1!==-1?num(row[iSv1]):null;
    var v3=iV3!==-1?num(row[iV3]):null,  l3=iL3!==-1?num(row[iL3]):null;
    var c3=iC3!==-1?num(row[iC3]):null,  sh3=iSh3!==-1?num(row[iSh3]):null;
    var rp3=iRp3!==-1?num(row[iRp3]):null,sv3=iSv3!==-1?num(row[iSv3]):null;
    var v7=iV7!==-1?num(row[iV7]):null,  l7=iL7!==-1?num(row[iL7]):null;
    var c7=iC7!==-1?num(row[iC7]):null,  sh7=iSh7!==-1?num(row[iSh7]):null;
    var rp7=iRp7!==-1?num(row[iRp7]):null,sv7=iSv7!==-1?num(row[iSv7]):null;

    var mmNum=ym.split("-")[1];
    var mNameES=MNAME_ES[mmNum]||monthStr;
    if(!MONTH_NAMES[ym]) MONTH_NAMES[ym]=mNameES;

    // Daily data
    if(!newDailyMap[ym]) newDailyMap[ym]=[];
    if(stories!==null||folls!==null){
      newDailyMap[ym].push({d:dayNum,s:stories||0,f:folls||0});
    }

    // Post row
    var tipoLow=(tipo||"").toLowerCase();
    if(tipoLow==="reel"||tipoLow==="post"){
      newPosts.push({
        date:dayNum,m:mNameES,ym:ym,tipo:tipo,tema:tema,leg:isLeg,
        d1:(v1!==null)?[v1,l1,c1,sh1,rp1,sv1]:[],
        d3:(v3!==null)?[v3,l3,c3,sh3,rp3,sv3]:[],
        d7:(v7!==null)?[v7,l7,c7,sh7,rp7,sv7]:[]
      });
    }

    // Summary accumulation
    if(!newSummaryMap[ym]) newSummaryMap[ym]={posts:0,stories:0,followers:0,views:0,likes:0,saves:0,comments:0,shared:0,note:"CSV importado"};
    var sm=newSummaryMap[ym];
    if(tipoLow==="reel"||tipoLow==="post"){
      sm.posts+=1;sm.views+=v1||0;sm.likes+=l1||0;sm.saves+=sv1||0;sm.comments+=c1||0;sm.shared+=sh1||0;
    }
    sm.stories+=stories||0;
    sm.followers+=folls||0;
  }

  // If no posts found but we have daily data, that's still valid
  var hasDailyData=Object.keys(newDailyMap).some(function(k){return newDailyMap[k].length>0;});
  if(newPosts.length===0&&!hasDailyData)
    throw new Error("No se encontraron datos válidos. Verificá que el CSV tenga columnas: Date/Fecha, Month/Mes, Stories, Followers");

  // Apply new data
  POSTS = newPosts.length>0 ? newPosts : BASE_POSTS.slice();
  DAILY = Object.keys(newDailyMap).length>0 ? newDailyMap : JSON.parse(JSON.stringify(BASE_DAILY));
  SUMMARY = Object.keys(newSummaryMap).length>0 ? newSummaryMap : JSON.parse(JSON.stringify(BASE_SUMMARY));

  // Rebuild month selectors
  var allYMs=Object.keys(SUMMARY).sort();
  allYMs.forEach(function(ym){if(!MONTH_NAMES[ym])MONTH_NAMES[ym]=ym;});
  rebuildSelectors(allYMs);

  fromYM=allYMs[0]; toYM=allYMs[allYMs.length-1];
  document.getElementById("selFrom").value=fromYM;
  document.getElementById("selTo").value=toYM;

  updatePeriodPill();
  updateKPIs();
  buildMonthlyTable();
  buildAll();
}

function rebuildSelectors(yms){
  ["selFrom","selTo"].forEach(function(id){
    var sel=document.getElementById(id), cur=sel.value;
    sel.innerHTML="";
    yms.forEach(function(ym){
      var o=document.createElement("option");
      o.value=ym; o.textContent=MONTH_NAMES[ym]+" "+ym.split("-")[0];
      sel.appendChild(o);
    });
    if(yms.indexOf(cur)!==-1)sel.value=cur;
  });
}
