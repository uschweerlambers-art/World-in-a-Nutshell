# Builds site/data/discover.json, the curated "Discover here" tips of the place popup (F-25).
#
# Usage: python3 tools/discover-tips.py
#
# Every tip names a real place with its own English Wikipedia article. The photo is taken by the
# GitHub Action (scripts/fetch-discover-pictures.mjs) from that article, only from Wikimedia Commons
# with a free licence, so it shows the place itself. Texts are our own words.
# kind: sight (landmark or local speciality), person (a person's story tied to a place), surprise (unexpected, may lie outside the city)
# The city anchor (lat/lon) comes from site/data/places.json, so the popup finds the tips by distance.
import json, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

C = []
def city(name, cc, r=12):
    C.append({'name': name, 'cc': cc, 'r': r, 'tips': []})
def tip(kind, title, wiki, lat, lon, text, more, person=None, photo=None):
    t = {'kind': kind, 'title': title, 'wiki': wiki, 'lat': lat, 'lon': lon, 'text': text, 'more': more}
    if person: t['person'] = person
    if photo: t['photo'] = photo
    C[-1]['tips'].append(t)

# ---------- Germany ----------
city('Bielefeld', 'DE')
tip('sight', 'Sparrenburg', 'Sparrenburg', 52.0141, 8.5266,
    'A 13th-century castle on the ridge above the old town, built by the Counts of Ravensberg.',
    'Its tower looks out over the city and the Teutoburg Forest. Below the walls, old passages run through the hill.')
tip('person', 'Kunsthalle Bielefeld', 'Kunsthalle Bielefeld', 52.0157, 8.5296,
    'The American architect Philip Johnson designed this red sandstone museum, opened in 1968.',
    'Johnson, famous for his Glass House in Connecticut, built very little in Europe. The Kunsthalle shows modern and contemporary art, with sculptures in the park beside it.',
    person='Philip Johnson')
tip('surprise', 'Externsteine', 'Externsteine', 51.8687, 8.9172,
    'Sandstone pillars rising out of the Teutoburg Forest, with a relief carved into the rock almost 900 years ago.',
    'Steps and a small chapel are cut into the rock, and a bridge links two of the pillars. A good outing from Bielefeld.')

city('Berlin', 'DE', 25)
tip('sight', 'Berlin Wall Memorial', 'Berlin Wall Memorial', 52.5353, 13.3903,
    'The last stretch of the Wall with its death strip intact, along Bernauer Strasse.',
    'The houses on this street stood right on the border, and in 1961 people jumped from their windows to the West. A viewing tower looks over the preserved border strip.')
tip('person', 'Einstein Tower', 'Einstein Tower', 52.3787, 13.0634,
    'An observatory built around 1920 to test Albert Einstein’s theory of relativity.',
    'Erich Mendelsohn’s curved tower on the Telegrafenberg in Potsdam became an icon of expressionist architecture. It still holds a solar telescope.',
    person='Albert Einstein')
tip('surprise', 'Tempelhofer Feld', 'Tempelhofer Feld', 52.4731, 13.4031,
    'An airport in the middle of the city that closed in 2008; its runways are now a park for everyone.',
    'People cycle, skate and fly kites on the old runways. During the Berlin Airlift of 1948–49 the planes supplying West Berlin landed here.')

city('Hamburg', 'DE', 20)
tip('sight', 'Elbphilharmonie', 'Elbphilharmonie', 53.5413, 9.9841,
    'A concert hall rising like a glass wave out of an old brick warehouse in the harbour.',
    'Its public viewing platform, the Plaza, sits 37 metres up between the old warehouse and the new glass building and is open to everyone.')
tip('person', 'Beatles-Platz', 'Beatles-Platz', 53.5498, 9.9578,
    'Before they were famous, the Beatles played hundreds of nights in the clubs of the Grosse Freiheit, right here.',
    'Between 1960 and 1962 they performed at the Indra, the Kaiserkeller, the Top Ten and the Star-Club. The round square at the corner of the Reeperbahn remembers them with steel figures.',
    person='The Beatles')
tip('surprise', 'Old Elbe Tunnel', 'Old Elbe Tunnel', 53.5459, 9.9665,
    'Lifts big enough for cars take you 24 metres down to a tiled tunnel under the Elbe, opened in 1911.',
    'Walk through it to the other bank and look back at the harbour and the Landungsbrücken.')

city('Munich', 'DE', 20)
tip('sight', 'Viktualienmarkt', 'Viktualienmarkt', 48.1351, 11.5763,
    'Munich’s open-air food market since 1807, with a maypole in the middle and a beer garden.',
    'Stalls sell fruit, cheese, flowers and Bavarian specialities a few steps from Marienplatz.')
tip('person', 'Lenbachhaus', 'Lenbachhaus', 48.1468, 11.5638,
    'This villa museum holds the largest collection of the Blue Rider, the artists around Wassily Kandinsky and Franz Marc.',
    'Many of the works were a gift from Gabriele Münter, who hid them from the Nazis in her house in Murnau and gave them to the city in 1957.',
    person='Gabriele Münter')
tip('surprise', 'Olympiapark', 'Olympiapark, Munich', 48.1731, 11.5466,
    'The park of the 1972 Olympic Games, with transparent tent roofs and a hill made of wartime rubble.',
    'From the top of the Olympiaberg the view reaches the Alps on clear days.')

city('Cologne', 'DE', 15)
tip('sight', 'Cologne Cathedral', 'Cologne Cathedral', 50.9413, 6.9583,
    'Building began in 1248 and was only finished in 1880; for a few years it was the tallest building in the world.',
    '533 steps lead up the south tower to a view over the Rhine. Inside stands the golden Shrine of the Three Kings.')
tip('sight', 'Chocolate Museum', 'Imhoff Chocolate Museum', 50.9322, 6.9644,
    'A museum on a peninsula in the Rhine harbour, with a chocolate fountain and a small working factory.',
    'It tells the story of cocoa from the plantations to the bar.')
tip('surprise', 'Hohenzollern Bridge', 'Hohenzollern Bridge', 50.9413, 6.9658,
    'Tens of thousands of love locks hang on the railway bridge leading to the cathedral.',
    'Couples have fastened padlocks to its fence since about 2008. Over 1,000 trains a day cross the bridge.')

city('Frankfurt am Main', 'DE', 15)
tip('sight', 'Römerberg', 'Römerberg', 50.1105, 8.6822,
    'The old town square with its half-timbered houses and the Römer, the city hall since 1405.',
    'Emperors were celebrated here after their coronation. Most of the houses were rebuilt after the Second World War.')
tip('person', 'Goethe House', 'Goethe House', 50.1110, 8.6778,
    'Johann Wolfgang von Goethe was born in this house in 1749 and wrote his first works here.',
    'The house was destroyed in 1944 and rebuilt; much of the original furniture had been saved and is back in its place.',
    person='Johann Wolfgang von Goethe')
tip('surprise', 'Main Tower', 'Main Tower', 50.1125, 8.6720,
    'Frankfurt’s only skyscraper with a viewing platform open to the public, about 200 metres up.',
    'From the top you look out over the towers of the banks, the river Main and the Taunus hills.')

city('Leipzig', 'DE', 15)
tip('sight', 'St. Nicholas Church', 'St. Nicholas Church, Leipzig', 51.3404, 12.3781,
    'The Monday prayers for peace in this church grew into the demonstrations of autumn 1989.',
    'On 9 October 1989, some 70,000 people marched peacefully around the city ring, a turning point on the way to the fall of the Wall.')
tip('person', 'St. Thomas Church', 'St. Thomas Church, Leipzig', 51.3393, 12.3726,
    'Johann Sebastian Bach was cantor here for 27 years and is buried in front of the altar.',
    'The St. Thomas Boys Choir, which Bach led, still sings here every week.',
    person='Johann Sebastian Bach')
tip('surprise', 'Monument to the Battle of the Nations', 'Monument to the Battle of the Nations', 51.3124, 12.4133,
    'A 91-metre stone monument to the battle of 1813 against Napoleon, finished in 1913.',
    'Inside, giant stone figures guard a crypt, and the platform at the top looks out over the whole city.')

city('Dresden', 'DE', 15)
tip('sight', 'Frauenkirche', 'Dresden Frauenkirche', 51.0519, 13.7416,
    'Destroyed in 1945, its ruins were a memorial for decades; it was rebuilt from 1994 and consecrated again in 2005.',
    'Many of the old stones were put back in their original places; they show up darker in the new walls.')
tip('surprise', 'Blue Wonder', 'Loschwitz Bridge', 51.0526, 13.8095,
    'A blue steel bridge across the Elbe from 1893 that the people of Dresden call the Blue Wonder.',
    'Next to it, one of the oldest suspension railways in the world climbs the hillside.')

city('Bonn', 'DE')
tip('person', 'Beethoven House', 'Beethoven House', 50.7372, 7.1015,
    'Ludwig van Beethoven was born in this house in 1770.',
    'It holds the largest Beethoven collection in the world, among it his last grand piano and his ear trumpets.',
    person='Ludwig van Beethoven')

# ---------- Europe ----------
city('Paris', 'FR', 25)
tip('sight', 'Musée d’Orsay', 'Musée d\'Orsay', 48.8600, 2.3266,
    'A grand railway station from 1900 that now holds the world’s best-known collection of Impressionist paintings.',
    'Look for the huge station clocks; through the glass of one of them you see across the Seine to the Louvre and Montmartre.')
tip('person', 'Shakespeare and Company', 'Shakespeare and Company (bookstore)', 48.8526, 2.3471,
    'An English-language bookshop by the Seine where young writers may sleep among the shelves.',
    'George Whitman opened it in 1951 and named it after Sylvia Beach’s shop of the 1920s, which first published James Joyce’s Ulysses.',
    person='Sylvia Beach & George Whitman')
tip('surprise', 'Catacombs of Paris', 'Catacombs of Paris', 48.8338, 2.3324,
    'Below the streets lie the bones of some six million Parisians, moved here from overflowing cemeteries from the 1780s on.',
    'A walk of about 1.5 km leads through old quarry tunnels lined with stacked bones.')

city('London', 'GB', 25)
tip('sight', 'Borough Market', 'Borough Market', 51.5055, -0.0910,
    'One of London’s oldest food markets, trading by London Bridge for many centuries.',
    'Under its Victorian iron roofs you find cheese, bread, game and street food from all over the world.')
tip('person', 'Charles Dickens Museum', 'Charles Dickens Museum', 51.5235, -0.1162,
    'Charles Dickens lived in this terraced house when he wrote Oliver Twist.',
    'He moved in with his young family in 1837. Rooms are furnished as in his day, with his writing desk.',
    person='Charles Dickens')
tip('surprise', 'Royal Observatory, Greenwich', 'Royal Observatory, Greenwich', 51.4769, -0.0005,
    'Stand with one foot in each hemisphere on the prime meridian, longitude 0°.',
    'All time zones of the world were once counted from here, Greenwich Mean Time. The red time ball on the roof still drops at 1 pm.')

city('Rome', 'IT', 25)
tip('sight', 'Pantheon', 'Pantheon, Rome', 41.8986, 12.4769,
    'A temple almost 1,900 years old whose dome is still the largest unreinforced concrete dome in the world.',
    'Light and rain fall through the open eye at the top, the oculus; small holes in the floor drain the water.')
tip('person', 'Keats-Shelley House', 'Keats-Shelley Memorial House', 41.9059, 12.4828,
    'The English poet John Keats died in a room of this house at the Spanish Steps in 1821, aged 25.',
    'Today it is a museum of the English Romantic poets who loved Rome, among them Keats, Shelley and Byron.',
    person='John Keats')
tip('surprise', 'Mouth of Truth', 'Mouth of Truth', 41.8881, 12.4814,
    'A marble face said to bite off the hand of anyone who tells a lie.',
    'The ancient disc, probably once a drain cover, hangs in the porch of the church of Santa Maria in Cosmedin.')

city('Barcelona', 'ES', 20)
tip('sight', 'La Boqueria', 'La Boqueria', 41.3817, 2.1716,
    'A covered market off La Rambla, with stalls of fruit, ham and seafood.',
    'Small bars inside the market cook what is sold around them.')
tip('person', 'Sagrada Família', 'Sagrada Família', 41.4036, 2.1744,
    'Antoni Gaudí worked on this basilica for over 40 years and is buried in its crypt; building goes on to this day.',
    'Gaudí designed its columns like trees, so the light inside falls as in a forest.',
    person='Antoni Gaudí')
tip('surprise', 'Montserrat', 'Montserrat (mountain)', 41.5933, 1.8378,
    'A saw-toothed mountain with a monastery on its side, about an hour from the city.',
    'A rack railway and a cable car climb to the monastery, home of the Black Madonna and one of Europe’s oldest boys’ choirs.')

city('Lisbon', 'PT', 15)
tip('sight', 'Belém Tower', 'Belém Tower', 38.6916, -9.2160,
    'A 16th-century fortress on the Tagus that guarded the way in and out of the harbour in the Age of Discovery.',
    'Its stonework shows ropes, armillary spheres and a carved rhinoceros.')
tip('person', 'A Brasileira', 'A Brasileira', 38.7107, -9.1424,
    'The poet Fernando Pessoa was a regular at this café, opened in 1905; his bronze figure sits at a table outside.',
    'Order a bica, the small Lisbon espresso, and take the seat next to him.',
    person='Fernando Pessoa')
tip('surprise', 'Pena Palace', 'Pena Palace', 38.7876, -9.3906,
    'A brightly painted 19th-century palace on a hilltop in the forests of Sintra.',
    'On clear days you can see from its terraces to Lisbon and the Atlantic.')

city('Amsterdam', 'NL', 15)
tip('sight', 'Rijksmuseum', 'Rijksmuseum', 52.3600, 4.8852,
    'The national museum of the Netherlands, home of Rembrandt’s Night Watch; a cycle path runs right through the building.',
    'Over 8,000 objects tell 800 years of Dutch art and history.')
tip('person', 'Anne Frank House', 'Anne Frank House', 52.3752, 4.8840,
    'Anne Frank hid with her family in the secret annex of this canal house for two years and wrote her diary here.',
    'The bookcase that hid the entrance is still in place.',
    person='Anne Frank')
tip('surprise', 'Zaanse Schans', 'Zaanse Schans', 52.4741, 4.8170,
    'Working windmills and green wooden houses by the river Zaan, about 15 km from the centre.',
    'Some of the mills still grind spices and press oil as they did 300 years ago.')

city('Vienna', 'AT', 20)
tip('sight', 'Naschmarkt', 'Naschmarkt', 48.1986, 16.3632,
    'Vienna’s best-known market, about 1.5 km of stalls along the Wienzeile.',
    'On Saturdays a flea market joins it at the far end.')
tip('person', 'Mozarthaus', 'Mozarthaus Vienna', 48.2075, 16.3755,
    'Wolfgang Amadeus Mozart lived in this apartment from 1784 to 1787 and wrote The Marriage of Figaro here.',
    'It is the only one of his Vienna homes that still stands.',
    person='Wolfgang Amadeus Mozart')
tip('surprise', 'Wiener Riesenrad', 'Wiener Riesenrad', 48.2166, 16.3958,
    'One of the oldest Ferris wheels still turning, built in 1897 in the Prater.',
    'Its red cabins rise to almost 65 metres above the amusement park.')

city('Prague', 'CZ', 15)
tip('sight', 'Charles Bridge', 'Charles Bridge', 50.0865, 14.4114,
    'A stone bridge from the 14th century lined with 30 statues of saints.',
    'Early in the morning, before the crowds arrive, it belongs to the photographers.')
tip('person', 'Golden Lane', 'Golden Lane', 50.0920, 14.4036,
    'Franz Kafka wrote in the little blue house at number 22 of this lane of tiny castle houses.',
    'He used it as a quiet place to write in 1916 and 1917, staying into the night.',
    person='Franz Kafka')
tip('surprise', 'Sedlec Ossuary', 'Sedlec Ossuary', 49.9620, 15.2882,
    'A chapel decorated with the bones of tens of thousands of people, in the town of Kutná Hora.',
    'Even the chandelier is made of bones. Kutná Hora is about an hour from Prague by train.')

# ---------- Rest of the world ----------
city('Istanbul', 'TR', 30)
tip('sight', 'Hagia Sophia', 'Hagia Sophia', 41.0086, 28.9802,
    'Built as a church in 537, it became a mosque in 1453; its dome has shaped the city for almost 1,500 years.',
    'Christian mosaics and Islamic calligraphy are seen side by side inside.')
tip('person', 'Museum of Innocence', 'Museum of Innocence', 41.0315, 28.9783,
    'Nobel laureate Orhan Pamuk wrote a novel and built this museum of everyday objects to go with it.',
    'Each display case belongs to a chapter of the book, and a ticket is printed inside the novel.',
    person='Orhan Pamuk')
tip('surprise', 'Basilica Cistern', 'Basilica Cistern', 41.0084, 28.9779,
    'An underground water tank from the 6th century, held up by 336 columns; two of them rest on Medusa heads.',
    'It once stored water for the Great Palace of the Byzantine emperors.')

city('New York City', 'US', 25)
tip('sight', 'High Line', 'High Line', 40.7480, -74.0048,
    'An old elevated freight railway on Manhattan’s West Side turned into a park in the air.',
    'The walk runs about 2.3 km above the streets, with plants that grew wild on the tracks.')
tip('person', 'Louis Armstrong House', 'Louis Armstrong House', 40.7546, -73.8616,
    'Louis Armstrong lived in this modest house in Queens from 1943 until his death in 1971.',
    'He could have lived anywhere, but chose to stay among his neighbours; his home recordings are played in the rooms.',
    person='Louis Armstrong')
tip('surprise', 'Grand Central Terminal', 'Grand Central Terminal', 40.7527, -73.9772,
    'Whisper into a corner of the tiled arches outside the Oyster Bar, and someone in the far corner hears you.',
    'Look up in the main hall: the ceiling shows the constellations, painted in reverse.')

city('San Francisco', 'US', 15)
tip('sight', 'Alcatraz Island', 'Alcatraz Island', 37.8267, -122.4230,
    'The island prison in the bay, closed in 1963, once held Al Capone.',
    'Ferries leave from Pier 33; the audio tour is told by former guards and inmates.')
tip('person', 'City Lights Bookstore', 'City Lights Bookstore', 37.7976, -122.4066,
    'Poet Lawrence Ferlinghetti’s bookshop published Allen Ginsberg’s Howl in 1956 and became the home of the Beat writers.',
    'The poetry room upstairs invites you to sit down and read.',
    person='Lawrence Ferlinghetti')
tip('surprise', 'Cable cars', 'San Francisco cable car system', 37.7848, -122.4076,
    'The last cable cars in the world still worked by hand, running since 1873.',
    'At the end of the line on Powell Street the cars are turned around on a turntable, pushed by the crew.')

city('Mexico City', 'MX', 30)
tip('sight', 'Palacio de Bellas Artes', 'Palacio de Bellas Artes', 19.4352, -99.1412,
    'A white marble palace of the arts, with murals by Diego Rivera inside.',
    'Its stage curtain is made of nearly a million pieces of coloured glass by Tiffany.')
tip('person', 'Frida Kahlo Museum', 'Frida Kahlo Museum', 19.3551, -99.1625,
    'Frida Kahlo was born, lived and died in this blue house in Coyoacán.',
    'Her studio, her easel and her clothes are still in the house, which she shared with Diego Rivera.',
    person='Frida Kahlo')
tip('surprise', 'Xochimilco', 'Xochimilco', 19.2574, -99.1052,
    'Colourful boats glide along canals that are a remnant of the old Aztec lake landscape.',
    'Mariachi bands and food sellers pull up alongside in their own boats.')

city('Rio de Janeiro', 'BR', 25)
tip('sight', 'Christ the Redeemer', 'Christ the Redeemer (statue)', -22.9519, -43.2105,
    'The 30-metre statue on Corcovado mountain, 700 metres above the city.',
    'A rack railway through the Tijuca forest climbs to its feet.')
tip('person', 'Selarón Steps', 'Escadaria Selarón', -22.9153, -43.1792,
    'Chilean artist Jorge Selarón covered these 215 steps with tiles from all over the world.',
    'He worked on them for more than 20 years; visitors sent him tiles from their home countries.',
    person='Jorge Selarón')
tip('surprise', 'Sugarloaf Mountain', 'Sugarloaf Mountain', -22.9486, -43.1566,
    'Two cable cars climb via Urca hill to the top of the granite peak at the mouth of the bay.',
    'Come for the sunset over the city and Copacabana.')

city('Buenos Aires', 'AR', 25)
tip('sight', 'Caminito', 'Caminito', -34.6393, -58.3627,
    'A colourful street in La Boca, painted like the houses of the dock workers who settled here.',
    'Tango dancers perform on the pavement for passers-by.')
tip('person', 'Café Tortoni', 'Café Tortoni', -34.6088, -58.3787,
    'The city’s oldest café, opened in 1858, where Jorge Luis Borges and Carlos Gardel were guests.',
    'Tango shows still take place in its cellar.',
    person='Jorge Luis Borges')
tip('surprise', 'Recoleta Cemetery', 'La Recoleta Cemetery', -34.5875, -58.3934,
    'A city of marble mausoleums where Eva Perón is buried.',
    'Its avenues and statues make it one of the most visited cemeteries in the world.')

city('Cairo', 'EG', 30)
tip('sight', 'Khan el-Khalili', 'Khan el-Khalili', 30.0477, 31.2622,
    'A bazaar of narrow lanes founded in the 14th century in the heart of old Cairo.',
    'Stop at one of the old coffee houses for mint tea.')
tip('surprise', 'Pyramids of Giza', 'Giza pyramid complex', 29.9792, 31.1342,
    'The last of the Seven Wonders of the Ancient World still standing, right at the edge of the city.',
    'The Great Pyramid was the tallest structure built by people for more than 3,800 years.')

city('Cape Town', 'ZA', 25)
tip('sight', 'Table Mountain', 'Table Mountain', -33.9628, 18.4098,
    'The flat-topped mountain above the city, reached by a cable car whose floor turns as it climbs.',
    'When clouds pour over its edge, people here say the table cloth is laid.')
tip('person', 'Robben Island', 'Robben Island', -33.8067, 18.3664,
    'Nelson Mandela spent 18 of his 27 years in prison on this island.',
    'Tours are led by former political prisoners and stop at his cell.',
    person='Nelson Mandela')
tip('surprise', 'Boulders Beach', 'Boulders Beach', -34.1972, 18.4517,
    'African penguins nest on this beach between granite boulders.',
    'Wooden walkways lead you right past the colony.')

city('Nairobi', 'KE', 25)
tip('sight', 'Nairobi National Museum', 'Nairobi National Museum', -1.2740, 36.8146,
    'Kenya’s national museum, with collections on the country’s history, nature, culture and art.',
    'A snake park is part of the museum grounds.')
tip('surprise', 'Nairobi National Park', 'Nairobi National Park', -1.3733, 36.8589,
    'Lions, rhinos and giraffes live in a national park with the city skyline in the background.',
    'It lies only about 7 km from the centre of the capital.')

city('Tokyo', 'JP', 30)
tip('sight', 'Sensō-ji', 'Sensō-ji', 35.7148, 139.7967,
    'Tokyo’s oldest temple, reached through the Thunder Gate with its giant red lantern.',
    'The shopping street in front of it has sold snacks and souvenirs to pilgrims for centuries.')
tip('person', 'Ghibli Museum', 'Ghibli Museum', 35.6962, 139.5704,
    'Hayao Miyazaki designed this museum of the Studio Ghibli films himself; a robot soldier guards its roof garden.',
    'Tickets name a date and time and are sold in advance only.',
    person='Hayao Miyazaki')
tip('surprise', 'Shibuya Crossing', 'Shibuya Crossing', 35.6595, 139.7005,
    'When the lights turn green, crowds cross this junction from all sides at once.',
    'The statue of the faithful dog Hachikō waits by the station exit.')

city('Kyoto', 'JP', 15)
tip('sight', 'Kinkaku-ji', 'Kinkaku-ji', 35.0394, 135.7292,
    'A Zen temple whose top two floors are covered in gold leaf.',
    'It is mirrored in the pond in front of it.')
tip('surprise', 'Fushimi Inari-taisha', 'Fushimi Inari-taisha', 34.9671, 135.7727,
    'Thousands of vermilion torii gates form tunnels up a wooded mountain.',
    'Each gate was given by a person or a company; the walk to the top takes about two hours.')

city('Seoul', 'KR', 25)
tip('sight', 'Gyeongbokgung', 'Gyeongbokgung', 37.5796, 126.9770,
    'The main royal palace of the Joseon dynasty, first built in 1395.',
    'The changing of the guard takes place at its main gate.')
tip('sight', 'Gwangjang Market', 'Gwangjang Market', 37.5700, 126.9996,
    'One of Korea’s oldest markets, famous for its mung bean pancakes.',
    'Hundreds of food stalls fill the covered lanes.')
tip('surprise', 'Cheonggyecheon', 'Cheonggyecheon', 37.5690, 126.9785,
    'A stream once buried under an elevated highway flows through the city centre again.',
    'The highway was torn down and the stream opened up in 2005; it is now an almost 11 km walk.')

city('Beijing', 'CN', 30)
tip('sight', 'Forbidden City', 'Forbidden City', 39.9163, 116.3972,
    'The palace of 24 emperors of the Ming and Qing dynasties.',
    'For almost 500 years no one could enter without the emperor’s permission.')
tip('sight', 'Temple of Heaven', 'Temple of Heaven', 39.8822, 116.4066,
    'Emperors prayed here for good harvests, in a round hall of wood under a blue roof.',
    'Today the park is full of people doing tai chi, dancing and playing cards in the mornings.')
tip('surprise', 'Mutianyu', 'Mutianyu', 40.4319, 116.5704,
    'A restored stretch of the Great Wall about 70 km from the city.',
    'A chairlift goes up and a toboggan run brings you back down.')

city('Singapore', 'SG', 25)
tip('sight', 'Gardens by the Bay', 'Gardens by the Bay', 1.2816, 103.8636,
    'Steel Supertrees up to 50 metres tall, planted with ferns and orchids.',
    'Every evening they light up to music.')
tip('sight', 'Lau Pa Sat', 'Lau Pa Sat', 1.2806, 103.8504,
    'A Victorian cast-iron market hall that is now a busy food centre.',
    'At night the street beside it fills with satay stalls.')
tip('surprise', 'Pulau Ubin', 'Pulau Ubin', 1.4044, 103.9625,
    'An island of village houses and mangroves, a short boat ride from the mainland.',
    'Rent a bicycle and explore one of the last kampongs, traditional villages, of Singapore.')

city('Mumbai', 'IN', 25)
tip('sight', 'Chhatrapati Shivaji Terminus', 'Chhatrapati Shivaji Maharaj Terminus', 18.9398, 72.8355,
    'A Victorian Gothic railway station, still one of the busiest in India.',
    'It was finished in 1888 and is a World Heritage Site.')
tip('person', 'Mani Bhavan', 'Mani Bhavan', 18.9596, 72.8114,
    'Mahatma Gandhi stayed in this house whenever he was in Bombay from 1917 to 1934.',
    'His room, with his spinning wheel, is kept as it was.',
    person='Mahatma Gandhi')
tip('surprise', 'Elephanta Caves', 'Elephanta Caves', 18.9633, 72.9315,
    'Rock-cut temples with a huge three-headed Shiva, on an island in the harbour.',
    'Ferries leave from the Gateway of India.')

city('Sydney', 'AU', 25)
tip('person', 'Sydney Opera House', 'Sydney Opera House', -33.8568, 151.2153,
    'Danish architect Jørn Utzon won the design competition in 1957, but left in 1966 and never saw the finished building.',
    'The roof shells are covered with more than a million tiles.',
    person='Jørn Utzon')
tip('sight', 'Sydney Harbour Bridge', 'Sydney Harbour Bridge', -33.8523, 151.2108,
    'You can climb the arch of the bridge, 134 metres above the harbour.',
    'Locals call it the Coathanger.')
tip('surprise', 'Bondi Beach', 'Bondi Beach', -33.8915, 151.2767,
    'Australia’s best-known beach, with an ocean pool cut into the rocks at its southern end.',
    'A coastal path leads along the cliffs to Coogee.')

city('Athens', 'GR', 20)
tip('sight', 'Acropolis', 'Acropolis of Athens', 37.9715, 23.7257,
    'The Parthenon has stood on this rock above the city for almost 2,500 years.',
    'The Acropolis Museum at its foot shows the sculptures that once decorated the temples.')
tip('person', 'Ancient Agora', 'Ancient Agora of Athens', 37.9747, 23.7223,
    'Socrates questioned the citizens of Athens in this marketplace.',
    'The Temple of Hephaestus above the agora is one of the best preserved Greek temples.',
    person='Socrates')
tip('surprise', 'Cape Sounion', 'Cape Sounion', 37.6503, 24.0246,
    'The ruins of a temple of Poseidon on a cape above the Aegean, about 70 km from Athens.',
    'Lord Byron carved his name into one of its columns.')

city('Stockholm', 'SE', 20)
tip('sight', 'Vasa Museum', 'Vasa Museum', 59.3280, 18.0914,
    'A warship that sank on its maiden voyage in 1628 and was raised almost intact in 1961.',
    'It is the best preserved ship of its time anywhere.')
tip('person', 'ABBA The Museum', 'ABBA The Museum', 59.3251, 18.0963,
    'The story of the band that won the Eurovision Song Contest in 1974 with Waterloo.',
    'Costumes, gold records and a copy of the studio where many of the songs were recorded.',
    person='ABBA')
tip('surprise', 'Metro art', 'Stockholm metro', 59.3313, 18.0596,
    'Over 90 of the 100 metro stations are decorated with art; some look like painted caves.',
    'Start at T-Centralen, with its blue vines on the rock walls.')

places = json.load(open(os.path.join(ROOT, 'site/data/places.json')))
rows = places['rows']
out, n = [], 0
for c in C:
    m = [r for r in rows if r[0] == c['name'] and r[4] == c['cc']]
    assert m, c['name']
    r = max(m, key=lambda r: r[6])
    cid = r[0].lower().replace(' ', '-').replace('ü', 'ue')
    tips = []
    for k, t in enumerate(c['tips']):
        tips.append({'id': f'{cid}-{k + 1}', **t})
    n += len(tips)
    out.append({'id': cid, 'name': r[0], 'cc': r[4], 'lat': r[2], 'lon': r[3], 'r': c['r'], 'tips': tips})
note = ('Curated tips for the place popup ("Discover here", F-25). Texts are our own; each tip links to the English Wikipedia '
        'article of the place. Photos: Wikimedia Commons, copied by scripts/fetch-discover-pictures.mjs. Edit tools/discover-tips.py, not this file.')
with open(os.path.join(ROOT, 'site/data/discover.json'), 'w') as f:
    json.dump({'note': note, 'cities': out}, f, ensure_ascii=False, indent=1)
print(len(out), 'cities,', n, 'tips')
