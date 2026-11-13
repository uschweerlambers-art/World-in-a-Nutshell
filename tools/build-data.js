const fs=require('fs');
const cities=require('all-the-cities');
const topo=require('topojson-client');
const out=process.argv[2]||require('path').join(__dirname,'../site/data/');
// German exonyms for frequent searches (GeoNames name field is mixed EN/local)
const DE={'Munich':'München','Vienna':'Wien','Rome':'Rom','Milan':'Mailand','Prague':'Prag','Warsaw':'Warschau','Moscow':'Moskau','Brussels':'Brüssel','Copenhagen':'Kopenhagen','Lisbon':'Lissabon','Venice':'Venedig','Florence':'Florenz','Naples':'Neapel','Geneva':'Genf','Athens':'Athen','Beijing':'Peking','Cairo':'Kairo','New Delhi':'Neu-Delhi','Mexico City':'Mexiko-Stadt','Tokyo':'Tokio','Nuremberg':'Nürnberg','Hanover':'Hannover','Brunswick':'Braunschweig','Cologne':'Köln','Gothenburg':'Göteborg','Antwerpen':'Antwerpen','The Hague':'Den Haag','Bucharest':'Bukarest','Belgrade':'Belgrad','Kyiv':'Kiew','Saint Petersburg':'Sankt Petersburg','Istanbul':'Istanbul','Turin':'Turin','Genoa':'Genua','Seville':'Sevilla','Gdańsk':'Danzig','Wrocław':'Breslau','Kraków':'Krakau','Poznań':'Posen','Bratislava':'Pressburg','Lucerne':'Luzern','Strasbourg':'Straßburg','Basel':'Basel','Bozen':'Bozen','Tbilisi':'Tiflis','Jerusalem':'Jerusalem','Damascus':'Damaskus','Tehran':'Teheran','Singapore':'Singapur','Cape Town':'Kapstadt','Rio de Janeiro':'Rio de Janeiro','Havana':'Havanna','Washington, D.C.':'Washington','Los Angeles':'Los Angeles','New York City':'New York'};
const STATES={'01':'Baden-Württemberg','02':'Bavaria','03':'Bremen','04':'Hamburg','05':'Hesse','06':'Lower Saxony','07':'North Rhine-Westphalia','08':'Rhineland-Palatinate','09':'Saarland','10':'Schleswig-Holstein','11':'Brandenburg','12':'Mecklenburg-Western Pomerania','13':'Saxony','14':'Saxony-Anhalt','15':'Thuringia','16':'Berlin'};
// English display names where GeoNames keeps the local form
const EN={'Köln':'Cologne','Nürnberg':'Nuremberg','Zürich':'Zurich','Genève':'Geneva','Den Haag':'The Hague','Lisboa':'Lisbon','Roma':'Rome','Milano':'Milan','Napoli':'Naples','Firenze':'Florence','Venezia':'Venice','Torino':'Turin','Praha':'Prague','Warszawa':'Warsaw','København':'Copenhagen','Bruxelles':'Brussels','Moskva':'Moscow','Athína':'Athens'};
const sel=cities.filter(c=>c.population>=5000&&c.featureCode!=='PPLX').sort((a,b)=>b.population-a.population);
const rows=sel.map(c=>{
  const [lon,lat]=c.loc.coordinates;
  const en=EN[c.name]||c.name;
  // keep the German / local form searchable as an alias
  const aliases=[...new Set([c.name, DE[c.name]].filter(x=>x&&x!==en))];
  const region=c.country==='DE'?(STATES[c.adminCode]||''):'';
  return [en, aliases.join('|'), +lat.toFixed(3), +lon.toFixed(3), c.country, region, Math.round(c.population/1000)];
});
fs.writeFileSync(out+'places.json',JSON.stringify({source:'GeoNames (cities1000 via all-the-cities 3.1.0), Orte ab 5 000 Einwohnern',license:'CC BY 4.0',fields:['name','alt','lat','lon','cc','region','popK'],rows}));
// Antarctica outline from Natural Earth 110m (world-atlas)
const w=require('world-atlas/countries-110m.json');
const fc=topo.feature(w,w.objects.countries);
const ant=fc.features.find(f=>f.properties.name==='Antarctica');
const sahara=[[-17,21],[-16,24],[-13,27.5],[-9,29],[-5,30.5],[0,32],[5,32.5],[9,33],[10,32],[12,31.5],[15,31.2],[19,30.3],[20,31.5],[24,31.5],[29,30.8],[32,30.5],[33,28],[34,26],[35.5,23.5],[37,21],[37.5,18.5],[36,16.5],[33,15.5],[28,15.5],[23,15.5],[18,15.5],[14,16],[10,16],[5,16.5],[0,16.5],[-5,16.8],[-10,16.5],[-16,16.5],[-16.5,19],[-17,21]];
const round=r=>r.map(p=>[+p[0].toFixed(2),+p[1].toFixed(2)]);
const antRings=(ant.geometry.type==='Polygon'?[ant.geometry.coordinates]:ant.geometry.coordinates).map(p=>round(p[0]));
fs.writeFileSync(out+'regions.json',JSON.stringify({
  antarktis:{source:'Natural Earth 1:110m (gemeinfrei)',rings:antRings},
  sahara:{source:'Vereinfachter Umriss, Platzhalter bis Natural Earth Geography Regions eingebunden ist',rings:[sahara]}
}));
console.log(rows.length, rows.slice(0,3), rows.find(r=>r[0]==='Bielefeld'), rows.find(r=>r[0]==='München'), antRings.length);
