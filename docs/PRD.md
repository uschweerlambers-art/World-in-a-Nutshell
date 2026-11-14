# World in a Nutshell – Product Requirements Document (PRD) für den Prototyp

Version 0.9 · Stand: 14.11.2026 · Status: **Entwurf zur Freigabe durch Uwe**

Änderungen in v0.9 (Uwe, 14.11.2026): Echte Kartenansicht (F-18). Der Umschalter „Globe / Map“ rollt den Globus in derselben 3D-Szene zu einer flachen Weltkarte ab, alle Ebenen bleiben erhalten.

Änderungen in v0.8 (Uwe, 14.11.2026): Ort des Tages auf dem Startscreen (F-16), Konfliktgebiete nach UCDP (F-17). Geplant: eine echte Kartenansicht.

Änderungen in v0.7 (Uwe, 13.11.2026, 23:14): Neue Ebenen Gradnetz, Vulkane, Wirbelstürme und weitere Naturereignisse (F-13); Flugzeug- und Satelliten-Details erweitert (F-04.8, F-05.6). Dazu Wetterkarten und Luftqualität (F-14) sowie Schiffe, Kraftwerke und Seekabel (F-15). Fracht, Passagiere und Crew gibt es in keiner offenen Quelle und werden nicht angezeigt.

Änderungen in v0.6 (Uwes Rückmeldungen vom 13.11.2026 abends): Orientierungs-Ebenen (Grenzen, Länder, Hauptstädte) und Routen-Schalter (F-09.7), Orts-Info schwebt über dem Ort mit Wetter, Ortszeit und Datum (F-09.8, F-09.9), Anzeige-Einstellungen und vier Farbschemata (F-09.10, F-09.11), dickere Linien.

Änderungen in v0.5 (Ergebnis M1/D2, 13.11.2026): Repo und GitHub Pages stehen (https://uschweerlambers-art.github.io/World-in-a-Nutshell/). Spike-Ergebnis Flugzeuge: adsb.lol bietet keinen weltweiten Browser-Abruf; die Action holt stattdessen alle 15 Minuten einen weltweiten Schnappschuss der OpenSky-Network-API, der Browser bewegt die Flugzeuge dazwischen entlang Kurs und Tempo weiter. Wolken kommen als tägliche Wolkenkarte aus NASA-GIBS-Satellitenbildern, die die Action berechnet. Radiosender werden beim Rauszoomen gruppiert. Betroffen: F-03.4, F-04.3, F-04.4, F-04.6, F-07.2, Kap. 6, 6.2, 9, 10.

Änderungen in v0.4 (Uwe, 13.11.2026): Kein Cloudflare. Die Seite läuft auf GitHub Pages; eine geplante GitHub Action holt die Daten, die nicht direkt im Browser abrufbar sind, alle 10–15 Minuten als Snapshot-Dateien ab und veröffentlicht die Seite neu. Diese Aktualität reicht (Kap. 6). Betroffen: F-04.4, F-05.1, F-07.1, F-10.2, N-1, N-2.3, N-2.5, N-4, N-7.4, Kap. 6, 9, 10, 11.

Änderungen in v0.3 (Uwe, 13.11.2026): Die Basisversion ist nur auf Englisch. Alle Oberflächentexte, Ländernamen, Weltwunder-Karten und Wikipedia-Links (en.wikipedia.org) sind englisch; dieses PRD bleibt deutsch, Beispiele für UI-Texte stehen auf Englisch. Startscreen erhält ein Symbol (stilisierter Globus, F-01.1).

Änderungen in v0.2 (Uwes Rückmeldung vom 13.11.2026): UFO-Archiv entfällt im Prototyp. Ohne Wunschort startet der Globus über Bielefeld, Deutschland. Jede Weltrekord-Karte verlinkt auf den passenden Wikipedia-Artikel. Repo und Cloudflare folgen später; zuerst entsteht ein Design-Prototyp mit allen Basisfunktionen (Kap. 6.1 und 9).

Grundlage: Projektbrief vom 12.11.2026, Styleframes im Design-Canvas (Main, Mobile, Tokens, Start, Arrival, StartMobile, Wonder)

Dieses Dokument legt fest, *was* der Prototyp können muss und *woran* wir prüfen, ob er es kann. Jede Anforderung hat eine ID und messbare Akzeptanzkriterien (AK). Die Qualitätskontrolle (Kapitel 8) hakt genau diese AK ab.

---

## 1. Ziel des Prototyps

Ein funktionsfähiger 3D-Globus (zunächst als Design-Prototyp, später öffentlich über GitHub Pages), der die MVP-Ebenen aus dem Projektbrief mit echten Live- bzw. Archivdaten zeigt – ohne Anmeldung, ohne Tracking, ohne Werbung und mit **0 € Betriebskosten**.

Der Prototyp soll beweisen, dass

1. die Architektur (statische Seite auf GitHub Pages, Daten-Snapshots per geplanter GitHub Action) kostenlos trägt,
2. der Globus mit vielen tausend Objekten flüssig bleibt (Desktop und iPhone),
3. jede Ebene ihre Quelle und Lizenz korrekt nennt und bei Ausfall der Quelle sauber reagiert,
4. Look und Einstieg den Styleframes entsprechen.

**Nicht Ziel:** Vollständigkeit aller späteren Ebenen, Feinschliff jeder Animation, Mehrsprachigkeit (die Basisversion ist nur auf Englisch; Texte liegen gesammelt, damit Deutsch und weitere Sprachen später ergänzt werden können).

## 2. Zielgruppe und Nutzungsszenarien

- **Neugierige Besucher:innen** ohne Vorwissen, die „einfach mal schauen“ – Einstieg über Ortssuche oder „Surprise me“.
- **Daten-Fans** (Flugzeuge, Satelliten, Erdbeben), die Details eines Objekts anklicken wollen.
- **Mobile Nutzung** auf dem Sofa: iPhone, Bottom Sheet, Radio hören.

Kernszenario: *Ich öffne die Seite, gebe „Bielefeld“ ein (die Oberfläche ist englisch), die Erde dreht sich dorthin, ich schalte Radio ein, höre einen lokalen Sender, schalte dann Flugzeuge dazu und klicke eins an.*

## 3. Umfang

### 3.1 Im Prototyp (MVP)

| ID | Feature | Priorität |
| --- | --- | --- |
| F-01 | Startscreen mit Ortssuche, „Explore freely“, Standort-Option | Muss |
| F-02 | „Surprise me“ mit sechs Weltwundern & Rekorden | Muss |
| F-03 | Globus mit Tag-Nacht-Grenze und Wolkenschicht | Muss |
| F-04 | Flugzeuge live | Muss |
| F-05 | Satelliten und ISS | Muss |
| F-06 | Erdbeben der letzten 24 h | Muss |
| F-07 | Radiosender zum Anklicken und Hören | Muss |
| F-08 | UFO-Archiv als Heatmap | **Entfällt im Prototyp** (Uwe, 13.11.2026) |
| F-09 | Ebenen-Steuerung, Inspector, Quellen-/Lizenzanzeige (übergreifende UI) | Muss |
| F-10 | Rechtliche Seiten: Impressum, Datenschutz, Lizenzen | Muss |
| F-11 | −24-h-Zeitleiste (aus Styleframe Main) | Kann (nur Erdbeben im Prototyp) |
| F-12 | Umschalter Globus/Karte (aus Styleframe Main) | Umgesetzt in v0.9, siehe F-18 |

### 3.2 Nicht im Prototyp

UFO-Archiv, Züge, TV, Webcams, Raketenstarts, Polarlicht, Benutzerkonten, Favoriten mit Server-Speicherung, Monetarisierung jeder Art. (Schiffe, Brände und Luftqualität sind seit v0.7 dabei, siehe F-13 bis F-15.)

---

## 4. Funktionale Anforderungen und Akzeptanzkriterien

Prüfmethoden: **M** = manueller Test nach Testskript, **A** = automatisierter Test (Unit/E2E mit Playwright), **L** = Lighthouse/DevTools-Messung, **R** = Review (Code, Netzwerk-Log oder Dokument).

### F-01 Startscreen & Einstieg

*Als Besucher:in möchte ich direkt sagen können, wo ich anfangen will, während die Erde im Hintergrund schon lädt.*

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| F-01.1 | Beim ersten Aufruf erscheint der Startscreen mit Symbol (stilisierter Globus mit Umlaufbahn), Titel „World in a Nutshell“, Frage „Where would you like to start?“, Suchfeld, „Explore freely“, „Use my location“ und „Surprise me“. Der Globus dreht sich dahinter langsam. | M, A |
| F-01.1a | **Sprache:** Alle sichtbaren Texte, Ländernamen, Datums- und Zahlformate sind englisch (z. B. „52.03° N · 8.53° E“, „8,849 m“). Kein deutscher Text in der Oberfläche. | R |
| F-01.2 | Das Suchfeld ist ohne Wartezeit bedienbar, auch wenn Globus-Texturen noch laden (Eingabe innerhalb von 1 s nach First Contentful Paint möglich). | M, L |
| F-01.3 | Ab 2 eingegebenen Zeichen erscheinen innerhalb von 150 ms bis zu 8 Vorschläge im Format „Ort, Region, Land“ auf Englisch (z. B. „Bielefeld, North Rhine-Westphalia, Germany“). Englische und lokale bzw. deutsche Namen sowie Schreibweisen ohne Akzent finden denselben Ort („Munich“, „München“, „Muenchen“ → „Munich“). | A |
| F-01.4 | Die Suche läuft vollständig im Browser über einen statischen GeoNames-Index (Orte ≥ 5 000 Einwohner, CC BY 4.0). **Im Netzwerk-Log geht bei der Eingabe keine einzige Anfrage an einen Drittserver.** | R (DevTools-Netzwerk) |
| F-01.5 | Der Ortsindex ist komprimiert ≤ 1,5 MB und wird erst geladen, wenn das Suchfeld den Fokus bekommt oder der Startscreen steht (nicht blockierend). | L |
| F-01.6 | Nach Auswahl eines Ortes fliegt die Kamera in 1,5–3 s sanft dorthin, der Ort wird markiert, der Ortsname erscheint kurz, danach blendet die Ebenenauswahl ein (Styleframe „Arrival“). | M |
| F-01.7 | Tastaturbedienung: Pfeiltasten wählen Vorschläge, Enter bestätigt, Esc schließt die Liste. | A |
| F-01.8 | „Explore freely“ blendet den Startscreen aus, die Kamera kommt über **Bielefeld, Deutschland** (52,02° N, 8,53° O) zur Ruhe und die Ebenenauswahl blendet ein. | M, A |
| F-01.8a | **Standard-Startort Bielefeld:** Wählt man keinen Wunschort (frei erkunden, Standort abgelehnt oder nicht verfügbar, Startscreen per Esc geschlossen), ist Bielefeld, Deutschland der Startort. Schon hinter dem Startscreen ist Bielefeld der Bezugspunkt der Drehung. Eine Ortsangabe in der URL hat Vorrang. | A |
| F-01.9 | „Use my location“ löst **erst beim Klick** die Standortabfrage des Browsers aus. Vorher wird die Geolocation-API nachweislich nicht aufgerufen. | R, A |
| F-01.10 | Lehnt man die Standortfreigabe ab oder schlägt sie fehl, erscheint ein kurzer Hinweis, die Kamera geht nach Bielefeld (F-01.8a), und die Suche bleibt ohne Neuladen nutzbar. | M |
| F-01.11 | Bei aktivierter Systemeinstellung „Bewegung reduzieren“ springt die Kamera ohne Flug zum Ziel, die Erde dreht sich im Hintergrund nicht. | M, A |
| F-01.12 | Ein Ortsparameter in der URL (z. B. `?ort=bielefeld` oder `#lat,lon,zoom`) öffnet direkt diese Ansicht – teilbare Links ohne Server-Speicherung. | A |

### F-02 „Surprise me“ – Weltwunder & Rekorde

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| F-02.1 | Ein Klick auf „Surprise me“ dreht den Globus zu einem der sechs Startorte (Mount Everest, Challenger-Tief, Sahara, Antarktis, Baikalsee, Salar de Uyuni) und öffnet eine Story-Karte (Styleframe „Wonder“). | M |
| F-02.2 | Jede Karte ist eine Kurzinfo: überraschende Überschrift, höchstens zwei Sätze Erklärung, die Zahl des Rekords und die Quelle als Link. | R |
| F-02.2a | **Wikipedia-Link:** Jede Karte enthält „Read more on Wikipedia“ mit Link auf den passenden Artikel der englischsprachigen Wikipedia (en.wikipedia.org) (öffnet in neuem Tab, `rel="noopener"`). Alle Links sind vor dem Livegang auf Erreichbarkeit geprüft (HTTP 200, kein Begriffsklärungsartikel). Wikipedia wird nur verlinkt, es werden keine Inhalte übernommen. | R, A (Link-Check) |
| F-02.3 | Alle Zahlen sind vor dem Livegang gegen die genannte Quelle geprüft; das Prüfdatum steht in der Datendatei je Eintrag. | R |
| F-02.4 | Sahara und Antarktis zeigen die Region als Fläche, nicht als Punkt (Umriss aus Natural Earth). Punkt-Orte (Everest, Challenger-Tief) erhalten eine Markierung. | M |
| F-02.5 | Wo ein Gegenstück existiert (Antarktis ↔ Sahara, Everest ↔ Challenger-Tief), bietet die Karte einen Link „Its counterpart: …“, der dorthin fliegt. | M |
| F-02.6 | „Next wonder“ führt zum nächsten Ort; innerhalb einer Sitzung wiederholt sich kein Ort, bevor alle sechs gezeigt wurden. | A |
| F-02.7 | Die Inhalte liegen in einer eigenen Datendatei (JSON), sodass weitere Einträge aus der Rekordtabelle ohne Codeänderung ergänzt werden können. | R |

### F-03 Globus, Tag-Nacht-Grenze, Wolken

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| F-03.1 | Der Globus ist mit Maus/Trackpad (Drehen, Zoomen) und Touch (Ein-Finger-Drehen, Pinch-Zoom) bedienbar; Zoom ist begrenzt, sodass man nicht in die Erde oder ins Leere zoomt. | M |
| F-03.2 | Die Tag-Nacht-Grenze wird aus dem aktuellen UTC-Zeitpunkt berechnet. Abweichung der Terminator-Position gegenüber einer Referenzrechnung (z. B. NOAA-Sonnenstand) ≤ 1° Länge. Aktualisierung mindestens einmal pro Minute. | A |
| F-03.3 | Auf der Nachtseite sind Stadtlichter zu sehen (NASA Black Marble / Nachtlichter), weich überblendet am Terminator. | M |
| F-03.4 | Eine Wolkenschicht liegt als eigene, leicht erhöhte Schale über der Erde. Quelle: tagesaktuelle Satellitenbilder aus NASA GIBS (MODIS Terra/Aqua, VIIRS SNPP/NOAA-20), von der Action höchstens alle 3 h zu einer Wolkenkarte verrechnet (heutige Überflüge zuerst, Lücken aus dem Vortag). Die Quellenzeile nennt das Datum. Fehlt die Karte, zeigt der Globus gezeichnete Platzhalter-Wolken. | M, R |
| F-03.5 | Wolken und Tag-Nacht lassen sich einzeln ein- und ausschalten (Toggle im UI). | M |
| F-03.6 | Look entspricht den Tokens: Hintergrund #05070D, Liquid Glass nur auf schwebenden Bedienelementen. | R (Abgleich Styleframe) |

### F-04 Flugzeuge live

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| F-04.1 | Flugzeuge erscheinen als ausgerichtete Symbole in #64D2FF; die Richtung entspricht dem Kurs (track). | M |
| F-04.2 | Positionen werden alle 5–15 s aktualisiert; zwischen Updates werden sie anhand von Kurs und Geschwindigkeit interpoliert, sodass keine Sprünge > 1 Symbolbreite sichtbar sind. | M |
| F-04.3 | Quelle ist ein weltweiter Schnappschuss der OpenSky-Network-API (anonym, 4 von 400 Tagespunkten pro Abruf), den die Action alle 15 min holt. Fällt OpenSky aus, bleibt der letzte Schnappschuss mit Uhrzeit stehen und meta.json vermerkt den Fehler. (v0.5: adsb.lol bietet keinen weltweiten Browser-Abruf.) | A (simulierter Ausfall) |
| F-04.4 | Der Browser fragt keine Flugdaten-API direkt ab, sondern lädt nur den Schnappschuss von der eigenen Seite (alle 2 min Prüfung der kleinen meta.json, Neuladen nur bei neuem Stand). Die Ebene nennt den Stand („Aircraft as of HH:MM“). | R, A |
| F-04.5 | Ein Klick auf ein Flugzeug öffnet den Inspector mit: Rufzeichen, ICAO-Hex, Höhe, Geschwindigkeit, Kurs, Zeitpunkt der letzten Meldung, Quelle. Daten, die die Quelle nicht liefert, werden als „–“ gezeigt, nicht erfunden. | M |
| F-04.6 | Zwischen zwei Schnappschüssen werden Flugzeuge entlang Kurs und Geschwindigkeit weiterbewegt, höchstens 20 min; danach bleiben sie stehen. Der Inspector zeigt die Uhrzeit der letzten Meldung und den Hinweis, dass die Position geschätzt ist. | A |
| F-04.7 | Die Ebene zeigt die aktuelle Anzahl sichtbarer Objekte in der Seitenleiste (Styleframe Main). | M |

### F-05 Satelliten und ISS

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| F-05.1 | Bahndaten (GP/TLE) kommen von CelesTrak, abgeholt von der GitHub Action höchstens alle 2 h und als Snapshot-Datei ausgeliefert. Der Browser fragt CelesTrak nie direkt ab. Die Positionen selbst rechnet der Browser laufend aus (F-05.2), die Satelliten bewegen sich also live. | R |
| F-05.2 | Positionen werden im Browser mit satellite.js (SGP4) berechnet. Die ISS-Position weicht gegenüber einer Referenz (wheretheiss.at oder N2YO zum selben Zeitpunkt) um ≤ 10 km ab, solange die TLE jünger als 48 h ist. | A |
| F-05.3 | Darstellung in #BF5AF2; die ISS ist hervorgehoben, mit Label und auf Wunsch mit ihrer Bahn für ±1 Umlauf. | M |
| F-05.4 | Standardmäßig wird eine kuratierte Auswahl gezeigt (z. B. Raumstationen, „Brightest“, Wetter, GNSS – zusammen ≤ 2 000 Objekte); ein Schalter „Alle aktiven“ zeigt die volle Liste (~10 000+). | M |
| F-05.5 | Klick auf einen Satelliten zeigt Name, NORAD-ID, Höhe, Geschwindigkeit, Bahnneigung, Alter der Bahndaten, Quelle. | M |
| F-05.6 | Ist der Snapshot älter als 24 h, erscheint im Inspector ein Hinweis „Bahndaten vom …“. | A |

### F-06 Erdbeben der letzten 24 h

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| F-06.1 | Quelle ist der USGS-Feed `all_day.geojson` (gemeinfrei), abgerufen direkt im Browser, Aktualisierung alle 5 min. | R |
| F-06.2 | Jedes Beben erscheint als Kreis in #FF9F0A; Größe skaliert mit der Magnitude, Beben der letzten Stunde pulsieren (bei reduzierter Bewegung: statischer Ring). | M |
| F-06.3 | Anzahl der angezeigten Beben entspricht exakt der Anzahl im Feed (Abgleich im Test). | A |
| F-06.4 | Klick zeigt Ort, Magnitude, Tiefe, Zeit (lokal und UTC), Link zur USGS-Detailseite. | M |
| F-06.5 | Filter nach Mindestmagnitude (z. B. alle / ≥ 2,5 / ≥ 4,5). | M |
| F-06.6 | Kann (F-11): Die −24-h-Zeitleiste spielt die Beben chronologisch ab. | M |

### F-07 Radiosender

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| F-07.1 | Quelle ist Radio Browser (gemeinfrei). Die Senderliste mit Koordinaten bereitet die GitHub Action täglich als Snapshot-Datei auf; nur Sender mit Koordinaten und HTTPS-Stream kommen in die Liste. | R |
| F-07.2 | Sender erscheinen als Punkte in #30D158; beim Rauszoomen werden sie auf einem Raster in zwei Stufen zu Gruppen zusammengefasst (größerer Punkt = mehr Sender). Ein Klick auf eine Gruppe zoomt hinein. | M |
| F-07.3 | Klick auf einen Sender startet die Wiedergabe innerhalb von 5 s (bei funktionierendem Stream) und zeigt Sendername, Ort, Land, Genre, Quelle. | M |
| F-07.4 | Ein Player bleibt sichtbar (Play/Pause, Lautstärke, Sendername), auch wenn andere Ebenen gewechselt werden. | M |
| F-07.5 | Ist ein Stream nicht erreichbar, erscheint nach spätestens 8 s eine Meldung „Station not reachable right now“ und ein Vorschlag für einen Sender in der Nähe. | A |
| F-07.6 | Kernszenario: Nach Ankunft in Bielefeld zeigt „Nearby“ die nächstgelegenen Sender sortiert nach Entfernung. | M |
| F-07.7 | Streams werden direkt vom Sender geladen und nicht über unsere Seite weitergeleitet (keine Kosten, keine Weiterverbreitung). | R |
| F-07.8 | Wiedergabe startet nur nach aktivem Klick, nie automatisch. | M |

### F-08 UFO-Archiv als Heatmap

Entfällt im Prototyp (Entscheidung Uwe, 13.11.2026). Die Lizenz der NUFORC-Daten ist ungeklärt; die Ebene kann nach einer Lizenzprüfung später als eigenes Modul ergänzt werden.

### F-13 Natur und Gradnetz (v0.7)

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| F-13.1 | **Vulkane:** alle Holozän-Vulkane des Smithsonian Global Volcanism Program als Dreieck; Vulkane mit Ausbruch seit Vorjahr oder im wöchentlichen Aktivitätsbericht mit Ring. Klick zeigt Land, Typ, letzten Ausbruch, Gipfelhöhe und Links zum Smithsonian-Profil und zu Wikipedia. | M, A |
| F-13.2 | **Wirbelstürme:** aktive tropische Stürme aus NASA EONET mit Symbol an der letzten Position und Zugbahn, eingefärbt nach Stärke (Saffir-Simpson). Klick zeigt Stärke, Wind in km/h und kn, Zugrichtung und -tempo, Stand und Link zur Warnung (JTWC/NHC). | M, A |
| F-13.3 | **Weitere Naturereignisse** (Waldbrände, Meer- und Seeeis, Fluten, Staub, Dürre u. a.) aus NASA EONET, Farbe je Art, Legende mit Anzahl. Klick zeigt Art, Größe (z. B. acres und ha), erste und letzte Meldung, Link zur Quelle. | M, A |
| F-13.4 | **Gradnetz** (Default aus): Breiten- und Längenkreise alle 15°, Gradangaben entlang der Bildmitte. | M |
| F-13.5 | EONET stündlich, Vulkanliste wöchentlich, Aktivitätsbericht zweimal täglich über die Action; fällt eine Quelle aus, bleibt der letzte Stand. | A |

### F-14 Wetterkarten und Luftqualität (v0.7)

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| F-14.1 | **Regen:** NASA GPM IMERG (Satellit, halbstündlich, ca. 5–6 h Verzug) als transparente Farbschicht über den Wolken, Legende leicht–stark, Zeitstempel. | M |
| F-14.2 | **Wind:** animierte Partikel nach dem 10-m-Wind des US-Modells GFS (1°, alle 6 h), Farbe nach Tempo, Legende. Bei „Bewegung reduzieren“ nur Standbild, alle 2 s neu. | M, A |
| F-14.3 | **Temperatur:** 2-m-Temperatur aus GFS als halbtransparente Farbkarte mit Skala −40 bis +40 °C. | M |
| F-14.4 | **Dunst, Rauch, Staub:** tägliche Aerosol-Karte (NASA GIBS, optische Dicke), nur wolkenfreie Gebiete. | M |
| F-14.5 | **Luftqualität in der Orts-Info:** Europäischer Luftqualitätsindex mit Einstufung und PM2.5/PM10 (Copernicus CAMS über Open-Meteo), nur beim Klick, nur Koordinaten des Ortes. | M, R |
| F-14.6 | Alle Wetterdateien baut die Action (GFS höchstens alle 3 h, Regen stündlich, Aerosole alle 6 h); fehlt eine Datei, meldet die Seite „not available right now“ und der Rest läuft weiter. | A |

### F-15 Schiffe, Kraftwerke, Seekabel (v0.7)

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| F-15.1 | **Schiffe:** Live-AIS von aisstream.io (kostenloser Schlüssel als Repo-Secret `AISSTREAM_API_KEY`). Die Action hört alle 15 Minuten rund eine Minute weltweit mit und führt das Ergebnis mit früheren Läufen zusammen (Positionen bis 2 h, Schiffsdaten bis 14 Tage). Symbol als Rumpf in Fahrtrichtung, Farbe nach Schiffsart (Fracht, Tanker, Passagier, Fischerei, Schlepper/Dienst, Schnellboot, Segel/Freizeit, Sonstige), Legende mit Anzahl. Fahrende Schiffe werden entlang Kurs und Tempo bis 30 Minuten weiterbewegt. | M, A |
| F-15.2 | **Schiffsdetails:** Name, Art, Flagge (aus der MMSI), Ziel und ETA (wie von der Crew eingegeben), Status, Tempo, Kurs, Länge und Breite, Tiefgang, Gefahrgut-Kategorie A–D (falls im AIS-Schiffstyp gemeldet), Rufzeichen, IMO, MMSI, letzte Meldung. Fracht, Passagiere, Crew und Heimathafen gibt AIS nicht her und werden nicht angezeigt; der Hinweis steht im Panel. | M |
| F-15.3 | **Kraftwerke:** Global Power Plant Database v1.3.0 (WRI, CC BY 4.0, Stand 2021), 34.936 Anlagen, einmal gebaut und im Repo (`tools/build-power.mjs`). Farbe nach Energieträger, Größe nach Leistung, Filter Alle / ≥ 100 MW (Standard) / ≥ 1 GW. Panel: Energieträger, Leistung, Erzeugung (falls gemeldet), Inbetriebnahme, Betreiber, Land, Links zu Wikipedia und OpenStreetMap. | M |
| F-15.4 | **Seekabel:** Daten- und Stromkabel am Meeresgrund aus OpenStreetMap (Overpass API, wöchentlich, ODbL, Namensnennung „© OpenStreetMap contributors“ sichtbar). Abschnitte mit gleichem Namen bilden ein Kabel. Klick auf eine Linie markiert das ganze Kabel und zeigt Name, Art, Betreiber, Spannung, kartierte Länge und Link zu OpenStreetMap. OSM ist unvollständig; das steht im Panel. Die TeleGeography-Karte ist nicht frei lizenziert und wird nicht genutzt. | M, R |


### F-16 Ort des Tages auf dem Startscreen (v0.8)

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| F-16.1 | Neben (Handy: unter) der Startkarte steht ein „Place of the day“: Name, Lage, ein Satz in eigenen Worten, Link zu Wikipedia und ein Knopf „Visit on the globe“, der wie die Ortssuche dorthin fliegt. | M |
| F-16.2 | Mini-Slider mit bis zu 5 Bildern, wechselt alle 6 s (nicht bei „Bewegung reduzieren“, pausiert bei Maus oder Fokus), Punkte, Pfeile und Wischen. Unter jedem Bild Urheber und Lizenz mit Link zur Commons-Seite. | M, A |
| F-16.3 | Bilder nur von Wikimedia Commons (freie Lizenzen, keine „non-free“-Dateien). Die Action lädt sie einmal täglich, verkleinert sie und legt sie auf unsere Seite; der Browser fragt Wikimedia nicht an. | R, A |
| F-16.4 | Der Ort wechselt um 00:00 Uhr Berliner Zeit nach fester Reihenfolge aus `scripts/places-of-the-day.json` (63 Orte, Start 14.11.2026). Die Datei enthält heute und morgen, eine offene Seite wechselt um Mitternacht selbst. Fehlt die Datei, bleibt der Startscreen wie bisher. | A |

### F-17 Bewaffnete Konflikte (v0.8)

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| F-17.1 | Ebene „Armed conflicts“ (Standard aus): rot schraffierte Gebiete, in denen in den letzten 12 Monaten der Daten mindestens 25 Menschen durch organisierte Gewalt im Umkreis von etwa 75 km starben (3 × 3 Zellen à 0,5°; 25 Tote ist auch die UCDP-Schwelle für einen bewaffneten Konflikt). Dichte der Schraffur nach Zahl der Toten. | M |
| F-17.2 | Quelle: UCDP Candidate Events Dataset (Uppsala Conflict Data Program, CC BY 4.0), monatlich, etwa zwei Monate Verzug. Die Action lädt die Monatsdateien der letzten 12 Monate (höchstens alle 3 Tage) und fasst sie zu Zellen und Ländern zusammen. ACLED scheidet aus (Registrierung, Weitergabe eingeschränkt). | A, R |
| F-17.3 | Klick auf eine schraffierte Fläche zeigt das Land: Tote (beste Schätzung), Ereignisse, Art der Gewalt, die drei größten Konflikte, letztes Ereignis, Zeitraum, Hinweis „vorläufige Daten“, Links zu UCDP und Wikipedia. Unbekannte Akteure (XXX…) heißen „unidentified group“. | M |

### F-18 Kartenansicht (v0.9)

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| F-18.1 | Der Umschalter „Globe / Map“ oben rechts (Handy: Knopf mit Karten- bzw. Globus-Symbol in der Werkzeugleiste) wechselt zwischen Globus und flacher Weltkarte. Der Wechsel ist eine weiche Bewegung von etwa 1,5 s, in der sich die Kugel abrollt; die Mitte des Bildes bleibt dabei an ihrem Ort. Bei „reduzierter Bewegung“ wechselt die Ansicht sofort. | M |
| F-18.2 | Projektion: Plattkarte (equirectangular), wie alle Texturen. Die Kartenmitte folgt der Ansicht, die Karte lässt sich nach Osten und Westen endlos verschieben; Linien über den Kartenrand (Datumsgrenze auf der Rückseite) werden dort getrennt. | M |
| F-18.3 | Alle Ebenen, Beschriftungen, Popups, Hervorhebungen und Klicks funktionieren auf der Karte wie auf dem Globus. Satelliten liegen über ihrem Bodenpunkt. Tag und Nacht, Wolken, Wetterkarten und Konfliktgebiete liegen auf der Karte. | M |
| F-18.4 | Bedienung der Karte: ziehen verschiebt, Mausrad oder zwei Finger zoomen zur Zeigerposition. Weitester Zoom: die ganze Breite der Welt passt auf den Bildschirm; nach Norden und Süden endet die Karte an den Polen. Suche, „Surprise me“ und „Mein Standort“ fliegen auf der Karte zum Ziel. | M |

### F-09 Übergreifende Bedienung

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| F-09.1 | Desktop: linke Ebenen-Seitenleiste mit Farbe, Name, Objektanzahl und Schalter je Ebene; Inspector rechts (Styleframe Main). | R |
| F-09.2 | Mobil (< 768 px): Bottom Sheet mit Suche und Ebenen-Chips (Styleframe Mobile). | R |
| F-09.3 | Jede aktive Ebene nennt in der Quellenzeile ihre Quelle und Lizenz mit Link (z. B. „Aircraft: adsb.lol · ODbL“). | R |
| F-09.4 | Jede Ebene hat drei sichtbare Zustände: *lädt*, *aktiv (Stand: Uhrzeit)*, *Quelle nicht erreichbar*. Ein Ausfall einer Ebene beeinträchtigt keine andere. | A (Netzwerk-Mock) |
| F-09.5 | Ebenen-Auswahl und Kameraposition werden in der URL gespiegelt (teilbar, ohne Cookies/Server). | A |
| F-09.6 | Keine Ebene ist beim Start „laut“: Standardmäßig aktiv sind Tag/Nacht, Wolken und Erdbeben; Flugzeuge, Satelliten und Radio schaltet man selbst ein (schont Rate-Limits und Datenvolumen). | M |
| F-04.8 | **Flugdetails** (v0.7): Klick auf ein Flugzeug zeigt Flugnummer, Airline, Start- und Zielflughafen (mit Linie auf dem Globus), Flugzeugtyp, Kennzeichen, Steig-/Sinkrate und Notfall-Squawk. Route und Typ kommen erst beim Klick von adsbdb.com (offen, ohne Schlüssel) und sind als „may be out of date“ gekennzeichnet. | M, R |
| F-05.6 | **Satellitendetails** (v0.7): Betreiber, Startdatum und -ort (CelesTrak SATCAT), Bahntyp (LEO/MEO/GEO/HEO), Höhenbereich Perigäum–Apogäum, Umlaufzeit. | M |
| F-09.7 | **Orientierung** (Uwe, 13.11.): Ländergrenzen mit Ländernamen und Hauptstädte als türkise Punkte mit Namen sind per Default an und je per Schalter ausblendbar. Überlappende Namen werden ausgeblendet, der Hauptstadtpunkt bleibt. Ein Schalter „Routes & directions“ (Default aus) zeigt Kurs voraus für Flugzeuge und die nächste Viertel-Umlaufbahn für Satelliten. | M |
| F-09.8 | **Orts-Info schwebt über dem Ort** (Uwe, 13.11.): Ein Klick auf den Suchmarker oder eine Hauptstadt öffnet ein kleines Fenster mit Pfeil direkt über dem Ort (ohne Platz darüber: darunter). Es folgt dem Ort beim Drehen, verschwindet auf der Rückseite und schließt per ×, Esc oder Klick auf freien Globus. Inhalt: Name, Region und Land, aktuelles Wetter (Temperatur, Lage als Symbol und Text, Tages-Min/Max, Wind), lokale Uhrzeit und Datum mit Zeitzone, Koordinaten, Einwohner, Höhe über NN, Links zu Wikipedia, OpenStreetMap, Google Maps und Waze. | M, A |
| F-09.9 | Wetter, Zeitzone und Höhe kommen aus **einer** Open-Meteo-Anfrage mit den Koordinaten des Ortes (nie des Besuchers), erst beim Klick, für 10 min im Browser gemerkt. Ohne Antwort zeigt das Fenster einen Hinweis, der Rest bleibt nutzbar. | R (Netzwerk-Log), A |
| F-09.10 | **Anzeige-Einstellungen** (Uwe, 13.11.): Ein Schalter in der Werkzeugleiste öffnet Regler für Panelgröße (85–130 %, nur ab 768 px), Namen auf dem Globus (80–160 %), Symbole (70–180 %) und Linienstärke (50–300 %), dazu „Reset“. Die Werte gelten sofort und bleiben nur im lokalen Speicher des Browsers. | M, A |
| F-09.11 | **Farbschemata:** vier Presets – Night (Standard), High contrast, Atlas, Colour-blind safe (Okabe-Ito). Sie färben Ebenen-Symbole, Seitenleiste, Linien und Globus-Namen einheitlich um; Hauptstädte bleiben türkis. Linien (Grenzen, Routen, ISS-Bahn) haben echte Pixelbreite (≥ 1,3 px bei 100 %). | M |

### F-10 Rechtliches

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| F-10.1 | Impressum und Datenschutzerklärung sind von jeder Ansicht mit höchstens zwei Klicks erreichbar. | M |
| F-10.2 | Die Datenschutzerklärung nennt alle Drittserver, an die der Browser Anfragen sendet (Liste deckt sich mit dem Netzwerk-Log aus Kap. 8), sowie GitHub Pages als Hoster inkl. US-Übermittlung. | R |
| F-10.3 | Eine Seite „Quellen & Lizenzen“ listet jede Datenquelle, jede Bibliothek und jeden Ortsindex mit Lizenz. | R |

---

## 5. Nicht-funktionale Anforderungen

### N-1 Kosten (0 €)

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| N-1.1 | Alle eingesetzten Dienste laufen im kostenlosen Tarif ohne hinterlegte Zahlungsmethode, wo das möglich ist. Liste aller Dienste mit Tarif im Repo (`docs/kosten.md`). | R |
| N-1.2 | Die geplante Action läuft höchstens alle 10 min, sodass GitHub Pages nicht mehr als 6 Veröffentlichungen pro Stunde bekommt (weiche Grenze 10/h). Laufzeit pro Durchgang < 3 min. Bei öffentlichem Repo kostet Actions nichts. | R |
| N-1.3 | Die ausgelieferte Seite inklusive Snapshots bleibt unter 1 GB (Grenze für GitHub Pages). Snapshots werden nicht ins Repo committet, sondern nur in das Pages-Artefakt gepackt, damit das Repo nicht wächst. | R |
| N-1.4 | Bandbreite: Eine Erstansicht lädt < 6 MB (Texturen progressiv). Steigt der Verkehr Richtung 100 GB/Monat (weiche Grenze von GitHub Pages), wird das als Risiko gemeldet und der Umzug (z. B. Codeberg oder Cloudflare) geplant. | R |
| N-1.5 | Keine bezahlten APIs, keine Tokens für Globus-Bibliotheken (kein Cesium ion, kein Mapbox-Token). | R |

### N-2 Datenschutz & Sicherheit

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| N-2.1 | Kein Analytics, keine Cookies, kein Fingerprinting. Der Browser-Speicher wird nur für Komfort genutzt (z. B. letzte Ebenenauswahl) und funktioniert auch, wenn er gesperrt ist. | R, DevTools |
| N-2.2 | Keine Schriften, Skripte oder Bilder von Google oder anderen CDNs, die nicht für Daten nötig sind: Schriften und Bibliotheken werden selbst ausgeliefert. | R (Netzwerk-Log) |
| N-2.3 | API-Keys (z. B. für spätere Ebenen wie Schiffe) liegen ausschließlich in GitHub Actions Secrets; eine Suche im ausgelieferten Bundle findet keinen Key. | R, A (Secret-Scan in CI) |
| N-2.4 | Content-Security-Policy erlaubt nur die in der Datenschutzerklärung genannten Ziele (`connect-src`, `img-src`, `media-src`). | R |
| N-2.5 | Es gibt keinen eigenen Proxy. Abrufe aus dem Browser gehen nur an die in der Datenschutzerklärung genannten Quellen; die Besucher-IP erreicht diese Quellen. Wo das vermeidbar ist, kommt die Ebene aus dem Snapshot. | R |
| N-2.6 | Standort und Sucheingaben verlassen den Browser nicht. | R |

### N-3 Performance

Referenzgeräte: **Desktop** MacBook Air M1 (Chrome und Safari aktuell), **Mobil** iPhone 12 oder neuer (Safari), **Untergrenze** ein Mittelklasse-Android-Gerät von 2021 (Chrome).

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| N-3.1 | Startscreen sichtbar und Suchfeld bedienbar: Largest Contentful Paint ≤ 2,5 s auf Desktop, ≤ 3,5 s auf iPhone bei „Fast 4G“-Drosselung. | L |
| N-3.2 | Initiales JavaScript ≤ 500 KB komprimiert; Texturen werden progressiv geladen (erst niedrige Auflösung, dann höhere). | L |
| N-3.3 | Bildrate mit Tag/Nacht, Wolken, Erdbeben + Flugzeugen (≥ 8 000 Objekte) + 2 000 Satelliten: ≥ 50 fps auf Desktop-Referenz, ≥ 30 fps auf iPhone-Referenz. | L (Performance-Panel, 30 s Messung) |
| N-3.4 | Mit „Alle aktiven Satelliten“ (~10 000) zusätzlich: ≥ 30 fps Desktop. | L |
| N-3.5 | Objekte werden per Instancing gezeichnet; Datenupdates blockieren den Hauptthread nicht länger als 50 ms (Parsing/Bahnrechnung in Web Worker). | L |
| N-3.6 | Speicher: Nach 30 min Laufzeit mit allen Ebenen kein stetiges Wachstum des JS-Heaps (kein Leak; Zuwachs < 20 %). | L |
| N-3.7 | Ist ein Tab im Hintergrund, pausieren Abfragen und Rendering. | A |
| N-3.8 | Lighthouse Performance-Score ≥ 80 (mobil) für den Startscreen. | L |

### N-4 Robustheit

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| N-4.1 | Jede Quelle hat Timeout, Wiederholung mit wachsendem Abstand und eine Fallback-Quelle oder den letzten Snapshot. | R, A |
| N-4.2 | Fällt die geplante Action aus, laufen Globus, Erdbeben, Flugzeuge (Browser-Quellen) und Ortssuche weiter; Snapshot-Ebenen zeigen ihren letzten Stand mit Uhrzeit und ab 2 h Alter einen Hinweis. | A |
| N-4.3 | Geplante Workflows ruhen nach 60 Tagen ohne Repo-Aktivität. Ein Wächter (z. B. monatlicher Keepalive-Commit oder Hinweis im README) verhindert das; dokumentiert in `docs/betrieb.md`. | R |
| N-4.4 | Ohne WebGL erscheint eine verständliche Meldung statt einer leeren Seite. | M |

### N-5 Barrierefreiheit

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| N-5.1 | Alle Bedienelemente haben Trefferflächen ≥ 44 × 44 px. | R |
| N-5.2 | Alle Bedienelemente sind per Tastatur erreichbar und haben sichtbaren Fokus. | M |
| N-5.3 | Texte auf Glas-Flächen erfüllen Kontrast ≥ 4,5:1 (WCAG AA). | L (axe) |
| N-5.4 | `prefers-reduced-motion` wird respektiert (keine Kameraflüge, kein Auto-Rotieren, kein Pulsieren). | A |
| N-5.5 | Ebenen unterscheiden sich nicht nur durch Farbe (zusätzlich Symbolform oder Label). | R |
| N-5.6 | Lighthouse Accessibility-Score ≥ 90. | L |

### N-6 Kompatibilität

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| N-6.1 | Läuft in den jeweils zwei neuesten Versionen von Chrome, Safari (macOS und iOS), Firefox und Edge. | M (Testmatrix) |
| N-6.2 | Layout funktioniert von 360 px bis 2560 px Breite ohne horizontales Scrollen. | M, A |

### N-7 Wartbarkeit & Offenheit

| AK | Kriterium | Prüfung |
| --- | --- | --- |
| N-7.1 | Jede Ebene ist ein eigenes Modul mit einheitlicher Schnittstelle (`load`, `update`, `render`, `dispose`, `meta` mit Quelle/Lizenz). Eine neue Ebene braucht keine Änderung an anderen Ebenen. | R |
| N-7.2 | Öffentliches GitHub-Repo mit Lizenz (Vorschlag: MIT für Code), README mit lokalem Start in ≤ 3 Befehlen. | R |
| N-7.3 | CI (GitHub Actions) führt bei jedem Pull Request Lint, Unit-Tests, E2E-Smoke-Test und Secret-Scan aus; Merge nur bei grün. | R |
| N-7.4 | Für Pull Requests wird eine Vorschau gebaut (Build-Artefakt oder eigener Vorschau-Ordner), damit Uwe Änderungen vor dem Merge ansehen kann. GitHub Pages hat keine eingebauten PR-Vorschauen. | R |

---

## 6. Architektur (Kurzfassung)

```
GitHub-Repo (öffentlich)
 ├─ Code, Ortsindex, Weltwunder, Texturen
 └─ GitHub Action „Daten & Deploy“ (Cron alle 10–15 min, plus bei jedem Push)
      ├─ holt: CelesTrak (≤ alle 2 h), Radio Browser (1× täglich), OpenSky-Flugzeuge und USGS-Fallback (jeder Lauf),
      │        NASA-GIBS-Wolkenkarte (≤ alle 3 h)
      ├─ schreibt kompakte JSON-Snapshots mit Zeitstempel nach data/live/
      └─ baut die Seite und veröffentlicht sie auf GitHub Pages (Snapshots nur im Pages-Artefakt, nicht im Repo)

Browser (GitHub Pages, statisch)
 ├─ three.js ── Globus, Ebenen, Instancing
 ├─ satellite.js (Web Worker) ── Satellitenpositionen live aus den Bahndaten
 ├─ direkt live:  USGS (Erdbeben), Radio-Streams
 └─ aus Snapshots:  data/live/*.json (Bahndaten, Senderliste, Flugzeuge), clouds.jpg
```

**Aktualität:** Erdbeben kommen direkt und damit live in den Browser. Flugzeuge kommen als 15-Minuten-Schnappschuss und werden dazwischen weiterbewegt; Wolken sind tagesaktuell. Satelliten bewegen sich live, weil der Browser ihre Bahn aus den Snapshot-Bahndaten berechnet. Nur Ebenen aus Snapshots sind 10–15 Minuten alt; die Cron-Startzeit von GitHub kann sich dabei um einige Minuten verschieben. Uwe hat das am 13.11.2026 als ausreichend bestätigt.


### 6.1 Design-Prototyp (vor dem Repo)

Solange das Repo noch nicht steht, läuft der Prototyp als statische Vorschau ohne geplante Action:

- Quellen, die der Browser direkt abrufen darf (USGS-Erdbeben, Flugzeuge, NASA GIBS, Radio-Streams), werden live abgerufen, soweit CORS das erlaubt.
- Was später die GitHub Action liefert (CelesTrak-Bahndaten, Radio-Senderliste), liegt im Design-Prototyp als mitgelieferte Snapshot-Datei mit Datum vor. Das Format entspricht dem späteren Snapshot, damit nichts umgebaut werden muss.
- Ist eine Live-Quelle aus dem Prototyp heraus nicht erreichbar, nutzt die Ebene eine Beispieldatei und zeigt „Beispieldaten“ in der Quellenzeile an.
- Für den Design-Prototyp gelten alle AK aus Kap. 4 und 7 sowie N-2, N-3 und N-5. N-1, N-4.3 und N-7.2 bis N-7.4 werden erst mit dem Repo geprüft.

### 6.2 Offene technische Fragen

Technische Klärung im ersten Sprint (Spike, Ergebnis ins PRD zurückschreiben):

- **Flugzeuge (geklärt in v0.5):** adsb.lol bietet nur Umkreisabfragen. Die Action holt einen weltweiten OpenSky-Schnappschuss; der erste Lauf lieferte rund 10 600 Flugzeuge.
- **Radio Browser:** Snapshot über die Action (kompakter, schneller, keine Besucher-IP an Radio Browser).
- **Größe der Snapshots (geprüft):** Flugzeuge rund 700 KB, Senderliste und Bahndaten deutlich kleiner, Wolkenkarte rund 240 KB.

## 7. Design-Vorgaben

Verbindlich sind die Styleframes im Design-Canvas (https://claude.ai/artifact/8dwohdR9fQgBZC97f2n42e) und die Tokens:

- Hintergrund #05070D; Liquid Glass nur auf schwebenden Bedienelementen (blur 30, saturate 1.4, Fläche rgba(28,31,40,0.62))
- Schrift: SF Pro bzw. Inter für UI, IBM Plex Mono für Messwerte (selbst ausgeliefert, siehe N-2.2)
- Eine Farbe pro Ebene: Flugzeuge #64D2FF, Satelliten #BF5AF2, Erdbeben #FF9F0A, Radio #30D158 (UFO #FF375F, Schiffe #0A84FF, Brände #FF453A, Züge #FFD60A für später reserviert)

Abnahme-Kriterium D-1: Ein Screenshot-Vergleich der Ansichten Main, Mobile, Start, Arrival und Wonder gegen die Styleframes zeigt keine Abweichung in Layout-Struktur, Farben und Typografie, die Uwe als störend einstuft.

## 8. Qualitätskontrolle

### 8.1 Vorgehen

1. **Pro Pull Request:** CI prüft automatisch alle mit **A** markierten Kriterien, die sich automatisieren lassen, plus Lint und Secret-Scan.
2. **Pro Meilenstein:** Manueller Durchlauf des Testskripts (alle **M**-Kriterien des Meilensteins) auf der Testmatrix; Lighthouse-/Performance-Messungen (**L**) auf den Referenzgeräten.
3. **Vor Livegang:** Vollständiges QA-Protokoll über alle AK in diesem Dokument, plus Netzwerk-Audit (alle Ziel-Domains abgleichen mit Datenschutzerklärung und CSP) und Lizenz-Audit.

### 8.2 QA-Protokoll

Für jede AK-ID wird festgehalten: Datum, Gerät/Browser, Ergebnis (bestanden / nicht bestanden / nicht anwendbar), Beleg (Screenshot, Messwert oder Link zum CI-Lauf), Bemerkung. Das Protokoll liegt im Repo unter `docs/qa/` und wird je Meilenstein fortgeschrieben.

### 8.3 Definition of Done (pro Feature)

- Alle **Muss**-AK des Features bestanden
- Quelle und Lizenz in der UI und auf der Seite „Quellen & Lizenzen“
- Fehlerzustand (Quelle nicht erreichbar) getestet
- Reduzierte Bewegung getestet
- Keine neue Drittserver-Domain ohne Eintrag in Datenschutzerklärung und CSP
- Code reviewed, CI grün, in der Vorschau von Uwe angesehen

### 8.4 Abnahme des Prototyps

Der Prototyp gilt als abgenommen, wenn alle Muss-AK aus Kap. 4 und 5 bestanden sind und Uwe D-1 freigibt. Nicht bestandene Kann-AK werden als Aufgaben für die nächste Stufe übernommen.

## 9. Meilensteine (Vorschlag)

| M | Inhalt | Ergebnis |
| --- | --- | --- |
| D1 | Design-Prototyp, Teil 1: Globus mit Tag/Nacht und Wolken, Startscreen mit Ortssuche, Start auf Bielefeld, Ankunft, „Surprise me“ mit Wikipedia-Links, Ebenen-UI nach Styleframes (Desktop und Mobil) | Look und Einstieg zur Abnahme durch Uwe (D-1) |
| D2 | Design-Prototyp, Teil 2: Erdbeben, Flugzeuge, Satelliten/ISS, Radio, Inspector, Quellenzeile | Alle Basisfunktionen im Design-Prototyp · **erledigt 13.11.2026** (direkt im Repo statt im Artefakt) |
| M1 | Repo, GitHub-Pages-Deploy, CI, geplante Action „Daten & Deploy“, Technik-Spikes aus Kap. 6.2 | Prototyp öffentlich erreichbar, Live-Ebenen (D2) laufen · **erledigt 13.11.2026** |
| M2 | Performance-Messung und Optimierung, Impressum/Datenschutz/Lizenzen | Performance- und Rechts-AK geprüft |
| M3 | Gesamt-QA nach Kap. 8, Korrekturen, Abnahme | Abgenommener Prototyp |

## 10. Offene Fragen und Entscheidungen für Uwe

Entschieden am 13.11.2026:

- UFO-Archiv entfällt im Prototyp.
- Ohne Wunschort startet der Globus über Bielefeld, Deutschland.
- Weltrekord-Karten sind Kurzinfos mit Link auf Wikipedia.
- Die Basisversion ist nur auf Englisch, Wikipedia-Links auf en.wikipedia.org.
- Der Startscreen bekommt ein Symbol (stilisierter Globus).
- Zuerst Design-Prototyp mit allen Basisfunktionen; das Repo folgt.
- Kein Cloudflare: GitHub Pages + geplante GitHub Action, Snapshot-Aktualität 10–15 min reicht.
- Repo `World-in-a-Nutshell` unter uschweerlambers-art, öffentlich; Seite unter uschweerlambers-art.github.io/World-in-a-Nutshell.
- Code unter MIT-Lizenz (Daten behalten die Lizenzen ihrer Quellen).
- Die Adresse bleibt vorerst uschweerlambers-art.github.io/World-in-a-Nutshell, keine eigene Domain.

Noch offen (spätestens vor M2):

1. **Impressum/Datenschutz:** Texte liefert Uwe; der Prototyp stellt Platzhalter und die Liste der Drittserver bereit. GitHub (USA) ist Hoster und wird in der Datenschutzerklärung genannt.
2. **Kann-Feature F-11** (Zeitleiste): im Prototyp als Bedienelement sichtbar, Funktion erst später. Der Umschalter Globus/Karte (F-12) ist seit v0.9 umgesetzt (F-18).

## 11. Risiken

| Risiko | Auswirkung | Gegenmaßnahme |
| --- | --- | --- |
| Flugdaten-Quelle erlaubt keinen Browser-Abruf oder ändert API | Ebene nur 10–15 min aktuell oder fällt aus | Fallback-Quellen, Snapshot der Action, Modul austauschbar |
| GitHub-Cron startet verspätet oder ruht nach 60 Tagen | Snapshots veralten | Zeitstempel und Hinweis in der Ebene, Keepalive, letzter Stand bleibt sichtbar |
| Bandbreite von GitHub Pages (ca. 100 GB/Monat) reicht bei Bekanntheit nicht | Seite wird gedrosselt | Texturen schlank halten, Umzug zu Codeberg oder Cloudflare vorbereitet |
| Browser-Abrufe senden Besucher-IPs an Quellen | Datenschutz | In der Datenschutzerklärung nennen; wo sinnvoll Snapshot statt Direktabruf |
| Performance auf älteren Handys | Ruckeln | Level of Detail, kuratierte Satellitenauswahl, Ebenen standardmäßig aus |
| Viele Radiostreams nur HTTP | Weniger Sender abspielbar | Nur HTTPS-Sender listen (kein Proxy, um Weiterleitung zu vermeiden) |
| Lizenzlage einzelner Quellen unklar | Rechtliches Risiko | Lizenzprüfung als Freigabe-Schritt je Ebene (F-10.3); UFO-Ebene deshalb vorerst gestrichen |
| Nicht-kommerzielle Lizenzen (OpenSky, Open-Meteo) | Spätere Monetarisierung ausgeschlossen | Im MVP nicht nötig; nur nutzen, wenn kein Ersatz |
